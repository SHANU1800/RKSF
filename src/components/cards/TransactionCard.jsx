export const TransactionCard = ({
  transaction,
  onDownload,
}) => {
  const isPositive = transaction.amount > 0;

  return (
    <div className="glass-panel border border-white/5 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-white font-semibold">{transaction.orderId || 'Transaction'}</p>
          <p className="text-gray-400 text-sm">{transaction.description || 'Service payment'}</p>
          <p className="text-xs text-gray-500 mt-1">{new Date(transaction.date || Date.now()).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : '-'}₹{Math.abs(transaction.amount || 0)}
          </p>
          <p className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {transaction.status || 'Completed'}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/10 transition">
          Invoice
        </button>
        {onDownload && (
          <button
            onClick={onDownload}
            className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/10 transition"
          >
            Download
          </button>
        )}
      </div>
    </div>
  );
};
