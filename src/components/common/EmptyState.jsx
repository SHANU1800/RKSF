import { EmptyBoxSvg } from '../icons/IconTypes';

export const EmptyState = ({
  icon,
  iconSvg,
  title = 'Nothing here yet',
  message = 'Try adding something new',
  action,
}) => {
  const IconComponent = iconSvg;
  return (
    <div className="glass-panel rounded-2xl border border-dashed border-[#00f0ff]/20 p-12 text-center animate-scale-in hover:border-[#00f0ff]/30 transition-colors duration-300">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#00f0ff]/10 text-[#00f0ff] mb-4 animate-bounce-in">
        {IconComponent ? (
          <IconComponent size={48} className="animate-float" />
        ) : icon ? (
          <span className="text-4xl">{icon}</span>
        ) : (
          <EmptyBoxSvg size={48} className="animate-float" />
        )}
      </div>
      <h3 className="text-xl font-semibold text-white mb-1 animate-fade-in">{title}</h3>
      <p className="text-gray-400 text-sm mb-6">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] hover:from-[#33f3ff] hover:to-[#00f0ff] text-black font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-[#00f0ff]/20"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};












