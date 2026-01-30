import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const ProviderCard = ({
  provider,
  onContact,
}) => {
  return (
    <div className="glass-panel rounded-2xl border border-white/5 p-6 space-y-4 card-hover">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white">{provider.name || 'Provider'}</h3>
          <p className="text-gray-400 text-sm mt-1">{provider.email}</p>
          {provider.description && (
            <p className="text-gray-300 text-sm mt-2 line-clamp-2">{provider.description}</p>
          )}
        </div>
        {provider.rating && (
          <Badge variant="success" size="md">
            ⭐ {Number(provider.rating).toFixed(1)}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-gray-400">Services</p>
          <p className="text-white font-bold">{provider.serviceCount || 0}</p>
        </div>
        <div>
          <p className="text-gray-400">Response Rate</p>
          <p className="text-white font-bold">{provider.responseRate || '—'}</p>
        </div>
      </div>

      <Button
        variant="primary"
        size="md"
        onClick={onContact}
        className="w-full"
      >
        Contact Provider
      </Button>
    </div>
  );
};
