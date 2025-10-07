/**
 * PageTransition Component - Smooth page transitions
 * Week 2: Micro-interactions & Animations
 * 
 * Features:
 * - Fade, slide, scale, and zoom transitions
 * - Configurable duration and easing
 * - Route-based animations
 * - Performance optimized
 * 
 * @example
 * <PageTransition variant="fade">
 *   <YourPage />
 * </PageTransition>
 */

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const PageTransition = ({
  children,
  variant = 'fade',
  duration = 300,
  delay = 0,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Transition variants
  const variants = {
    fade: {
      initial: 'opacity-0',
      animate: 'opacity-100',
      exit: 'opacity-0',
    },
    slideUp: {
      initial: 'opacity-0 translate-y-8',
      animate: 'opacity-100 translate-y-0',
      exit: 'opacity-0 translate-y-8',
    },
    slideDown: {
      initial: 'opacity-0 -translate-y-8',
      animate: 'opacity-100 translate-y-0',
      exit: 'opacity-0 -translate-y-8',
    },
    slideLeft: {
      initial: 'opacity-0 translate-x-8',
      animate: 'opacity-100 translate-x-0',
      exit: 'opacity-0 translate-x-8',
    },
    slideRight: {
      initial: 'opacity-0 -translate-x-8',
      animate: 'opacity-100 translate-x-0',
      exit: 'opacity-0 -translate-x-8',
    },
    scale: {
      initial: 'opacity-0 scale-95',
      animate: 'opacity-100 scale-100',
      exit: 'opacity-0 scale-95',
    },
    zoom: {
      initial: 'opacity-0 scale-50',
      animate: 'opacity-100 scale-100',
      exit: 'opacity-0 scale-50',
    },
  };

  const variantClasses = variants[variant] || variants.fade;
  const durationClass = `duration-${duration}`;

  return (
    <div
      className={`
        transform transition-all ease-out
        ${durationClass}
        ${isVisible ? variantClasses.animate : variantClasses.initial}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </div>
  );
};

// Stagger children animation
const StaggerChildren = ({
  children,
  staggerDelay = 50,
  className = '',
}) => {
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <PageTransition
          key={index}
          variant="slideUp"
          delay={index * staggerDelay}
        >
          {child}
        </PageTransition>
      ))}
    </div>
  );
};

// Attach sub-components
PageTransition.Stagger = StaggerChildren;

PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'fade',
    'slideUp',
    'slideDown',
    'slideLeft',
    'slideRight',
    'scale',
    'zoom',
  ]),
  duration: PropTypes.number,
  delay: PropTypes.number,
  className: PropTypes.string,
};

StaggerChildren.propTypes = {
  children: PropTypes.node.isRequired,
  staggerDelay: PropTypes.number,
  className: PropTypes.string,
};

export default PageTransition;
