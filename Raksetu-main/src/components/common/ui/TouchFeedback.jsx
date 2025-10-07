/**
 * TouchFeedback Component - Enhanced touch interaction wrapper
 * Week 2: Mobile Navigation Enhancement
 * 
 * Features:
 * - Active state feedback
 * - Ripple effect on touch
 * - Haptic feedback (vibration)
 * - Long-press detection
 * - Touch-friendly targets (min 48px)
 * 
 * @example
 * <TouchFeedback onPress={handlePress} onLongPress={handleLongPress}>
 *   <button>Touch me</button>
 * </TouchFeedback>
 */

import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const TouchFeedback = ({
  children,
  onPress,
  onLongPress,
  haptic = true,
  ripple = true,
  activeScale = 0.97,
  longPressDuration = 500,
  className = '',
  disabled = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);
  const longPressTimer = useRef(null);
  const elementRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  // Trigger haptic feedback
  const triggerHaptic = (intensity = 10) => {
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(intensity);
    }
  };

  // Create ripple effect
  const createRipple = (event) => {
    if (!ripple || disabled) return;

    const rect = elementRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple = {
      x,
      y,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  // Handle press start
  const handlePressStart = (event) => {
    if (disabled) return;

    setIsPressed(true);
    triggerHaptic(5);

    // Create ripple effect
    if (event.type === 'mousedown' || event.type === 'touchstart') {
      const clientX = event.type === 'touchstart'
        ? event.touches[0].clientX
        : event.clientX;
      const clientY = event.type === 'touchstart'
        ? event.touches[0].clientY
        : event.clientY;

      createRipple({ clientX, clientY });
    }

    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        triggerHaptic(20);
        onLongPress();
        setIsPressed(false);
      }, longPressDuration);
    }
  };

  // Handle press end
  const handlePressEnd = () => {
    if (disabled) return;

    setIsPressed(false);

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Trigger press callback
    if (onPress) {
      onPress();
    }
  };

  // Handle press cancel
  const handlePressCancel = () => {
    setIsPressed(false);

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div
      ref={elementRef}
      className={`
        relative overflow-hidden
        select-none
        transition-transform duration-150 ease-out
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={{
        transform: isPressed && !disabled ? `scale(${activeScale})` : 'scale(1)',
        minWidth: '48px',
        minHeight: '48px',
      }}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressCancel}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressCancel}
    >
      {/* Children */}
      {children}

      {/* Ripple effects */}
      {ripple && ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white opacity-30 pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            transform: 'translate(-50%, -50%)',
            animation: 'ripple 0.6s ease-out',
          }}
        />
      ))}

      {/* Ripple animation styles */}
      <style jsx>{`
        @keyframes ripple {
          0% {
            width: 0;
            height: 0;
            opacity: 0.5;
          }
          100% {
            width: 300px;
            height: 300px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

TouchFeedback.propTypes = {
  children: PropTypes.node.isRequired,
  onPress: PropTypes.func,
  onLongPress: PropTypes.func,
  haptic: PropTypes.bool,
  ripple: PropTypes.bool,
  activeScale: PropTypes.number,
  longPressDuration: PropTypes.number,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default TouchFeedback;
