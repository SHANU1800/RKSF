export const OrderCard = ({
  order,
  onViewDetails,
  onTrack,
}) => {
  const statusColors = {
    pending: 'yellow',
    confirmed: 'blue',
    shipped: 'cyan',
    delivered: 'emerald',
    cancelled: 'red',
  };

  const getStatusColor = (status) => {
    const color = statusColors[status?.toLowerCase()] || 'gray';
    return `bg-${color}-500/10 border-${color}-500/30 text-${color}-200`;
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
      <div className="h-1 bg-linear-to-r from-blue-500 via-cyan-400 to-emerald-400" />
      
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-blue-300 font-semibold">Order #{order._id?.slice(-8) || 'N/A'}</p>
            <h4 className="text-lg font-bold text-white mt-1">{order.serviceTitle || 'Service'}</h4>
          </div>
          <div className={`pill text-xs ${getStatusColor(order.status)}`}>
            {order.status || 'Pending'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400">Quantity</p>
            <p className="text-white font-semibold">{order.quantity || 1}</p>
          </div>
          <div>
            <p className="text-gray-400">Total</p>
            <p className="text-emerald-300 font-bold">₹{order.totalAmount || 0}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
            >
              View Details
            </button>
          )}
          {onTrack && (
            <button
              onClick={onTrack}
              className="flex-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/10 transition"
            >
              Track
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
