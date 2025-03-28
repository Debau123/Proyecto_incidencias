// components/Navbar.js
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

  if (!user) return null;

  return (
    <nav style={{ padding: '1rem', backgroundColor: '#222', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
      <div>👤 {user.username} ({user.rol})</div>
      <button onClick={handleLogout} style={{ background: 'red', color: 'white', border: 'none', padding: '0.5rem 1rem' }}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
