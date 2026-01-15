import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Package, Users, ShoppingCart, DollarSign } from 'lucide-react';
import Card from '../ui/Card';

interface KPI {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

interface ReportsDashboardProps {
  orders: any[];
  bigSuppliers: any[];
  suppliers: any[];
}

type PeriodFilter = 'month' | '3months' | '6months' | 'year' | 'byYear';

const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ orders, bigSuppliers, suppliers }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('year');
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const availableYears = useMemo(() => {
    const years = new Set(orders.map(o => new Date(o.date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [orders]);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (periodFilter) {
      case 'month':
        startDate = new Date(currentYear, currentMonth, 1);
        endDate = new Date(currentYear, currentMonth + 1, 0);
        break;
      case '3months':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6months':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case 'year':
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31);
        break;
      case 'byYear':
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31);
        break;
    }

    return { startDate, endDate };
  };

  const calculateKPIs = (): KPI[] => {
    const { startDate, endDate } = getDateRange();

    const currentPeriodOrders = orders.filter(o => {
      const date = new Date(o.date);
      return date >= startDate && date <= endDate;
    });

    const periodDuration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const lastPeriodStart = new Date(startDate.getTime() - periodDuration * 1000 * 60 * 60 * 24);
    const lastPeriodEnd = new Date(startDate.getTime() - 1);

    const lastPeriodOrders = orders.filter(o => {
      const date = new Date(o.date);
      return date >= lastPeriodStart && date <= lastPeriodEnd;
    });

    const totalRevenue = currentPeriodOrders.reduce((sum, o) => sum + (o.totalPriceInclTax || 0), 0);
    const lastPeriodRevenue = lastPeriodOrders.reduce((sum, o) => sum + (o.totalPriceInclTax || 0), 0);
    const revenueChange = lastPeriodRevenue > 0
      ? ((totalRevenue - lastPeriodRevenue) / lastPeriodRevenue * 100).toFixed(1)
      : '0';

    const totalQuantity = currentPeriodOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
    const lastPeriodQuantity = lastPeriodOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
    const quantityChange = lastPeriodQuantity > 0
      ? ((totalQuantity - lastPeriodQuantity) / lastPeriodQuantity * 100).toFixed(1)
      : '0';

    const bigSupplierSpending = bigSuppliers
      .filter(bs => {
        const date = new Date(bs.date);
        return date >= startDate && date <= endDate;
      })
      .reduce((sum, bs) => sum + (bs.totalPrice || 0), 0);

    const getPeriodLabel = () => {
      switch (periodFilter) {
        case 'month': return 'ce Mois';
        case '3months': return '3 Derniers Mois';
        case '6months': return '6 Derniers Mois';
        case 'year': return 'cette Année';
        case 'byYear': return `en ${selectedYear}`;
        default: return '';
      }
    };

    return [
      {
        label: `Revenu Total ${getPeriodLabel()}`,
        value: `${totalRevenue.toFixed(2)} DH`,
        change: `${revenueChange}% vs période précédente`,
        isPositive: parseFloat(revenueChange) >= 0,
        icon: <DollarSign size={24} />
      },
      {
        label: `Quantité Vendue ${getPeriodLabel()}`,
        value: `${totalQuantity.toFixed(2)} kg`,
        change: `${quantityChange}% vs période précédente`,
        isPositive: parseFloat(quantityChange) >= 0,
        icon: <Package size={24} />
      },
      {
        label: `Commandes ${getPeriodLabel()}`,
        value: currentPeriodOrders.length.toString(),
        change: `${totalRevenue.toFixed(2)} DH de revenu`,
        isPositive: true,
        icon: <ShoppingCart size={24} />
      },
      {
        label: `Dépenses Grands Fournisseurs`,
        value: `${bigSupplierSpending.toFixed(2)} DH`,
        change: `${bigSuppliers.filter(bs => {
          const date = new Date(bs.date);
          return date >= startDate && date <= endDate;
        }).length} achats ${getPeriodLabel()}`,
        isPositive: true,
        icon: <Users size={24} />
      }
    ];
  };

  const kpis = calculateKPIs();

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPeriodFilter('month')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            periodFilter === 'month'
              ? 'bg-comagal-blue text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Ce Mois
        </button>
        <button
          onClick={() => setPeriodFilter('3months')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            periodFilter === '3months'
              ? 'bg-comagal-blue text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          3 Derniers Mois
        </button>
        <button
          onClick={() => setPeriodFilter('6months')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            periodFilter === '6months'
              ? 'bg-comagal-blue text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          6 Derniers Mois
        </button>
        <button
          onClick={() => setPeriodFilter('year')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            periodFilter === 'year'
              ? 'bg-comagal-blue text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Cette Année
        </button>
        <button
          onClick={() => setPeriodFilter('byYear')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            periodFilter === 'byYear'
              ? 'bg-comagal-blue text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Par Année
        </button>

        {periodFilter === 'byYear' && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-comagal-blue focus:outline-none focus:ring-2 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {kpi.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {kpi.value}
              </p>
              <div className="mt-2 flex items-center text-sm">
                {kpi.isPositive ? (
                  <TrendingUp size={16} className="mr-1 text-green-500" />
                ) : (
                  <TrendingDown size={16} className="mr-1 text-red-500" />
                )}
                <span className={kpi.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {kpi.change}
                </span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-comagal-blue/10 text-comagal-blue dark:bg-comagal-light-blue/10 dark:text-comagal-light-blue">
              {kpi.icon}
            </div>
          </div>
        </Card>
      ))}
      </div>
    </div>
  );
};

export default ReportsDashboard;
