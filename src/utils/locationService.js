// Location service using Browser Geolocation API + Google Geocoding
const GOOGLE_GEOCODE_API = 'https://maps.googleapis.com/maps/api/geocode/json';

export async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        resolve({ latitude, longitude, accuracy });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

export async function reverseGeocode(latitude, longitude) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  const response = await fetch(
    `${GOOGLE_GEOCODE_API}?latlng=${latitude},${longitude}&key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error('Geocoding request failed');
  }

  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Geocoding error: ${data.status}`);
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
    city: getAddressComponent(addressComponents, 'locality') || 
          getAddressComponent(addressComponents, 'administrative_area_level_3'),
    state: getAddressComponent(addressComponents, 'administrative_area_level_1'),
    postalCode: getAddressComponent(addressComponents, 'postal_code'),
    country: getAddressComponent(addressComponents, 'country'),
    latitude,
    longitude,
    placeId: mainResult.place_id,
  };

  return address;
}

function getAddressComponent(components, type) {
  const component = components.find((c) => c.types.includes(type));
  return component ? component.long_name : null;
}

export async function getLocationWithAddress() {
  const coords = await getCurrentLocation();
  const address = await reverseGeocode(coords.latitude, coords.longitude);
  return address;
}
