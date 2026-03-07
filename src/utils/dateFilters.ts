import { PeriodType } from '../components/ui/PeriodFilter';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export const getDateRangeFromPeriod = (
  period: PeriodType,
  customStartDate?: string,
  customEndDate?: string
): DateRange => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  switch (period) {
    case 'current_month': {
      const startDate = new Date(currentYear, currentMonth, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
      return { startDate, endDate };
    }

    case 'last_month': {
      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
      return { startDate, endDate };
    }

    case 'last_6_months': {
      const startDate = new Date(currentYear, currentMonth - 5, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
      return { startDate, endDate };
    }

    case 'current_year': {
      const startDate = new Date(currentYear, 0, 1);
      const endDate = new Date(currentYear, 11, 31, 23, 59, 59);
      return { startDate, endDate };
    }

    case 'custom': {
      const startDate = customStartDate ? new Date(customStartDate) : new Date(currentYear, 0, 1);
      const endDate = customEndDate ? new Date(customEndDate + 'T23:59:59') : now;
      return { startDate, endDate };
    }

    default:
      return { startDate: new Date(currentYear, 0, 1), endDate: now };
  }
};

export const filterByDateRange = <T extends { date: string }>(
  items: T[],
  dateRange: DateRange
): T[] => {
  return items.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
  });
};
