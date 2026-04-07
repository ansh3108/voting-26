import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { name: '📊 Election Overview', path: '/admin-dashboard' },
    { name: '👥 Student Registry', path: '/students' },
    { name: '📁 Manage Posts', path: '/categories' },
    { name: '👤 Candidates', path: '/candidates' },
  ];

  return (
    <div style={sidebarStyle}>
      <div style={logoSectionStyle}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '1px' }}>VOTE HUB</h2>
        <small style={{ color: '#3498db' }}>Admin Panel</small>
      </div>
      <nav style={{ flex: 1, padding: '20px 0' }}>
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            style={({ isActive }) => ({
              ...linkStyle,
              borderLeft: isActive ? '4px solid #3498db' : '4px solid transparent',
              backgroundColor: isActive ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
              color: isActive ? '#3498db' : '#ecf0f1'
            })}
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '20px', borderTop: '1px solid #3e4f5f' }}>
        <button 
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }} 
          style={logoutButtonStyle}
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
};

const sidebarStyle = {
  width: '260px',
  height: '100vh',
  backgroundColor: '#1a252f',
  position: 'fixed',
  left: 0,
  top: 0,
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
  zIndex: 100
};

const logoSectionStyle = {
  padding: '30px 20px',
  textAlign: 'center',
  borderBottom: '1px solid #3e4f5f',
  color: 'white'
};

const linkStyle = {
  display: 'block',
  padding: '15px 25px',
  textDecoration: 'none',
  fontSize: '1rem',
  transition: '0.2s all ease',
  fontWeight: '500'
};

const logoutButtonStyle = {
  width: '100%',
  padding: '10px',
  backgroundColor: 'transparent',
  color: '#e74c3c',
  border: '1px solid #e74c3c',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default Sidebar;