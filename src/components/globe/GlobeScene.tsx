import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

import { Earth } from "./Earth";
import { CityPin } from "./CityPin";
import { Starfield } from "./Starfield";
import { GLOBE_RADIUS, latLngToVec3 } from "./hooks/latLngToVec3";
import { awards, cities, contact, type Company } from "../../data/resume";

import { BootSequence } from "../ui/BootSequence";
import { CompanyList } from "../ui/CompanyList";
import { CompanyPopover } from "../ui/CompanyPopover";
import { AwardsFooter } from "../ui/AwardsFooter";
import { FullResumePanel } from "../ui/FullResumePanel";

// Tip the north pole toward the camera so the northern hemisphere (where every
// city sits, ~25–51°N) faces the viewer instead of riding the top edge.
const GLOBE_TILT = 0.52; // radians (~30°)

// Default orientation: face the centroid of all city longitudes so the pins sit
// in view from the start (cities cluster around the North Atlantic).
const OVERVIEW_Y = (() => {
  const c = new THREE.Vector3();
  for (const city of cities) c.add(latLngToVec3(city.lat, city.lng, 1));
  c.normalize();
  return Math.atan2(-c.x, c.z);
})();

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

interface RotatingGlobeProps {
  hoveredCityId: string | null;
  selectedCityId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  reducedMotion: boolean;
}

/** The globe group: eases the cities into view, or the selected city to front. */
function RotatingGlobe({
  hoveredCityId,
  selectedCityId,
  onHover,
  onSelect,
  reducedMotion,
}: RotatingGlobeProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Y-rotation that brings the selected city to front-center (toward +Z
  // camera). null → auto-rotate (no city selected).
  const targetY = useMemo(() => {
    if (!selectedCityId) return null;
    const city = cities.find((c) => c.id === selectedCityId);
    if (!city) return null;
    const v = latLngToVec3(city.lat, city.lng, GLOBE_RADIUS);
    return Math.atan2(-v.x, v.z);
  }, [selectedCityId]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const dt = Math.min(delta, 0.1);

    // Idle: slow auto-rotation. Selected: ease the city to front.
    if (targetY === null) {
      if (!reducedMotion) group.rotation.y += dt * 0.12;
      return;
    }

    const cur = group.rotation.y;
    const twoPi = Math.PI * 2;
    const wrapped =
      cur + ((((targetY - cur + Math.PI) % twoPi) + twoPi) % twoPi) - Math.PI;
    group.rotation.y = reducedMotion
      ? wrapped
      : THREE.MathUtils.damp(cur, wrapped, 3, dt);
  });

  return (
    <group rotation={[GLOBE_TILT, 0, 0]}>
      <group ref={groupRef} rotation={[0, OVERVIEW_Y, 0]}>
        <Earth>
          {cities.map((city) => (
            <CityPin
              key={city.id}
              city={city}
              hovered={hoveredCityId === city.id}
              selected={selectedCityId === city.id}
              onHover={onHover}
              onSelect={onSelect}
            />
          ))}
        </Earth>
      </group>
    </group>
  );
}

export default function GlobeScene() {
  const reducedMotion = usePrefersReducedMotion();
  const [booted, setBooted] = useState(false);
  const [hoveredCityId, setHoveredCityId] = useState<string | null>(null);
  // Start with Miami selected (its list shown, globe eased to it). Auto-rotation
  // resumes once the user deselects by clicking empty space.
  const [selectedCityId, setSelectedCityId] = useState<string | null>('mia');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [resumeOpen, setResumeOpen] = useState(false);
  const resumeCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Heuristic: skip the (heavy) bloom pass on small / low-core devices.
  const enableBloom = useMemo(() => {
    if (reducedMotion) return false;
    if (typeof window === "undefined") return true;
    const smallScreen = window.innerWidth < 768;
    const lowCore =
      typeof navigator !== "undefined" &&
      typeof navigator.hardwareConcurrency === "number" &&
      navigator.hardwareConcurrency <= 4;
    return !(smallScreen || lowCore);
  }, [reducedMotion]);

  // The panel shows the selected city if any, otherwise the hovered city.
  const displayCity = useMemo(() => {
    const id = selectedCityId ?? hoveredCityId;
    return id ? (cities.find((c) => c.id === id) ?? null) : null;
  }, [selectedCityId, hoveredCityId]);

  const handleSelectCity = (id: string) => {
    setSelectedCityId((prev) => (prev === id ? prev : id));
    setSelectedCompany(null);
  };

  const handleClearSelection = () => {
    setSelectedCityId(null);
    setSelectedCompany(null);
    setHoveredCityId(null);
  };

  // Résumé panel open/close with a small grace period so the pointer can travel
  // from the footer link to the panel without it snapping shut.
  const openResume = () => {
    if (resumeCloseTimer.current) {
      clearTimeout(resumeCloseTimer.current);
      resumeCloseTimer.current = null;
    }
    setResumeOpen(true);
  };
  const scheduleCloseResume = () => {
    if (resumeCloseTimer.current) clearTimeout(resumeCloseTimer.current);
    resumeCloseTimer.current = setTimeout(() => setResumeOpen(false), 220);
  };
  const closeResume = () => {
    if (resumeCloseTimer.current) clearTimeout(resumeCloseTimer.current);
    setResumeOpen(false);
  };
  const toggleResume = () => (resumeOpen ? closeResume() : openResume());
  useEffect(
    () => () => {
      if (resumeCloseTimer.current) clearTimeout(resumeCloseTimer.current);
    },
    [],
  );

  return (
    <>
      {!booted && <BootSequence onComplete={() => setBooted(true)} />}

      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={handleClearSelection}
      >
        <ambientLight intensity={0.6} />
        <Starfield />
        <RotatingGlobe
          hoveredCityId={hoveredCityId}
          selectedCityId={selectedCityId}
          onHover={setHoveredCityId}
          onSelect={handleSelectCity}
          reducedMotion={reducedMotion}
        />
        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={3.5}
          maxDistance={9}
          rotateSpeed={0.5}
          zoomSpeed={0.6}
          autoRotate={false}
        />
        {enableBloom && (
          <EffectComposer>
            <Bloom
              intensity={1.1}
              luminanceThreshold={0.15}
              luminanceSmoothing={0.5}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Canvas>

      <CompanyList
        city={displayCity}
        onSelectCompany={setSelectedCompany}
        selectedCompanyName={selectedCompany?.name ?? null}
      />
      <CompanyPopover
        company={selectedCompany}
        onClose={() => setSelectedCompany(null)}
      />
      <FullResumePanel
        open={resumeOpen}
        onEnter={openResume}
        onLeave={scheduleCloseResume}
        onClose={closeResume}
      />
      <AwardsFooter
        awards={awards}
        contact={contact}
        onResumeEnter={openResume}
        onResumeLeave={scheduleCloseResume}
        onResumeToggle={toggleResume}
        resumeOpen={resumeOpen}
      />
    </>
  );
}
