import React from 'react';

const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent ${className}`}
    {...props}
  />
);

export default Input;
