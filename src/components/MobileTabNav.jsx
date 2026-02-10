import { useState, useEffect, useRef } from 'react';

/**
 * MobileTabNav - Swipe-enabled tab navigation for mobile (cyan theme)
 */
const MobileTabNav = ({ tabs, activeTab, onTabChange }) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef(null);
  const [swipeStart, setSwipeStart] = useState(null);

  // Check scroll position
  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [tabs]);

  const scrollTabs = (direction) => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 200;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 300);
  };

  const handleTouchStart = (e) => {
    setSwipeStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!swipeStart) return;
    const swipeEnd = e.changedTouches[0].clientX;
    const diff = swipeStart - swipeEnd;

    if (Math.abs(diff) > 50) {
      const currentIndex = tabs.findIndex(t => t.id === activeTab);
      if (diff > 0 && currentIndex < tabs.length - 1) {
        // Swiped left - move to next tab
        onTabChange(tabs[currentIndex + 1].id);
      } else if (diff < 0 && currentIndex > 0) {
        // Swiped right - move to previous tab
        onTabChange(tabs[currentIndex - 1].id);
      }
    }
    setSwipeStart(null);
  };

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    // Scroll active tab into view
    setTimeout(() => {
      const activeElement = document.querySelector(`[data-tab-id="${tabId}"]`);
      if (activeElement && scrollContainerRef.current) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 0);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-black/40 backdrop-blur-md border-b border-white/10 overflow-hidden relative max-[480px]:p-1.5 max-[480px]:pr-1">
      {canScrollLeft && (
        <button
          className="shrink-0 w-8 h-8 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-center text-xl cursor-pointer transition-all active:bg-white/20 active:scale-95 select-none touch-manipulation max-[480px]:w-7 max-[480px]:h-7"
          onClick={() => scrollTabs('left')}
          aria-label="Scroll tabs left"
        >
          ‹
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex gap-2 flex-1 overflow-x-auto overflow-y-hidden scroll-smooth min-h-[44px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onScroll={checkScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            className={`shrink-0 flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[60px] h-16 rounded-lg border font-medium text-xs transition-all duration-200 select-none touch-manipulation relative max-[480px]:min-w-[56px] max-[480px]:h-[60px] max-[480px]:py-1.5 max-[480px]:px-2 max-[480px]:text-[0.65rem] max-[320px]:min-w-[48px] max-[320px]:py-1 max-[320px]:px-1 ${
              activeTab === tab.id
                ? 'text-white bg-[#00f0ff]/15 border-[#00f0ff]/30 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-0.5 after:bg-gradient-to-r after:from-[#00f0ff] after:to-[#33f3ff] after:rounded-full'
                : 'text-white/60 bg-transparent border-transparent hover:bg-white/10 hover:text-white/80'
            } active:scale-95`}
            onClick={() => handleTabClick(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className="text-xl leading-none flex items-center justify-center">{typeof tab.icon === 'string' ? tab.icon : tab.icon}</span>
            <span className="text-[0.7rem] leading-none whitespace-nowrap tracking-wide max-[480px]:text-[0.65rem] max-[320px]:hidden">{tab.label}</span>
          </button>
        ))}
      </div>

      {canScrollRight && (
        <button
          className="shrink-0 w-8 h-8 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-center text-xl cursor-pointer transition-all active:bg-white/20 active:scale-95 select-none touch-manipulation max-[480px]:w-7 max-[480px]:h-7"
          onClick={() => scrollTabs('right')}
          aria-label="Scroll tabs right"
        >
          ›
        </button>
      )}
    </div>
  );
};

export default MobileTabNav;












