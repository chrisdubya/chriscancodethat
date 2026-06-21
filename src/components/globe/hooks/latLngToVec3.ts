import * as THREE from 'three';

/** Shared globe radius — used everywhere for consistent placement. */
export const GLOBE_RADIUS = 2;

/**
 * Convert geographic coordinates to a 3D position on a sphere.
 *
 * @param lat    Latitude in degrees (-90..90).
 * @param lng    Longitude in degrees (-180..180).
 * @param radius Sphere radius.
 */
export function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}
