import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BellRing, CalendarClock } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getChequeReminders, getEntrepriseId } from '../../firebase/services/chequeReminders';
import { ChequeReminder } from '../../types';
import { calculateChequeStats, formatMad, getAlertMessage, sortChequeAlerts } from '../../utils/chequeReminders';

const ChequeRemindersWidget: React.FC = () => {
  const { user } = useAuth();
  const [cheques, setCheques] = useState<ChequeReminder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getChequeReminders(getEntrepriseId(user));
        setCheques(data);
      } catch (error) {
        console.error('Error loading cheque reminders widget:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const stats = useMemo(() => calculateChequeStats(cheques), [cheques]);
  const alerts = useMemo(() => sortChequeAlerts(cheques).slice(0, 3), [cheques]);

  if (user?.role !== 'admin') return null;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <BellRing className="mr-2 h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rappels chèques urgents</h3>
        </div>
        <Link to="/cheque-reminders">
          <Button size="sm" variant="outline">Voir tous les rappels</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">Chargement des rappels...</p>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-red-50 p-3 text-red-700 dark:bg-red-900/30 dark:text-red-300">
              <div className="flex items-center text-sm"><AlertTriangle className="mr-2 h-4 w-4" />En retard</div>
              <div className="mt-1 text-2xl font-bold">{stats.enRetard}</div>
            </div>
            <div className="rounded-md bg-orange-50 p-3 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
              <div className="flex items-center text-sm"><CalendarClock className="mr-2 h-4 w-4" />Aujourd'hui</div>
              <div className="mt-1 text-2xl font-bold">{stats.echeanceAujourdhui}</div>
            </div>
          </div>

          {alerts.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Aucune alerte urgente.</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((cheque) => (
                <div key={cheque.id} className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{getAlertMessage(cheque)}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatMad(cheque.montant)}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default ChequeRemindersWidget;
