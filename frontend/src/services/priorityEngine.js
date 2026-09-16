// Distance & Quantity Priority Engine (TRD Section 12)
// Priority Score = (distance weight * distance score) + (quantity weight * quantity score)

/**
 * Calculates Haversine distance in kilometers between two geo coordinates.
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 5.0; // fallback default
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

/**
 * Calculates normalized distance score (0 - 100).
 * Shorter distance yields a higher score.
 * Example: <= 1km => 100; 15km => 0.
 */
export function computeDistanceScore(distanceKm) {
  if (distanceKm <= 0.5) return 100;
  if (distanceKm >= 15) return 5;
  return Math.max(5, Math.round(100 - (distanceKm / 15) * 95));
}

/**
 * Calculates normalized quantity score (0 - 100).
 * Higher servings/quantity rescued yields higher priority.
 * Example: 80+ servings => 100; 10 servings => 20.
 */
export function computeQuantityScore(servings) {
  if (!servings) return 20;
  return Math.min(100, Math.max(10, Math.round((servings / 80) * 100)));
}

/**
 * Computes composite priority score based on configurable weights.
 * @param {number} distanceKm
 * @param {number} servings
 * @param {number} distanceWeight (0.0 to 1.0)
 * @param {number} quantityWeight (0.0 to 1.0)
 */
export function calculatePriorityScore(
  distanceKm,
  servings,
  distanceWeight = 0.5,
  quantityWeight = 0.5
) {
  const distScore = computeDistanceScore(distanceKm);
  const qtyScore = computeQuantityScore(servings);
  
  const score = (distanceWeight * distScore) + (quantityWeight * qtyScore);
  return {
    compositeScore: Math.round(score),
    distanceKm,
    distanceScore: distScore,
    quantityScore: qtyScore,
    urgencyTier: score >= 75 ? 'HIGH' : score >= 45 ? 'MEDIUM' : 'STANDARD'
  };
}
