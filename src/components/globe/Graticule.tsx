import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { latLngToVec3, GLOBE_RADIUS } from './hooks/latLngToVec3';

const GRID_RADIUS = GLOBE_RADIUS * 1.001;
const LINE_COLOR = '#ffb000';
const LINE_OPACITY = 0.12;

// Number of meridians (longitude lines) and parallels (latitude lines).
const MERIDIANS = 12;
const PARALLELS = 6;
const SEGMENTS = 64;

/**
 * Latitude/longitude grid lines for the "developer grid" look.
 * Renders ~12 meridians and ~6 parallels at GLOBE_RADIUS * 1.001.
 */
export function Graticule() {
  const lines = useMemo<THREE.Vector3[][]>(() => {
    const out: THREE.Vector3[][] = [];

    // Meridians: fixed longitude, sweep latitude -90..90.
    for (let m = 0; m < MERIDIANS; m++) {
      const lng = -180 + (360 / MERIDIANS) * m;
      const pts: THREE.Vector3[] = [];
      for (let s = 0; s <= SEGMENTS; s++) {
        const lat = -90 + (180 / SEGMENTS) * s;
        pts.push(latLngToVec3(lat, lng, GRID_RADIUS));
      }
      out.push(pts);
    }

    // Parallels: fixed latitude, sweep longitude -180..180.
    // Skip the poles (offset by one step) to avoid degenerate rings.
    for (let p = 1; p <= PARALLELS; p++) {
      const lat = -90 + (180 / (PARALLELS + 1)) * p;
      const pts: THREE.Vector3[] = [];
      for (let s = 0; s <= SEGMENTS; s++) {
        const lng = -180 + (360 / SEGMENTS) * s;
        pts.push(latLngToVec3(lat, lng, GRID_RADIUS));
      }
      out.push(pts);
    }

    return out;
  }, []);

  return (
    <group>
      {lines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color={LINE_COLOR}
          lineWidth={0.5}
          transparent
          opacity={LINE_OPACITY}
          toneMapped={false}
        />
      ))}
    </group>
  );
}

export default Graticule;
