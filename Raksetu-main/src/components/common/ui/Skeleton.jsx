/**
 * Skeleton Component - Loading state placeholders
 * Week 2: Micro-interactions & Animations
 * 
 * Features:
 * - Shimmer animation effect
 * - Multiple variants (text, circle, rectangle)
 * - Customizable size and count
 * - Responsive design
 * 
 * @example
 * <Skeleton variant="text" count={3} />
 * <Skeleton variant="circle" size={64} />
 */

import PropTypes from 'prop-types';

const Skeleton = ({
  variant = 'text',
  width,
  height,
  size,
  count = 1,
  className = '',
  animate = true,
}) => {
  // Base styles
  const baseStyles = `
    bg-gray-200
    ${animate ? 'animate-pulse' : ''}
  `;

  // Variant styles
  const variantStyles = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    rectangle: 'rounded-lg',
    avatar: 'rounded-full',
    card: 'rounded-2xl h-48',
    button: 'rounded-xl h-11',
  };

  // Width styles for text variant
  const textWidths = ['w-full', 'w-11/12', 'w-10/12', 'w-9/12', 'w-full'];

  // Render single skeleton
  const renderSkeleton = (index) => {
    const style = {};

    // Handle width
    if (width) {
      style.width = typeof width === 'number' ? `${width}px` : width;
    }

    // Handle height
    if (height) {
      style.height = typeof height === 'number' ? `${height}px` : height;
    }

    // Handle size (for circle/avatar)
    if (size && (variant === 'circle' || variant === 'avatar')) {
      style.width = `${size}px`;
      style.height = `${size}px`;
    }

    // Get width class for text variant
    const widthClass = variant === 'text' && !width
      ? textWidths[index % textWidths.length]
      : '';

    return (
      <div
        key={index}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${widthClass}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        style={style}
      />
    );
  };

  // Render multiple skeletons
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => renderSkeleton(index))}
    </div>
  );
};

// Skeleton group components for common patterns
const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
    <div className="flex items-start gap-4 mb-4">
      <Skeleton variant="circle" size={48} />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" className="mb-2" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <Skeleton variant="text" count={3} className="mb-4" />
    <Skeleton variant="button" width="120px" />
  </div>
);

const SkeletonList = ({ count = 3, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex items-center gap-4">
        <Skeleton variant="circle" size={40} />
        <div className="flex-1">
          <Skeleton variant="text" width="70%" className="mb-2" />
          <Skeleton variant="text" width="50%" />
        </div>
      </div>
    ))}
  </div>
);

const SkeletonProfile = ({ className = '' }) => (
  <div className={`flex flex-col items-center ${className}`}>
    <Skeleton variant="circle" size={96} className="mb-4" />
    <Skeleton variant="text" width={200} className="mb-2" />
    <Skeleton variant="text" width={150} className="mb-6" />
    <div className="flex gap-4">
      <Skeleton variant="button" width={120} />
      <Skeleton variant="button" width={120} />
    </div>
  </div>
);

// Attach sub-components
Skeleton.Card = SkeletonCard;
Skeleton.List = SkeletonList;
Skeleton.Profile = SkeletonProfile;

Skeleton.propTypes = {
  variant: PropTypes.oneOf(['text', 'circle', 'rectangle', 'avatar', 'card', 'button']),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number,
  count: PropTypes.number,
  className: PropTypes.string,
  animate: PropTypes.bool,
};

SkeletonCard.propTypes = {
  className: PropTypes.string,
};

SkeletonList.propTypes = {
  count: PropTypes.number,
  className: PropTypes.string,
};

SkeletonProfile.propTypes = {
  className: PropTypes.string,
};

export default Skeleton;
