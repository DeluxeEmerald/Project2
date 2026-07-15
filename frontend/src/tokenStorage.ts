export function storeToken(token: string): void
{
  try
  {
    localStorage.setItem('token_data', token);
  }
  catch(e)
  {
    console.log(e);
  }
}

export function retrieveToken(): string
{
  try
  {
    return localStorage.getItem('token_data') ?? '';
  }
  catch(e)
  {
    console.log(e);
    return '';
  }
}

export function clearToken(): void
{
  try
  {
    localStorage.removeItem('token_data');
  }
  catch(e)
  {
    console.log(e);
  }
}