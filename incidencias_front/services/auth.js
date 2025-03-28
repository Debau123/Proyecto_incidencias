export const login = async (email, password) => {
    const res = await fetch('http://localhost:1339/api/auth/local', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: email,
        password,
      }),
    });
  
    if (!res.ok) {
      throw new Error('Login fallido');
    }
  
    const data = await res.json();
    return data;
  };
  