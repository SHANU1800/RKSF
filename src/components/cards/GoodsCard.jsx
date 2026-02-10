import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { PackageIllustrationSvg } from '../icons/IconTypes';

export const GoodsCard = ({
  item,
  onChat,
  onOffer,
}) => {
  return (
    <div className="glass-panel card-premium rounded-2xl border border-white/10 overflow-hidden card-hover group relative lg:aspect-[4/3] flex flex-col">
      {/* Enhanced gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#F7D047] opacity-80 shadow-lg z-10" />
      
      {/* Image with enhanced overlay */}
      {item.image ? (
        <div className="h-44 sm:h-56 bg-black relative overflow-hidden">
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-slate-900/70" />
          
          {/* Condition badge on image */}
          <div className="absolute top-3 left-3">
            <Badge variant="info" size="md" className="shadow-lg backdrop-blur-sm">
              {item.condition || 'Good'}
            </Badge>
          </div>
          
          {/* Enhanced price overlay on image */}
          <div className="absolute bottom-4 right-4 px-4 py-2.5 rounded-xl bg-black backdrop-blur-sm shadow-2xl border border-[#0a0a0a]/30">
            <span className="text-white font-bold text-xl sm:text-2xl">₹{item.price}</span>
          </div>
        </div>
      ) : (
        <div className="h-44 sm:h-56 bg-slate-800 flex items-center justify-center relative text-gray-500">
          <PackageIllustrationSvg size={64} className="opacity-40" />
          <div className="absolute top-3 left-3">
            <Badge variant="info" size="md" className="shadow-lg backdrop-blur-sm">
              {item.condition || 'Good'}
            </Badge>
          </div>
          <div className="absolute bottom-4 right-4 px-4 py-2.5 rounded-xl bg-black backdrop-blur-sm shadow-2xl border border-[#0a0a0a]/30">
            <span className="text-white font-bold text-xl sm:text-2xl">₹{item.price}</span>
          </div>
        </div>
      )}

      <div className="p-5 sm:p-7 space-y-4 relative">
        {/* Background glow on hover */}
        <div className="absolute inset-0 bg-[#F7D047]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          {/* Title and description */}
          <div>
            <h4 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight line-clamp-2">
              {item.title}
            </h4>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed line-clamp-2">
              {item.description}
            </p>
          </div>

          {/* Location and date - enhanced */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 min-w-0 flex-1 bg-white/5 rounded-lg px-3 py-2">
              <span className="text-lg">📍</span>
              <span className="text-sm text-gray-300 truncate font-medium">{item.location}</span>
            </div>
            <div className="text-xs text-gray-400 shrink-0 bg-white/5 rounded-lg px-3 py-2">
              {new Date(item.createdAt || new Date()).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short' 
              })}
            </div>
          </div>

          {/* Seller info - enhanced */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/10">
            <div className="w-10 h-10 rounded-xl bg-[#F7D047] flex items-center justify-center text-white text-sm font-bold shadow-lg">
              {(item.sellerName || 'P').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{item.sellerName || 'Provider'}</p>
              <p className="text-xs text-gray-400">Seller</p>
            </div>
          </div>

          {/* Actions - enhanced */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={onChat}
              className="flex-1 font-bold shadow-lg hover:shadow-xl transition-all"
            >
              💬 Chat
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={onOffer}
              className="px-6 font-bold shadow-lg hover:shadow-xl transition-all"
            >
              🏷️ Make Offer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};












