import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BODY, C, DISPLAY} from '../theme';

const NEVER = 9999;

/** Spring progress (0..1) that starts at `sec` (scene-relative seconds). */
export const useSpringAt = (sec: number, config = {damping: 18, stiffness: 140, mass: 0.7}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: frame - Math.round(sec * fps), fps, config});
};

/**
 * Text revealed from a mask: the content slides up from behind an invisible
 * edge, and leaves upward through the same edge when `out` is reached.
 */
export const MaskLine: React.FC<{
	at: number;
	out?: number;
	children: React.ReactNode;
	style?: React.CSSProperties;
}> = ({at, out = NEVER, children, style}) => {
	const inP = useSpringAt(at, {damping: 20, stiffness: 150, mass: 0.8});
	const outP = useSpringAt(out, {damping: 22, stiffness: 170, mass: 0.7});
	const y = (1 - inP) * 110 - outP * 110;
	return (
		<div style={{overflow: 'hidden', paddingBottom: '0.14em', marginBottom: '-0.14em', ...style}}>
			<div style={{transform: `translateY(${y}%)`, willChange: 'transform'}}>{children}</div>
		</div>
	);
};

/** Wipe reveal through a clip-path, used for cards and bars. */
export const Wipe: React.FC<{
	at: number;
	out?: number;
	dir?: 'left' | 'up';
	children: React.ReactNode;
	style?: React.CSSProperties;
}> = ({at, out = NEVER, dir = 'left', children, style}) => {
	const inP = useSpringAt(at, {damping: 22, stiffness: 120, mass: 0.9});
	const outP = useSpringAt(out, {damping: 22, stiffness: 160, mass: 0.7});
	const shown = (1 - inP) * 100;
	const gone = outP * 100;
	const clip =
		dir === 'left'
			? `inset(0 ${shown}% 0 ${gone}% round 36px)`
			: `inset(${gone}% 0 ${shown}% 0 round 36px)`;
	return <div style={{clipPath: clip, ...style}}>{children}</div>;
};

/**
 * Circle reveal / collapse around an origin. This is how one object turns
 * into the dot that carries us to the next scene, and how the next object
 * grows out of it.
 */
export const Iris: React.FC<{
	expandAt?: number;
	collapseAt?: number;
	origin: string;
	children: React.ReactNode;
	style?: React.CSSProperties;
}> = ({expandAt = -NEVER, collapseAt = NEVER, origin, children, style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const grow = interpolate(frame, [expandAt * fps, expandAt * fps + 12], [0, 150], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});
	const shrink = interpolate(frame, [collapseAt * fps, collapseAt * fps + 9], [150, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.in(Easing.cubic),
	});
	const r = Math.min(grow, shrink);
	return <div style={{clipPath: `circle(${r}% at ${origin})`, ...style}}>{children}</div>;
};

/** Pop-in with overshoot, used for badges and chips. */
export const Pop: React.FC<{at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
	at,
	out = NEVER,
	children,
	style,
}) => {
	const p = useSpringAt(at, {damping: 11, stiffness: 180, mass: 0.6});
	const o = useSpringAt(out, {damping: 20, stiffness: 180, mass: 0.6});
	const s = p * (1 - o);
	return (
		<div style={{transform: `scale(${s})`, opacity: Math.min(1, s * 1.5), ...style}}>{children}</div>
	);
};

export const Pill: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.red}) => (
	<div
		style={{
			display: 'inline-flex',
			alignItems: 'center',
			gap: 14,
			padding: '14px 26px',
			borderRadius: 999,
			background: 'rgba(22,24,32,0.72)',
			border: `1.5px solid ${C.stroke}`,
			boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 12px 40px rgba(0,0,0,0.4)',
			backdropFilter: 'blur(14px)',
			fontFamily: BODY,
			fontWeight: 700,
			fontSize: 26,
			letterSpacing: 4,
			color: C.ink,
			textTransform: 'uppercase',
		}}
	>
		<span style={{width: 12, height: 12, borderRadius: 99, background: color, boxShadow: `0 0 18px ${color}`}} />
		{children}
	</div>
);

export const Glass: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<div
		style={{
			background: 'linear-gradient(180deg, rgba(40,42,52,0.72), rgba(16,18,26,0.72))',
			border: `1.5px solid ${C.stroke}`,
			borderRadius: 36,
			backdropFilter: 'blur(22px)',
			boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14), 0 30px 80px rgba(0,0,0,0.5)',
			padding: 40,
			...style,
		}}
	>
		{children}
	</div>
);

export const Counter: React.FC<{
	from: number;
	to: number;
	start: number;
	end: number;
	format?: (n: number) => string;
}> = ({from, to, start, end, format}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const v = interpolate(frame, [start * fps, end * fps], [from, to], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.quad),
	});
	const text = format ? format(v) : Math.round(v).toLocaleString('en-US');
	return <span style={{fontVariantNumeric: 'tabular-nums'}}>{text}</span>;
};

export const BigNumber: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({
	children,
	size = 170,
	color = C.ink,
}) => (
	<div
		style={{
			fontFamily: DISPLAY,
			fontWeight: 800,
			fontSize: size,
			lineHeight: 1,
			letterSpacing: -4,
			color,
			textShadow: '0 10px 50px rgba(0,0,0,0.5)',
		}}
	>
		{children}
	</div>
);

export const Label: React.FC<{children: React.ReactNode; size?: number; style?: React.CSSProperties}> = ({
	children,
	size = 40,
	style,
}) => (
	<div style={{fontFamily: BODY, fontWeight: 600, fontSize: size, lineHeight: 1.2, color: C.ink, ...style}}>
		{children}
	</div>
);

export const Source: React.FC<{children: React.ReactNode}> = ({children}) => (
	<div style={{fontFamily: BODY, fontWeight: 500, fontSize: 22, color: C.muted, letterSpacing: 0.5}}>
		Fuente: {children}
	</div>
);

export const Headline: React.FC<{children: React.ReactNode; size?: number; style?: React.CSSProperties}> = ({
	children,
	size = 92,
	style,
}) => (
	<div
		style={{
			fontFamily: DISPLAY,
			fontWeight: 700,
			fontSize: size,
			lineHeight: 1.05,
			letterSpacing: -2,
			color: C.ink,
			textShadow: '0 10px 50px rgba(0,0,0,0.6)',
			...style,
		}}
	>
		{children}
	</div>
);

export const Red: React.FC<{children: React.ReactNode}> = ({children}) => (
	<span style={{color: C.redGlow}}>{children}</span>
);

export const Abs: React.FC<{x: number; y: number; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
	x,
	y,
	w,
	children,
	style,
}) => <div style={{position: 'absolute', left: x, top: y, width: w, ...style}}>{children}</div>;
