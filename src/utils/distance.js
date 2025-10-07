/**
 * Distance calculation utilities
 * Uses the Haversine formula to calculate distance between two coordinates
 */

/**
 * Convert degrees to radians
 * @param {number} value - Value in degrees
 * @returns {number} Value in radians
 */
const toRad = (value) => {
  return (value * Math.PI) / 180;
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers, rounded to 1 decimal place
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Calculate distance and format as string with precise units
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {string} Formatted distance string (e.g., "12.8km" or "800m")
 */
export const getFormattedDistance = (lat1, lon1, lat2, lon2) => {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  
  // If distance is less than 1km, show in meters
  if (distance < 1) {
    const meters = Math.round(distance * 1000);
    return `${meters}m`;
  }
  
  // Otherwise show in kilometers with 1 decimal place
  return `${distance.toFixed(1)}km`;
};

/**
 * Sort array of items by distance from a reference point
 * @param {Array} items - Array of items with coordinates property
 * @param {number} refLat - Reference latitude
 * @param {number} refLng - Reference longitude
 * @returns {Array} Sorted array by distance (closest first)
 */
export const sortByDistance = (items, refLat, refLng) => {
  return items
    .map(item => ({
      ...item,
      distance: calculateDistance(
        refLat,
        refLng,
        item.coordinates?.latitude || item.coordinates?.lat || 0,
        item.coordinates?.longitude || item.coordinates?.lng || 0
      )
    }))
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Filter items by maximum distance
 * @param {Array} items - Array of items with distance property
 * @param {number|null} maxDistance - Maximum distance in km (null for no filter)
 * @returns {Array} Filtered array
 */
export const filterByDistance = (items, maxDistance) => {
  if (!maxDistance) return items;
  return items.filter(item => item.distance <= maxDistance);
};

/**
 * Format a distance value (in km) to a string with proper units
 * @param {number|string} distance - Distance in kilometers
 * @returns {string} Formatted distance (e.g., "12.8km" or "800m")
 */
export const formatDistance = (distance) => {
  // Handle string inputs and edge cases
  if (!distance || distance === 'N/A' || distance === 'Unknown') return 'N/A';
  
  const distanceKm = typeof distance === 'string' ? parseFloat(distance) : distance;
  
  if (isNaN(distanceKm)) return 'N/A';
  
  // If less than 1km, show in meters
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters}m`;
  }
  
  // Otherwise show in kilometers with 1 decimal place
  return `${distanceKm.toFixed(1)}km`;
};
