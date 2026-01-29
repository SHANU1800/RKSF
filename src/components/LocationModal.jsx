import { useState } from 'react';
import { getLocationWithAddress } from '../utils/locationService';

export function LocationModal({ onSelectLocation, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  const handleGetCurrentLocation = async () => {
    setError(null);
    setLoading(true);

    try {
      const addr = await getLocationWithAddress();
      setLocation(addr);
    } catch (err) {
      setError(err.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (location) {
      onSelectLocation(location);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-panel rounded-2xl border border-white/10 p-6 max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto -webkit-overflow-scrolling-touch">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">📍 Select Location</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl flex-shrink-0 w-8 h-8 flex items-center justify-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {location ? (
          <div className="space-y-4 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Address</p>
                <p className="text-white mt-1">{location.fullAddress}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">City</p>
                  <p className="text-white mt-1 text-sm sm:text-base">{location.city || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">State</p>
                  <p className="text-white mt-1 text-sm sm:text-base">{location.state || '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Postal Code</p>
                  <p className="text-white mt-1 text-sm sm:text-base">{location.postalCode || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Country</p>
                  <p className="text-white mt-1 text-sm sm:text-base">{location.country || '—'}</p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3">
                <p className="text-xs text-gray-400 uppercase font-semibold">Coordinates</p>
                <p className="text-white text-sm mt-1 font-mono">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setLocation(null);
                  setError(null);
                }}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold border border-white/10 transition"
              >
                Change
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-lg hover:shadow-emerald-500/20 text-white font-semibold transition"
              >
                ✓ Confirm
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <p className="text-gray-300 text-sm">
              📌 Share your location to auto-fill delivery address
            </p>

            <button
              onClick={handleGetCurrentLocation}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-60 text-white font-semibold transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Getting location...
                </>
              ) : (
                <>
                  📍 Use Current Location
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Your location is used only for address lookup. No tracking occurs.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/5 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
