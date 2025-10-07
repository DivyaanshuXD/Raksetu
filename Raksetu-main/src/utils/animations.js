/**
 * Animation Utilities
 * Reusable animation classes and utilities for consistent micro-interactions
 */

// Fade In Animations
export const fadeIn = "animate-in fade-in duration-300";
export const fadeInUp = "animate-in fade-in slide-in-from-bottom-4 duration-500";
export const fadeInDown = "animate-in fade-in slide-in-from-top-4 duration-500";
export const fadeInLeft = "animate-in fade-in slide-in-from-left-4 duration-500";
export const fadeInRight = "animate-in fade-in slide-in-from-right-4 duration-500";

// Scale Animations
export const scaleIn = "animate-in zoom-in-95 duration-300";
export const scaleInFast = "animate-in zoom-in-95 duration-200";

// Slide Animations
export const slideInFromBottom = "animate-in slide-in-from-bottom-full duration-500";
export const slideInFromTop = "animate-in slide-in-from-top-full duration-500";
export const slideInFromLeft = "animate-in slide-in-from-left-full duration-500";
export const slideInFromRight = "animate-in slide-in-from-right-full duration-500";

// Combined Animations
export const modalEnter = "animate-in fade-in zoom-in-95 duration-300";
export const toastEnter = "animate-in fade-in slide-in-from-right-5 duration-300";
export const dropdownEnter = "animate-in fade-in slide-in-from-top-2 duration-200";

// Hover Effects (use with className)
export const hoverScale = "transition-transform hover:scale-105 active:scale-95";
export const hoverLift = "transition-all hover:-translate-y-1 hover:shadow-lg";
export const hoverGrow = "transition-all hover:scale-[1.02]";
export const hoverBrightness = "transition-all hover:brightness-110";

// Button Animations
export const buttonPress = "transition-all active:scale-95";
export const buttonPulse = "animate-pulse";
export const buttonShake = "animate-shake"; // Need to define in tailwind config

// Loading States
export const spin = "animate-spin";
export const bounce = "animate-bounce";
export const pulse = "animate-pulse";

// Stagger Animation Helper
export const staggerDelay = (index, delayMs = 50) => ({
  style: { animationDelay: `${index * delayMs}ms` }
});

// Skeleton Loading
export const skeleton = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]";

// Card Hover Effects
export const cardHover = `
  transition-all duration-300
  hover:shadow-xl hover:-translate-y-1
  active:scale-[0.98]
`;

// Smooth Transitions
export const smoothTransition = "transition-all duration-300 ease-out";
export const smoothTransitionFast = "transition-all duration-200 ease-out";
export const smoothTransitionSlow = "transition-all duration-500 ease-out";

// Focus States
export const focusRing = "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2";
export const focusRingBlue = "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

// Glassmorphism Effect (without backdrop-blur for performance)
export const glass = "bg-white/95 shadow-xl";
export const glassDark = "bg-gray-900/95 shadow-xl";

// Gradient Animations
export const gradientAnimation = "bg-gradient-to-r animate-gradient-x";

// Utility Functions
export const delayedFadeIn = (delayMs = 0) => ({
  className: fadeIn,
  style: { animationDelay: `${delayMs}ms` }
});

export const staggeredFadeIn = (index, delayMs = 100) => ({
  className: fadeInUp,
  style: { animationDelay: `${index * delayMs}ms` }
});

// Scroll Reveal Animation
export const useScrollReveal = () => {
  // Can be implemented with IntersectionObserver
  // Returns ref to attach to elements
};

// Success/Error Animation States
export const successPulse = "animate-in zoom-in-95 duration-500 ease-out";
export const errorShake = "animate-shake"; // Need to add to tailwind.config

// Badge Pulse Animation
export const badgePulse = "animate-pulse";

// Notification Bell Ring
export const bellRing = "animate-bounce"; // Can add custom ring animation

export default {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleInFast,
  modalEnter,
  toastEnter,
  dropdownEnter,
  hoverScale,
  hoverLift,
  hoverGrow,
  buttonPress,
  cardHover,
  smoothTransition,
  focusRing,
  glass,
  staggerDelay,
  delayedFadeIn,
  staggeredFadeIn,
};
