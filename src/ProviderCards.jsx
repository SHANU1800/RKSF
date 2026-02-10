function ProviderCards({ providers }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {providers.length === 0 ? (
        <div className="col-span-full text-center py-12 md:py-8 text-gray-400 text-sm md:text-base">
          No providers available yet
        </div>
      ) : (
        providers.map((provider, idx) => (
          <div key={provider._id} className="glass-panel rounded-xl md:rounded-2xl overflow-hidden card-hover border-2 border-[#00f0ff]/20 flex flex-col shadow-lg hover:shadow-[#00f0ff]/20 animate-slide-up"
            style={{ animationDelay: `${idx * 80}ms` }}>
            {/* Provider Avatar */}
            <div className="bg-gradient-to-br from-zinc-900 to-black h-24 md:h-32 flex items-center justify-center relative overflow-hidden">
              <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id={`provider-grid-${provider._id}`} width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#provider-grid-${provider._id})`} />
              </svg>
              {provider.avatar ? (
                <img 
                  src={provider.avatar} 
                  alt={provider.name || 'Provider Avatar'}
                  className="w-16 md:w-20 h-16 md:h-20 rounded-full border-4 border-[#00f0ff] shadow-xl object-cover shadow-[#00f0ff]/30"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="w-16 md:w-20 h-16 md:h-20 bg-gradient-to-br from-[#00f0ff] to-[#33f3ff] rounded-full border-4 border-[#00f0ff] shadow-xl items-center justify-center text-2xl md:text-3xl font-bold text-black" style={{ display: provider.avatar ? 'none' : 'flex' }}>
                {provider.name?.charAt(0).toUpperCase() || '?'}
              </div>
            </div>

            {/* Provider Info */}
            <div className="p-4 md:p-6 space-y-3 flex-1 flex flex-col">
              <div>
                <h3 className="text-base md:text-xl font-bold text-white line-clamp-2">{provider.name}</h3>
                <p className="text-gray-400 text-xs md:text-sm line-clamp-1">{provider.email}</p>
              </div>

              {(() => {
                const displayRating = Number.isFinite(provider.rating) ? provider.rating : 4.5;
                return (
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400 text-base md:text-lg">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          {i < Math.round(displayRating) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="pill text-xs bg-[#00f0ff]/10 border-[#00f0ff]/30 text-[#00f0ff]">{displayRating.toFixed(1)}</span>
                  </div>
                );
              })()}

              <div className="text-xs text-[#00f0ff] font-semibold">
                {provider.distanceKm != null && provider.etaMinutes != null
                  ? `${provider.distanceKm.toFixed(1)} km | ${provider.etaMinutes} min`
                  : provider.location?.latitude && provider.location?.longitude
                    ? 'Add your location to see distance'
                    : 'Location unavailable'}
              </div>

              {/* Bio */}
              {provider.bio && (
                <p className="text-gray-300 text-xs md:text-sm line-clamp-2">{provider.bio}</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-auto pt-2">
                <button
                  onClick={() => provider.onViewServices?.(provider)}
                  className="flex-1 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] hover:from-[#33f3ff] hover:to-[#00f0ff] hover:shadow-lg hover:shadow-[#00f0ff]/30 text-black font-semibold transition text-sm active:opacity-90"
                >
                  View Services
                </button>
                <button
                  onClick={() => provider.onContact?.(provider)}
                  className="flex-1 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-white/10 hover:bg-white/15 text-[#00f0ff] font-semibold transition border-2 border-[#00f0ff]/30 text-sm active:opacity-90"
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ProviderCards;












