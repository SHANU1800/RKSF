import { Badge } from '../common/Badge';
import { ClockIcon, CheckIcon, PackageIcon, CheckCircleIcon, CloseIcon, MapPinIcon, InfoIcon } from '../icons/IconTypes';

export const OrderCard = ({
  order,
  onViewDetails,
  onTrack,
}) => {
  const statusConfig = {
    pending: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-200', Icon: ClockIcon },
    confirmed: { bg: 'bg-[#00f0ff]/10', border: 'border-[#00f0ff]/30', text: 'text-[#00f0ff]', Icon: CheckIcon },
    shipped: { bg: 'bg-[#00f0ff]/10', border: 'border-[#00f0ff]/30', text: 'text-[#00f0ff]', Icon: PackageIcon },
    delivered: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-200', Icon: CheckCircleIcon },
    cancelled: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-200', Icon: CloseIcon },
  };

  const getStatusStyle = (status) => {
    const style = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    return `${style.bg} ${style.border} ${style.text}`;
  };

  const getStatusIcon = (status) => {
    const cfg = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    return cfg.Icon;
  };

  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="group glass-panel card-premium rounded-2xl border border-white/10 hover:border-[#00f0ff]/40 overflow-hidden card-hover relative aspect-[4/3] flex flex-col transition-all shadow-lg hover:shadow-xl">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-[#00f0ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="p-5 flex flex-col h-full relative z-10">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <span className="text-xs text-gray-500 mb-1 block">#{order._id?.slice(-8) || 'N/A'}</span>
            <h4 className="text-lg font-bold text-white leading-tight line-clamp-2">
              {order.serviceTitle || 'Service'}
            </h4>
          </div>
          <span className="shrink-0 p-1.5 rounded-lg bg-white/5 border border-white/10">
            <StatusIcon size={18} className="text-[#00f0ff]" />
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 mb-3">
          <div className={`px-3 py-1.5 rounded-lg ${getStatusStyle(order.status)} border text-xs font-bold uppercase flex items-center gap-2`}>
            <StatusIcon size={14} />
            {order.status || 'Pending'}
          </div>
          <p className="text-[#00f0ff] font-bold text-xl">₹{order.totalAmount || 0}</p>
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
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] hover:from-[#33f3ff] hover:to-[#00f0ff] text-black font-bold text-sm transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <InfoIcon size={16} /> Details
            </button>
          )}
          {onTrack && (
            <button
              onClick={onTrack}
              className="flex-1 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold border border-[#00f0ff]/30 text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <MapPinIcon size={16} /> Track
            </button>
          )}
        </div>
      </div>
    </div>
  );
};












