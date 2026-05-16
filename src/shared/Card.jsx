import React from 'react';

const Card = ({ children, className = '', padding = true }) => {
  return (
    <div className={`bg-card border-2 border-border rounded-2xl overflow-hidden ${className}`}>
      <div className={padding ? 'p-6 sm:p-8' : ''}>
        {children}
      </div>
    </div>
  );
};

export default Card;
