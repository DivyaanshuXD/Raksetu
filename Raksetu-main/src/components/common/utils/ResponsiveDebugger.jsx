/**
 * ResponsiveDebugger Component - Visual breakpoint indicator
 * Week 2: Responsive Design Audit
 * 
 * Features:
 * - Shows current breakpoint
 * - Displays viewport dimensions
 * - Grid overlay option
 * - Touch target visualizer
 * - Only visible in development
 * 
 * @example
 * <ResponsiveDebugger />
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ResponsiveDebugger = ({
  enabled = process.env.NODE_ENV === 'development',
  showGrid = false,
  showTouchTargets = false,
}) => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [breakpoint, setBreakpoint] = useState('');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDimensions({ width, height });

      // Determine breakpoint
      if (width < 640) {
        setBreakpoint('xs');
      } else if (width < 768) {
        setBreakpoint('sm');
      } else if (width < 1024) {
        setBreakpoint('md');
      } else if (width < 1280) {
        setBreakpoint('lg');
      } else {
        setBreakpoint('xl');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Breakpoint Indicator */}
      <div
        className="fixed bottom-4 left-4 z-[9999] bg-black/80 text-white px-4 py-2 rounded-lg font-mono text-sm shadow-lg"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        <div className="flex items-center gap-3">
          {/* Breakpoint */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Breakpoint:</span>
            <span
              className={`
                font-bold px-2 py-0.5 rounded
                ${breakpoint === 'xs' ? 'bg-red-500' : ''}
                ${breakpoint === 'sm' ? 'bg-orange-500' : ''}
                ${breakpoint === 'md' ? 'bg-yellow-500' : ''}
                ${breakpoint === 'lg' ? 'bg-green-500' : ''}
                ${breakpoint === 'xl' ? 'bg-blue-500' : ''}
              `.trim().replace(/\s+/g, ' ')}
            >
              {breakpoint.toUpperCase()}
            </span>
          </div>

          {/* Dimensions */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Size:</span>
            <span className="font-bold">
              {dimensions.width} × {dimensions.height}
            </span>
          </div>
        </div>

        {/* Breakpoint Reference */}
        <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
          <div>xs: &lt;640px | sm: 640px | md: 768px | lg: 1024px | xl: 1280px</div>
        </div>
      </div>

      {/* Grid Overlay */}
      {showGrid && (
        <div
          className="fixed inset-0 z-[9998] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,0,0.1) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
      )}

      {/* Touch Target Overlay */}
      {showTouchTargets && (
        <style>{`
          * {
            outline: 1px solid rgba(255, 0, 0, 0.3) !important;
          }
          
          button, a, input, select, textarea {
            outline: 2px solid rgba(0, 255, 0, 0.5) !important;
            min-width: 44px !important;
            min-height: 44px !important;
          }
        `}</style>
      )}
    </>
  );
};

ResponsiveDebugger.propTypes = {
  enabled: PropTypes.bool,
  showGrid: PropTypes.bool,
  showTouchTargets: PropTypes.bool,
};

export default ResponsiveDebugger;
