const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

export const haversineDistanceKm = (lat1, lng1, lat2, lng2) => {
  const values = [lat1, lng1, lat2, lng2].map(Number);
  if (values.some((value) => !Number.isFinite(value))) return null;

  const [latA, lngA, latB, lngB] = values;
  const dLat = toRadians(latB - latA);
  const dLng = toRadians(lngB - lngA);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(latA)) *
      Math.cos(toRadians(latB)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.asin(Math.sqrt(a));
  return EARTH_RADIUS_KM * c;
};

export const estimateBikeEtaMinutes = (distanceKm, speedKmh = 30) => {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) return null;
  const hours = distanceKm / speedKmh;
  return Math.max(1, Math.round(hours * 60));
};

