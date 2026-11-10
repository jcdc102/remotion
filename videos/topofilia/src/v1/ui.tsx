import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BODY, C, DISPLAY} from '../theme';

export const useAppear = (delaySec: number, durationFrames = 18) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({
		frame: frame - delaySec * fps,
		fps,
		config: {damping: 16, stiffness: 120, mass: 0.8},
		durationInFrames: durationFrames,
	});
};

export const useFadeOut = (atSec: number, frames = 10) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return interpolate(frame, [atSec * fps, atSec * fps + frames], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
};

export const Rise: React.FC<{
	delay: number;
	out?: number | null;
	y?: number;
	children: React.ReactNode;
	style?: React.CSSProperties;
}> = ({delay, out = null, y = 40, children, style}) => {
	const a = useAppear(delay);
	const o = useFadeOut(out ?? 9999);
	return (
		<div
			style={{
				opacity: a * o,
				transform: `translateY(${(1 - a) * y - (1 - o) * 30}px)`,
				filter: `blur(${(1 - a) * 8}px)`,
				...style,
			}}
		>
			{children}
		</div>
	);
};

export const Pill: React.FC<{children: React.ReactNode; color?: string}> = ({
	children,
	color = C.red,
}) => (
	<div
		style={{
			display: 'inline-flex',
			alignItems: 'center',
			gap: 14,
			padding: '14px 26px',
			borderRadius: 999,
			background: 'rgba(10,12,18,0.6)',
			border: `1.5px solid ${C.stroke}`,
			backdropFilter: 'blur(14px)',
			fontFamily: BODY,
			fontWeight: 700,
			fontSize: 26,
			letterSpacing: 4,
			color: C.ink,
			textTransform: 'uppercase',
		}}
	>
		<span
			style={{
				width: 12,
				height: 12,
				borderRadius: 99,
				background: color,
				boxShadow: `0 0 18px ${color}`,
			}}
		/>
		{children}
	</div>
);

export const Glass: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({
	children,
	style,
}) => (
	<div
		style={{
			background: C.glass,
			border: `1.5px solid ${C.stroke}`,
			borderRadius: 36,
			backdropFilter: 'blur(22px)',
			boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
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
	duration: number;
	format?: (n: number) => string;
	style?: React.CSSProperties;
}> = ({from, to, start, duration, format, style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const v = interpolate(frame, [start * fps, (start + duration) * fps], [from, to], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});
	const text = format ? format(v) : Math.round(v).toLocaleString('en-US');
	return <span style={{fontVariantNumeric: 'tabular-nums', ...style}}>{text}</span>;
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
	<div
		style={{
			fontFamily: BODY,
			fontWeight: 600,
			fontSize: size,
			lineHeight: 1.2,
			color: C.ink,
			...style,
		}}
	>
		{children}
	</div>
);

export const Source: React.FC<{children: React.ReactNode}> = ({children}) => (
	<div
		style={{
			fontFamily: BODY,
			fontWeight: 500,
			fontSize: 22,
			color: C.muted,
			letterSpacing: 0.5,
		}}
	>
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
