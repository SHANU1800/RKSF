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
    <div className="group glass-panel card-premium rounded-2xl border border-white/10 hover:border-[#F7D047]/40 overflow-hidden card-hover relative flex flex-col transition-all shadow-lg hover:shadow-xl aspect-4/3">
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F7D047] to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
      
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-[#F7D047]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Profile Photo Section - Circular */}
      <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 pt-8 pb-5 flex justify-center">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#F7D047] to-yellow-500 flex items-center justify-center text-white font-bold text-4xl shadow-xl relative shrink-0">
            {(provider.name || 'P').charAt(0).toUpperCase()}
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-zinc-800 flex items-center justify-center">
                <CheckCircleIcon size={14} className="text-white" />
              </div>
            )}
            {isWomenOnly && (
              <div className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-pink-500 border-2 border-zinc-800 flex items-center justify-center">
                <ShieldIcon size={14} className="text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="relative z-10 p-6 flex flex-col flex-1">
        {/* Name & Email */}
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-white leading-tight mb-1">
            {provider.name || 'Provider'}
          </h3>
          <p className="text-gray-400 text-base truncate">{provider.email}</p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-3 mb-5">
          {provider.rating && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <span className="text-yellow-400 text-base">⭐</span>
              <span className="text-yellow-400 font-bold text-base">{Number(provider.rating).toFixed(1)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <ShieldIcon size={14} className="text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-sm">{safetyScore.toFixed(1)}</span>
          </div>
          {provider.serviceCount !== undefined && (
            <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-gray-300 font-semibold text-sm">{provider.serviceCount} services</span>
            </div>
          )}
        </div>

        {/* Description */}
        {provider.description && (
          <p className="text-gray-300 text-base leading-relaxed line-clamp-2 mb-5 flex-1 text-center px-2">
            {provider.description}
          </p>
        )}

        {/* Contact Button */}
        <button
          onClick={onContact}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F7D047] to-yellow-500 hover:from-yellow-500 hover:to-[#F7D047] text-black font-bold text-base transition-all hover:shadow-lg hover:shadow-[#F7D047]/30 active:scale-95 mt-auto"
        >
          Contact Provider
        </button>
      </div>
    </div>
  );
};












