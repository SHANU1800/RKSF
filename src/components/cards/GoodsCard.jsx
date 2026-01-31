import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const GoodsCard = ({
  item,
  onChat,
  onOffer,
}) => {
  return (
    <div className="glass-panel rounded-2xl border border-white/8 overflow-hidden card-hover group">
      {/* Image with beautiful overlay */}
      {item.image ? (
        <div className="h-36 sm:h-44 bg-gray-800/40 relative overflow-hidden">
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/70 via-transparent to-transparent" />
          {/* Price overlay on image */}
          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-emerald-500/90 backdrop-blur-sm shadow-lg">
            <span className="text-white font-bold text-lg">₹{item.price}</span>
          </div>
        </div>
      ) : (
        <div className="h-36 sm:h-44 bg-linear-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
          <span className="text-4xl opacity-30">📦</span>
          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-emerald-500/90">
            <span className="text-white font-bold text-lg">₹{item.price}</span>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Title and condition */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Badge variant="info" size="sm" className="mb-2">{item.condition || 'Good'}</Badge>
            <h4 className="text-base sm:text-lg font-bold text-white leading-tight truncate">{item.title}</h4>
            <p className="text-gray-300 text-sm mt-1 line-clamp-2">{item.description}</p>
          </div>
        </div>

        {/* Location and seller */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-base">📍</span>
            <span className="truncate">{item.location}</span>
          </div>
          <span className="text-gray-500 shrink-0">{new Date(item.createdAt || new Date()).toLocaleDateString('en-IN')}</span>
        </div>

        {/* Seller info */}
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
            {(item.sellerName || 'P').charAt(0).toUpperCase()}
          </div>
          <span className="text-gray-300 truncate">{item.sellerName || 'Provider'}</span>
        </div>

        {/* Actions - larger touch targets */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="primary"
            size="md"
            onClick={onChat}
            className="flex-1 py-3 sm:py-2.5 text-sm font-bold"
          >
            💬 Chat
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onOffer}
            className="py-3 sm:py-2.5 px-4 text-sm font-bold"
          >
            🏷️
          </Button>
        </div>
      </div>
    </div>
  );
};
