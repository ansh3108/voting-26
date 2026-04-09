import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';

// --- IMPORT COMPONENTS ---
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentRegistry from './pages/StudentRegistry';
import CategoryManagement from './pages/CategoryManagement';
import CandidateManagement from './pages/CandidateManagement';
import VoterDashboard from './pages/VoterDashboard';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    try {
      const parsedData = JSON.parse(savedUser);
      return parsedData.user || null;
    } catch {
      return null;
    }
  });
  const [loading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    const sync = () => setSidebarOpen(window.innerWidth > 900);
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [user?.role]);

  if (loading) return <div style={loaderStyle}>Initializing System...</div>;

  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--dv-bg)' }}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid rgba(248, 250, 252, 0.12)',
            },
          }}
        />
        
        {/* 2. SIDEBAR LOGIC: Only show if Admin is logged in */}
        {user && user.role === 'admin' && (
          <>
            <div
              className={`dv-sidebar-overlay ${sidebarOpen ? 'dv-sidebar-overlay--open' : ''}`}
              onClick={() => setSidebarOpen(false)}
            />
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          </>
        )}

        {/* 3. MAIN CONTENT AREA */}
        <div
          className={user && user.role === 'admin' ? 'dv-admin-main' : undefined}
          style={
            user && user.role === 'admin'
              ? undefined
              : { flex: 1, minHeight: '100vh', background: 'var(--dv-bg)' }
          }
        >
          {user && user.role === 'admin' ? (
            <div className="dv-topbar">
              <button
                type="button"
                className="dv-hamburger"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={18} />
              </button>
              <div style={{ fontWeight: 700, color: 'var(--dv-text)' }}>Admin</div>
            </div>
          ) : null}
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