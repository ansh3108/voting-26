import { useState, useEffect } from 'react';
import API from '../api';

const StudentRegistry = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', username: '', password: '' });

  const fetchStudents = async () => {
    try {
      const { data } = await API.get('/admin/users');
      setStudents(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/add-user', formData);
      setFormData({ name: '', username: '', password: '' });
      fetchStudents();
    } catch (err) { alert(err.response?.data?.message || "Error adding student"); }
  };

  const handleModifySave = async (id) => {
    try {
      await API.put(`/admin/user/${id}`, editData);
      setEditId(null);
      fetchStudents();
    } catch (err) { alert("Modify failed"); }
  };

  const startEdit = (s) => {
    setEditId(s._id);
    setEditData({ name: s.name, username: s.username, password: s.password });
  };

  const deleteStudent = async (id) => {
    if (window.confirm("Are you sure?")) {
      await API.delete(`/admin/user/${id}`);
      fetchStudents();
    }
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Student Registry</h2>
        <button 
          onClick={() => setShowPasswords(!showPasswords)}
          style={toggleButtonStyle}
        >
          {showPasswords ? "🔒 Hide All Passwords" : "👁️ Show All Passwords"}
        </button>
      </div>

      {/* REGISTRATION FORM */}
      <div style={cardStyle}>
        <h4 style={{ marginTop: 0 }}>Register New Voter</h4>
        <form onSubmit={handleAdd} style={formGrid}>
          <input placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} required />
          <input placeholder="Roll number / username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} style={inputStyle} required />
          <input placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={inputStyle} required />
          <button type="submit" style={addBtnStyle}>Add student</button>
        </form>
      </div>

      <input 
        placeholder="Search by name or roll number..." 
        value={searchTerm} 
        onChange={e => setSearchTerm(e.target.value)} 
        style={searchStyle} 
      />

      {/* DATA TABLE */}
      <div style={tableCard}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={thRow}>
              <th style={tdPadding}>Full Name</th>
              <th style={tdPadding}>Roll No (Username)</th>
              <th style={tdPadding}>Password</th>
              <th style={tdPadding}>Voting Status</th>
              <th style={{ ...tdPadding, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s._id} style={trStyle}>
                {editId === s._id ? (
                  <>
                    <td style={tdPadding}><input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} style={editInput} /></td>
                    <td style={tdPadding}><input value={editData.username} onChange={e => setEditData({...editData, username: e.target.value})} style={editInput} /></td>
                    <td style={tdPadding}><input value={editData.password} onChange={e => setEditData({...editData, password: e.target.value})} style={editInput} /></td>
                    <td style={tdPadding}>-</td>
                    <td style={{ ...tdPadding, textAlign: 'right' }}>
                      <button onClick={() => handleModifySave(s._id)} style={saveBtn}>Save</button>
                      <button onClick={() => setEditId(null)} style={cancelBtn}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={tdPadding}><strong>{s.name}</strong></td>
                    <td style={tdPadding}>{s.username}</td>
                    <td style={tdPadding}>
                      <span style={{ fontFamily: 'monospace', color: showPasswords ? '#2c3e50' : '#bdc3c7' }}>
                        {showPasswords ? s.password : "••••••••"}
                      </span>
                    </td>
                    <td style={tdPadding}>
                      <span style={{ color: s.hasVoted ? '#27ae60' : '#f39c12', fontWeight: 'bold' }}>
                        {s.hasVoted ? "Voted" : "Pending"}
                      </span>
                    </td>
                    <td style={{ ...tdPadding, textAlign: 'right' }}>
                      <button onClick={() => startEdit(s)} style={modifyBtn}>Modify</button>
                      <button onClick={() => deleteStudent(s._id)} style={deleteBtn}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- STYLES ---
const cardStyle = { backgroundColor: 'white', padding: '25px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'center' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem' };
const addBtnStyle = { padding: '12px 25px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const searchStyle = { width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '25px', boxSizing: 'border-box', fontSize: '1rem' };
const tableCard = { backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' };
const thRow = { textAlign: 'left', backgroundColor: '#f9f9f9', borderBottom: '2px solid #eee' };
const trStyle = { borderBottom: '1px solid #eee' };
const tdPadding = { padding: '15px 20px' };
const editInput = { width: '90%', padding: '8px', borderRadius: '5px', border: '2px solid #3498db' };
const toggleButtonStyle = { padding: '10px 20px', backgroundColor: '#ecf0f1', border: '1px solid #bdc3c7', borderRadius: '25px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' };
const modifyBtn = { color: '#3498db', background: 'none', border: 'none', cursor: 'pointer', marginRight: '15px', fontWeight: '600' };
const deleteBtn = { color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' };
const saveBtn = { color: '#27ae60', background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px', fontWeight: 'bold' };
const cancelBtn = { color: '#95a5a6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' };

export default StudentRegistry;