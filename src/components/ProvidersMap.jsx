import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../utils/googleMapsLoader';

const getLatLng = (location) => {
  if (!location) return null;
  const lat = Number(location.latitude);
  const lng = Number(location.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
};

const getInitialCenter = (userLocation, providers) => {
  const userLatLng = getLatLng(userLocation);
  if (userLatLng) return userLatLng;

  for (const provider of providers) {
    const providerLatLng = getLatLng(provider.location);
    if (providerLatLng) return providerLatLng;
  }

  return { lat: 20, lng: 0 };
};

const getInitialZoom = (userLocation, providers) => {
  if (getLatLng(userLocation)) return 12;
  for (const provider of providers) {
    if (getLatLng(provider.location)) return 10;
  }
  return 2;
};

export default function ProvidersMap({ userLocation, providers }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => {
      if (typeof marker.setMap === 'function') {
        marker.setMap(null);
      } else {
        marker.map = null;
      }
    });
    markersRef.current = [];
  };

  useEffect(() => {
    let isActive = true;

    const initMap = async () => {
      try {
        const google = await loadGoogleMaps();
        await google.maps.importLibrary('maps');

        if (!isActive || !mapRef.current) return;

        const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
        if (mapId) {
          await google.maps.importLibrary('marker');
        }
        const center = getInitialCenter(userLocation, providers);
        const zoom = getInitialZoom(userLocation, providers);

        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapId: mapId || undefined,
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
        });

        setMapReady(true);
      } catch (err) {
        if (isActive) setError(err.message || 'Failed to load map');
      }
    };

    initMap();

    return () => {
      isActive = false;
      clearMarkers();
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const google = window.google;
    clearMarkers();

    const bounds = new google.maps.LatLngBounds();
    const useAdvancedMarkers = Boolean(import.meta.env.VITE_GOOGLE_MAPS_MAP_ID);

    const addMarker = (position, title, label) => {
      if (useAdvancedMarkers && google.maps.marker?.AdvancedMarkerElement) {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position,
          title,
        });
        markersRef.current.push(marker);
        return marker;
      }

      const marker = new google.maps.Marker({
        map,
        position,
        title,
        label,
      });
      markersRef.current.push(marker);
      return marker;
    };

    const userLatLng = getLatLng(userLocation);
    if (userLatLng) {
      addMarker(userLatLng, 'You', 'Y');
      bounds.extend(userLatLng);
    }

    providers.forEach((provider) => {
      const providerLatLng = getLatLng(provider.location);
      if (!providerLatLng) return;
      addMarker(providerLatLng, provider.name || 'Provider', 'P');
      bounds.extend(providerLatLng);
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 60);
    }
  }, [mapReady, providers, userLocation]);

  if (error) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 text-gray-300 p-4 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-white/10 bg-slate-900/70">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}












