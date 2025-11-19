import React from 'react';
import { useOrders } from '../context/OrderContext';
import Layout from '../components/layout/Layout';
import OrderList from '../components/orders/OrderList';
import FloatingActionButton from '../components/layout/FloatingActionButton';
import Card from '../components/ui/Card';
import { AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const OrdersPage: React.FC = () => {
  const { orders, deleteOrder, loading, error, refreshOrders } = useOrders();

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      try {
        await deleteOrder(id);
      } catch (err) {
        console.error('Error deleting order:', err);
      }
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Liste des Commandes</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos commandes clients
          </p>
        </div>
        
        <Button 
          variant="primary" 
          onClick={refreshOrders}
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
        <OrderList orders={orders} onDelete={handleDelete} />
      )}
      
      <FloatingActionButton 
        to="/orders/new" 
        label="Ajouter une commande"
      />
    </Layout>
  );
};

export default OrdersPage;