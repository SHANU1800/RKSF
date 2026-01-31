import { useState, useEffect, useRef } from 'react';
import './SmartHeader.css';

/**
 * SmartHeader - Header that collapses/expands based on scroll direction
 * Features:
 * - Collapse when scrolling down
 * - Expand when scrolling up
 * - Smooth animations
 * - Customizable height
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
    <div className="smart-header-wrapper">
      <header
        className={`smart-header ${isCollapsed ? 'collapsed' : 'expanded'}`}
        style={{
          height: isCollapsed ? collapsedHeight : expandedHeight,
        }}
      >
        {children}
      </header>
    </div>
  );
};

export default SmartHeader;
