import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { login } from '../services/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      switch (parsed.rol) {
        case 'Administrador':
          router.push('/admin');
          break;
        case 'Tecnico':
          router.push('/tecnico');
          break;
        case 'Usuario':
          router.push('/usuario');
          break;
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      const { jwt, user } = res;

      localStorage.setItem('token', jwt);
      localStorage.setItem('user', JSON.stringify(user));

      switch (user.rol) {
        case 'administrador':
          router.push('/admin');
          break;
        case 'tecnico':
          router.push('/tecnico');
          break;
        case 'usuario':
          router.push('/usuario');
          break;
        default:
          router.push('/');
      }
    } catch (err) {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleSubmit}>
        <h2>Iniciar sesión</h2>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>

      <style jsx>{`
        .login-container {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f1117;
        }

        .login-box {
          background: #1c1f26;
          padding: 3rem;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          max-width: 400px;
        }

        .login-box h2 {
          color: #fff;
          text-align: center;
          margin-bottom: 1rem;
        }

        .login-box input {
          padding: 0.75rem 1rem;
          border-radius: 6px;
          border: 1px solid #444;
          background: #2a2e39;
          color: #fff;
          font-size: 1rem;
        }

        .login-box input:focus {
          outline: none;
          border-color: #6366f1;
        }

        .login-box button {
          background: #6366f1;
          color: white;
          padding: 0.75rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.3s ease;
        }

        .login-box button:hover {
          background: #4f46e5;
        }
      `}</style>
    </div>
  );
}
