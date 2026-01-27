function ProviderCards({ providers }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {providers.length === 0 ? (
        <div className="col-span-full text-center py-8 text-gray-400">
          No providers available yet
        </div>
      ) : (
        providers.map((provider) => (
          <div key={provider._id} className="glass-panel rounded-2xl overflow-hidden card-hover border border-white/5">
            {/* Provider Avatar */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 h-32 flex items-center justify-center relative">
              {provider.avatar ? (
                <img 
                  src={provider.avatar} 
                  alt={provider.name}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-xl object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-xl items-center justify-center text-3xl font-bold text-blue-700" style={{ display: provider.avatar ? 'none' : 'flex' }}>
                {provider.name?.charAt(0).toUpperCase() || '?'}
              </div>
            </div>

            {/* Provider Info */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">{provider.name}</h3>
                <p className="text-gray-400 text-sm">{provider.email}</p>
              </div>

              {(() => {
                const displayRating = Number.isFinite(provider.rating) ? provider.rating : 4.5;
                return (
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400 text-lg">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          {i < Math.round(displayRating) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="pill text-xs bg-white/5 border-white/10 text-yellow-200">{displayRating.toFixed(1)}</span>
                  </div>
                );
              })()}

              {/* Bio */}
              {provider.bio && (
                <p className="text-gray-300 text-sm line-clamp-2">{provider.bio}</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/20 text-white font-semibold transition">
                  View Services
                </button>
                <button
                  onClick={() => provider.onContact?.(provider)}
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition border border-white/10"
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
