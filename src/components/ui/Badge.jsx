import React from 'react';

const Badge = ({ variant = 'default', className = '', children }) => {
  const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium';
  const styles = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-emerald-100 text-emerald-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-amber-100 text-amber-800',
    info: 'bg-blue-100 text-blue-800',
  };
  return (
    <span className={`${base} ${styles[variant] || styles.default} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
