import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface ClientFormProps {
  onSubmit: (data: any) => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    city: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du client est requis';
    }

    if (!formData.logo.trim()) {
      newErrors.logo = 'Le logo est requis';
    } else if (!isValidUrl(formData.logo)) {
      newErrors.logo = 'L\'URL du logo n\'est pas valide';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ville est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nom du client"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        fullWidth
        required
      />

      <Input
        label="Logo (URL)"
        name="logo"
        type="url"
        value={formData.logo}
        onChange={handleChange}
        error={errors.logo}
        placeholder="https://example.com/logo.png"
        fullWidth
        required
      />

      <Input
        label="Ville"
        name="city"
        value={formData.city}
        onChange={handleChange}
        error={errors.city}
        fullWidth
        required
      />

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => navigate('/clients')}>
          Annuler
        </Button>
        <Button type="submit" variant="primary">
          Ajouter le client
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;