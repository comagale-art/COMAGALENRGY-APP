import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order } from '../types';
import { getOrders } from '../firebase/services';

interface ClientSuggestion {
  name: string;
  addresses: string[];
}

interface ClientSuggestionsContextType {
  clientSuggestions: ClientSuggestion[];
  loading: boolean;
  error: string | null;
  refreshSuggestions: () => Promise<void>;
}

const ClientSuggestionsContext = createContext<ClientSuggestionsContextType | undefined>(undefined);

export const ClientSuggestionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientSuggestions, setClientSuggestions] = useState<ClientSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const orders = await getOrders();
      
      // Group orders by client name and collect unique addresses
      const suggestionMap = orders.reduce((acc, order) => {
        if (!acc[order.clientName]) {
          acc[order.clientName] = {
            name: order.clientName,
            addresses: new Set<string>()
          };
        }
        
        if (order.deliveryAddress) {
          acc[order.clientName].addresses.add(order.deliveryAddress);
        }
        
        return acc;
      }, {} as Record<string, { name: string; addresses: Set<string> }>);
      
      // Convert to array and transform Sets to arrays
      const suggestions = Object.values(suggestionMap).map(suggestion => ({
        name: suggestion.name,
        addresses: Array.from(suggestion.addresses)
      }));
      
      setClientSuggestions(suggestions);
    } catch (err) {
      console.error('Error loading suggestions:', err);
      setError('Erreur lors du chargement des suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const refreshSuggestions = async () => {
    await loadSuggestions();
  };

  return (
    <ClientSuggestionsContext.Provider value={{
      clientSuggestions,
      loading,
      error,
      refreshSuggestions
    }}>
      {children}
    </ClientSuggestionsContext.Provider>
  );
};

export const useClientSuggestions = (): ClientSuggestionsContextType => {
  const context = useContext(ClientSuggestionsContext);
  if (context === undefined) {
    throw new Error('useClientSuggestions must be used within a ClientSuggestionsProvider');
  }
  return context;
};