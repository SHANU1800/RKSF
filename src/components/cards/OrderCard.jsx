import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const OrderCard = ({
  order,
  onViewDetails,
  onTrack,
}) => {
  const statusColors = {
    pending: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-200', icon: '⏳' },
    confirmed: { bg: 'bg-[#0a0a0a]/10', border: 'border-[#0a0a0a]/30', text: 'text-[#0a0a0a]', icon: '✓' },
    shipped: { bg: 'bg-[#0a0a0a]/10', border: 'border-[#0a0a0a]/30', text: 'text-[#F7D047]', icon: '🚚' },
    delivered: { bg: 'bg-[#0a0a0a]/10', border: 'border-[#0a0a0a]/30', text: 'text-[#F7D047]', icon: '✅' },
    cancelled: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-200', icon: '❌' },
  };

  const getStatusStyle = (status) => {
    const style = statusColors[status?.toLowerCase()] || statusColors.pending;
    return `${style.bg} ${style.border} ${style.text}`;
  };

  const getStatusIcon = (status) => {
    return statusColors[status?.toLowerCase()]?.icon || '⏳';
  };

  return (
    <div className="group glass-panel card-premium rounded-2xl border border-white/10 hover:border-[#F7D047]/40 overflow-hidden card-hover relative aspect-4/3 flex flex-col transition-all shadow-lg hover:shadow-xl">
      {/* Enhanced gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F7D047] to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
      
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-[#F7D047]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="p-5 flex flex-col h-full relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <span className="text-xs text-gray-500 mb-1 block">#{order._id?.slice(-8) || 'N/A'}</span>
            <h4 className="text-lg font-bold text-white leading-tight line-clamp-2">
              {order.serviceTitle || 'Service'}
            </h4>
          </div>
          <span className={`text-xl shrink-0`}>{getStatusIcon(order.status)}</span>
        </div>

        {/* Status & Amount */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className={`px-3 py-1 rounded-lg ${getStatusStyle(order.status)} border text-xs font-bold uppercase`}>
            {order.status || 'Pending'}
          </div>
          <p className="text-[#F7D047] font-bold text-xl">₹{order.totalAmount || 0}</p>
        </div>

        {/* Quantity Info */}
        {order.quantity && order.quantity > 1 && (
          <div className="text-xs text-gray-400 mb-3">
            Qty: {order.quantity}
          </div>
        )}

        {/* Action buttons - Compact */}
        <div className="flex gap-2 mt-auto">
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#F7D047] to-yellow-500 hover:from-yellow-500 hover:to-[#F7D047] text-black font-bold text-sm transition-all hover:shadow-lg active:scale-95"
            >
              Details
            </button>
          )}
          {onTrack && (
            <button
              onClick={onTrack}
              className="flex-1 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold border border-white/20 text-sm transition-all active:scale-95"
            >
              📍 Track
            </button>
          )}
        </div>
      </div>
    </div>
  );
};












