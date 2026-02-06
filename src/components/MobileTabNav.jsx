import { useState, useEffect, useRef } from 'react';
import './MobileTabNav.css';

/**
 * MobileTabNav - Swipe-enabled tab navigation for mobile
 * Features:
 * - Horizontal swipe to navigate
 * - Visual scroll indicator
 * - Touch-optimized buttons
 * - Smooth animations
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
    <div className="mobile-tab-nav">
      {canScrollLeft && (
        <button
          className="tab-scroll-btn tab-scroll-left"
          onClick={() => scrollTabs('left')}
          aria-label="Scroll tabs left"
        >
          ‹
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="tabs-container"
        onScroll={checkScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {typeof tab.icon === 'string' ? (
              <span className="tab-icon">{tab.icon}</span>
            ) : (
              <span className="tab-icon-component">{tab.icon}</span>
            )}
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {canScrollRight && (
        <button
          className="tab-scroll-btn tab-scroll-right"
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












