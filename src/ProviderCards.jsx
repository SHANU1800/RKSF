function ProviderCards({ providers }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {providers.length === 0 ? (
        <div className="col-span-full text-center py-12 md:py-8 text-gray-400 text-sm md:text-base">
          No providers available yet
        </div>
      ) : (
        providers.map((provider, idx) => (
          <div key={provider._id} className="group glass-panel rounded-2xl overflow-hidden card-hover border border-[#00f0ff]/30 hover:border-[#00f0ff]/50 flex flex-col shadow-xl hover:shadow-[#00f0ff]/20 animate-slide-up transition-all aspect-4/3"
            style={{ animationDelay: `${idx * 80}ms` }}>
            {/* Provider Avatar - Circular */}
            <div className="bg-gradient-to-br from-zinc-900 to-black pt-8 pb-5 flex justify-center relative overflow-hidden">
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
                  className="w-28 h-28 rounded-full border-4 border-[#00f0ff] shadow-xl object-cover shadow-[#00f0ff]/30 relative z-10"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="w-28 h-28 bg-gradient-to-br from-[#00f0ff] to-[#33f3ff] rounded-full border-4 border-[#00f0ff] shadow-xl items-center justify-center text-3xl font-bold text-black relative z-10" style={{ display: provider.avatar ? 'none' : 'flex' }}>
                {provider.name?.charAt(0).toUpperCase() || '?'}
              </div>
            </div>

            {/* Provider Info - Bigger */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="mb-3">
                <h3 className="text-xl font-bold text-white line-clamp-1">{provider.name}</h3>
                <p className="text-gray-400 text-sm line-clamp-1">{provider.email}</p>
              </div>

              {(() => {
                const displayRating = Number.isFinite(provider.rating) ? provider.rating : 4.5;
                return (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-[#00f0ff] text-lg">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          {i < Math.round(displayRating) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm font-bold text-[#00f0ff]">{displayRating.toFixed(1)}</span>
                  </div>
                );
              })()}

              {provider.distanceKm != null && provider.etaMinutes != null && (
                <div className="text-sm text-gray-400 mb-4">
                  📍 {provider.distanceKm.toFixed(1)} km • {provider.etaMinutes} min
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => provider.onViewServices?.(provider)}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] hover:from-[#33f3ff] hover:to-[#00f0ff] hover:shadow-lg hover:shadow-[#00f0ff]/40 text-black font-bold text-base transition-all active:scale-95"
                >
                  Services
                </button>
                <button
                  onClick={() => provider.onContact?.(provider)}
                  className="flex-1 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold border border-[#00f0ff]/30 text-base transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  💬 Chat
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












