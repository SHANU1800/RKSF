import React from 'react';

export const AccordionItem = ({ id, title, icon, children, isExpanded, onToggle, triggerHaptic }) => {
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden mb-3 animate-slide-up">
      <button
        onClick={() => {
          onToggle(id);
          triggerHaptic?.(20);
        }}
        className="w-full px-4 py-4 sm:py-3 flex items-center justify-between gap-3 bg-white/5 hover:bg-white/10 transition-all font-semibold text-white"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-xl">{icon}</span>}
          <span className="text-sm sm:text-base">{title}</span>
        </div>
        <span className={`text-lg transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 py-4 sm:py-3 bg-gradient-to-b from-white/5 to-transparent border-t border-white/10 animate-slide-down">
          {children}
        </div>
      )}
    </div>
  );
};

export const Accordion = ({ items, expandedSections, onToggle, triggerHaptic }) => {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          id={item.id}
          title={item.title}
          icon={item.icon}
          isExpanded={expandedSections[item.id]}
          onToggle={onToggle}
          triggerHaptic={triggerHaptic}
        >
          {item.children}
        </AccordionItem>
      ))}
    </div>
  );
};

export default Accordion;
