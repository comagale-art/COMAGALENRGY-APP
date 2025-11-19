import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Volume2, Volume2 as Volume2Off } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Supplier } from '../../types';

interface LastDeliveryCardProps {
  supplier: Supplier | null;
}

const LastDeliveryCard: React.FC<LastDeliveryCardProps> = ({ supplier }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  if (!supplier) {
    return (
      <Card title="Dernière Livraison">
        <p className="text-gray-500 dark:text-gray-400">Aucune livraison enregistrée</p>
      </Card>
    );
  }
  
  const formattedDate = format(parseISO(supplier.deliveryDate), 'dd MMMM yyyy', { locale: fr });
  
  const speakSupplierName = () => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const text = `Fournisseur: ${supplier.name}`;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };
  
  return (
    <Card title="Dernière Livraison">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fournisseur</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{supplier.name}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={isSpeaking ? stopSpeaking : speakSupplierName}
            className="flex items-center space-x-2"
            aria-label={isSpeaking ? "Arrêter la lecture" : "Lire le nom du fournisseur"}
          >
            {isSpeaking ? <Volume2Off size={18} /> : <Volume2 size={18} />}
          </Button>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Date de livraison</p>
          <p className="text-base text-gray-800 dark:text-white">{formattedDate}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{supplier.deliveryTime}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Quantité</p>
            <p className={`text-xl font-medium ${supplier.quantity < 0 ? 'text-red-500' : 'text-comagal-green dark:text-comagal-light-green'}`}>
              {supplier.quantity.toFixed(2)} cm
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Barils</p>
            <p className="text-base font-medium text-gray-800 dark:text-white">
              {supplier.barrels.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Poids</p>
          <p className="text-base font-medium text-gray-800 dark:text-white">
            {supplier.kgQuantity.toFixed(2)} kg
          </p>
        </div>
      </div>
    </Card>
  );
};

export default LastDeliveryCard;