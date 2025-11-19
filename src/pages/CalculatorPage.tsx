import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { calculateBarrels, calculateKgQuantity, calculateCmFromKg } from '../utils/calculations';
import { Plus, Minus, X, Divide, ArrowDownUp } from 'lucide-react';

const CalculatorPage: React.FC = () => {
  // Conversion calculator state
  const [conversionMode, setConversionMode] = useState<'cm' | 'kg'>('cm');
  const [inputValue, setInputValue] = useState('');
  const [kgPerBarrel, setKgPerBarrel] = useState(185);
  const [convertedValues, setConvertedValues] = useState({
    cm: '',
    barrels: '',
    kg: ''
  });
  
  // Basic calculator state
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [operation, setOperation] = useState<'+' | '-' | '*' | '/'>('+');
  const [result, setResult] = useState<number | null>(null);
  
  const handleConversionInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(',', '.');
    setInputValue(value);
    
    if (!isNaN(parseFloat(value))) {
      const numValue = parseFloat(value);
      
      if (conversionMode === 'cm') {
        const barrels = calculateBarrels(numValue);
        const kg = calculateKgQuantity(barrels, kgPerBarrel);
        setConvertedValues({
          cm: value,
          barrels: barrels.toFixed(2),
          kg: kg.toFixed(2)
        });
      } else {
        const cm = calculateCmFromKg(numValue, kgPerBarrel);
        const barrels = calculateBarrels(cm);
        setConvertedValues({
          cm: cm.toFixed(2),
          barrels: barrels.toFixed(2),
          kg: value
        });
      }
    } else {
      setConvertedValues({
        cm: '',
        barrels: '',
        kg: ''
      });
    }
  };
  
  const toggleConversionMode = () => {
    setConversionMode(prev => prev === 'cm' ? 'kg' : 'cm');
    setInputValue('');
    setConvertedValues({
      cm: '',
      barrels: '',
      kg: ''
    });
  };
  
  const handleCalculate = () => {
    const number1 = parseFloat(num1.replace(',', '.'));
    const number2 = parseFloat(num2.replace(',', '.'));
    
    if (isNaN(number1) || isNaN(number2)) {
      setResult(null);
      return;
    }
    
    switch (operation) {
      case '+':
        setResult(number1 + number2);
        break;
      case '-':
        setResult(number1 - number2);
        break;
      case '*':
        setResult(number1 * number2);
        break;
      case '/':
        if (number2 === 0) {
          setResult(null);
        } else {
          setResult(number1 / number2);
        }
        break;
    }
  };
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calculatrice</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convertissez les mesures et effectuez des calculs
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Conversion des mesures">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {conversionMode === 'cm' ? 'Centimètres vers Barils/Kg' : 'Kilogrammes vers Cm/Barils'}
              </h3>
              <Button
                type="button"
                variant="outline"
                onClick={toggleConversionMode}
                className="flex items-center space-x-2"
              >
                <ArrowDownUp size={16} />
                <span>Inverser</span>
              </Button>
            </div>
            
            <Input
              label={conversionMode === 'cm' ? 'Quantité (cm)' : 'Quantité (kg)'}
              type="text"
              value={inputValue}
              onChange={handleConversionInput}
              placeholder={`Entrez une valeur en ${conversionMode === 'cm' ? 'cm' : 'kg'}`}
              fullWidth
            />
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Conversion kg par baril
              </label>
              <select
                value={kgPerBarrel}
                onChange={(e) => {
                  setKgPerBarrel(Number(e.target.value));
                  // Recalculate with new conversion factor
                  if (inputValue && !isNaN(parseFloat(inputValue))) {
                    const numValue = parseFloat(inputValue);
                    const newKgPerBarrel = Number(e.target.value);
                    
                    if (conversionMode === 'cm') {
                      const barrels = calculateBarrels(numValue);
                      const kg = calculateKgQuantity(barrels, newKgPerBarrel);
                      setConvertedValues({
                        cm: inputValue,
                        barrels: barrels.toFixed(2),
                        kg: kg.toFixed(2)
                      });
                    } else {
                      const cm = calculateCmFromKg(numValue, newKgPerBarrel);
                      const barrels = calculateBarrels(cm);
                      setConvertedValues({
                        cm: cm.toFixed(2),
                        barrels: barrels.toFixed(2),
                        kg: inputValue
                      });
                    }
                  }
                }}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value={182}>182 kg/baril</option>
                <option value={183}>183 kg/baril</option>
                <option value={184}>184 kg/baril</option>
                <option value={185}>185 kg/baril</option>
              </select>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Centimètres</p>
                <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                  <p className="text-gray-900 dark:text-white">{convertedValues.cm || '0.00'} cm</p>
                </div>
              </div>
              
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Barils</p>
                <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                  <p className="text-gray-900 dark:text-white">{convertedValues.barrels || '0.00'}</p>
                </div>
              </div>
              
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Kilogrammes</p>
                <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                  <p className="text-gray-900 dark:text-white">{convertedValues.kg || '0.00'} kg ({kgPerBarrel} kg/baril)</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="Calculatrice standard">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Premier nombre"
                type="text"
                value={num1}
                onChange={(e) => setNum1(e.target.value)}
                placeholder="0"
                fullWidth
              />
              
              <Input
                label="Deuxième nombre"
                type="text"
                value={num2}
                onChange={(e) => setNum2(e.target.value)}
                placeholder="0"
                fullWidth
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <Button
                type="button"
                variant={operation === '+' ? 'primary' : 'outline'}
                onClick={() => setOperation('+')}
                className="flex items-center justify-center"
              >
                <Plus size={20} />
              </Button>
              
              <Button
                type="button"
                variant={operation === '-' ? 'primary' : 'outline'}
                onClick={() => setOperation('-')}
                className="flex items-center justify-center"
              >
                <Minus size={20} />
              </Button>
              
              <Button
                type="button"
                variant={operation === '*' ? 'primary' : 'outline'}
                onClick={() => setOperation('*')}
                className="flex items-center justify-center"
              >
                <X size={20} />
              </Button>
              
              <Button
                type="button"
                variant={operation === '/' ? 'primary' : 'outline'}
                onClick={() => setOperation('/')}
                className="flex items-center justify-center"
              >
                <Divide size={20} />
              </Button>
            </div>
            
            <Button type="button" variant="primary" onClick={handleCalculate} fullWidth>
              Calculer
            </Button>
            
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Résultat</p>
              <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {result !== null ? result.toFixed(2) : '-'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default CalculatorPage;