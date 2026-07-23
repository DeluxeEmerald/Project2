export function buildPath(route: string): string
{
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (envBaseUrl && envBaseUrl.trim().length > 0)
  {
    return `${envBaseUrl.replace(/\/$/, '')}/${route}`;
  }

  if (import.meta.env.DEV)
  {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:5000/${route}`;
  }

  return `${window.location.origin}:5000/${route}`;
}
