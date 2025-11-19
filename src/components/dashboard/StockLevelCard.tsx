import React from 'react';
import Card from '../ui/Card';
import { calculateStockPercentage } from '../../utils/calculations';

interface StockLevelCardProps {
  currentLevel: number;
  maxLevel?: number;
}

const StockLevelCard: React.FC<StockLevelCardProps> = ({ 
  currentLevel, 
  maxLevel = 193 // Updated to 193 cm
}) => {
  const percentage = calculateStockPercentage(currentLevel, maxLevel);
  
  const getColorClass = () => {
    if (percentage < 20) return 'text-red-600';
    if (percentage < 50) return 'text-yellow-500';
    return 'text-comagal-green';
  };
  
  const getProgressColorClass = () => {
    if (percentage < 20) return 'bg-red-600';
    if (percentage < 50) return 'bg-yellow-500';
    return 'bg-comagal-green';
  };
  
  return (
    <Card title="Niveau de Stock SARIJE">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Niveau actuel</p>
          <p className={`text-3xl font-bold ${getColorClass()}`}>
            {currentLevel.toFixed(2)} cm
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Capacité maximale</p>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            {maxLevel} cm
          </p>
        </div>
      </div>
      
      <div className="mb-2 h-6 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div 
          className={`h-full ${getProgressColorClass()} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
        {percentage.toFixed(1)}% de la capacité totale
      </p>
    </Card>
  );
};

export default StockLevelCard;