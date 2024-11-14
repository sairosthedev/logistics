import React from 'react';

export function Alert({ children, className }) {
  return (
    <div className={`bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 ${className}`} role="alert">
      {children}
    </div>
  );
}

export function AlertDescription({ children }) {
  return <p className="text-sm">{children}</p>;
}