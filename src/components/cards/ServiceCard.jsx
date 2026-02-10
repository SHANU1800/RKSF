import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ShieldIcon, CheckCircleIcon, StarIcon, InfoIcon, ServiceWrenchSvg, MessageIcon, EyeIcon } from '../icons/IconTypes';

export const ServiceCard = ({
  service,
  onChat,
  onCheckout,
  onDetails,
  isOwnService = false,
}) => {
  const providerName = service.provider?.name || 'Unknown Provider';
  const providerEmail = service.provider?.email || '';
  const category = service.category || 'General';
  const price = Number.isFinite(service.price) ? `₹${service.price}` : '—';
  
  const isVerified = service.provider?.isVerified || service.provider?.verificationStatus === 'verified';
  const isWomenOnly = service.provider?.preferredProviderGender === 'female_only' || service.provider?.gender === 'female';
  const safetyScore = service.provider?.safetyScore || (isVerified ? 4.5 : 3.5);

  return (
    <div
      className={`group bg-gradient-to-br from-zinc-900 to-black rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#00f0ff]/30 hover:border-[#00f0ff]/50 flex aspect-[16/9] relative z-10 pointer-events-auto ${onDetails ? 'cursor-pointer' : ''}`}
      onClick={onDetails ? () => onDetails() : undefined}
      role={onDetails ? 'button' : undefined}
      tabIndex={onDetails ? 0 : undefined}
      onKeyDown={onDetails ? (e) => { if (e.key === 'Enter') onDetails(); } : undefined}
    >
      {/* Left Side - Profile Photo and Buttons */}
      <div className="w-2/5 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 flex flex-col">
        {/* Circular Profile Photo - Top Left */}
        <div className="relative mb-auto">
          {service.image ? (
            <img
              src={service.image}
              alt={service.title}
              className="w-24 h-24 rounded-full object-cover border-4 border-[#00f0ff] shadow-lg shadow-[#00f0ff]/30 transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#33f3ff] flex items-center justify-center text-black text-2xl font-bold shadow-lg" style={{ display: service.image ? 'none' : 'flex' }}>
            <ServiceWrenchSvg size={40} />
          </div>
          
          {/* Rating Badge on photo */}
          {service.rating !== undefined && (
            <div className="absolute -bottom-1 -right-1">
              <span className="px-2 py-1 rounded-full bg-black/90 backdrop-blur-sm text-white font-bold text-xs flex items-center gap-1 shadow-lg border-2 border-[#00f0ff]/50">
                <StarIcon size={12} filled className="text-[#00f0ff]" /> {Number(service.rating).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons - Bottom Half */}
        {isOwnService ? (
          <div className="py-3 px-4 rounded-xl bg-zinc-800 text-gray-400 text-sm font-semibold text-center mt-auto">
            Your Service
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mt-auto">
            {onDetails && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDetails(); }}
                className="w-full font-bold py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] hover:from-[#33f3ff] hover:to-[#00f0ff] text-black text-base transition-all hover:shadow-lg hover:shadow-[#00f0ff]/50 active:scale-95 flex items-center justify-center gap-2"
              >
                <EyeIcon size={18} /> View Details
              </button>
            )}
            {onChat && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChat(); }}
                className="w-full font-semibold py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-base border border-[#00f0ff]/40 hover:border-[#00f0ff]/60 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <MessageIcon size={18} /> Chat
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Side - Content/Description */}
      <div className="flex-1 p-6 flex flex-col">
        {/* Category Badge */}
        <div className="mb-3">
          <span className="inline-block text-xs uppercase tracking-wider font-bold px-4 py-1.5 rounded-lg bg-[#00f0ff] text-black shadow-lg">
            {category}
          </span>
        </div>

        {/* Title & Price */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-white line-clamp-1 leading-tight mb-2">
            {service.title}
          </h3>
          <p className="text-2xl font-extrabold text-[#00f0ff]">{price}</p>
        </div>

        {/* Description */}
        <div className="mb-4 flex-1">
          <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
            {service.description || 'Professional service with quality guarantee. Contact us for more details and customized solutions.'}
          </p>
        </div>

        {/* Provider Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F7D047] to-yellow-500 flex items-center justify-center text-black font-bold text-base shrink-0 shadow-md">
            {(providerName || 'P').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-white font-semibold text-sm truncate">{providerName}</p>
              {isVerified && <CheckCircleIcon size={14} className="text-emerald-400" />}
            </div>
            <p className="text-gray-400 text-xs truncate">{providerEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
};












