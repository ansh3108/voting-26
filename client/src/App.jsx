import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Import all your Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import VoterDashboard from './pages/VoterDashboard';
import Spinner from './components/Spinner';

function App() {
  // This state holds the logged-in user's information (name, role, hasVoted, etc.)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // When the app first loads, check if there's a user saved in LocalStorage
  useEffect(() => {
    const savedData = localStorage.getItem('user');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setUser(parsedData.user); // Set the user from the saved session
    }
    setLoading(false); // Stop showing a blank screen once check is done
  }, []);

  if (loading) {
    return (
      <div className="dv-center" style={{ minHeight: '50vh' }}>
        <Spinner />
        <span>Loading application…</span>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Route: Login */}
        <Route 
          path="/login" 
          element={!user ? <Login setUser={setUser} /> : (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/voter" />)} 
        />

        {/* Protected Route: Admin Panel 
            Note the '/*' - this allows AdminDashboard to handle its own sub-routes like /students and /candidates
        */}
        <Route 
          path="/admin/*" 
          element={user?.role === 'admin' ? <AdminDashboard setUser={setUser} /> : <Navigate to="/login" />} 
        />

        {/* Protected Route: Voter Portal */}
        <Route 
          path="/voter" 
          element={user?.role === 'user' ? <VoterDashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} 
        />

        {/* Default Redirect: If no path matches, go to Login */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;