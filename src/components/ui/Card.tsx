import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800 ${className}`}>
      {title && (
        <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">{title}</h3>
      )}
      {children}
    </div>
  );
};

export default Card;