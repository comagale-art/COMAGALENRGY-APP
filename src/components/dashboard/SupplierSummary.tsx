import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Supplier } from '../../types';
import Card from '../ui/Card';
import { calculateBarrels, calculateKgQuantity } from '../../utils/calculations';

interface SupplierSummaryProps {
  suppliers: Supplier[];
  bigSuppliers: any[]; // Using any[] since BigSupplier type might not be available
}

const SupplierSummary: React.FC<SupplierSummaryProps> = ({ suppliers, bigSuppliers }) => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  
  // Get list of big supplier names to exclude
  const bigSupplierNames = bigSuppliers.map(s => s.supplierName.toLowerCase());

  // Calculate weeks for the selected month
  const weeks = useMemo(() => {
    const monthStart = startOfMonth(new Date(`${selectedYear}-${selectedMonth}-01`));
    const monthEnd = endOfMonth(monthStart);
    
    return eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 1 } // Week starts on Monday
    ).map((weekStart, index) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const adjustedEnd = weekEnd > monthEnd ? monthEnd : weekEnd;
      
      return {
        value: `week${index + 1}`,
        label: `Semaine ${index + 1}`,
        start: weekStart,
        end: adjustedEnd
      };
    });
  }, [selectedMonth, selectedYear]);

  // Filter suppliers by selected month, year, and week
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const name = supplier.name.toLowerCase();
      const supplierDate = new Date(supplier.deliveryDate);
      const supplierMonth = format(supplierDate, 'MM');
      const supplierYear = format(supplierDate, 'yyyy');
      
      const matchesMonthYear = supplierMonth === selectedMonth && supplierYear === selectedYear;
      
      // Check if supplier matches week criteria when a specific week is selected
      const matchesWeek = selectedWeek === 'all' || weeks.some(week => {
        return week.value === selectedWeek && 
               isWithinInterval(supplierDate, { start: week.start, end: week.end });
      });
      
      return (
        supplier.quantity > 0 && // Only positive quantities
        !name.includes('jalal solo') &&
        !name.includes('jalal roumk') &&
        !name.includes('sarije') &&
        !bigSupplierNames.includes(name) &&
        matchesMonthYear &&
        matchesWeek
      );
    });
  }, [suppliers, selectedMonth, selectedYear, selectedWeek, weeks, bigSupplierNames]);

  // Calculate totals
  const totals = filteredSuppliers.reduce((acc, supplier) => {
    const barrels = calculateBarrels(supplier.quantity);
    const kgQuantity = calculateKgQuantity(barrels);
    
    return {
      cm: acc.cm + supplier.quantity,
      barrels: acc.barrels + barrels,
      kg: acc.kg + kgQuantity
    };
  }, { cm: 0, barrels: 0, kg: 0 });

  // Group by supplier name with all quantities
  const supplierGroups = filteredSuppliers.reduce((groups, supplier) => {
    if (!groups[supplier.name]) {
      groups[supplier.name] = {
        cm: 0,
        barrels: 0,
        kg: 0,
        deliveries: 0
      };
    }
    const barrels = calculateBarrels(supplier.quantity);
    const kgQuantity = calculateKgQuantity(barrels);
    
    groups[supplier.name].cm += supplier.quantity;
    groups[supplier.name].barrels += barrels;
    groups[supplier.name].kg += kgQuantity;
    groups[supplier.name].deliveries += 1;
    
    return groups;
  }, {} as Record<string, { cm: number; barrels: number; kg: number; deliveries: number }>);

  return (
    <Card title="Résumé des Fournisseurs">
      <div className="space-y-4">
        {/* Date selection controls */}
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Mois
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setSelectedWeek('all'); // Reset week selection when month changes
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const month = (i + 1).toString().padStart(2, '0');
                return (
                  <option key={month} value={month}>
                    {format(new Date(2024, i, 1), 'MMMM', { locale: fr })}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Année
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedWeek('all'); // Reset week selection when year changes
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = (new Date().getFullYear() - 2 + i).toString();
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Semaine
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Toutes les semaines</option>
              {weeks.map((week) => (
                <option key={week.value} value={week.value}>
                  {week.label} ({format(week.start, 'dd/MM', { locale: fr })} - {format(week.end, 'dd/MM', { locale: fr })})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Quantité (cm)</p>
            <p className="text-2xl font-bold text-comagal-green dark:text-comagal-light-green">
              {totals.cm.toFixed(2)} cm
            </p>
          </div>
          
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Barils</p>
            <p className="text-2xl font-bold text-comagal-green dark:text-comagal-light-green">
              {totals.barrels.toFixed(2)}
            </p>
          </div>
          
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Quantité (kg)</p>
            <p className="text-2xl font-bold text-comagal-green dark:text-comagal-light-green">
              {totals.kg.toFixed(2)} kg
            </p>
          </div>
        </div>

        {/* Supplier groups */}
        <div className="space-y-3">
          {Object.entries(supplierGroups)
            .sort(([, a], [, b]) => b.cm - a.cm)
            .map(([name, data]) => (
              <div key={name} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {data.deliveries} livraison{data.deliveries > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quantité (cm)</p>
                    <p className="text-lg font-semibold text-comagal-green dark:text-comagal-light-green">
                      {data.cm.toFixed(2)} cm
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Barils</p>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {data.barrels.toFixed(2)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quantité (kg)</p>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {data.kg.toFixed(2)} kg
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
};

export default SupplierSummary;