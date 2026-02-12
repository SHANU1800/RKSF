import { MessageIcon, MapPinIcon, StarIcon, CheckCircleIcon, ServicesIcon } from './components/icons/IconTypes';

function ProviderCards({ providers }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {providers.length === 0 ? (
        <div className="col-span-full text-center py-12 text-gray-400 text-sm md:text-base">
          No providers available yet
        </div>
      ) : (
        providers.map((provider, idx) => (
          <div
            key={provider._id}
            className="group glass-panel rounded-2xl overflow-hidden card-hover border border-[#00f0ff]/25 hover:border-[#00f0ff]/45 flex flex-row shadow-lg hover:shadow-[#00f0ff]/15 animate-slide-up transition-all duration-300"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* Left: Avatar - compact, no wasted space */}
            <div className="flex-shrink-0 w-28 sm:w-32 p-4 flex items-center justify-center bg-gradient-to-br from-zinc-900/80 to-black/80 border-r border-[#00f0ff]/15">
              {provider.avatar ? (
                <img
                  src={provider.avatar}
                  alt={provider.name || 'Provider'}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-[#00f0ff]/50 shadow-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#00f0ff] to-[#00b8cc] flex items-center justify-center text-2xl sm:text-3xl font-bold text-black border-2 border-[#00f0ff]/50 shadow-lg"
                style={{ display: provider.avatar ? 'none' : 'flex' }}
              >
                {provider.name?.charAt(0).toUpperCase() || '?'}
              </div>
            </div>

            {/* Right: Info + actions - fills remaining space */}
            <div className="flex-1 min-w-0 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white truncate">{provider.name}</h3>
                  {provider.isVerified && (
                    <CheckCircleIcon size={16} className="text-[#00f0ff] shrink-0" title="Verified" />
                  )}
                </div>
                <p className="text-gray-400 text-sm truncate mb-3">{provider.email}</p>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[#00f0ff]">
                    <StarIcon size={16} filled className="text-[#00f0ff]" />
                    <span className="text-sm font-semibold">
                      {(Number.isFinite(provider.rating) ? provider.rating : 4.5).toFixed(1)}
                    </span>
                  </div>
                  {provider.distanceKm != null && provider.etaMinutes != null && (
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                      <MapPinIcon size={14} className="text-[#00f0ff]/80" />
                      <span>{provider.distanceKm.toFixed(1)} km • {provider.etaMinutes} min</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => provider.onViewServices?.(provider)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] hover:from-[#33f3ff] hover:to-[#00f0ff] text-black font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md hover:shadow-[#00f0ff]/30"
                >
                  <ServicesIcon size={18} />
                  Services
                </button>
                <button
                  onClick={() => provider.onContact?.(provider)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold border border-[#00f0ff]/40 text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <MessageIcon size={18} className="text-[#00f0ff]" />
                  Chat
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
