import { useEffect, useRef, useCallback } from 'react';

/**
 * SwipeGestureHandler - Detects left/right swipes for tab navigation
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to wrap
 * @param {Function} props.onSwipeLeft - Callback when swiping left
 * @param {Function} props.onSwipeRight - Callback when swiping right
 * @param {number} props.threshold - Minimum distance to trigger (default: 50px)
 * @param {boolean} props.enabled - Enable/disable swipe detection
 */
const SwipeGestureHandler = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  enabled = true,
}) => {
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isSwipingRef = useRef(false);

  const handleTouchStart = useCallback((e) => {
    if (!enabled) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwipingRef.current = true;
  }, [enabled]);

  const handleTouchEnd = useCallback((e) => {
    if (!enabled || !isSwipingRef.current) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Ensure it's more of a horizontal swipe than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
      if (diffX > 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (diffX < 0 && onSwipeRight) {
        onSwipeRight();
      }
    }

    isSwipingRef.current = false;
  }, [enabled, threshold, onSwipeLeft, onSwipeRight]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
      {children}
    </div>
  );
};

export default SwipeGestureHandler;
