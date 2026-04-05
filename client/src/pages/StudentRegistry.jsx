import { useState, useEffect } from 'react';
import API from '../api';

const StudentRegistry = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });

  // 1. Fetch students on load
  const fetchStudents = async () => {
    const { data } = await API.get('/admin/users');
    setStudents(data);
  };

  useEffect(() => { fetchStudents(); }, []);

  // 2. Handle Add Student
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/add-user', { ...formData, role: 'user' });
      setFormData({ name: '', username: '', password: '' }); // Clear form
      fetchStudents(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || "Error adding student");
    }
  };

  // 3. Handle Delete
  const deleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to remove this student?")) {
      await API.delete(`/admin/user/${id}`);
      fetchStudents();
    }
  };

  return (
    <div>
      <h3>Add New Student</h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        <input type="text" placeholder="Username (Roll No)" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
        <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
        <button type="submit">Register Student</button>
      </form>

      <h3>Registered Students ({students.length})</h3>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#eee' }}>
            <th>Name</th>
            <th>Username</th>
            <th>Has Voted?</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.username}</td>
              <td>{s.hasVoted ? "✅ Yes" : "❌ No"}</td>
              <td><button onClick={() => deleteStudent(s._id)} style={{ color: 'red' }}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentRegistry;