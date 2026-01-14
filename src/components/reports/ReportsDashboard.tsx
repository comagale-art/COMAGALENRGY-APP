import React from 'react';
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

const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ orders, bigSuppliers, suppliers }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const calculateKPIs = (): KPI[] => {
    const currentYearOrders = orders.filter(o => new Date(o.date).getFullYear() === currentYear);
    const lastYearOrders = orders.filter(o => new Date(o.date).getFullYear() === currentYear - 1);

    const currentMonthOrders = orders.filter(o => {
      const date = new Date(o.date);
      return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
    });

    const lastMonthOrders = orders.filter(o => {
      const date = new Date(o.date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const yearForLastMonth = currentMonth === 0 ? currentYear - 1 : currentYear;
      return date.getFullYear() === yearForLastMonth && date.getMonth() === lastMonth;
    });

    const totalRevenue = currentYearOrders.reduce((sum, o) => sum + (o.totalPriceInclTax || 0), 0);
    const lastYearRevenue = lastYearOrders.reduce((sum, o) => sum + (o.totalPriceInclTax || 0), 0);
    const revenueChange = lastYearRevenue > 0
      ? ((totalRevenue - lastYearRevenue) / lastYearRevenue * 100).toFixed(1)
      : '0';

    const totalQuantity = currentYearOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
    const lastYearQuantity = lastYearOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
    const quantityChange = lastYearQuantity > 0
      ? ((totalQuantity - lastYearQuantity) / lastYearQuantity * 100).toFixed(1)
      : '0';

    const currentMonthRevenue = currentMonthOrders.reduce((sum, o) => sum + (o.totalPriceInclTax || 0), 0);
    const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + (o.totalPriceInclTax || 0), 0);
    const monthlyRevenueChange = lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : '0';

    const bigSupplierSpending = bigSuppliers
      .filter(bs => new Date(bs.date).getFullYear() === currentYear)
      .reduce((sum, bs) => sum + (bs.totalPrice || 0), 0);

    return [
      {
        label: 'Revenu Total Annuel',
        value: `${totalRevenue.toFixed(2)} DH`,
        change: `${revenueChange}% vs année précédente`,
        isPositive: parseFloat(revenueChange) >= 0,
        icon: <DollarSign size={24} />
      },
      {
        label: 'Quantité Vendue Annuelle',
        value: `${totalQuantity.toFixed(2)} kg`,
        change: `${quantityChange}% vs année précédente`,
        isPositive: parseFloat(quantityChange) >= 0,
        icon: <Package size={24} />
      },
      {
        label: 'Commandes ce Mois',
        value: currentMonthOrders.length.toString(),
        change: `${monthlyRevenueChange}% revenu vs mois dernier`,
        isPositive: parseFloat(monthlyRevenueChange) >= 0,
        icon: <ShoppingCart size={24} />
      },
      {
        label: 'Dépenses Grands Fournisseurs',
        value: `${bigSupplierSpending.toFixed(2)} DH`,
        change: `${bigSuppliers.filter(bs => new Date(bs.date).getFullYear() === currentYear).length} achats`,
        isPositive: true,
        icon: <Users size={24} />
      }
    ];
  };

  const kpis = calculateKPIs();

  return (
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
  );
};

export default ReportsDashboard;
