import dayjs from 'dayjs';

/**
 * Formats a value as currency with US dollar sign and exactly two decimal places
 * @param value - The numeric value to format
 * @param currency - The currency code (default: 'USD')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number,
  currency: string = 'USD',
): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    // Fallback for unsupported currency codes
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
};

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return 'Not provided';
  const parsedDate = dayjs(value);
  return parsedDate.isValid()
    ? parsedDate.format('MM/DD/YYYY')
    : 'Not provided';
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return 'Unknown';
  return value.charAt(0).toUpperCase() + value.slice(1);
};
