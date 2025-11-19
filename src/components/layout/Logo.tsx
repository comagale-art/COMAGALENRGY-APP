import React from 'react';
import { Droplets, Cog } from 'lucide-react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="absolute text-comagal-green dark:text-comagal-light-green">
        <Droplets size={28} />
      </div>
      <div className="absolute ml-4 mt-2 text-comagal-blue dark:text-comagal-light-blue">
        <Cog size={20} />
      </div>
    </div>
  );
};

export default Logo;