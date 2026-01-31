/**
 * Location Service
 * Provides geolocation, geocoding, distance calculation, and places autocomplete
 * Uses Browser Geolocation API + Google Maps APIs with caching and fallbacks
 */

const GOOGLE_GEOCODE_API = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_PLACES_API = 'https://maps.googleapis.com/maps/api/place';

// Simple in-memory cache for geocode results
const geocodeCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Get the Google Maps API key from environment
 */
function getApiKey() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('Google Maps API key not configured. Some features may not work.');
  }
  return apiKey;
}

/**
 * Get current device location using Browser Geolocation API
 * @param {Object} options - Geolocation options
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
 */
export async function getCurrentLocation(options = {}) {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 60000, // Cache for 1 minute
    ...options,
  };

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
        resolve({
          latitude,
          longitude,
          accuracy,
          altitude: altitude ?? null,
          heading: heading ?? null,
          speed: speed ?? null,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        let message;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable. Please try again.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out. Please check your connection and try again.';
            break;
          default:
            message = `Unable to get location: ${error.message}`;
        }
        reject(new Error(message));
      },
      defaultOptions
    );
  });
}

/**
 * Generate cache key for coordinates
 */
function getCacheKey(latitude, longitude) {
  // Round to 5 decimal places (~1.1m precision) for cache efficiency
  return `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry) {
  return entry && (Date.now() - entry.timestamp) < CACHE_TTL;
}

/**
 * Reverse geocode coordinates to address using Google Geocoding API
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Object>} Address object
 */
export async function reverseGeocode(latitude, longitude) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    // Fallback: return coordinates without address details
    return {
      fullAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      city: null,
      state: null,
      postalCode: null,
      country: null,
      latitude,
      longitude,
      placeId: null,
      isApproximate: true,
    };
  }

  // Check cache first
  const cacheKey = getCacheKey(latitude, longitude);
  const cached = geocodeCache.get(cacheKey);
  if (isCacheValid(cached)) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `${GOOGLE_GEOCODE_API}?latlng=${latitude},${longitude}&key=${apiKey}&language=en`
    );

    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'ZERO_RESULTS') {
      return {
        fullAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        city: null,
        state: null,
        postalCode: null,
        country: null,
        latitude,
        longitude,
        placeId: null,
        isApproximate: true,
      };
    }

    if (data.status !== 'OK') {
      throw new Error(`Geocoding error: ${data.status} - ${data.error_message || ''}`);
    }

    const results = data.results;
    if (results.length === 0) {
      throw new Error('No address found for this location');
    }

    // Parse the most detailed address (first result)
    const mainResult = results[0];
    const addressComponents = mainResult.address_components;

    const address = {
      fullAddress: mainResult.formatted_address,
      streetNumber: getAddressComponent(addressComponents, 'street_number'),
      street: getAddressComponent(addressComponents, 'route'),
      neighborhood: getAddressComponent(addressComponents, 'neighborhood') ||
                    getAddressComponent(addressComponents, 'sublocality_level_1') ||
                    getAddressComponent(addressComponents, 'sublocality'),
      city: getAddressComponent(addressComponents, 'locality') ||
            getAddressComponent(addressComponents, 'administrative_area_level_3') ||
            getAddressComponent(addressComponents, 'administrative_area_level_2'),
      state: getAddressComponent(addressComponents, 'administrative_area_level_1'),
      stateCode: getAddressComponentShort(addressComponents, 'administrative_area_level_1'),
      postalCode: getAddressComponent(addressComponents, 'postal_code'),
      country: getAddressComponent(addressComponents, 'country'),
      countryCode: getAddressComponentShort(addressComponents, 'country'),
      latitude,
      longitude,
      placeId: mainResult.place_id,
      formattedTypes: mainResult.types,
      isApproximate: false,
    };

    // Cache the result
    geocodeCache.set(cacheKey, {
      data: address,
      timestamp: Date.now(),
    });

    return address;
  } catch (error) {
    console.error('Reverse geocode error:', error);
    // Return fallback with coordinates
    return {
      fullAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      city: null,
      state: null,
      postalCode: null,
      country: null,
      latitude,
      longitude,
      placeId: null,
      isApproximate: true,
      error: error.message,
    };
  }
}

/**
 * Get long name from address component
 */
function getAddressComponent(components, type) {
  const component = components.find((c) => c.types.includes(type));
  return component ? component.long_name : null;
}

/**
 * Get short name from address component
 */
function getAddressComponentShort(components, type) {
  const component = components.find((c) => c.types.includes(type));
  return component ? component.short_name : null;
}

/**
 * Get current location with address (combines getCurrentLocation + reverseGeocode)
 * @returns {Promise<Object>} Location object with coordinates and address
 */
export async function getLocationWithAddress() {
  const coords = await getCurrentLocation();
  const address = await reverseGeocode(coords.latitude, coords.longitude);
  return {
    ...address,
    accuracy: coords.accuracy,
    timestamp: coords.timestamp,
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @param {string} unit - Unit of distance ('km', 'mi', 'm')
 * @returns {number} Distance in specified unit
 */
export function calculateDistance(lat1, lon1, lat2, lon2, unit = 'km') {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  switch (unit) {
    case 'mi':
      return distanceKm * 0.621371;
    case 'm':
      return distanceKm * 1000;
    default:
      return distanceKm;
  }
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param {number} distance - Distance in km
 * @returns {string} Formatted distance string
 */
export function formatDistance(distance) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  if (distance < 10) {
    return `${distance.toFixed(1)} km`;
  }
  return `${Math.round(distance)} km`;
}

/**
 * Estimate travel time based on distance
 * @param {number} distanceKm - Distance in kilometers
 * @param {string} mode - Travel mode ('driving', 'walking', 'cycling')
 * @returns {Object} Estimated time in minutes and formatted string
 */
export function estimateTravelTime(distanceKm, mode = 'driving') {
  // Average speeds in km/h
  const speeds = {
    driving: 30, // Account for city traffic
    walking: 5,
    cycling: 15,
  };

  const speed = speeds[mode] || speeds.driving;
  const timeHours = distanceKm / speed;
  const timeMinutes = Math.round(timeHours * 60);

  let formatted;
  if (timeMinutes < 60) {
    formatted = `${timeMinutes} min`;
  } else {
    const hours = Math.floor(timeMinutes / 60);
    const mins = timeMinutes % 60;
    formatted = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  return {
    minutes: timeMinutes,
    formatted,
    mode,
  };
}

/**
 * Search for places using Google Places Autocomplete
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of place predictions
 */
export async function searchPlaces(query, options = {}) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.warn('Places search requires Google Maps API key');
    return [];
  }

  if (!query || query.length < 2) {
    return [];
  }

  const { 
    types = 'geocode',
    country = 'IN', // Default to India
    location = null, // { lat, lng } for bias
    radius = 50000, // 50km radius
  } = options;

  try {
    let url = `${GOOGLE_PLACES_API}/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}&types=${types}`;
    
    if (country) {
      url += `&components=country:${country}`;
    }
    
    if (location) {
      url += `&location=${location.lat},${location.lng}&radius=${radius}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Places search failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API error: ${data.status}`);
    }

    return (data.predictions || []).map((prediction) => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting?.main_text,
      secondaryText: prediction.structured_formatting?.secondary_text,
      types: prediction.types,
    }));
  } catch (error) {
    console.error('Places search error:', error);
    return [];
  }
}

/**
 * Get place details by place ID
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} Place details with coordinates
 */
export async function getPlaceDetails(placeId) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('Place details requires Google Maps API key');
  }

  try {
    const response = await fetch(
      `${GOOGLE_PLACES_API}/details/json?place_id=${placeId}&fields=geometry,formatted_address,address_components,name&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Place details request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Place details error: ${data.status}`);
    }

    const result = data.result;
    const location = result.geometry.location;
    const components = result.address_components || [];

    return {
      name: result.name,
      fullAddress: result.formatted_address,
      latitude: location.lat,
      longitude: location.lng,
      city: getAddressComponent(components, 'locality') ||
            getAddressComponent(components, 'administrative_area_level_3'),
      state: getAddressComponent(components, 'administrative_area_level_1'),
      postalCode: getAddressComponent(components, 'postal_code'),
      country: getAddressComponent(components, 'country'),
      placeId,
    };
  } catch (error) {
    console.error('Place details error:', error);
    throw error;
  }
}

/**
 * Watch user position with continuous updates
 * @param {Function} onUpdate - Callback for position updates
 * @param {Function} onError - Callback for errors
 * @param {Object} options - Geolocation options
 * @returns {number} Watch ID (use to clear with clearWatch)
 */
export function watchPosition(onUpdate, onError, options = {}) {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation is not supported'));
    return null;
  }

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 10000,
    ...options,
  };

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      onError(error);
    },
    defaultOptions
  );

  return watchId;
}

/**
 * Stop watching position
 * @param {number} watchId - Watch ID from watchPosition
 */
export function clearWatch(watchId) {
  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Check if location permission is granted
 * @returns {Promise<string>} Permission state: 'granted', 'denied', 'prompt'
 */
export async function checkLocationPermission() {
  if (!navigator.permissions) {
    // Fallback for browsers without permissions API
    return 'prompt';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch {
    return 'prompt';
  }
}

/**
 * Clear the geocode cache
 */
export function clearGeocodeCache() {
  geocodeCache.clear();
}
