import React from 'react';

const Card = ({ className = '', children }) => (
  <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 ${className}`}>
    {children}
  </div>
);

export default Card;
