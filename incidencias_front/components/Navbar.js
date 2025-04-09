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

  const irA = (ruta) => {
    if (router.pathname !== ruta) {
      router.push(ruta);
    }
  };

  const irAInicio = () => {
    if (!user?.rol) return;
    const rutaInicio = `/${user.rol.toLowerCase()}`;
    irA(rutaInicio);
  };

  if (!user) return null;

  return (
    <nav style={{
      padding: '1rem',
      backgroundColor: '#222',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      <span>👤 {user.username} ({user.rol})</span>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={irAInicio} style={botonEstilo('#3b82f6')}>
          Inicio
        </button>

        {user.rol === 'tecnico' && (
          <>
            <button onClick={() => irA('/tecnico/dispositivos')} style={botonEstilo('#10b981')}>
              Dispositivos
            </button>
            <button onClick={() => irA('/tecnico/incidencias')} style={botonEstilo('#f59e0b')}>
              Incidencias
            </button>
          </>
        )}

        {user.rol === 'administrador' && (
          <>
            <button onClick={() => irA('/admin/usuarios')} style={botonEstilo('#6366f1')}>
              👥 Usuarios
            </button>
            <button onClick={() => irA('/admin/dispositivos')} style={botonEstilo('#0ea5e9')}>
              💻 Dispositivos
            </button>
            
            <button onClick={() => irA('/admin/incidencias')} style={botonEstilo('#f97316')}>
              ⚠️ Incidencias
            </button>
           
          </>
        )}

        <button onClick={handleLogout} style={botonEstilo('red')}>
          Logout
        </button>
      </div>
    </nav>
  );
};

const botonEstilo = (bg) => ({
  background: bg,
  color: 'white',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  cursor: 'pointer'
});

export default Navbar;
