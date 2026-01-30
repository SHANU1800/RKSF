export const LoadingGrid = ({
  count = 6,
  columns = 3,
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="glass-panel border border-white/5 rounded-2xl p-6 animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="h-5 bg-white/10 rounded w-3/4" />
          <div className="h-16 bg-white/10 rounded" />
          <div className="flex justify-between">
            <div className="h-4 bg-white/10 rounded w-20" />
            <div className="h-4 bg-white/10 rounded w-12" />
          </div>
          <div className="h-10 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
};
