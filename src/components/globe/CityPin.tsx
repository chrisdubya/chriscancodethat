import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import type { City } from '../../data/resume';
import { latLngToVec3, GLOBE_RADIUS } from './hooks/latLngToVec3';

export interface CityPinProps {
  city: City;
  /** Is this city currently hovered. */
  hovered: boolean;
  /** Is this city currently selected. */
  selected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

const AMBER = '#ffb000';
const PIN_RADIUS = GLOBE_RADIUS * 1.02;
const HIT_RADIUS = 0.18;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function CityPin({ city, hovered, selected, onHover, onSelect }: CityPinProps) {
  const position = useMemo(
    () => latLngToVec3(city.lat, city.lng, PIN_RADIUS),
    [city.lat, city.lng]
  );

  const ringRef = useRef<THREE.Mesh>(null);
  const dotRef = useRef<THREE.Mesh>(null);

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
  }, []);

  const active = hovered || selected;

  // Reset body cursor on unmount to avoid a stuck pointer cursor.
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') document.body.style.cursor = '';
    };
  }, []);

  useFrame((state) => {
    const dotScale = active ? 1.6 : 1;
    if (dotRef.current) {
      dotRef.current.scale.setScalar(
        THREE.MathUtils.lerp(dotRef.current.scale.x, dotScale, 0.2)
      );
    }

    if (!ringRef.current) return;
    if (reducedMotion) {
      ringRef.current.scale.setScalar(active ? 1.4 : 1);
      const mat = ringRef.current.material as THREE.Material;
      mat.opacity = active ? 0.6 : 0.3;
      return;
    }
    const t = state.clock.elapsedTime;
    const pulse = 1 + (Math.sin(t * 3) * 0.5 + 0.5) * (active ? 0.8 : 0.4);
    ringRef.current.scale.setScalar(pulse);
    const mat = ringRef.current.material as THREE.Material;
    // Fade out as the ring expands.
    mat.opacity = THREE.MathUtils.clamp((active ? 0.7 : 0.4) * (1.6 - pulse), 0, 1);
  });

  return (
    <group position={position}>
      {/* Invisible, generous hit-area for hover/tap. */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(city.id);
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(null);
          if (typeof document !== 'undefined') document.body.style.cursor = '';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(city.id);
        }}
      >
        <sphereGeometry args={[HIT_RADIUS, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <Billboard>
        {/* Pulsing ring. */}
        <mesh ref={ringRef}>
          <ringGeometry args={[0.045, 0.06, 32]} />
          <meshBasicMaterial
            color={AMBER}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        {/* Glowing core dot. */}
        <mesh ref={dotRef}>
          <circleGeometry args={[0.035, 24]} />
          <meshBasicMaterial color={AMBER} toneMapped={false} />
        </mesh>

        {active && (
          <Text
            position={[0, 0.12, 0]}
            font="/fonts/orbitron-500.woff"
            fontSize={0.07}
            letterSpacing={0.08}
            color={AMBER}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.004}
            outlineColor="#000000"
          >
            {city.name.toUpperCase()}
          </Text>
        )}
      </Billboard>
    </group>
  );
}

export default CityPin;
