import React from 'react';

/**
 * A loading placeholder component that mimics the shape of content that will eventually be loaded
 * @param {Object} props
 * @param {string} [props.className] - Additional CSS classes to apply
 */
export const Skeleton = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
};
