/**
 * Calculate standard deviation of an array of values
 * @param {Array<number>} values - Array of numeric values
 * @param {number} mean - Mean value (if already calculated)
 * @returns {number} Standard deviation
 */
export const calculateStdDev = (values, mean) => {
  if (!values || values.length === 0) return 0;
  
  const avg = mean !== undefined ? mean : values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  
  return Math.sqrt(variance);
};

/**
 * Format timestamp to readable date/time
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted date/time
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

/**
 * Format price value with currency symbol
 * @param {number} price - Price value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted price
 */
export const formatPrice = (price, decimals = 2) => {
  if (price === null || price === undefined) return 'N/A';
  
  return `$${parseFloat(price).toFixed(decimals)}`;
};

/**
 * Format percentage value
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return 'N/A';
  
  const sign = value >= 0 ? '+' : '';
  return `${sign}${parseFloat(value).toFixed(decimals)}%`;
};

/**
 * Calculate percentage change between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change
 */
export const calculatePercentChange = (current, previous) => {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
};
