import React from 'react';
import { Tank } from '../../types';
import Card from '../ui/Card';

interface TankStockAnalysisProps {
  tanks: Tank[];
  sarijeLevel?: number;
}

// Tank capacity configuration
const TANK_CAPACITIES: Record<string, number> = {
  'C1': 250,
  'C2': 250,
  'C3': 250,
  'C4': 250,
  'C5': 250,
  'C6': 250,
  'C7': 250,
  'C8': 250,
  'C9': 454,
  'C10': 200,
  'C11': 200,
  'C50': 300,
  'C60': 300,
  'C100-1': 36, // Tonne capacity
  'C100-2': 64  // Tonne capacity
};

// Conversion factors for kg calculation
const KG_CONVERSION = {
  // Regular tanks: kg per cm
  'C1': 27300 / 240, // 27300kg/240cm
  'C2': 27300 / 240,
  'C3': 27300 / 240,
  'C4': 27300 / 240,
  'C5': 25000 / 240, // 25000kg/240cm
  'C6': 23000 / 240,
  'C7': 23000 / 240,
  'C8': 27300 / 240,
  'C9': 9500 / 413,   // 9500kg/41cm
  'C10': 9000 / 200, // 10000kg/190cm
  'C11': 9000 / 200,
  'C50': 49000 / 290, // 58000kg/290cm
  'C60': 59000 / 290  // 50000kg/290cm
};

const TankStockAnalysis: React.FC<TankStockAnalysisProps> = ({ tanks, sarijeLevel = 0 }) => {
  // Get the latest status for each tank
  const latestTankStatus = tanks.reduce((acc, tank) => {
    if (!acc[tank.name] || new Date(`${tank.date} ${tank.time}`) > new Date(`${acc[tank.name].date} ${acc[tank.name].time}`)) {
      acc[tank.name] = tank;
    }
    return acc;
  }, {} as Record<string, Tank>);

  // Calculate product totals including Sarije
  const productTotals = Object.entries(TANK_CAPACITIES).reduce((acc, [tankName, capacity]) => {
    const tank = latestTankStatus[tankName];
    if (!tank) return acc;

    const isC100Tank = tankName === 'C100-1' || tankName === 'C100-2';
    
    if (!acc[tank.productType]) {
      acc[tank.productType] = {
        quantityKg: 0,
        tanks: []
      };
    }
    
    let kgQuantity: number;
    if (isC100Tank) {
      // For C100 tanks, quantity is already in tonnes, convert to kg
      kgQuantity = tank.quantity * 1000;
    } else {
      // For regular tanks, calculate actual quantity in cm then convert to kg
      const actualQuantityCm = TANK_CAPACITIES[tankName] - tank.quantity;
      kgQuantity = actualQuantityCm * KG_CONVERSION[tankName];
    }
    
    acc[tank.productType].quantityKg += kgQuantity;
    acc[tank.productType].tanks.push(tankName);
    
    return acc;
  }, {} as Record<string, { quantityKg: number; tanks: string[] }>);

  // Add Sarije stock to product totals
  if (sarijeLevel > 0) {
    const sarijeKg = (sarijeLevel / 0.75) * 185; // Convert cm to kg using the formula
    
    if (!productTotals['huile_usage']) {
      productTotals['huile_usage'] = {
        quantityKg: 0,
        tanks: []
      };
    }
    
    productTotals['huile_usage'].quantityKg += sarijeKg;
    productTotals['huile_usage'].tanks.push('Sarije');
  }

  // Calculate total stock in kg
  const totalStockKg = Object.values(productTotals).reduce((total, product) => {
    return total + product.quantityKg;
  }, 0);

  return (
    <div className="space-y-6">
      <Card title="Stock Total">
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Quantité totale en stock</p>
          <p className="text-3xl font-bold text-comagal-green dark:text-comagal-light-green">
            {totalStockKg.toFixed(2)} kg
          </p>
        </div>
      </Card>

      <Card title="État des Citernes">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(TANK_CAPACITIES).map(([tankName, capacity]) => {
            const tank = latestTankStatus[tankName];
            const isC100Tank = tankName === 'C100-1' || tankName === 'C100-2';
            const isEmpty = !tank;
            
            // Calculate actual quantity and remaining space
            let actualQuantity = 0;
            let remainingSpace = capacity;
            let kgQuantity = 0;
            
            if (tank) {
              if (isC100Tank) {
                actualQuantity = tank.quantity;
                remainingSpace = capacity - actualQuantity;
                kgQuantity = actualQuantity * 1000; // Convert tonnes to kg
              } else {
                remainingSpace = tank.quantity;
                actualQuantity = capacity - remainingSpace;
                kgQuantity = actualQuantity * KG_CONVERSION[tankName];
              }
            }
            
            // Calculate fill percentage based on actual quantity
            const filledPercentage = (actualQuantity / capacity) * 100;
            
            return (
              <div 
                key={tankName}
                className={`rounded-lg border p-4 ${
                  isEmpty 
                    ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/30' 
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">{tankName}</h3>
                  <span className={`text-sm ${isEmpty ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {capacity} {isC100Tank ? 'tonnes' : 'cm'}
                  </span>
                </div>
                
                {tank ? (
                  <>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {tank.productType}
                    </p>
                    <div className="mt-2">
                      <div className="mb-1 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">
                            {isC100Tank ? (
                              `${actualQuantity.toFixed(2)} tonnes`
                            ) : (
                              `${actualQuantity.toFixed(2)} cm`
                            )}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {filledPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {kgQuantity.toFixed(2)} kg
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div 
                          className={`h-full ${
                            filledPercentage < 20 
                              ? 'bg-red-500' 
                              : filledPercentage < 50 
                                ? 'bg-yellow-500' 
                                : 'bg-comagal-green'
                          }`}
                          style={{ width: `${Math.min(filledPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    Citerne vide
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Stock par Produit">
        <div className="space-y-4">
          {Object.entries(productTotals).map(([product, data]) => (
            <div key={product} className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
              <h3 className="mb-2 font-medium text-gray-900 dark:text-white">{product}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Quantité totale</p>
                  <p className="text-lg font-semibold text-comagal-green dark:text-comagal-light-green">
                    {data.quantityKg.toFixed(2)} kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Emplacements</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {data.tanks.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TankStockAnalysis;