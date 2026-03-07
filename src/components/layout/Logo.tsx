import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <img
      src="https://comagale.com/assets/logo-comagal-BGb6Fdik.png"
      alt="Comagal Energy Logo"
      className={`h-10 w-auto object-contain ${className}`}
    />
  );
};

export default Logo;