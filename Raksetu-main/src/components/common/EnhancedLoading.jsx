/**
 * Enhanced Loading States
 * Beautiful loading indicators for better UX
 */

import React from 'react';
import { Droplet, Heart } from 'lucide-react';

// Spinner with blood drop animation
export const BloodDropSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Droplet 
          className={`${sizes[size]} text-red-600 animate-bounce`}
          fill="currentColor"
        />
        <div className="absolute inset-0 animate-ping opacity-25">
          <Droplet 
            className={`${sizes[size]} text-red-600`}
            fill="currentColor"
          />
        </div>
      </div>
      {message && (
        <p className="text-gray-600 text-sm font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

// Heartbeat loading animation
export const HeartbeatLoader = ({ message = 'Processing...' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Heart 
          className="w-12 h-12 text-red-600 animate-pulse"
          fill="currentColor"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-red-600/20 rounded-full animate-ping" />
        </div>
      </div>
      {message && (
        <p className="text-gray-600 text-sm font-medium">
          {message}
        </p>
      )}
    </div>
  );
};

// Skeleton loader for cards
export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-full" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 bg-gray-200 rounded w-20" />
        <div className="h-8 bg-gray-200 rounded w-24" />
      </div>
    </div>
  );
};

// Skeleton loader for list items
export const SkeletonList = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

// Progress bar with blood drop
export const ProgressBar = ({ progress = 0, message = 'Loading...' }) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{message}</span>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-300 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-0 w-4 h-4 -mt-1 -mr-1">
            <Droplet 
              className="w-4 h-4 text-red-600 animate-bounce"
              fill="currentColor"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Dots loading indicator
export const DotsLoader = ({ message = 'Loading' }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-600 text-sm font-medium">{message}</span>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

// Full page loading overlay
export const LoadingOverlay = ({ message = 'Please wait...' }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-filter backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4">
        <BloodDropSpinner size="lg" message={message} />
      </div>
    </div>
  );
};

// Inline spinner for buttons
export const ButtonSpinner = ({ className = '' }) => {
  return (
    <svg
      className={`animate-spin h-5 w-5 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
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
  );
};

export default {
  BloodDropSpinner,
  HeartbeatLoader,
  SkeletonCard,
  SkeletonList,
  ProgressBar,
  DotsLoader,
  LoadingOverlay,
  ButtonSpinner,
};
