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
    <div className="glass-panel border border-white/5 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-semibold">{review.serviceTitle || 'Service'}</p>
          <div className="flex gap-1 text-sm mt-1">
            {renderStars(review.rating || 5)}
          </div>
        </div>
        <p className="text-gray-400 text-xs">{new Date(review.createdAt || Date.now()).toLocaleDateString()}</p>
      </div>

      <p className="text-gray-300 text-sm mb-3">{review.text || 'No comment provided'}</p>

      <div className="flex gap-2">
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex-1 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm font-semibold border border-red-500/30 transition"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
