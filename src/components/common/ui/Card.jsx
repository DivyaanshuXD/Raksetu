/**
 * Card Component - Standardized card container with design system integration
 * Week 2: Component Library
 * 
 * Variants: default, outlined, elevated
 * Padding: sm, md, lg
 * Features: header, footer, hoverable, clickable
 * 
 * @example
 * <Card variant="elevated" padding="md" hoverable>
 *   <Card.Header>Title</Card.Header>
 *   <Card.Body>Content</Card.Body>
 *   <Card.Footer>Footer</Card.Footer>
 * </Card>
 */

import PropTypes from 'prop-types';

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  clickable = false,
  className = '',
  onClick,
  ...props
}) => {
  // Base styles
  const baseStyles = `
    bg-white rounded-2xl transition-all duration-200
    ${clickable || onClick ? 'cursor-pointer' : ''}
  `;

  // Variant styles
  const variantStyles = {
    default: `
      border border-gray-200 shadow-sm
    `,
    outlined: `
      border-2 border-gray-200
    `,
    elevated: `
      shadow-md hover:shadow-lg
    `,
  };

  // Padding styles
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // Hover styles
  const hoverStyles = hoverable || clickable ? `
    hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-300
  ` : '';

  // Combine styles
  const combinedStyles = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${paddingStyles[padding]}
    ${hoverStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      className={combinedStyles}
      onClick={onClick}
      role={clickable || onClick ? 'button' : undefined}
      tabIndex={clickable || onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header
const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

// Card Body
const CardBody = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

// Card Footer
const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 ${className}`} {...props}>
    {children}
  </div>
);

// Card Title
const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-xl font-bold text-gray-800 ${className}`} {...props}>
    {children}
  </h3>
);

// Card Description
const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`} {...props}>
    {children}
  </p>
);

// Attach sub-components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Title = CardTitle;
Card.Description = CardDescription;

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'outlined', 'elevated']),
  padding: PropTypes.oneOf(['sm', 'md', 'lg']),
  hoverable: PropTypes.bool,
  clickable: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardDescription.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Card;
