import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { DieselProvider } from '../context/DieselContext';
import { useAuth } from '../context/AuthContext';
import DieselConsumptionForm from '../components/diesel/DieselConsumptionForm';

const AddDieselConsumptionPageContent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleSuccess = () => {
    navigate('/diesel');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <DieselConsumptionForm onSuccess={handleSuccess} />
      </div>
    </Layout>
  );
};

const AddDieselConsumptionPage: React.FC = () => {
  return (
    <DieselProvider>
      <AddDieselConsumptionPageContent />
    </DieselProvider>
  );
};

export default AddDieselConsumptionPage;
