import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const ServiceCard = ({
  service,
  onChat,
  onCheckout,
}) => {
  const providerName = service.provider?.name || 'Unknown Provider';
  const category = service.category || 'General';
  const price = Number.isFinite(service.price) ? `₹${service.price}` : '—';

  return (
    <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden card-hover">
      <div className="h-1 bg-linear-to-r from-blue-500 via-cyan-400 to-emerald-400" />
      
      {service.image && (
        <div className="w-full h-48 bg-gray-700/40">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-blue-300 font-semibold">{category}</p>
            <h4 className="text-xl font-bold text-white mt-1">{service.title}</h4>
            <p className="text-gray-300 text-sm mt-2 line-clamp-3">{service.description}</p>
          </div>
          {service.rating !== undefined && (
            <Badge variant="info" size="md">⭐ {Number(service.rating).toFixed(1)}</Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div>
            <p className="text-white font-semibold">{providerName}</p>
            {service.provider?.email && (
              <p className="text-xs text-gray-500">{service.provider.email}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-300">{price}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="success"
            size="md"
            onClick={onCheckout}
            className="flex-1"
          >
            🧾 Buy Package
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onChat}
            className="flex-1"
          >
            💬 Chat
          </Button>
        </div>
      </div>
    </div>
  );
};
