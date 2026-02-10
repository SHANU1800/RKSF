import { useState, useEffect, useRef } from 'react';

/**
 * SmartHeader - Header that collapses/expands based on scroll direction
 */
const SmartHeader = ({
  children,
  onCollapse,
  onExpand,
  expandedHeight = 80,
  collapsedHeight = 56,
  scrollThreshold = 50,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollableRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollableRef.current) return;
      const scrollY = scrollableRef.current.scrollTop;
      const isScrollingDown = scrollY > lastScrollY;

      if (isScrollingDown && !isCollapsed && scrollY > scrollThreshold) {
        setIsCollapsed(true);
        onCollapse?.();
      } else if (!isScrollingDown && isCollapsed) {
        setIsCollapsed(false);
        onExpand?.();
      }
      setLastScrollY(scrollY);
    };

    const element = scrollableRef.current;
    if (!element) return;
    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => element.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isCollapsed, scrollThreshold, onCollapse, onExpand]);

  return (
    <div className="w-full">
      <header
        className={`flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 transition-all duration-300 ease-out md:px-4 px-3 md:py-4 py-3 ${isCollapsed ? 'opacity-95 py-2 md:py-2' : 'opacity-100'}`}
        style={{ height: isCollapsed ? collapsedHeight : expandedHeight }}
      >
        {children}
      </header>
    </div>
  );
};

export default SmartHeader;












