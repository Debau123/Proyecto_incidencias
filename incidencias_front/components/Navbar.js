import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const irAInicio = () => {
    if (!user?.rol) return;
    const rutaInicio = `/${user.rol.toLowerCase()}`;
    router.push(rutaInicio);
  };

  if (!user) return null;

  return (
    <nav style={{
      padding: '1rem',
      backgroundColor: '#222',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span>👤 {user.username} ({user.rol})</span>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={irAInicio}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Inicio
        </button>

        <button
          onClick={handleLogout}
          style={{
            background: 'red',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
