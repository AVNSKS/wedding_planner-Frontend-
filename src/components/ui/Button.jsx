import React from 'react';

const Button = ({ variant = 'primary', className = '', ...props }) => {
  const base =
    'inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60';
  const styles = {
    primary: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700',
    outline: 'border border-rose-300 text-rose-600 bg-white/80 hover:bg-white',
    ghost: 'text-gray-700 hover:bg-gray-100',
  };

  return (
    <button
      className={`${base} ${styles[variant] || ''} ${className}`}
      {...props}
    />
  );
};

export default Button;
