export interface StrapiLoginResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    confirmed: boolean;
    blocked: boolean;
    rol: 'usuario' | 'tecnico' | 'administrador'; // Enum personalizado
  };
}

export const loginUser = async (
  email: string,
  password: string
): Promise<StrapiLoginResponse> => {
  try {
    const response = await fetch('http://192.168.0.15:1339/api/auth/local', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || 'Login fallido';
      throw new Error(message);
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Error de red');
  }
};
