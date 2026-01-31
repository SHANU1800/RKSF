import { useState, useEffect, useCallback } from 'react';
import { 
  getLocationWithAddress, 
  searchPlaces, 
  getPlaceDetails,
  checkLocationPermission 
} from '../utils/locationService';
import { 
  MapPinIcon, 
  CloseIcon, 
  AlertCircleIcon, 
  HomeIcon, 
  SearchIcon,
  CheckIcon,
  LockIcon,
  LoaderIcon,
  ChevronDownIcon
} from './icons/IconTypes';

// Debounce hook for search
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

export function LocationModal({ onSelectLocation, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [permissionState, setPermissionState] = useState('prompt');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Check location permission on mount
  useEffect(() => {
    checkLocationPermission().then(setPermissionState);
  }, []);

  // Search places when query changes
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setSearchResults([]);
      return;
    }

    const search = async () => {
      setSearchLoading(true);
      try {
        const results = await searchPlaces(debouncedSearch);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    search();
  }, [debouncedSearch]);

  const handleGetCurrentLocation = useCallback(async () => {
    setError(null);
    setLoading(true);
    setShowSearch(false);

    try {
      const addr = await getLocationWithAddress();
      setLocation(addr);
    } catch (err) {
      setError(err.message || 'Failed to get location');
      // Update permission state if denied
      if (err.message?.includes('permission denied')) {
        setPermissionState('denied');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectPlace = useCallback(async (place) => {
    setError(null);
    setLoading(true);
    setShowSearch(false);
    setSearchQuery('');

    try {
      const details = await getPlaceDetails(place.placeId);
      setLocation(details);
    } catch (err) {
      setError(err.message || 'Failed to get place details');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (location) {
      onSelectLocation(location);
      onClose();
    }
  }, [location, onSelectLocation, onClose]);

  const handleReset = useCallback(() => {
    setLocation(null);
    setError(null);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="glass-panel rounded-t-3xl sm:rounded-2xl border border-white/10 p-6 sm:max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease-out]">
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 sm:hidden" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-500)] flex items-center justify-center shadow-lg">
              <MapPinIcon size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Select Location</h2>
              <p className="text-gray-400 text-xs">Set your delivery address</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all active:scale-95"
            aria-label="Close"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-xl text-sm mb-6 flex items-center gap-3">
            <AlertCircleIcon size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Permission denied warning */}
        {permissionState === 'denied' && !location && (
          <div className="bg-amber-900/30 border border-amber-500/50 text-amber-300 p-4 rounded-xl text-sm mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircleIcon size={16} />
              <span className="font-semibold">Location Access Denied</span>
            </div>
            <p className="text-xs opacity-80">
              Please enable location access in your browser settings, or search for your address manually.
            </p>
          </div>
        )}

        {location ? (
          /* Location confirmed view */
          <div className="space-y-4 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <HomeIcon size={24} className="text-primary-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Address</p>
                  <p className="text-white mt-1 text-sm leading-relaxed">{location.fullAddress}</p>
                  {location.isApproximate && (
                    <p className="text-amber-400 text-xs mt-1">Approximate location</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">City</p>
                  <p className="text-white mt-1 text-sm font-medium truncate">{location.city || '—'}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">State</p>
                  <p className="text-white mt-1 text-sm font-medium truncate">{location.state || '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Postal Code</p>
                  <p className="text-white mt-1 text-sm font-medium">{location.postalCode || '—'}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Country</p>
                  <p className="text-white mt-1 text-sm font-medium truncate">{location.country || '—'}</p>
                </div>
              </div>

              {/* Coordinates (collapsible) */}
              <details className="border-t border-white/10 pt-3">
                <summary className="flex items-center gap-2 text-gray-400 text-xs cursor-pointer hover:text-gray-300 transition-colors">
                  <ChevronDownIcon size={14} className="transition-transform" />
                  <span className="uppercase font-semibold tracking-wide">Coordinates</span>
                </summary>
                <p className="text-white text-sm font-mono bg-slate-900/50 px-3 py-2 rounded-lg mt-2">
                  {location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)}
                </p>
              </details>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold border border-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ChevronDownIcon size={16} className="rotate-90" />
                Change
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-4 rounded-xl bg-[var(--color-accent-500)] hover:bg-[var(--color-accent-600)] text-white font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <CheckIcon size={16} />
                Confirm
              </button>
            </div>
          </div>
        ) : (
          /* Location selection view */
          <div className="space-y-4 mb-6">
            {/* Search input */}
            <div className="relative">
              <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearch(true);
                }}
                onFocus={() => setShowSearch(true)}
                placeholder="Search for an address..."
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
              />
              {searchLoading && (
                <LoaderIcon size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              )}
            </div>

            {/* Search results */}
            {showSearch && searchResults.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl max-h-48 overflow-y-auto">
                {searchResults.map((place) => (
                  <button
                    key={place.placeId}
                    onClick={() => handleSelectPlace(place)}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-start gap-3 border-b border-white/5 last:border-0"
                  >
                    <MapPinIcon size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{place.mainText}</p>
                      <p className="text-gray-400 text-xs truncate">{place.secondaryText}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 text-gray-500 text-xs">
              <div className="flex-1 h-px bg-white/10" />
              <span>or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Current location button */}
            <button
              onClick={handleGetCurrentLocation}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] disabled:opacity-60 text-white font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <LoaderIcon size={20} />
                  <span>Getting location...</span>
                </>
              ) : (
                <>
                  <MapPinIcon size={20} />
                  <span>Use Current Location</span>
                </>
              )}
            </button>

            {/* Privacy note */}
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <LockIcon size={18} className="text-gray-400 shrink-0" />
              <p className="text-xs text-gray-400">
                Your location is stored securely to estimate distance and ETA. You can update it anytime.
              </p>
            </div>
          </div>
        )}

        {/* Cancel button */}
        <button
          onClick={onClose}
          className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/5 transition-all active:scale-[0.98]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
