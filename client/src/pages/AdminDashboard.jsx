import { Routes, Route, Link } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';

// THESE ARE THE MISSING IMPORTS:
import DashboardHome from './DashboardHome';
import StudentRegistry from './StudentRegistry';
import CandidateManagement from './CandidateManagement';

const AdminDashboard = ({ setUser }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px' }}>
        <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '10px' }}>Admin Panel</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ margin: '20px 0' }}>
            <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>📊 Live Results</Link>
          </li>
          <li style={{ margin: '20px 0' }}>
            <Link to="/admin/students" style={{ color: 'white', textDecoration: 'none' }}>👥 Manage Students</Link>
          </li>
          <li style={{ margin: '20px 0' }}>
            <Link to="/admin/candidates" style={{ color: 'white', textDecoration: 'none' }}>🏅 Manage Candidates</Link>
          </li>
        </ul>
        <div style={{ marginTop: '50px' }}>
          <LogoutButton setUser={setUser} />
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '40px', backgroundColor: '#f4f7f6' }}>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/students" element={<StudentRegistry />} />
          <Route path="/candidates" element={<CandidateManagement />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;