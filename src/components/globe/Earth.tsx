import { useEffect, useMemo, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { Points, PointMaterial } from '@react-three/drei';
import { GLOBE_RADIUS } from './hooks/latLngToVec3';
import { Graticule } from './Graticule';

export interface EarthProps {
  /** Pins (or other globe-locked content) rendered inside the same group. */
  children?: ReactNode;
}

const MASK_URL = '/textures/earth-water.png';
const MASK_W = 1600;
const MASK_H = 800;
const DESKTOP_SAMPLES = 12000;
const MOBILE_SAMPLES = 6000;
// Land pixels are dark; keep points whose sampled brightness is below this.
const LAND_THRESHOLD = 128;

const isBrowser = typeof window !== 'undefined';

function getSampleCount(): number {
  if (!isBrowser) return DESKTOP_SAMPLES;
  const lowCores =
    typeof navigator !== 'undefined' &&
    typeof navigator.hardwareConcurrency === 'number' &&
    navigator.hardwareConcurrency <= 4;
  if (window.innerWidth < 768 || lowCores) return MOBILE_SAMPLES;
  return DESKTOP_SAMPLES;
}

/**
 * Generate Fibonacci-sphere points and keep only those that land on dark
 * (land) pixels of the equirectangular mask. Returns a packed Float32Array
 * of xyz positions at GLOBE_RADIUS.
 */
function buildLandPositions(data: Uint8ClampedArray, sampleCount: number): Float32Array {
  const kept: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < sampleCount; i++) {
    // Even distribution on the unit sphere.
    const y = 1 - (i / (sampleCount - 1)) * 2; // 1 .. -1
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const t = golden * i;
    const x = Math.cos(t) * r;
    const z = Math.sin(t) * r;

    // Cartesian -> lat/lng (inverse of latLngToVec3 mapping).
    const lat = 90 - (Math.acos(y) * 180) / Math.PI;
    const lng = (Math.atan2(z, -x) * 180) / Math.PI - 180;

    // lat/lng -> equirectangular UV.
    const u = (((lng + 180) / 360) % 1 + 1) % 1;
    const v = (90 - lat) / 180;

    const px = Math.min(MASK_W - 1, Math.max(0, Math.floor(u * MASK_W)));
    const py = Math.min(MASK_H - 1, Math.max(0, Math.floor(v * MASK_H)));
    const idx = (py * MASK_W + px) * 4;
    const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

    if (brightness < LAND_THRESHOLD) {
      kept.push(x * GLOBE_RADIUS, y * GLOBE_RADIUS, z * GLOBE_RADIUS);
    }
  }

  return new Float32Array(kept);
}

/**
 * Dotted-continent point cloud globe. Self-contained: renders the dots, a
 * faint solid base sphere (occludes back-facing dots), the graticule grid,
 * and any children (pins) inside the same group so they rotate together.
 */
export function Earth({ children }: EarthProps) {
  const [positions, setPositions] = useState<Float32Array | null>(null);

  useEffect(() => {
    if (!isBrowser) return;
    let cancelled = false;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = MASK_URL;

    img.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement('canvas');
      canvas.width = MASK_W;
      canvas.height = MASK_H;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, MASK_W, MASK_H);
      const { data } = ctx.getImageData(0, 0, MASK_W, MASK_H);
      const built = buildLandPositions(data, getSampleCount());
      if (!cancelled) setPositions(built);
    };

    return () => {
      cancelled = true;
    };
  }, []);

  // Stable buffer reference so <Points> doesn't rebuild every render.
  const buffer = useMemo(() => positions ?? new Float32Array(0), [positions]);

  return (
    <group>
      {/* Faint solid base so back-facing dots are occluded. */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 0.99, 48, 48]} />
        <meshBasicMaterial color="#05070a" transparent opacity={0.92} />
      </mesh>

      {positions && positions.length > 0 && (
        <Points positions={buffer} stride={3}>
          <PointMaterial
            color="#ffb000"
            size={0.02}
            sizeAttenuation
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </Points>
      )}

      <Graticule />

      {children}
    </group>
  );
}

export default Earth;
