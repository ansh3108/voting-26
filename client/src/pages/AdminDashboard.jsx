import { Routes, Route, Link } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';

import DashboardHome from './DashboardHome';
import StudentRegistry from './StudentRegistry';
import CandidateManagement from './CandidateManagement';
import CategoryManagement from './CategoryManagement';

const AdminDashboard = ({ setUser }) => {
  return (
    <div className="dv-admin-shell">
      <div className="dv-admin-sidebar">
        <h3>Admin panel</h3>
        <ul className="dv-admin-nav">
          <li>
            <Link to="/admin">Live results</Link>
          </li>
          <li>
            <Link to="/admin/students">Manage students</Link>
          </li>
          <li>
            <Link to="/admin/candidates">Manage candidates</Link>
          </li>
          <li>
            <Link to="/admin/categories">Manage Categories</Link>
          </li>
        </ul>
        <div style={{ marginTop: '2rem' }}>
          <LogoutButton setUser={setUser} />
        </div>
      </div>

      <div className="dv-admin-main">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/students" element={<StudentRegistry />} />
          <Route path="/candidates" element={<CandidateManagement />} />
          <Route path="/categories" element={<CategoryManagement />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
