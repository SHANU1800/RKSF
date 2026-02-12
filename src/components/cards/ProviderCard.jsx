import { Badge } from '../common/Badge';
import { ShieldIcon, CheckCircleIcon, StarIcon, MessageIcon } from '../icons/IconTypes';

export const ProviderCard = ({
  provider,
  onContact,
}) => {
  const isVerified = provider.isVerified || provider.verificationStatus === 'verified';
  const isWomenOnly = provider.preferredProviderGender === 'female_only' || provider.gender === 'female';
  const safetyScore = provider.safetyScore || (isVerified ? 4.5 : 3.5);

  return (
    <div className="group glass-panel card-premium rounded-2xl border border-white/10 hover:border-[#00f0ff]/40 overflow-hidden card-hover relative flex flex-col transition-all shadow-lg hover:shadow-xl aspect-[4/3]">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-[#00f0ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Horizontal layout - avatar left, info right */}
      <div className="flex flex-1 p-5 gap-4 relative z-10">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00f0ff] to-[#00b8cc] flex items-center justify-center text-black text-2xl font-bold shadow-lg border-2 border-[#00f0ff]/50 relative">
            {(provider.name || 'P').charAt(0).toUpperCase()}
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-zinc-900 flex items-center justify-center">
                <CheckCircleIcon size={12} className="text-white" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-white truncate">{provider.name || 'Provider'}</h3>
            {isVerified && <CheckCircleIcon size={16} className="text-[#00f0ff] shrink-0" />}
            {isWomenOnly && (
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-400 text-xs font-semibold flex items-center gap-1">
                <ShieldIcon size={12} /> Women
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm truncate mb-3">{provider.email}</p>

          <div className="flex items-center gap-3 flex-wrap mb-3">
            {provider.rating && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/20">
                <StarIcon size={14} filled className="text-[#00f0ff]" />
                <span className="text-[#00f0ff] font-bold text-sm">{Number(provider.rating).toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              <ShieldIcon size={14} className="text-emerald-400" />
              <span className="text-emerald-400 font-semibold text-sm">{safetyScore.toFixed(1)}</span>
            </div>
            {provider.serviceCount !== undefined && (
              <span className="text-gray-400 text-sm">{provider.serviceCount} services</span>
            )}
          </div>

          {provider.description && (
            <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
              {provider.description}
            </p>
          )}

          <button
            onClick={onContact}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] hover:from-[#33f3ff] hover:to-[#00f0ff] text-black font-bold text-sm transition-all hover:shadow-lg hover:shadow-[#00f0ff]/30 active:scale-95 flex items-center justify-center gap-2 mt-auto"
          >
            <MessageIcon size={18} /> Contact
          </button>
        </div>
      </div>
    </div>
  );
};
