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

export function storeUserID(id: string): void
{
  try
  {
    localStorage.setItem('user_id', id);
  }
  catch(e)
  {
    console.log(e);
  }
}

export function retrieveUserID(): string
{
  try
  {
    return localStorage.getItem('user_id') ?? '';
  }
  catch(e)
  {
    console.log(e);
    return '';
  }
}