/**
 * SwipeableModal Component - Modal with swipe-to-dismiss gesture
 * Week 2: Mobile Navigation Enhancement
 * 
 * Features:
 * - Swipe down to dismiss on mobile
 * - Drag indicator at top
 * - Smooth spring animations
 * - Touch-friendly interactions
 * 
 * @example
 * <SwipeableModal isOpen={isOpen} onClose={handleClose}>
 *   <h2>Modal Content</h2>
 * </SwipeableModal>
 */

import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const SwipeableModal = ({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  swipeThreshold = 100,
  className = '',
}) => {
  const modalRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Touch handlers
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const touchY = e.touches[0].clientY;
    const deltaY = touchY - startY;

    // Only allow dragging down
    if (deltaY > 0) {
      setCurrentY(touchY);
      setTranslateY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // If dragged beyond threshold, close modal
    if (translateY > swipeThreshold) {
      onClose();
    }

    // Reset position
    setTranslateY(0);
    setStartY(0);
    setCurrentY(0);
  };

  // Mouse handlers for desktop testing
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setCurrentY(e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaY = e.clientY - startY;

    if (deltaY > 0) {
      setCurrentY(e.clientY);
      setTranslateY(deltaY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    if (translateY > swipeThreshold) {
      onClose();
    }

    setTranslateY(0);
    setStartY(0);
    setCurrentY(0);
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Calculate opacity based on drag distance
  const opacity = Math.max(0, 1 - translateY / 300);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-black transition-opacity duration-300
          ${isOpen ? 'opacity-50' : 'opacity-0'}
        `.trim().replace(/\s+/g, ' ')}
        style={{ opacity: opacity * 0.5 }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative w-full max-w-lg
          bg-white rounded-t-3xl md:rounded-2xl
          shadow-2xl
          max-h-[90vh] md:max-h-[80vh]
          transition-all duration-300
          ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full md:translate-y-0 opacity-0'}
          ${isDragging ? 'transition-none' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        style={{
          transform: `translateY(${translateY}px)`,
        }}
      >
        {/* Drag handle area */}
        <div
          className="md:hidden pt-3 pb-2 px-4 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Drag indicator */}
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`
                  p-2 rounded-xl
                  text-gray-500 hover:text-gray-700
                  hover:bg-gray-100
                  transition-colors duration-200
                  active:scale-95
                `.trim().replace(/\s+/g, ' ')}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] md:max-h-[calc(80vh-8rem)] p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

SwipeableModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  showCloseButton: PropTypes.bool,
  swipeThreshold: PropTypes.number,
  className: PropTypes.string,
};

export default SwipeableModal;
