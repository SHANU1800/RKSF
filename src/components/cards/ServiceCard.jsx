import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const ServiceCard = ({
  service,
  onChat,
  onCheckout,
}) => {
  const providerName = service.provider?.name || 'Unknown Provider';
  const category = service.category || 'General';
  const price = Number.isFinite(service.price) ? `₹${service.price}` : '—';

  return (
    <div className="glass-panel rounded-2xl sm:rounded-2xl border border-white/8 overflow-hidden card-hover group">
      {/* Gradient accent line */}
      <div className="h-1 bg-linear-to-r from-blue-500 via-cyan-400 to-emerald-400 opacity-80" />
      
      {/* Image with overlay */}
      {service.image && (
        <div className="w-full h-36 sm:h-48 bg-gray-800/40 relative overflow-hidden">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent" />
        </div>
      )}

      <div className="p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
        {/* Header with category and rating */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs uppercase tracking-wide text-blue-300 font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/20">
                {category}
              </span>
              {service.rating !== undefined && (
                <Badge variant="info" size="sm" className="sm:hidden">⭐ {Number(service.rating).toFixed(1)}</Badge>
              )}
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white mt-2 leading-tight">{service.title}</h4>
            <p className="text-gray-300 text-sm mt-1.5 line-clamp-2 sm:line-clamp-3">{service.description}</p>
          </div>
          {service.rating !== undefined && (
            <Badge variant="info" size="md" className="hidden sm:flex shrink-0">⭐ {Number(service.rating).toFixed(1)}</Badge>
          )}
        </div>

        {/* Provider info and price */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
          <div className="min-w-0 flex-1">
            <p className="text-white font-semibold text-sm truncate">{providerName}</p>
            {service.provider?.email && (
              <p className="text-xs text-gray-500 truncate">{service.provider.email}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl sm:text-2xl font-bold text-emerald-300">{price}</p>
          </div>
        </div>

        {/* Action buttons - larger touch targets on mobile */}
        <div className="flex gap-2 sm:gap-3 pt-1">
          <Button
            variant="success"
            size="md"
            onClick={onCheckout}
            className="flex-1 py-3 sm:py-2.5 text-sm font-bold"
          >
            🧾 Buy
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onChat}
            className="flex-1 py-3 sm:py-2.5 text-sm font-bold"
          >
            💬 Chat
          </Button>
        </div>
      </div>
    </div>
  );
};
