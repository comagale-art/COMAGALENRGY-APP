// Utility function to convert numbers to words in French
export function numberToWords(num: number): string {
  if (num === 0) return 'zéro DH';
  
  const ones = [
    '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
    'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept',
    'dix-huit', 'dix-neuf'
  ];
  
  const tens = [
    '', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante',
    'quatre-vingt', 'quatre-vingt'
  ];
  
  const scales = ['', 'mille', 'million', 'milliard'];
  
  function convertHundreds(n: number): string {
    let result = '';
    
    if (n >= 100) {
      const hundreds = Math.floor(n / 100);
      if (hundreds === 1) {
        result += 'cent';
      } else {
        result += ones[hundreds] + ' cent';
      }
      if (n % 100 !== 0) {
        result += 's';
      }
      n %= 100;
      if (n > 0) result += ' ';
    }
    
    if (n >= 20) {
      const tensDigit = Math.floor(n / 10);
      const onesDigit = n % 10;
      
      if (tensDigit === 7 || tensDigit === 9) {
        result += tens[tensDigit - 1];
        if (tensDigit === 7) {
          result += '-' + ones[10 + onesDigit];
        } else {
          result += '-' + ones[10 + onesDigit];
        }
      } else {
        result += tens[tensDigit];
        if (onesDigit === 1 && tensDigit === 8) {
          result += '-un';
        } else if (onesDigit > 0) {
          result += '-' + ones[onesDigit];
        }
      }
    } else if (n > 0) {
      result += ones[n];
    }
    
    return result;
  }
  
  function convertNumber(n: number): string {
    if (n === 0) return '';
    
    let result = '';
    let scaleIndex = 0;
    
    while (n > 0) {
      const chunk = n % 1000;
      if (chunk !== 0) {
        let chunkText = convertHundreds(chunk);
        
        if (scaleIndex > 0) {
          if (chunk === 1 && scaleIndex === 1) {
            chunkText = 'mille';
          } else {
            chunkText += ' ' + scales[scaleIndex];
            if (chunk > 1 && scaleIndex > 1) {
              chunkText += 's';
            }
          }
        }
        
        result = chunkText + (result ? ' ' + result : '');
      }
      
      n = Math.floor(n / 1000);
      scaleIndex++;
    }
    
    return result;
  }
  
  // Split into integer and decimal parts
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  let result = convertNumber(integerPart);
  
  if (integerPart === 0) {
    result = 'zéro';
  }
  
  result += integerPart <= 1 ? ' dirham' : ' DH';
  
  if (decimalPart > 0) {
    result += ' et ' + convertNumber(decimalPart);
    result += decimalPart <= 1 ? ' centime' : ' centimes';
  }
  
  return result.charAt(0).toUpperCase() + result.slice(1);
}