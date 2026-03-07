import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import DieselConsumptionForm from '../components/diesel/DieselConsumptionForm';

const AddDieselConsumptionPage: React.FC = () => {
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

export default AddDieselConsumptionPage;
