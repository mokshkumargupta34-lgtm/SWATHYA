/**
 * Small geo helpers for the "pharmacies near me" view. All distance math runs in
 * the browser from the user's granted coordinates — their location is never sent
 * to the server.
 *
 * The seeded pharmacies are sample data, so we place each one at its catalogued
 * distance (`distance_km`) from the user, along a stable bearing derived from its
 * name. That gives a genuine, location-aware distance and a working directions
 * link wherever the user happens to be.
 */

export type LatLng = { lat: number; lng: number };

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Great-circle distance between two points, in kilometres. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** The point that is `distanceKm` away from `origin` along `bearingDeg`. */
export function destinationPoint(
  origin: LatLng,
  distanceKm: number,
  bearingDeg: number,
): LatLng {
  const d = distanceKm / EARTH_RADIUS_KM;
  const brng = toRad(bearingDeg);
  const lat1 = toRad(origin.lat);
  const lng1 = toRad(origin.lng);
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2),
    );
  return { lat: toDeg(lat2), lng: toDeg(lng2) };
}

/** A stable 0-359 bearing from a string, so a pharmacy keeps a consistent direction. */
export function bearingFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

/** Human-friendly distance: metres under 1 km, else one decimal of km. */
export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
