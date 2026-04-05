import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user'); // Wipe the token and user data
    setUser(null);                   // Reset the app state
    navigate('/login');              // Back to the start
  };

  return (
    <button onClick={handleLogout} style={{ backgroundColor: '#ff4d4d', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
      Logout
    </button>
  );
};

export default LogoutButton;