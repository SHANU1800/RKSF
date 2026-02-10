import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { PackageIllustrationSvg } from '../icons/IconTypes';

export const GoodsCard = ({
  item,
  onChat,
  onOffer,
}) => {
  return (
    <div className="group glass-panel card-premium rounded-2xl border border-white/10 hover:border-[#F7D047]/30 overflow-hidden card-hover relative aspect-4/3 flex flex-col shadow-lg hover:shadow-xl transition-all">
      {/* Enhanced gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F7D047] to-transparent opacity-60 group-hover:opacity-100 z-10 transition-opacity" />
      
      {/* Image with enhanced overlay - Takes 55% */}
      {item.image ? (
        <div className="h-[55%] bg-black relative overflow-hidden">
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
        <div className="h-[55%] bg-slate-800 flex items-center justify-center relative text-gray-500">
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

      {/* Content Section - Takes 45% */}
      <div className="flex-1 p-4 flex flex-col relative">
        {/* Background glow on hover */}
        <div className="absolute inset-0 bg-[#F7D047]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Title */}
          <h4 className="text-lg font-bold text-white mb-2 leading-tight line-clamp-2">
            {item.title}
          </h4>

          {/* Seller & Location - Compact */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-[#F7D047] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(item.sellerName || 'P').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="text-xs">📍</span>
              <span className="text-xs text-gray-300 truncate">{item.location}</span>
            </div>
          </div>

          {/* Actions - Compact */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={(e) => { e.stopPropagation(); onChat(); }}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#F7D047] to-yellow-500 hover:from-yellow-500 hover:to-[#F7D047] text-black font-bold text-sm transition-all hover:shadow-lg active:scale-95"
            >
              💬 Chat
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onOffer(); }}
              className="flex-1 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-all active:scale-95"
            >
              🏷️ Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};












