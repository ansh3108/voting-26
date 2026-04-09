import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';

const Sidebar = ({ open = false, onClose }) => {
  const menuItems = [
    { name: '📊 Election Overview', path: '/admin-dashboard' },
    { name: '👥 Student Registry', path: '/students' },
    { name: '📁 Manage Posts', path: '/categories' },
    { name: '👤 Candidates', path: '/candidates' },
  ];

  return (
    <div className={`dv-admin-sidebar ${open ? '' : 'dv-admin-sidebar--closed'}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ padding: '0.5rem 0' }}>
          <div style={{ fontWeight: 800, letterSpacing: '0.08em' }}>VOTE HUB</div>
          <div style={{ color: '#93c5fd', fontSize: '0.85rem' }}>Admin panel</div>
        </div>
        <button
          type="button"
          className="dv-btn dv-btn--ghost"
          onClick={onClose}
          style={{ color: '#e2e8f0', padding: 8, borderRadius: 10 }}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav style={{ flex: 1, padding: '1rem 0' }}>
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            style={({ isActive }) => ({
              display: 'block',
              padding: '0.75rem 0.9rem',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: 600,
              borderRadius: 10,
              transition: 'all 0.2s ease',
              color: isActive ? '#ffffff' : '#cbd5e1',
              background: isActive ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
            })}
            onClick={() => onClose?.()}
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(248, 250, 252, 0.12)' }}>
        <button
          type="button"
          className="dv-btn dv-btn--danger"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;