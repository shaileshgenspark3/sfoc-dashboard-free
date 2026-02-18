export const getAssetUrl = (path: string | undefined | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // In production, use the same origin for uploads (backend serves both frontend and uploads)
  // In development with proxy, relative path works via Vite proxy
  // If VITE_API_URL is set (e.g., different backend host), use it
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}${cleanPath}`;
  }

  // Default: use relative path (works when backend serves frontend)
  return cleanPath;
};
