import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const GoodsCard = ({
  item,
  onChat,
  onOffer,
}) => {
  return (
    <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden card-hover">
      {item.image ? (
        <div className="h-40 bg-gray-800/40">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-40 bg-slate-900/70 flex items-center justify-center text-gray-500">
          No image
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge variant="info" size="sm">{item.condition || 'Good'}</Badge>
            <h4 className="text-lg font-bold text-white mt-1">{item.title}</h4>
            <p className="text-gray-300 text-sm line-clamp-2">{item.description}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-emerald-300">₹{item.price}</p>
            <p className="text-xs text-gray-400">{item.location}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Seller: {item.sellerName || 'Provider'}</span>
          <span>{new Date(item.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={onChat}
            className="flex-1"
          >
            View & Chat
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onOffer}
          >
            Make Offer
          </Button>
        </div>
      </div>
    </div>
  );
};
