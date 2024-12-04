import React from 'react';

const Toggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
      enabled ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-200 dark:bg-dark-bg-tertiary'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export default Toggle;
