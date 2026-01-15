export const getAssetUrl = (path: string | undefined | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Get base URL without /api
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const baseUrl = apiUrl.replace(/\/api\/?$/, ''); // Remove trailing /api or /api/
  
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
};
