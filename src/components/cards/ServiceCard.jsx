import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ShieldIcon, CheckCircleIcon, StarIcon, InfoIcon, ServiceWrenchSvg } from '../icons/IconTypes';

export const ServiceCard = ({
  service,
  onChat,
  onCheckout,
  onDetails,
}) => {
  const providerName = service.provider?.name || 'Unknown Provider';
  const providerEmail = service.provider?.email || '';
  const category = service.category || 'General';
  const price = Number.isFinite(service.price) ? `₹${service.price}` : '—';
  
  const isVerified = service.provider?.isVerified || service.provider?.verificationStatus === 'verified';
  const isWomenOnly = service.provider?.preferredProviderGender === 'female_only' || service.provider?.gender === 'female';
  const safetyScore = service.provider?.safetyScore || (isVerified ? 4.5 : 3.5);

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-200 flex flex-col max-w-sm hover-lift lg:aspect-[4/3]">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {service.image ? (
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400" style={{ display: service.image ? 'none' : 'flex' }}>
          <ServiceWrenchSvg size={56} className="opacity-50" />
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-block text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg bg-black text-[#F7D047] shadow-lg">
            {category}
          </span>
        </div>

        {/* Rating Badge */}
        {service.rating !== undefined && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1.5 rounded-lg bg-black/90 backdrop-blur-sm text-white font-bold text-xs flex items-center gap-1 shadow-lg">
              <StarIcon size={12} filled className="text-[#F7D047]" /> {Number(service.rating).toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
          {service.description}
        </p>

        {/* Provider Info */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-[#F7D047] font-bold text-lg shadow-md flex-shrink-0">
            {(providerName || 'P').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-gray-900 font-semibold text-sm truncate">{providerName}</p>
              {isVerified && <CheckCircleIcon size={14} className="text-green-600 flex-shrink-0" />}
            </div>
            <p className="text-gray-500 text-xs truncate">{providerEmail}</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <p className="text-3xl font-extrabold text-black">{price}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onDetails && (
            <Button
              variant="secondary"
              size="md"
              onClick={onDetails}
              className="flex-1 font-semibold py-3 px-4 rounded-xl bg-white hover:bg-gray-50 text-black border-2 border-black transition-all hover:shadow-lg"
            >
              <span className="flex items-center justify-center gap-2">
                <InfoIcon size={16} /> Details
              </span>
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={onCheckout}
            className="flex-1 font-semibold py-3 px-4 rounded-xl bg-black hover:bg-gray-900 text-white transition-all hover:shadow-xl"
          >
            Buy
          </Button>
        </div>

        {/* Chat Button */}
        <Button
          variant="secondary"
          size="md"
          onClick={onChat}
          className="w-full mt-2 font-semibold py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 transition-all"
        >
          <span className="flex items-center justify-center gap-2">
            💬 Chat
          </span>
        </Button>
      </div>
    </div>
  );
};












