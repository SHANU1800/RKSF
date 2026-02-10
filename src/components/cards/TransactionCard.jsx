import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { FileTextIcon, DownloadIcon } from '../icons/IconTypes';

export const TransactionCard = ({
  transaction,
  onDownload,
}) => {
  const isPositive = transaction.amount > 0;
  const amountColor = isPositive ? 'text-emerald-300' : 'text-red-400';
  const bgColor = isPositive ? 'bg-[#0a0a0a]/10 border-[#0a0a0a]/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <div className="glass-panel card-premium rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4 card-hover group relative overflow-hidden lg:aspect-[4/3] flex flex-col">
      {/* Gradient accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        isPositive 
          ? 'bg-emerald-500' 
          : 'bg-red-500'
      } opacity-60`} />
      
      {/* Background glow */}
      <div className={`absolute inset-0 ${
        isPositive 
          ? 'bg-emerald-500/5' 
          : 'bg-red-500/5'
      } opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h4 className="text-lg sm:text-xl font-bold text-white mb-1 leading-tight">
              {transaction.orderId || 'Transaction'}
            </h4>
            <p className="text-gray-400 text-sm sm:text-base mb-2">
              {transaction.description || 'Service payment'}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 bg-white/5 rounded-lg px-2 py-1">
                {new Date(transaction.date || Date.now()).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              <Badge 
                variant={isPositive ? 'success' : 'error'} 
                size="sm"
                className="text-xs"
              >
                {transaction.status || 'Completed'}
              </Badge>
            </div>
          </div>
          <div className={`text-right shrink-0 rounded-xl px-4 py-3 border ${bgColor}`}>
            <p className={`text-2xl sm:text-3xl font-bold ${amountColor} leading-none mb-1`}>
              {isPositive ? '+' : '-'}₹{Math.abs(transaction.amount || 0)}
            </p>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
              Amount
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-white/10">
          <Button
            variant="secondary"
            size="md"
            className="flex-1 font-semibold flex items-center justify-center gap-2"
          >
            <FileTextIcon size={16} />
            Invoice
          </Button>
          {onDownload && (
            <Button
              variant="primary"
              size="md"
              onClick={onDownload}
              className="flex-1 font-semibold flex items-center justify-center gap-2"
            >
              <DownloadIcon size={16} />
              Download
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};












