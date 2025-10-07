/**
 * Accessibility Utilities
 * Helper functions for keyboard navigation, focus management, and ARIA
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Trap focus within a container (useful for modals and dropdowns)
 * @param {RefObject} containerRef - React ref to the container element
 * @param {boolean} isActive - Whether focus trap is active
 * @param {RefObject} initialFocusRef - Optional ref to element that should receive initial focus
 */
export function useFocusTrap(containerRef, isActive, initialFocusRef = null) {
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the element that had focus before the trap
    previousActiveElement.current = document.activeElement;

    // Get all focusable elements
    const focusableElements = getFocusableElements(containerRef.current);
    
    if (focusableElements.length === 0) return;

    // Focus initial element or first focusable element
    const elementToFocus = initialFocusRef?.current || focusableElements[0];
    elementToFocus?.focus();

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      }
      // Tab
      else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup: restore focus when trap is deactivated
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      if (previousActiveElement.current && previousActiveElement.current.focus) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, containerRef, initialFocusRef]);
}

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement[]} Array of focusable elements
 */
export function getFocusableElements(container) {
  if (!container) return [];

  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  return Array.from(container.querySelectorAll(selector));
}

/**
 * Hook for handling Escape key press
 * @param {Function} callback - Function to call when Escape is pressed
 * @param {boolean} isActive - Whether the handler is active
 */
export function useEscapeKey(callback, isActive = true) {
  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [callback, isActive]);
}

/**
 * Hook for handling Enter key press on an element
 * @param {Function} callback - Function to call when Enter is pressed
 */
export function useEnterKey(callback) {
  return useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback(e);
    }
  }, [callback]);
}

/**
 * Make a non-interactive element keyboard accessible
 * @param {Function} onClick - Click handler
 * @returns {Object} Props to spread on the element
 */
export function makeKeyboardAccessible(onClick) {
  return {
    role: 'button',
    tabIndex: 0,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e);
      }
    },
    onClick
  };
}

/**
 * Announce a message to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' (default) or 'assertive'
 */
export function announceToScreenReader(message, priority = 'polite') {
  // Create or get existing live region
  let liveRegion = document.getElementById('a11y-live-region');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'a11y-live-region';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only'; // Visually hidden but readable by screen readers
    liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(liveRegion);
  }

  // Update the message
  liveRegion.textContent = message;

  // Clear after announcement
  setTimeout(() => {
    liveRegion.textContent = '';
  }, 1000);
}

/**
 * Check if an element is visible to screen readers
 * @param {HTMLElement} element - Element to check
 * @returns {boolean}
 */
export function isAriaHidden(element) {
  if (!element) return true;
  
  if (element.getAttribute('aria-hidden') === 'true') {
    return true;
  }
  
  if (element.parentElement) {
    return isAriaHidden(element.parentElement);
  }
  
  return false;
}

/**
 * Generate a unique ID for ARIA relationships
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
let idCounter = 0;
export function generateAriaId(prefix = 'a11y') {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}

/**
 * Hook to manage a unique ID that persists across renders
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Persistent unique ID
 */
export function useAriaId(prefix = 'a11y') {
  const idRef = useRef(null);
  
  if (!idRef.current) {
    idRef.current = generateAriaId(prefix);
  }
  
  return idRef.current;
}

/**
 * Create ARIA label for form errors
 * @param {string} fieldName - Name of the field
 * @param {string} error - Error message
 * @returns {Object} Props for the input and error message
 */
export function createFieldErrorProps(fieldName, error) {
  const errorId = `${fieldName}-error`;
  
  return {
    inputProps: {
      'aria-invalid': !!error,
      'aria-describedby': error ? errorId : undefined
    },
    errorProps: {
      id: errorId,
      role: 'alert'
    }
  };
}

/**
 * Skip to content link component (should be first interactive element on page)
 * @returns {JSX.Element}
 */
export function SkipToContent({ targetId = 'main-content' }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-red-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}
      onFocus={(e) => {
        e.target.style.position = 'fixed';
        e.target.style.left = '1rem';
        e.target.style.width = 'auto';
        e.target.style.height = 'auto';
        e.target.style.overflow = 'visible';
      }}
      onBlur={(e) => {
        e.target.style.position = 'absolute';
        e.target.style.left = '-10000px';
        e.target.style.width = '1px';
        e.target.style.height = '1px';
        e.target.style.overflow = 'hidden';
      }}
    >
      Skip to main content
    </a>
  );
}

/**
 * Accessible loading spinner with screen reader announcement
 * @param {Object} props - Component props
 * @returns {JSX.Element}
 */
export function AccessibleSpinner({ label = 'Loading', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div role="status" aria-live="polite" aria-label={label}>
      <svg
        className={`animate-spin text-red-600 ${sizeClasses[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * Get readable color contrast ratio
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @returns {number} Contrast ratio
 */
export function getContrastRatio(foreground, background) {
  const getLuminance = (hex) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = ((rgb >> 0) & 0xff) / 255;
    
    const [rL, gL, bL] = [r, g, b].map(c => 
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    
    return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color contrast meets WCAG AA standards
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @param {boolean} largeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns {boolean}
 */
export function meetsWCAGAA(foreground, background, largeText = false) {
  const ratio = getContrastRatio(foreground, background);
  return largeText ? ratio >= 3 : ratio >= 4.5;
}
