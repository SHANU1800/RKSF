import { ShieldIcon, CheckCircleIcon, StarIcon, ServiceWrenchSvg, MessageIcon, EyeIcon } from '../icons/IconTypes';

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

  return (
    <div
      className={`group bg-gradient-to-br from-zinc-900 to-black rounded-2xl shadow-xl overflow-hidden border border-[#00f0ff]/30 flex aspect-[16/9] relative z-10 pointer-events-auto animate-scale-in
        hover:shadow-[0_0_40px_rgba(0,240,255,0.15)] hover:border-[#00f0ff]/50
        transition-all duration-500 ease-out
        ${onDetails ? 'cursor-pointer' : ''}`}
      style={{ animationDelay: '0ms' }}
      onClick={onDetails ? () => onDetails() : undefined}
      role={onDetails ? 'button' : undefined}
      tabIndex={onDetails ? 0 : undefined}
      onKeyDown={onDetails ? (e) => { if (e.key === 'Enter') onDetails(); } : undefined}
    >
      {/* Left Side - Compact profile + buttons */}
      <div className="w-28 sm:w-32 shrink-0 bg-gradient-to-br from-zinc-900 to-zinc-800 p-4 flex flex-col items-center justify-between gap-4 border-r border-white/5">
        {/* Photo + rating row - compact */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="relative group/photo">
            {service.image ? (
              <img
                src={service.image}
                alt={service.title}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#00f0ff]/60 shadow-md
                  transition-all duration-500 ease-out
                  group-hover/photo:scale-110 group-hover/photo:border-[#00f0ff] group-hover/photo:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#33f3ff] flex items-center justify-center text-black shadow-md transition-transform duration-500 group-hover/photo:scale-110 group-hover/photo:shadow-[0_0_20px_rgba(0,240,255,0.4)]" style={{ display: service.image ? 'none' : 'flex' }}>
              <ServiceWrenchSvg size={28} />
            </div>
            {service.rating !== undefined && (
              <span className="absolute -bottom-0.5 -right-0.5 px-1.5 py-0.5 rounded-full bg-black/90 text-white font-bold text-[10px] flex items-center gap-0.5 border border-[#00f0ff]/50 animate-fade-in">
                <StarIcon size={10} filled className="text-[#00f0ff]" /> {Number(service.rating).toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons - spaced */}
        {isOwnService ? (
          <div className="py-2.5 px-3 rounded-xl bg-zinc-800 text-gray-400 text-xs font-semibold text-center animate-fade-in">
            Your Service
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full mt-auto">
            {onCheckout && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onCheckout(); }}
                className="w-full font-bold py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] text-black text-sm
                  transition-all duration-300 ease-out
                  hover:scale-[1.02] hover:shadow-[0_0_16px_rgba(0,240,255,0.4)] active:scale-[0.98]
                  animate-slide-in-left"
              >
                Book & Pay
              </button>
            )}
            {onDetails && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDetails(); }}
                className="w-full font-semibold py-2 px-3 rounded-xl bg-zinc-800 text-white text-xs border border-[#00f0ff]/30
                  transition-all duration-300 ease-out
                  hover:scale-[1.02] hover:bg-zinc-700 hover:border-[#00f0ff]/50 active:scale-[0.98]
                  flex items-center justify-center gap-1.5 animate-slide-in-left stagger-1"
              >
                <EyeIcon size={14} /> View
              </button>
            )}
            {onChat && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChat(); }}
                className="w-full font-semibold py-2 px-3 rounded-xl bg-zinc-800 text-white text-xs border border-[#00f0ff]/30
                  transition-all duration-300 ease-out
                  hover:scale-[1.02] hover:bg-zinc-700 hover:border-[#00f0ff]/50 active:scale-[0.98]
                  flex items-center justify-center gap-1.5 animate-slide-in-left stagger-2"
              >
                <MessageIcon size={14} /> Chat
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Side - Content */}
      <div className="flex-1 p-5 flex flex-col min-w-0">
        <span className="inline-block text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-lg bg-[#00f0ff] text-black w-fit mb-3 animate-slide-in-right">
          {category}
        </span>
        <h3 className="text-lg font-bold text-white line-clamp-1 leading-tight mb-1 animate-fade-in stagger-1">
          {service.title}
        </h3>
        <p className="text-xl font-extrabold text-[#00f0ff] mb-3 animate-fade-in stagger-2 animate-price-glow">
          {price}
        </p>
        <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 flex-1 mb-4 animate-fade-in stagger-3">
          {service.description || 'Professional service with quality guarantee. Contact us for more details and customized solutions.'}
        </p>
        <div className="flex items-center gap-2.5 animate-slide-up">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#00b8cc] flex items-center justify-center text-black font-bold text-sm shrink-0 shadow-md transition-transform duration-300 hover:scale-110">
            {(providerName || 'P').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-white font-semibold text-sm truncate">{providerName}</p>
              {isVerified && <CheckCircleIcon size={12} className="text-emerald-400 shrink-0" />}
            </div>
            <p className="text-gray-400 text-xs truncate">{providerEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
};












