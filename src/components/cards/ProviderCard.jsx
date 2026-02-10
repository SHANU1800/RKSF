import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ShieldIcon, CheckCircleIcon } from '../icons/IconTypes';

export const ProviderCard = ({
  provider,
  onContact,
}) => {
  // Safety indicators
  const isVerified = provider.isVerified || provider.verificationStatus === 'verified';
  const isWomenOnly = provider.preferredProviderGender === 'female_only' || provider.gender === 'female';
  const safetyScore = provider.safetyScore || (isVerified ? 4.5 : 3.5);
  return (
    <div className="glass-panel card-premium rounded-2xl border border-white/10 p-6 sm:p-8 space-y-5 card-hover group relative overflow-hidden lg:aspect-[4/3] flex flex-col">
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#F7D047] opacity-60" />
      
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-[#F7D047]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-[#F7D047] flex items-center justify-center text-white font-bold text-lg shadow-lg relative">
                {(provider.name || 'P').charAt(0).toUpperCase()}
                {isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0a0a0a] border-2 border-slate-900 flex items-center justify-center">
                    <CheckCircleIcon size={12} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight truncate">
                    {provider.name || 'Provider'}
                  </h3>
                  {isVerified && (
                    <CheckCircleIcon size={16} className="text-emerald-400 shrink-0" title="Verified Provider" />
                  )}
                  {isWomenOnly && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-400/30">
                      <ShieldIcon size={12} className="text-pink-400" />
                      <span className="text-xs font-semibold text-pink-400">Women Only</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-sm truncate mb-1">{provider.email}</p>
                {/* Safety score */}
                <div className="flex items-center gap-1.5">
                  <ShieldIcon size={12} className="text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-semibold">Safety Score: {safetyScore.toFixed(1)}/5.0</span>
                </div>
              </div>
            </div>
            {provider.description && (
              <p className="text-gray-300 text-sm sm:text-base mt-3 line-clamp-2 leading-relaxed">
                {provider.description}
              </p>
            )}
          </div>
          {provider.rating && (
            <Badge variant="success" size="md" className="shrink-0">
              ⭐ {Number(provider.rating).toFixed(1)}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold mb-1">Services</p>
            <p className="text-white font-bold text-lg sm:text-xl">{provider.serviceCount || 0}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold mb-1">Response Rate</p>
            <p className="text-white font-bold text-lg sm:text-xl">{provider.responseRate || '—'}</p>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={onContact}
          className="w-full mt-5 font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          Contact Provider
        </Button>
      </div>
    </div>
  );
};












