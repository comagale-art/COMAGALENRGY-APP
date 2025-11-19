import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { ChangeCredentialsData } from '../../types';

const ChangeCredentialsForm: React.FC = () => {
  const [formData, setFormData] = useState<ChangeCredentialsData>({
    newUsername: '',
    newPassword: '',
    securityKey: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { changeCredentials, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
      
      // Clear error when field is edited
      if (errors.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error when field is edited
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.securityKey) {
      newErrors.securityKey = 'La clé de sécurité est requise';
    }
    
    if (!formData.newUsername && !formData.newPassword) {
      newErrors.general = 'Veuillez remplir au moins un champ à modifier';
    }
    
    if (formData.newPassword && formData.newPassword.length < 6) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (formData.newPassword && formData.newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      const result = await changeCredentials(formData);
      
      if (result.success) {
        setMessage({ text: result.message, type: 'success' });
        
        // Reset form
        setFormData({
          newUsername: '',
          newPassword: '',
          securityKey: '',
        });
        setConfirmPassword('');
        
        // Logout after 3 seconds
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 3000);
      } else {
        setMessage({ text: result.message, type: 'error' });
      }
    } catch (error) {
      setMessage({ 
        text: 'Une erreur est survenue. Veuillez réessayer.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message.text && (
        <div className={`rounded-md p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}
      
      {errors.general && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {errors.general}
        </div>
      )}
      
      <Input
        label="Nouvel identifiant (optionnel)"
        type="text"
        name="newUsername"
        value={formData.newUsername}
        onChange={handleChange}
        error={errors.newUsername}
        placeholder="Nouvel identifiant"
        fullWidth
      />
      
      <Input
        label="Nouveau mot de passe (optionnel)"
        type="password"
        name="newPassword"
        value={formData.newPassword}
        onChange={handleChange}
        error={errors.newPassword}
        placeholder="Minimum 6 caractères"
        fullWidth
      />
      
      <Input
        label="Confirmer le nouveau mot de passe"
        type="password"
        name="confirmPassword"
        value={confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        placeholder="Répétez le mot de passe"
        fullWidth
        disabled={!formData.newPassword}
      />
      
      <Input
        label="Clé de sécurité"
        type="password"
        name="securityKey"
        value={formData.securityKey}
        onChange={handleChange}
        error={errors.securityKey}
        placeholder="Entrez la clé de sécurité"
        fullWidth
        required
      />
      
      <div className="pt-2">
        <Button 
          type="submit" 
          variant="primary" 
          fullWidth 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Traitement en cours...' : 'Mettre à jour les identifiants'}
        </Button>
      </div>
    </form>
  );
};

export default ChangeCredentialsForm;