import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FloatingActionButtonProps {
  to: string;
  label?: string;
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  to, 
  label = 'Ajouter',
  className = ''
}) => {
  return (
    <Link
      to={to}
      className={`fixed bottom-4 right-4 z-10 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 md:bottom-6 md:right-6 ${className || 'bg-comagal-green hover:bg-comagal-light-green focus:ring-comagal-green'}`}
      aria-label={label}
    >
      <Plus size={24} />
    </Link>
  );
};

export default FloatingActionButton;