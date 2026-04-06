import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <button type="button" className="dv-btn dv-btn--danger" onClick={handleLogout}>
      Logout
    </button>
  );
};

export default LogoutButton;
