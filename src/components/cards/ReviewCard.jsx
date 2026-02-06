import { Button } from '../common/Button';

export const ReviewCard = ({
  review,
  onEdit,
  onDelete,
}) => {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-600'}>
        ★
      </span>
    ));
  };

  return (
    <div className="glass-panel card-premium rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4 card-hover group relative overflow-hidden">
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500 opacity-60" />
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h4 className="text-lg sm:text-xl font-bold text-white mb-2 leading-tight">
              {review.serviceTitle || 'Service'}
            </h4>
            <div className="flex gap-1 text-lg sm:text-xl">
              {renderStars(review.rating || 5)}
            </div>
          </div>
          <div className="text-xs text-gray-400 bg-white/5 rounded-lg px-3 py-1.5 shrink-0">
            {new Date(review.createdAt || Date.now()).toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'short',
              year: 'numeric'
            })}
          </div>
        </div>

        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
          {review.text || 'No comment provided'}
        </p>

        <div className="flex gap-3 pt-3 border-t border-white/10">
          {onEdit && (
            <Button
              variant="primary"
              size="md"
              onClick={onEdit}
              className="flex-1 font-semibold"
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="md"
              onClick={onDelete}
              className="flex-1 font-semibold"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};












