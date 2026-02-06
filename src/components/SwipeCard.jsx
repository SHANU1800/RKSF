import React, { useState } from 'react';

export const SwipeCard = ({ cards = [], onSwipeLeft, onSwipeRight, onTap, renderCard }) => {
  const [touchStart, setTouchStart] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!cards || cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <p>No items to browse</p>
      </div>
    );
  }

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;

    if (Math.abs(distance) < 50) {
      // Tap
      onTap?.(cards[currentIndex]);
      return;
    }

    if (distance > 50) {
      // Swipe left
      onSwipeLeft?.(cards[currentIndex]);
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    } else if (distance < -50) {
      // Swipe right
      onSwipeRight?.(cards[currentIndex]);
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="w-full">
      <div
        className="relative h-96 md:h-128 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing transition-transform"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {renderCard ? renderCard(currentCard) : (
          <div className="w-full h-full bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
            <p className="text-white">{currentCard.title}</p>
          </div>
        )}
      </div>

      {/* Swipe Instructions */}
      <div className="flex justify-between items-center mt-4 px-4 text-xs text-gray-400">
        <div className="text-center flex-1">
          <p>← Swipe left</p>
          <p className="text-red-400 font-bold">No</p>
        </div>
        <div className="text-center text-gray-400">
          {currentIndex + 1} / {cards.length}
        </div>
        <div className="text-center flex-1">
          <p>Swipe right →</p>
          <p className="text-green-400 font-bold">Yes</p>
        </div>
      </div>

      {/* Tap to Details */}
      <p className="text-center text-xs text-blue-400 mt-4">Tap card for details</p>
    </div>
  );
};

export default SwipeCard;












