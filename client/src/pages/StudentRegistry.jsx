import { useState, useEffect } from 'react';
import API from '../api';

const StudentRegistry = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);

  // 1. Fetch Students from Backend
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/admin/users');
      setStudents(data);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 2. Add New Student
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/add-user', { ...formData, role: 'user' });
      setFormData({ name: '', username: '', password: '' }); // Reset form
      fetchStudents(); // Refresh list
      alert("Student registered successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error adding student");
    }
  };

  // 3. Delete Student
  const deleteStudent = async (id) => {
    if (window.confirm("Are you sure? This will permanently remove the student and any vote they cast.")) {
      try {
        await API.delete(`/admin/user/${id}`);
        fetchStudents();
      } catch (err) {
        alert("Failed to delete student");
      }
    }
  };

  // 4. Search Logic
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1000px' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Student Registry</h2>

      {/* Registration Form Card */}
      <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h4 style={{ marginTop: 0 }}>Register New Voter</h4>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <input 
            style={inputStyle}
            type="text" placeholder="Full Name" 
            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
            required 
          />
          <input 
            style={inputStyle}
            type="text" placeholder="Roll Number / Username" 
            value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} 
            required 
          />
          <input 
            style={inputStyle}
            type="password" placeholder="Password" 
            value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} 
            required 
          />
          <button type="submit" style={buttonStyle}>Add Student</button>
        </form>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="🔍 Search by name or roll number..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
        />
      </div>

      {/* Students Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #eee' }}>
              <th style={thStyle}>Full Name</th>
              <th style={thStyle}>Roll No (Username)</th>
              <th style={thStyle}>Voting Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Loading students...</td></tr>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tdStyle}>{s.name}</td>
                  <td style={tdStyle}>{s.username}</td>
                  <td style={tdStyle}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem',
                      backgroundColor: s.hasVoted ? '#e8f5e9' : '#fff3e0',
                      color: s.hasVoted ? '#2e7d32' : '#ef6c00'
                    }}>
                      {s.hasVoted ? "✅ Voted" : "⏳ Pending"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button 
                      onClick={() => deleteStudent(s._id)} 
                      style={{ color: '#e74c3c', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No students found matching your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Simple Inline Styles ---
const inputStyle = {
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ddd',
  flex: '1',
  minWidth: '200px'
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const thStyle = { padding: '15px', color: '#7f8c8d', fontSize: '0.9rem', textTransform: 'uppercase' };
const tdStyle = { padding: '15px', color: '#2c3e50' };

export default StudentRegistry;