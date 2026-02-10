import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { FileTextIcon, DownloadIcon } from '../icons/IconTypes';

export const TransactionCard = ({
  transaction,
  onDownload,
}) => {
  const isPositive = transaction.amount > 0;
  const amountColor = isPositive ? 'text-emerald-300' : 'text-red-400';
  const accentColor = isPositive ? 'bg-emerald-500' : 'bg-red-500';
  const gradientColor = isPositive ? 'bg-emerald-500/5' : 'bg-red-500/5';

  return (
    <div className="glass-panel card-premium rounded-2xl border border-white/10 hover:border-white/20 overflow-hidden card-hover group relative aspect-4/3 flex flex-col transition-all">
      {/* Gradient accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${accentColor} opacity-60 group-hover:opacity-100 transition-opacity`} />
      
      {/* Background glow */}
      <div className={`absolute inset-0 ${gradientColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
      
      {/* Amount Display - 45% height */}
      <div className={`h-[45%] flex items-center justify-center ${gradientColor} border-b border-white/10 relative`}>
        <div className="text-center">
          <p className={`text-4xl font-bold ${amountColor} leading-none mb-2`}>
            {isPositive ? '+' : ''}₹{Math.abs(transaction.amount || 0)}
          </p>
          <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            {isPositive ? 'Credit' : 'Debit'}
          </span>
        </div>
      </div>

      {/* Content - 55% height */}
      <div className="flex-1 p-4 flex flex-col relative z-10">
        {/* Order ID & Status */}
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-white truncate">
            {transaction.orderId || 'Transaction'}
          </h4>
          <span className={`text-xs px-2 py-1 rounded-md ${isPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
            {transaction.status || 'Completed'}
          </span>
        </div>

        {/* Description & Date */}
        <p className="text-xs text-gray-400 mb-2 line-clamp-1">
          {transaction.description || 'Service payment'}
        </p>
        <span className="text-xs text-gray-500 mb-3">
          {new Date(transaction.date || Date.now()).toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short',
            year: 'numeric'
          })}
        </span>

        {/* Action buttons - Compact */}
        <div className="flex gap-2 mt-auto">
          <button className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-all active:scale-95">
            📄 Invoice
          </button>
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold transition-all active:scale-95"
            >
              💾 Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
};












