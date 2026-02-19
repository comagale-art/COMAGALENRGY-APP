import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <img
      src="/logo_COMAGAL_ENERGY.png"
      alt="Comagal Energy Logo"
      className={`h-10 w-auto object-contain ${className}`}
    />
  );
};

export default Logo;