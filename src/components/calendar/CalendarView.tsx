import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Supplier } from '../../types';
import Button from '../ui/Button';

interface CalendarViewProps {
  suppliers: Supplier[];
  onDayClick: (date: Date, suppliers: Supplier[]) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ suppliers, onDayClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Group suppliers by date
  const suppliersByDate = useMemo(() => {
    const result: Record<string, Supplier[]> = {};
    
    suppliers.forEach(supplier => {
      const dateKey = supplier.deliveryDate;
      if (!result[dateKey]) {
        result[dateKey] = [];
      }
      result[dateKey].push(supplier);
    });
    
    return result;
  }, [suppliers]);
  
  // Calculate total quantity for a specific date
  const getTotalQuantity = (date: Date): number => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dateSuppliers = suppliersByDate[dateKey] || [];
    return dateSuppliers.reduce((sum, supplier) => sum + supplier.quantity, 0);
  };
  
  // Get suppliers for a specific date
  const getSuppliersForDate = (date: Date): Supplier[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return suppliersByDate[dateKey] || [];
  };
  
  // Handle day click
  const handleDayClick = (date: Date) => {
    const suppliers = getSuppliersForDate(date);
    onDayClick(date, suppliers);
  };
  
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={prevMonth} aria-label="Mois précédent">
            <ChevronLeft size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth} aria-label="Mois suivant">
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div key={day} className="py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((day, i) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const daySuppliers = suppliersByDate[dateKey] || [];
          const hasDeliveries = daySuppliers.length > 0;
          const totalQuantity = getTotalQuantity(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          // Determine color based on quantity
          const getQuantityColorClass = () => {
            if (totalQuantity < 0) return 'text-red-500';
            if (totalQuantity > 0) return 'text-comagal-green';
            return 'text-gray-500 dark:text-gray-400';
          };
          
          return (
            <button
              key={i}
              onClick={() => handleDayClick(day)}
              className={`
                flex h-24 flex-col rounded-md border p-1 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700
                ${isCurrentMonth ? 'border-gray-200 dark:border-gray-700' : 'border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900'}
                ${hasDeliveries ? 'border-comagal-blue dark:border-comagal-light-blue' : ''}
              `}
            >
              <div className={`text-sm font-medium ${isCurrentMonth ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                {format(day, 'd')}
              </div>
              
              {hasDeliveries && (
                <div className="mt-1 flex flex-col space-y-1">
                  <div className={`text-xs font-semibold ${getQuantityColorClass()}`}>
                    {totalQuantity.toFixed(2)} cm
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {daySuppliers.length} livraison{daySuppliers.length > 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;