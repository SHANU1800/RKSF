import { useState, useEffect, useCallback } from 'react';
import { useSafetyAPI } from '../../hooks/useSafety';

// ============================================
// PROVIDER MATCHING FILTER - Safety-aware provider search
// ============================================
export default function ProviderMatchingFilter({ serviceType, onProvidersLoaded }) {
  const [filters, setFilters] = useState({
    preferWomen: false,
    daytimeOnly: false,
    buddyRequired: false,
    minSafetyScore: 0,
  });
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { getMatchedProviders } = useSafetyAPI();

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMatchedProviders({
        serviceType,
        preferWomen: filters.preferWomen,
        daytimeOnly: filters.daytimeOnly,
        buddyRequired: filters.buddyRequired,
      });
      
      let filteredResult = result.data || [];
      
      // Apply client-side safety score filter
      if (filters.minSafetyScore > 0) {
        filteredResult = filteredResult.filter(
          p => (p.safetyScore || 0) >= filters.minSafetyScore
        );
      }
      
      setProviders(filteredResult);
      onProvidersLoaded?.(filteredResult);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    }
    setLoading(false);
  }, [serviceType, filters.preferWomen, filters.daytimeOnly, filters.buddyRequired, filters.minSafetyScore, getMatchedProviders, onProvidersLoaded]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all"
      >
        <span>🛡️</span>
        Safety Filters
        <span className={`ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {/* Filter Panel */}
      {showFilters && (
        <div className="glass-panel rounded-2xl p-4 border border-white/10 space-y-4 animate-[slideDown_0.2s_ease-out]">
          <h4 className="text-white font-bold flex items-center gap-2">
            <span>🛡️</span> Safety Preferences
          </h4>

          {/* Prefer Women Provider */}
          <label className="flex items-center justify-between bg-white/5 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3">
              <span className="text-pink-400">👩</span>
              <div>
                <span className="text-white font-medium">Prefer Women Provider</span>
                <p className="text-gray-400 text-xs">Only show female service providers</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${filters.preferWomen ? 'bg-emerald-500' : 'bg-gray-600'}`}>
              <input
                type="checkbox"
                checked={filters.preferWomen}
                onChange={(e) => setFilters({ ...filters, preferWomen: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${filters.preferWomen ? 'translate-x-6' : ''}`} />
            </div>
          </label>

          {/* Daytime Only */}
          <label className="flex items-center justify-between bg-white/5 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3">
              <span className="text-amber-400">☀️</span>
              <div>
                <span className="text-white font-medium">Daytime Visit Only</span>
                <p className="text-gray-400 text-xs">Schedule during daylight hours</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${filters.daytimeOnly ? 'bg-emerald-500' : 'bg-gray-600'}`}>
              <input
                type="checkbox"
                checked={filters.daytimeOnly}
                onChange={(e) => setFilters({ ...filters, daytimeOnly: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${filters.daytimeOnly ? 'translate-x-6' : ''}`} />
            </div>
          </label>

          {/* Buddy Visit */}
          <label className="flex items-center justify-between bg-white/5 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3">
              <span className="text-blue-400">👥</span>
              <div>
                <span className="text-white font-medium">Buddy Visit Available</span>
                <p className="text-gray-400 text-xs">Provider who can bring a colleague</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${filters.buddyRequired ? 'bg-emerald-500' : 'bg-gray-600'}`}>
              <input
                type="checkbox"
                checked={filters.buddyRequired}
                onChange={(e) => setFilters({ ...filters, buddyRequired: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${filters.buddyRequired ? 'translate-x-6' : ''}`} />
            </div>
          </label>

          {/* Minimum Safety Score */}
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-emerald-400">⭐</span>
              <div>
                <span className="text-white font-medium">Minimum Safety Score</span>
                <p className="text-gray-400 text-xs">Only show highly-rated providers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minSafetyScore}
                onChange={(e) => setFilters({ ...filters, minSafetyScore: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-white font-bold min-w-10 text-right">
                {filters.minSafetyScore > 0 ? `${filters.minSafetyScore}+` : 'Any'}
              </span>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-gray-400 text-sm">
              {loading ? (
                'Loading...'
              ) : (
                `${providers.length} provider${providers.length !== 1 ? 's' : ''} match`
              )}
            </span>
            <button
              onClick={() => setFilters({
                preferWomen: false,
                daytimeOnly: false,
                buddyRequired: false,
                minSafetyScore: 0,
              })}
              className="text-emerald-400 text-sm font-medium hover:underline"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Quick Safety Badges */}
      {!showFilters && (
        <div className="flex gap-2 flex-wrap">
          {filters.preferWomen && (
            <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-xs flex items-center gap-1">
              👩 Women Only
              <button
                onClick={() => setFilters({ ...filters, preferWomen: false })}
                className="ml-1 hover:text-pink-300"
              >
                ✕
              </button>
            </span>
          )}
          {filters.daytimeOnly && (
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs flex items-center gap-1">
              ☀️ Daytime
              <button
                onClick={() => setFilters({ ...filters, daytimeOnly: false })}
                className="ml-1 hover:text-amber-300"
              >
                ✕
              </button>
            </span>
          )}
          {filters.buddyRequired && (
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs flex items-center gap-1">
              👥 Buddy
              <button
                onClick={() => setFilters({ ...filters, buddyRequired: false })}
                className="ml-1 hover:text-blue-300"
              >
                ✕
              </button>
            </span>
          )}
          {filters.minSafetyScore > 0 && (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs flex items-center gap-1">
              🛡️ {filters.minSafetyScore}+ Score
              <button
                onClick={() => setFilters({ ...filters, minSafetyScore: 0 })}
                className="ml-1 hover:text-emerald-300"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// PROVIDER SAFETY CARD - Shows provider with safety info
// ============================================
export function ProviderSafetyCard({ provider, onSelect }) {
  const getSafetyColor = (score) => {
    if (score >= 4.5) return 'emerald';
    if (score >= 4) return 'blue';
    if (score >= 3) return 'amber';
    return 'gray';
  };

  const color = getSafetyColor(provider.safetyScore);

  return (
    <div
      onClick={() => onSelect?.(provider)}
      className="glass-panel rounded-2xl p-4 border border-white/10 hover:border-white/30 cursor-pointer transition-all hover:scale-[1.02]"
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/20">
            <img
              src={provider.avatar || 'https://via.placeholder.com/100'}
              alt={provider.name}
              className="w-full h-full object-cover"
            />
          </div>
          {provider.verificationLevel === 'verified' || provider.verificationLevel === 'premium' ? (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-slate-900">
              ✓
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-white font-bold truncate">{provider.name}</h4>
            <div className={`px-2 py-1 bg-${color}-500/20 text-${color}-400 rounded-lg text-xs font-medium flex items-center gap-1`}>
              🛡️ {provider.safetyScore?.toFixed(1) || 'N/A'}
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
            <span>⭐ {provider.rating?.toFixed(1) || 'N/A'}</span>
            <span>•</span>
            <span>{provider.totalReviews || 0} reviews</span>
          </div>

          {/* Safety Badges */}
          <div className="flex gap-1 flex-wrap">
            {provider.gender === 'female' && (
              <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 rounded text-xs">
                👩 Woman
              </span>
            )}
            {provider.trainingCompleted && (
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                📚 Trained
              </span>
            )}
            {provider.buddyAvailable && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">
                👥 Buddy OK
              </span>
            )}
            {provider.daytimeOnly && (
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                ☀️ Daytime
              </span>
            )}
            {provider.feltSafePercent >= 95 && (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                💚 {Math.round(provider.feltSafePercent)}% Safe
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
