import React, { useMemo } from 'react';
import { useDiesel } from '../../context/DieselContext';
import { Fuel, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import Card from '../ui/Card';

const DieselDashboard: React.FC = () => {
  const { consumptions, getSummary } = useDiesel();

  const currentMonth = useMemo(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    return getSummary(startOfMonth, endOfMonth);
  }, [consumptions, getSummary]);

  const lastMonth = useMemo(() => {
    const today = new Date();
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
    return getSummary(startOfLastMonth, endOfLastMonth);
  }, [consumptions, getSummary]);

  const currentYear = useMemo(() => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
    const endOfYear = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
    return getSummary(startOfYear, endOfYear);
  }, [consumptions, getSummary]);

  const percentageChange = useMemo(() => {
    if (lastMonth.totalAmount === 0) return null;
    const change = ((currentMonth.totalAmount - lastMonth.totalAmount) / lastMonth.totalAmount) * 100;
    return change;
  }, [currentMonth, lastMonth]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-2">Ce mois</p>
            <div className="space-y-2">
              <div>
                <p className="text-3xl font-bold">{currentMonth.totalAmount.toFixed(2)} DH</p>
                <p className="text-blue-100 text-sm">Total dépensé</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{currentMonth.totalLiters.toFixed(2)} L</p>
                <p className="text-blue-100 text-sm">Total litres</p>
              </div>
            </div>
            {percentageChange !== null && (
              <div className={`mt-3 flex items-center gap-1 text-sm ${percentageChange >= 0 ? 'text-red-200' : 'text-green-200'}`}>
                <TrendingUp className={`w-4 h-4 ${percentageChange < 0 ? 'rotate-180' : ''}`} />
                <span>{Math.abs(percentageChange).toFixed(1)}% vs mois dernier</span>
              </div>
            )}
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium mb-2">Mois dernier</p>
            <div className="space-y-2">
              <div>
                <p className="text-3xl font-bold">{lastMonth.totalAmount.toFixed(2)} DH</p>
                <p className="text-purple-100 text-sm">Total dépensé</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{lastMonth.totalLiters.toFixed(2)} L</p>
                <p className="text-purple-100 text-sm">Total litres</p>
              </div>
            </div>
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white md:col-span-2 lg:col-span-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium mb-2">Cette année</p>
            <div className="space-y-2">
              <div>
                <p className="text-3xl font-bold">{currentYear.totalAmount.toFixed(2)} DH</p>
                <p className="text-green-100 text-sm">Total dépensé</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{currentYear.totalLiters.toFixed(2)} L</p>
                <p className="text-green-100 text-sm">Total litres</p>
              </div>
            </div>
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <Fuel className="w-6 h-6" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DieselDashboard;
