/**
 * Generate unique uppercase alphanumeric codes
 * @param length Length of the code (default 6)
 * @returns Generated code string
 */
export const generateCode = (length: number = 6): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Check if code is valid format (6 alphanumeric characters)
 * @param code Code to validate
 * @returns boolean indicating if format is valid
 */
export const isValidCode = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/i.test(code);
};
