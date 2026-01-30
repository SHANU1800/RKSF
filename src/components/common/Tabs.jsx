export const Tabs = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1 overflow-x-auto pb-2 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            px-4 py-2 rounded-lg font-semibold transition text-sm whitespace-nowrap
            ${
              activeTab === tab.id
                ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
