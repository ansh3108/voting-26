import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState(null);

  // On page load, check if user is already logged in
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setUser(savedUser.user);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        
        {/* Basic placeholders for now */}
        <Route path="/admin" element={user?.role === 'admin' ? <h1>Admin Dashboard</h1> : <Navigate to="/login" />} />
        <Route path="/voter" element={user?.role === 'user' ? <h1>Voter Dashboard</h1> : <Navigate to="/login" />} />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;