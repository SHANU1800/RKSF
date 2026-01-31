import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../utils/apiConfig';

const API_BASE = API_BASE_URL;

// Custom hook for safety API calls
export function useSafetyAPI() {
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // Verification APIs
  const uploadVerification = async (data) => {
    const res = await fetch(`${API_BASE}/safety/verification/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  };

  const getVerificationStatus = async () => {
    const res = await fetch(`${API_BASE}/safety/verification/status`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  };

  // Safety Preferences APIs
  const getSafetyPreferences = async () => {
    const res = await fetch(`${API_BASE}/safety/preferences`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  };

  const updateSafetyPreferences = async (data) => {
    const res = await fetch(`${API_BASE}/safety/preferences`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  };

  const addTrustedContact = async (contact) => {
    const res = await fetch(`${API_BASE}/safety/preferences/trusted-contacts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(contact),
    });
    return res.json();
  };

  const removeTrustedContact = async (contactId) => {
    const res = await fetch(`${API_BASE}/safety/preferences/trusted-contacts/${contactId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  };

  const acceptConductAgreement = async () => {
    const res = await fetch(`${API_BASE}/safety/preferences/conduct-agreement`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  };

  const completeTraining = async (trainingType) => {
    const res = await fetch(`${API_BASE}/safety/preferences/complete-training`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ trainingType }),
    });
    return res.json();
  };

  // Visit Session APIs
  const createVisitSession = async (data) => {
    const res = await fetch(`${API_BASE}/safety/visit-session`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  };

  const verifyCheckInCode = async (sessionId, code) => {
    const res = await fetch(`${API_BASE}/safety/visit-session/${sessionId}/verify-code`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code }),
    });
    return res.json();
  };

  const updateLocation = async (sessionId, location) => {
    const res = await fetch(`${API_BASE}/safety/visit-session/${sessionId}/location`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(location),
    });
    return res.json();
  };

  const performCheckIn = async (sessionId) => {
    const res = await fetch(`${API_BASE}/safety/visit-session/${sessionId}/check-in`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  };

  const triggerSOS = async (sessionId, data) => {
    const res = await fetch(`${API_BASE}/safety/visit-session/${sessionId}/sos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  };

  const completeSession = async (sessionId, data) => {
    const res = await fetch(`${API_BASE}/safety/visit-session/${sessionId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  };

  const getETALink = async (sessionId) => {
    const res = await fetch(`${API_BASE}/safety/visit-session/${sessionId}/eta-link`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  };

  const requestScopeChange = async (sessionId, data) => {
    const res = await fetch(`${API_BASE}/safety/visit-session/${sessionId}/scope-change`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  };

  const consentScopeChange = async (sessionId, changeIndex) => {
    const res = await fetch(`${API_BASE}/safety/visit-session/${sessionId}/scope-change/${changeIndex}/consent`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  };

  // Incident APIs
  const reportIncident = async (data) => {
    const res = await fetch(`${API_BASE}/safety/incidents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  };

  const getIncidents = async () => {
    const res = await fetch(`${API_BASE}/safety/incidents`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  };

  // Rating APIs
  const submitSafetyRating = async (data) => {
    const res = await fetch(`${API_BASE}/safety/ratings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  };

  const getUserSafetyRatings = async (userId) => {
    const res = await fetch(`${API_BASE}/safety/ratings/user/${userId}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  };

  // Matched Providers
  const getMatchedProviders = async () => {
    const res = await fetch(`${API_BASE}/safety/providers/matched`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  };

  return {
    uploadVerification,
    getVerificationStatus,
    getSafetyPreferences,
    updateSafetyPreferences,
    addTrustedContact,
    removeTrustedContact,
    acceptConductAgreement,
    completeTraining,
    createVisitSession,
    verifyCheckInCode,
    updateLocation,
    performCheckIn,
    triggerSOS,
    completeSession,
    getETALink,
    requestScopeChange,
    consentScopeChange,
    reportIncident,
    getIncidents,
    submitSafetyRating,
    getUserSafetyRatings,
    getMatchedProviders,
  };
}

// Hook for location tracking during visits
export function useLocationTracking(sessionId, enabled = true) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const { updateLocation } = useSafetyAPI();

  useEffect(() => {
    if (!enabled || !sessionId) return;

    let watchId;
    
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setLocation(loc);
          updateLocation(sessionId, loc);
        },
        (err) => setError(err.message),
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [sessionId, enabled]);

  return { location, error };
}

// Hook for check-in timer
export function useCheckInTimer(sessionId, intervalMinutes = 30) {
  const [nextCheckIn, setNextCheckIn] = useState(null);
  const [isOverdue, setIsOverdue] = useState(false);
  const { performCheckIn } = useSafetyAPI();

  useEffect(() => {
    if (!sessionId) return;

    const interval = intervalMinutes * 60 * 1000;
    setNextCheckIn(new Date(Date.now() + interval));

    const timer = setInterval(() => {
      const now = new Date();
      if (nextCheckIn && now > nextCheckIn) {
        setIsOverdue(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionId, intervalMinutes]);

  const doCheckIn = useCallback(async () => {
    if (!sessionId) return;
    await performCheckIn(sessionId);
    setNextCheckIn(new Date(Date.now() + intervalMinutes * 60 * 1000));
    setIsOverdue(false);
  }, [sessionId, intervalMinutes, performCheckIn]);

  return { nextCheckIn, isOverdue, doCheckIn };
}
