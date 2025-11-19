import React, { useState } from 'react';
import { useSuppliers } from '../context/SupplierContext';
import Layout from '../components/layout/Layout';
import CalendarView from '../components/calendar/CalendarView';
import DayDetailsModal from '../components/calendar/DayDetailsModal';
import { Supplier } from '../types';
import FloatingActionButton from '../components/layout/FloatingActionButton';
import Card from '../components/ui/Card';
import { AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const CalendarPage: React.FC = () => {
  const { suppliers, loading, error, refreshSuppliers } = useSuppliers();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState<Supplier[]>([]);
  
  const handleDayClick = (date: Date, suppliers: Supplier[]) => {
    setSelectedDate(date);
    setSelectedSuppliers(suppliers);
  };
  
  const handleCloseModal = () => {
    setSelectedDate(null);
  };
  
  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendrier des livraisons</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualisez les livraisons par date
          </p>
        </div>
        
        <Button 
          variant="primary" 
          onClick={refreshSuppliers}
          disabled={loading}
        >
          {loading ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </div>
      
      {error && (
        <Card className="mb-6 border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/30">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <AlertCircle className="mr-2" size={20} />
            <p>{error}</p>
          </div>
        </Card>
      )}
      
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-comagal-blue border-t-transparent"></div>
        </div>
      ) : (
        <CalendarView suppliers={suppliers} onDayClick={handleDayClick} />
      )}
      
      {selectedDate && (
        <DayDetailsModal
          date={selectedDate}
          suppliers={selectedSuppliers}
          onClose={handleCloseModal}
        />
      )}
      
      <FloatingActionButton to="/suppliers/new" label="Ajouter un fournisseur" />
    </Layout>
  );
};

export default CalendarPage;