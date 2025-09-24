const stripTrailingSlash = (value: string) => value.replace(/\/$/, '');

export const API_BASE_URL = stripTrailingSlash(process.env.NEXT_PUBLIC_API_URL || '/api/proxy');

export const buildApiUrl = (path = ''): string => {
  const cleanPath = path.replace(/^\/+/, '');
  return cleanPath ? `${API_BASE_URL}/${cleanPath}` : API_BASE_URL;
};
