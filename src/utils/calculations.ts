/**
 * Rounds a number to specified decimal places
 * @param num - Number to round
 * @param decimals - Number of decimal places
 * @returns Rounded number
 */
const round = (num: number, decimals: number = 2): number => {
  return Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals);
};

/**
 * Calculates the number of barrels based on the quantity in cm
 * @param quantityCm - Quantity in cm
 * @returns Number of barrels
 */
export const calculateBarrels = (quantityCm: number): number => {
  return round(quantityCm / 0.75);
};

/**
 * Calculates the quantity in kg based on the number of barrels
 * @param barrels - Number of barrels
 * @param kgPerBarrel - Kg per barrel conversion factor (default: 185)
 * @returns Quantity in kg
 */
export const calculateKgQuantity = (barrels: number, kgPerBarrel: number = 185): number => {
  return round(barrels * kgPerBarrel);
};

/**
 * Calculates the quantity in cm based on kg
 * @param kg - Quantity in kg
 * @param kgPerBarrel - Kg per barrel conversion factor (default: 185)
 * @returns Quantity in cm
 */
export const calculateCmFromKg = (kg: number, kgPerBarrel: number = 185): number => {
  const barrels = round(kg / kgPerBarrel);
  return round(barrels * 0.75);
};

/**
 * Calculates the current stock level percentage
 * @param currentLevel - Current stock level in cm
 * @param maxLevel - Maximum stock level in cm (default: 193)
 * @returns Stock level percentage
 */
export const calculateStockPercentage = (currentLevel: number, maxLevel: number = 193): number => {
  const percentage = (currentLevel / maxLevel) * 100;
  return Math.min(Math.max(percentage, 0), 100); // Ensure between 0 and 100
};