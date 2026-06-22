import { useMemo } from 'react';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Stars sit on a large shell well outside the globe + max zoom distance (9),
// so they never collide with the geometry but stay inside the camera's far plane.
const SHELL_RADIUS = 60;
const DESKTOP_STARS = 1600;
const MOBILE_STARS = 800;

const isBrowser = typeof window !== 'undefined';

function getStarCount(): number {
  if (!isBrowser) return DESKTOP_STARS;
  const lowCores =
    typeof navigator !== 'undefined' &&
    typeof navigator.hardwareConcurrency === 'number' &&
    navigator.hardwareConcurrency <= 4;
  if (window.innerWidth < 768 || lowCores) return MOBILE_STARS;
  return DESKTOP_STARS;
}

// Theme palette: mostly dim amber-tinted "terminal" stars, a few cool white
// ones for depth. Kept low-luminance so they read as background, not foreground.
const PALETTE: ReadonlyArray<readonly [number, number, number]> = [
  [1.0, 0.69, 0.0], // amber  (#ffb000)
  [1.0, 0.84, 0.6], // pale amber (--term-fg)
  [0.6, 0.7, 0.85], // cool white
];

interface BuiltStars {
  positions: Float32Array;
  colors: Float32Array;
}

/** Random points on a sphere shell, each tinted from the terminal palette. */
function buildStars(count: number): BuiltStars {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Uniform direction on the unit sphere (avoids polar clustering).
    const u = Math.random() * 2 - 1; // cos(theta), -1..1
    const phi = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.max(0, 1 - u * u));
    const x = Math.cos(phi) * r;
    const z = Math.sin(phi) * r;
    const y = u;

    const i3 = i * 3;
    positions[i3] = x * SHELL_RADIUS;
    positions[i3 + 1] = y * SHELL_RADIUS;
    positions[i3 + 2] = z * SHELL_RADIUS;

    // Weight toward amber (entries 0/1) so the field stays on-theme.
    const pick = Math.random();
    const tint = pick < 0.55 ? PALETTE[0] : pick < 0.85 ? PALETTE[1] : PALETTE[2];
    // Per-star brightness jitter so the field has depth instead of a flat wash.
    const b = 0.25 + Math.random() * 0.6;
    colors[i3] = tint[0] * b;
    colors[i3 + 1] = tint[1] * b;
    colors[i3 + 2] = tint[2] * b;
  }

  return { positions, colors };
}

/**
 * Subtle starry backdrop for the globe scene. A static point cloud on a distant
 * shell with additive blending (matching Earth's dots). Static by default, like
 * the globe itself (which only auto-rotates once a city is deselected).
 */
export function Starfield() {
  const { positions, colors } = useMemo(() => buildStars(getStarCount()), []);

  return (
    <group>
      <Points positions={positions} colors={colors} stride={3}>
        <PointMaterial
          vertexColors
          size={0.12}
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </Points>
    </group>
  );
}

export default Starfield;
