import {useFrame, useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {useCallback, useLayoutEffect, useMemo, useRef} from 'react';
import {
	Easing,
	interpolate,
	random,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import * as THREE from 'three';
import {cue, FPS, sceneOf, sceneStart} from './data';

const GRID = 24;
const PITCH = 1.15;
const STREET = 0.7;
const BLOCK = 4;

const coord = (i: number) => i * PITCH + Math.floor(i / BLOCK) * STREET;
const HALF = (coord(GRID - 1) + 0.8) / 2;

// Study polygon (Versalles, Díaz Ordaz, Los Mangos), next to the coast.
const POLY = {i0: 4, i1: 11, j0: 8, j1: 15};
const inPoly = (i: number, j: number) =>
	i >= POLY.i0 && i <= POLY.i1 && j >= POLY.j0 && j <= POLY.j1;

export const POLY_CENTER = new THREE.Vector3(
	(coord(POLY.i0) + coord(POLY.i1)) / 2 - HALF + 0.4,
	0,
	(coord(POLY.j0) + coord(POLY.j1)) / 2 - HALF + 0.4,
);

// Eight concentration zones (lot coordinates), one of them is the polygon.
const ZONES: [number, number][] = [
	[7.5, 11.5],
	[2, 3],
	[9, 20],
	[15, 6],
	[19, 15],
	[13, 1],
	[20, 22],
	[16, 11],
];

type Lot = {
	x: number;
	z: number;
	h: number;
	w: number;
	d: number;
	white: THREE.Color;
	roof: THREE.Color;
	rentalRank: number;
	poly: boolean;
	tower: boolean;
	towerAt: number; // 0..1 inside the findings scene
	towerH: number;
	vanishAt: number; // 0..1 inside the effects scene, >1 = stays
	riseDelay: number;
};

const sec = (s: number) => s * FPS;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const backOut = (t: number) => {
	const c1 = 1.9;
	const c3 = c1 + 1;
	const x = clamp01(t);
	return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

const useLots = () =>
	useMemo(() => {
		const lots: Lot[] = [];
		const whites = ['#F4EFE6', '#EDE4D6', '#F7F3EC', '#E8DCC8', '#F1D9B5'];
		const roofs = ['#9E4A35', '#AD5A40', '#8F4030', '#B86A4C'];
		for (let i = 0; i < GRID; i++) {
			for (let j = 0; j < GRID; j++) {
				const seed = `${i}-${j}`;
				const poly = inPoly(i, j);
				lots.push({
					x: coord(i) - HALF + 0.4,
					z: coord(j) - HALF + 0.4,
					h: 0.35 + random(`h${seed}`) * 0.35,
					w: 0.72 + random(`w${seed}`) * 0.14,
					d: 0.72 + random(`d${seed}`) * 0.14,
					white: new THREE.Color(
						whites[Math.floor(random(`c${seed}`) * whites.length)],
					),
					roof: new THREE.Color(
						roofs[Math.floor(random(`r${seed}`) * roofs.length)],
					),
					rentalRank: random(`rent${seed}`) * (poly ? 0.55 : 1),
					poly,
					tower: poly && random(`t${seed}`) < 0.5,
					towerAt: random(`ta${seed}`),
					towerH: 2.2 + random(`th${seed}`) * 3.6,
					vanishAt: poly ? random(`v${seed}`) * 1.6 : 9,
					riseDelay: random(`rd${seed}`) * 30 + Math.hypot(i - 8, j - 12) * 1.2,
				});
			}
		}
		return lots;
	}, []);

const useWindowTexture = () =>
	useMemo(() => {
		const canvas = document.createElement('canvas');
		canvas.width = 64;
		canvas.height = 256;
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		ctx.fillStyle = '#2a3242';
		ctx.fillRect(0, 0, 64, 256);
		for (let y = 6; y < 256; y += 14) {
			for (let x = 5; x < 64; x += 14) {
				const lit = random(`win-${x}-${y}`) > 0.45;
				ctx.fillStyle = lit ? '#E9C793' : '#384356';
				ctx.fillRect(x, y, 8, 7);
			}
		}
		const tex = new THREE.CanvasTexture(canvas);
		tex.colorSpace = THREE.SRGBColorSpace;
		tex.anisotropy = 8;
		tex.minFilter = THREE.LinearMipmapLinearFilter;
		return tex;
	}, []);

type Key = {t: number; pos: [number, number, number]; look: [number, number, number]};

const useCameraKeys = (): Key[] =>
	useMemo(() => {
		const P = POLY_CENTER;
		const p = (x: number, y: number, z: number): [number, number, number] => [
			P.x + x,
			y,
			P.z + z,
		];
		const l = (x = 0, y = 0, z = 0): [number, number, number] => [
			P.x + x,
			y,
			P.z + z,
		];
		const s = (id: string, plus = 0) => sceneStart(id) + sec(plus);
		const w = (id: string, word: string, plus = 0) => sceneStart(id) + sec(cue(id, word) + plus);
		return [
			{t: 0, pos: p(6, 3.6, 9), look: l(0, 0.4, 0)},
			{t: w('hook', 'Fácil'), pos: p(4, 4.6, 9.5), look: l(0, 0.5, 0)},
			// follow the hero pin as it drops
			{t: w('hook', 'barrio'), pos: p(2.2, 3.4, 6.5), look: l(0, 1, 0)},
			{t: s('global', 0.4), pos: p(3, 6, 10), look: l(0, 0.5, 0)},
			// pull out as pins spread worldwide
			{t: w('global', '8'), pos: [4, 34, 34], look: [0, 0, 1]},
			{t: w('vallarta', 'doce'), pos: [-8, 28, 28], look: [-1, 0, 0]},
			{t: s('study', 0.4), pos: [-6, 26, 26], look: [-1, 0, 0]},
			// dive into the study polygon on "tres colonias"
			{t: w('study', 'tres', 0.6), pos: p(5, 13, 14), look: l(0, 0, 0)},
			{t: s('findings', 0.2), pos: p(2, 11, 12), look: l(0, 0, 0)},
			{t: w('findings', 'más'), pos: p(-4, 9, 13), look: l(0, 0.8, 0)},
			// towers rise: low dramatic angle
			{t: s('effects', 0), pos: p(-9, 9, 13), look: l(0, 1.8, 0)},
			{t: w('effects', 'desaparecen', 0.4), pos: p(8, 9, 11), look: l(0, 0.6, 0)},
			{t: w('effects', 'identidad'), pos: p(5, 15, 15), look: l(0, 0, 0)},
			{t: w('zones', 'rentas'), pos: [-2, 30, 30], look: [-1, 0, 0]},
			// pull out to reveal the eight zones
			{t: w('zones', 'zonas', 0.8), pos: [2, 46, 30], look: [0, 0, 1]},
			{t: s('outro', 0), pos: [-4, 44, 32], look: [0, 0, 0]},
			{t: s('outro', 12), pos: [12, 30, 30], look: [0, 0, 0]},
		];
	}, []);

const lerp3 = (a: number[], b: number[], t: number) =>
	new THREE.Vector3(
		a[0] + (b[0] - a[0]) * t,
		a[1] + (b[1] - a[1]) * t,
		a[2] + (b[2] - a[2]) * t,
	);

const CityContent: React.FC = () => {
	const frame = useCurrentFrame();
	const lots = useLots();
	const windowTex = useWindowTexture();
	const keys = useCameraKeys();
	const camera = useThree((s) => s.camera);

	const bodies = useRef<THREE.InstancedMesh>(null);
	const roofsRef = useRef<THREE.InstancedMesh>(null);
	const towers = useRef<THREE.InstancedMesh>(null);
	const pinHeads = useRef<THREE.InstancedMesh>(null);
	const pinTips = useRef<THREE.InstancedMesh>(null);
	const outline = useRef<THREE.Group>(null);
	const zonesRef = useRef<THREE.Group>(null);
	const heroPin = useRef<THREE.Group>(null);

	const S = useMemo(
		() => ({
			global: sceneStart('global'),
			vallarta: sceneStart('vallarta'),
			study: sceneStart('study'),
			findings: sceneStart('findings'),
			effects: sceneStart('effects'),
			zones: sceneStart('zones'),
			outro: sceneStart('outro'),
			towersAt: sceneStart('findings') + sec(cue('findings', 'más') - 0.2),
			towersSpan: sec(cue('findings', 'construcción') - cue('findings', 'más') + 1.6),
			vanishAt: sceneStart('effects') + sec(0.3),
			vanishSpan: sec(cue('effects', 'desaparecen') + 0.4),
			outline: sceneStart('study') + sec(cue('study', 'tres')),
			heroDrop: sec(cue('hook', 'barrio') - 1.1),
			heroOut: sceneStart('global') - sec(0.3),
			zoneRings: sceneStart('zones') + sec(cue('zones', 'ocho')),
		}),
		[],
	);

	// Runs before every R3F render (useFrame) and on frame change, so a fresh
	// render tab never draws the city before its instances are positioned.
	const update = useCallback(() => {
		if (!bodies.current || !roofsRef.current || !towers.current || !pinHeads.current || !pinTips.current) {
			return;
		}
		// Camera path
		let k = 0;
		while (k < keys.length - 2 && frame > keys[k + 1].t) {
			k++;
		}
		const a = keys[k];
		const b = keys[k + 1];
		const t = Easing.inOut(Easing.cubic)(
			clamp01((frame - a.t) / Math.max(1, b.t - a.t)),
		);
		const pos = lerp3(a.pos, b.pos, t);
		const look = lerp3(a.look, b.look, t);
		// gentle handheld drift
		pos.x += Math.sin(frame / 70) * 0.25;
		pos.y += Math.cos(frame / 90) * 0.15;
		camera.position.copy(pos);
		camera.lookAt(look);

		// Rental share visible over time (2M -> 8M -> 12,600 in Vallarta)
		const share = interpolate(
			frame,
			[S.global + sec(0.5), S.global + sec(6), S.global + sec(9), S.vallarta + sec(5), S.vallarta + sec(9)],
			[0.012, 0.05, 0.17, 0.21, 0.3],
			{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
		);
		const studyFocus = interpolate(
			frame,
			[S.outline - sec(0.5), S.outline + sec(1), S.zones, S.zones + sec(1.5)],
			[0, 1, 1, 0],
			{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
		);

		// pins grow with camera distance so they stay readable in aerial shots
		const pinBoost = Math.min(1.8, Math.max(1, pos.distanceTo(look) / 17));
		const m = new THREE.Object3D();
		const zero = new THREE.Matrix4().makeScale(0, 0, 0);
		const dim = new THREE.Color('#3a3f4a');
		const tmp = new THREE.Color();

		lots.forEach((lot, idx) => {
			const rise = backOut((frame - lot.riseDelay) / 18);
			const towerProgress = lot.tower
				? clamp01((frame - S.towersAt - lot.towerAt * S.towersSpan) / 20)
				: 0;
			const vanish =
				!lot.tower && lot.poly
					? clamp01((frame - S.vanishAt - (lot.vanishAt / 1.6) * S.vanishSpan) / 14)
					: 0;
			const houseScale = rise * (1 - towerProgress) * (1 - vanish);

			// house body
			if (houseScale > 0.001) {
				m.position.set(lot.x, (lot.h * houseScale) / 2, lot.z);
				m.scale.set(lot.w, lot.h * houseScale, lot.d);
				m.rotation.set(0, 0, 0);
				m.updateMatrix();
				bodies.current!.setMatrixAt(idx, m.matrix);
				m.position.set(lot.x, lot.h * houseScale + 0.17 * houseScale, lot.z);
				m.scale.set(lot.w * 0.78, 0.34 * houseScale, lot.d * 0.78);
				m.rotation.set(0, Math.PI / 4, 0);
				m.updateMatrix();
				roofsRef.current!.setMatrixAt(idx, m.matrix);
			} else {
				bodies.current!.setMatrixAt(idx, zero);
				roofsRef.current!.setMatrixAt(idx, zero);
			}
			const fade = lot.poly ? 0 : studyFocus * 0.75;
			tmp.copy(lot.white).lerp(dim, fade);
			bodies.current!.setColorAt(idx, tmp);
			tmp.copy(lot.roof).lerp(dim, fade);
			roofsRef.current!.setColorAt(idx, tmp);

			// tower
			const th = lot.towerH * Easing.out(Easing.cubic)(towerProgress);
			if (th > 0.01) {
				m.position.set(lot.x, th / 2, lot.z);
				m.scale.set(lot.w * 0.95, th, lot.d * 0.95);
				m.rotation.set(0, 0, 0);
				m.updateMatrix();
				towers.current!.setMatrixAt(idx, m.matrix);
			} else {
				towers.current!.setMatrixAt(idx, zero);
			}

			// rental pin
			const appearAt = interpolate(
				lot.rentalRank,
				[0.012, 0.05, 0.17, 0.21, 0.3],
				[S.global + sec(0.5), S.global + sec(6), S.global + sec(9), S.vallarta + sec(5), S.vallarta + sec(9)],
				{extrapolateLeft: 'clamp', extrapolateRight: 'extend'},
			);
			const isRental = lot.rentalRank < share || (lot.poly && lot.tower && towerProgress > 0.5);
			const popFrame = lot.rentalRank < 0.3 ? appearAt : S.towersAt + lot.towerAt * S.towersSpan + 12;
			let pinScale = isRental ? backOut((frame - popFrame) / 10) : 0;
			if (!lot.poly) {
				pinScale *= 1 - studyFocus * 0.6;
			}
			if (vanish > 0.5 && !lot.tower) {
				pinScale *= 1 - vanish;
			}
			if (pinScale > 0.001) {
				const top = Math.max(lot.h * houseScale + 0.34 * houseScale, th);
				const bob = Math.sin((frame + idx * 7) / 12) * 0.05;
				const ps = pinScale * pinBoost;
				const y = top + 0.35 + 0.22 * pinBoost + bob;
				m.rotation.set(0, 0, 0);
				m.position.set(lot.x, y, lot.z);
				m.scale.setScalar(0.17 * ps);
				m.updateMatrix();
				pinHeads.current!.setMatrixAt(idx, m.matrix);
				m.position.set(lot.x, y - 0.2 * ps, lot.z);
				m.rotation.set(Math.PI, 0, 0);
				m.scale.set(0.11 * ps, 0.26 * ps, 0.11 * ps);
				m.updateMatrix();
				pinTips.current!.setMatrixAt(idx, m.matrix);
			} else {
				pinHeads.current!.setMatrixAt(idx, zero);
				pinTips.current!.setMatrixAt(idx, zero);
			}
		});

		for (const r of [bodies, roofsRef, towers, pinHeads, pinTips]) {
			r.current!.instanceMatrix.needsUpdate = true;
			if (r.current!.instanceColor) {
				r.current!.instanceColor.needsUpdate = true;
			}
		}

		// polygon outline draw-on
		if (outline.current) {
			const o = interpolate(frame, [S.outline, S.outline + sec(1.2)], [0, 1], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
				easing: Easing.out(Easing.cubic),
			});
			const off = interpolate(frame, [S.zones, S.zones + sec(1)], [1, 0], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			});
			outline.current.scale.set(o, 1, o);
			outline.current.visible = o * off > 0.01;
			outline.current.children.forEach((c) => {
				const mat = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
				mat.opacity = off * (0.75 + Math.sin(frame / 6) * 0.25);
			});
		}

		// 8 zones pulse
		if (zonesRef.current) {
			zonesRef.current.children.forEach((c, zi) => {
				const s = backOut((frame - S.zoneRings - zi * 3) / 12);
				const pulse = 1 + Math.sin((frame - zi * 9) / 8) * 0.08;
				c.scale.setScalar(Math.max(0.0001, s * pulse));
				c.visible = s > 0.001;
			});
		}

		// hero pin drop on "y reservas"
		if (heroPin.current) {
			const drop = clamp01((frame - S.heroDrop) / 14);
			const out = clamp01((frame - S.heroOut) / 8);
			const y = 6 * (1 - Easing.bounce(drop)) + 1.35;
			heroPin.current.position.set(POLY_CENTER.x, y, POLY_CENTER.z);
			heroPin.current.scale.setScalar(drop > 0 ? 1 - out : 0.0001);
			heroPin.current.rotation.y = frame / 20;
			heroPin.current.visible = drop > 0 && out < 1;
		}
	}, [frame, lots, camera, keys, S]);

	useLayoutEffect(update, [update]);
	useFrame(update);

	const count = lots.length;
	const outlineW = coord(POLY.i1) - coord(POLY.i0) + 1.4;
	const outlineD = coord(POLY.j1) - coord(POLY.j0) + 1.4;
	const zoneData = useMemo(
		() =>
			ZONES.map(([i, j]) => ({
				x: coord(i) - HALF + 0.4,
				z: coord(j) - HALF + 0.4,
			})),
		[],
	);

	return (
		<>
			<color attach="background" args={['#070a10']} />
			<fog attach="fog" args={['#070a10', 30, 85]} />
			<ambientLight intensity={0.55} />
			<hemisphereLight args={['#ffd7b0', '#1b2a44', 0.7]} />
			<directionalLight position={[-18, 22, 12]} intensity={2.2} color="#ffcf9e" />
			<directionalLight position={[16, 10, -14]} intensity={0.6} color="#7fb4ff" />

			{/* ground */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
				<planeGeometry args={[HALF * 2 + 4, HALF * 2 + 4]} />
				<meshStandardMaterial color="#141922" roughness={1} />
			</mesh>
			{/* beach + ocean to the west */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[-HALF - 3.2, -0.005, 0]}>
				<planeGeometry args={[2.4, HALF * 2 + 4]} />
				<meshStandardMaterial color="#c9a46c" roughness={1} />
			</mesh>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[-HALF - 54.4, -0.02, 0]}>
				<planeGeometry args={[100, 200]} />
				<meshStandardMaterial color="#0c3550" roughness={0.25} metalness={0.4} />
			</mesh>

			<instancedMesh ref={bodies} args={[undefined, undefined, count]}>
				<boxGeometry args={[1, 1, 1]} />
				<meshStandardMaterial roughness={0.8} />
			</instancedMesh>
			<instancedMesh ref={roofsRef} args={[undefined, undefined, count]}>
				<coneGeometry args={[0.72, 1, 4]} />
				<meshStandardMaterial roughness={0.7} flatShading />
			</instancedMesh>
			<instancedMesh ref={towers} args={[undefined, undefined, count]}>
				<boxGeometry args={[1, 1, 1]} />
				<meshStandardMaterial
					map={windowTex}
					emissiveMap={windowTex}
					emissive="#ffffff"
					emissiveIntensity={0.35}
					roughness={0.35}
					metalness={0.3}
				/>
			</instancedMesh>
			<instancedMesh ref={pinHeads} args={[undefined, undefined, count]}>
				<sphereGeometry args={[1, 16, 12]} />
				<meshBasicMaterial color="#ff4655" toneMapped={false} />
			</instancedMesh>
			<instancedMesh ref={pinTips} args={[undefined, undefined, count]}>
				<coneGeometry args={[1, 1, 12]} />
				<meshBasicMaterial color="#ff4655" toneMapped={false} />
			</instancedMesh>

			{/* polygon outline */}
			<group ref={outline} position={[POLY_CENTER.x, 0.05, POLY_CENTER.z]}>
				{[
					[0, -outlineD / 2, outlineW, 0.22],
					[0, outlineD / 2, outlineW, 0.22],
					[-outlineW / 2, 0, 0.22, outlineD],
					[outlineW / 2, 0, 0.22, outlineD],
				].map(([x, z, w, d], i) => (
					<mesh key={i} position={[x, 0, z]} rotation={[-Math.PI / 2, 0, 0]}>
						<planeGeometry args={[w, d]} />
						<meshBasicMaterial color="#ff3344" transparent toneMapped={false} />
					</mesh>
				))}
			</group>

			{/* 8 zones */}
			<group ref={zonesRef}>
				{zoneData.map((z, i) => (
					<mesh key={i} position={[z.x, 0.9, z.z]} rotation={[-Math.PI / 2, 0, 0]}>
						<ringGeometry args={[2.4, 3.1, 64]} />
						<meshBasicMaterial color="#ff3344" transparent opacity={0.9} toneMapped={false} />
					</mesh>
				))}
			</group>

			{/* hero pin */}
			<group ref={heroPin}>
				<mesh>
					<sphereGeometry args={[0.38, 24, 18]} />
					<meshStandardMaterial color="#ff2f3c" emissive="#ff1e2d" emissiveIntensity={1.2} />
				</mesh>
				<mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
					<coneGeometry args={[0.25, 0.6, 16]} />
					<meshStandardMaterial color="#ff2f3c" emissive="#ff1e2d" emissiveIntensity={1.2} />
				</mesh>
				<mesh position={[0, 0.05, 0.3]}>
					<sphereGeometry args={[0.13, 16, 12]} />
					<meshBasicMaterial color="#ffffff" />
				</mesh>
			</group>
		</>
	);
};

export const City3D: React.FC = () => {
	const {width, height} = useVideoConfig();
	return (
		<ThreeCanvas
			width={width}
			height={height}
			camera={{fov: 42, near: 0.1, far: 300, position: [0, 10, 20]}}
			gl={{antialias: true}}
			dpr={2}
		>
			<CityContent />
		</ThreeCanvas>
	);
};
