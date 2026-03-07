import React from 'react';
import { Calendar } from 'lucide-react';

export type PeriodType = 'current_month' | 'last_month' | 'last_6_months' | 'current_year' | 'custom';

interface PeriodFilterProps {
  selectedPeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  customStartDate?: string;
  customEndDate?: string;
  onCustomDateChange?: (startDate: string, endDate: string) => void;
}

const PeriodFilter: React.FC<PeriodFilterProps> = ({
  selectedPeriod,
  onPeriodChange,
  customStartDate,
  customEndDate,
  onCustomDateChange
}) => {
  const periods = [
    { value: 'current_month', label: 'Ce mois' },
    { value: 'last_month', label: 'Mois dernier' },
    { value: 'last_6_months', label: '6 derniers mois' },
    { value: 'current_year', label: 'Cette année' },
    { value: 'custom', label: 'Personnalisé' }
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {periods.map(period => (
          <button
            key={period.value}
            onClick={() => onPeriodChange(period.value as PeriodType)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === period.value
                ? 'bg-comagal-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {selectedPeriod === 'custom' && onCustomDateChange && (
        <div className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Du:
            </label>
            <input
              type="date"
              value={customStartDate || ''}
              onChange={(e) => onCustomDateChange(e.target.value, customEndDate || '')}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Au:
            </label>
            <input
              type="date"
              value={customEndDate || ''}
              onChange={(e) => onCustomDateChange(customStartDate || '', e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodFilter;
