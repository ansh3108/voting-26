import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORT COMPONENTS ---
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentRegistry from './pages/StudentRegistry';
import CategoryManagement from './pages/CategoryManagement';
import CandidateManagement from './pages/CandidateManagement';
import VoterDashboard from './pages/VoterDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. CHECK FOR LOGGED-IN USER ON STARTUP
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedData = JSON.parse(savedUser);
      setUser(parsedData.user);
    }
    setLoading(false);
  }, []);

  if (loading) return <div style={loaderStyle}>Initializing System...</div>;

  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
        
        {/* 2. SIDEBAR LOGIC: Only show if Admin is logged in */}
        {user && user.role === 'admin' && <Sidebar />}

        {/* 3. MAIN CONTENT AREA */}
        <div style={{ 
          flex: 1, 
          marginLeft: user && user.role === 'admin' ? '260px' : '0', 
          transition: 'margin 0.3s ease' 
        }}>
          <Routes>
            {/* PUBLIC ROUTE */}
            <Route 
              path="/login" 
              element={!user ? <Login setUser={setUser} /> : <Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/voter-dashboard'} />} 
            />

            {/* ADMIN PROTECTED ROUTES */}
            <Route 
              path="/admin-dashboard" 
              element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/students" 
              element={user?.role === 'admin' ? <StudentRegistry /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/categories" 
              element={user?.role === 'admin' ? <CategoryManagement /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/candidates" 
              element={user?.role === 'admin' ? <CandidateManagement /> : <Navigate to="/login" />} 
            />

            {/* VOTER PROTECTED ROUTE */}
            <Route 
              path="/voter-dashboard" 
              element={user?.role === 'user' ? <VoterDashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} 
            />

            {/* DEFAULT REDIRECT */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// --- BASIC STYLES ---
const loaderStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  fontSize: '1.2rem',
  color: '#2c3e50',
  fontWeight: 'bold'
};

export default App;