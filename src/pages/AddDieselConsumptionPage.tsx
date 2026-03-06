import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { DieselProvider } from '../context/DieselContext';
import DieselConsumptionForm from '../components/diesel/DieselConsumptionForm';

const AddDieselConsumptionPageContent: React.FC = () => {
  const navigate = useNavigate();

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
