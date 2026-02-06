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
    <div className="glass-panel card-premium rounded-2xl border border-white/10 overflow-hidden card-hover group relative">
      {/* Enhanced gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#F7D047] opacity-80 shadow-lg" />
      
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-[#F7D047]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="p-6 sm:p-8 space-y-5 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider text-[#F7D047] font-bold">Order</span>
              <span className="text-xs text-gray-500">#{order._id?.slice(-8) || 'N/A'}</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-white leading-tight line-clamp-2">
              {order.serviceTitle || 'Service'}
            </h4>
          </div>
          <Badge 
            variant="info" 
            size="md" 
            className={`${getStatusStyle(order.status)} border backdrop-blur-sm shadow-lg`}
          >
            <span className="mr-1">{getStatusIcon(order.status)}</span>
            {order.status || 'Pending'}
          </Badge>
        </div>

        {/* Stats grid - enhanced */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
            <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold mb-1">Quantity</p>
            <p className="text-white font-bold text-xl">{order.quantity || 1}</p>
          </div>
          <div className="bg-[#0a0a0a]/10 rounded-xl p-4 backdrop-blur-sm border border-[#0a0a0a]/20">
            <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold mb-1">Total</p>
            <p className="text-[#F7D047] font-bold text-xl sm:text-2xl">₹{order.totalAmount || 0}</p>
          </div>
        </div>

        {/* Action buttons - enhanced */}
        <div className="flex gap-3 pt-2">
          {onViewDetails && (
            <Button
              variant="primary"
              size="lg"
              onClick={onViewDetails}
              className="flex-1 font-bold shadow-lg hover:shadow-xl transition-all"
            >
              View Details
            </Button>
          )}
          {onTrack && (
            <Button
              variant="secondary"
              size="lg"
              onClick={onTrack}
              className="flex-1 font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Track Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};












