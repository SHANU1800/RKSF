export const EmptyState = ({
  icon = '📭',
  title = 'Nothing here yet',
  message = 'Try adding something new',
  action,
}) => {
  return (
    <div className="glass-panel rounded-2xl border border-dashed border-white/10 p-12 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};












