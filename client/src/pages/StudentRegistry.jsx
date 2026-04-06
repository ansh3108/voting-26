import { useState, useEffect, useMemo } from 'react';
import API from '../api';
import Spinner from '../components/Spinner';

const StudentRegistry = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/admin/users');
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/admin/add-user', { ...formData, role: 'user' });
      setFormData({ name: '', username: '', password: '' });
      await fetchStudents();
      alert('Student registered successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding student');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteStudent = async (id) => {
    if (
      window.confirm(
        'Are you sure? This will permanently remove the student and any vote they cast.'
      )
    ) {
      try {
        await API.delete(`/admin/user/${id}`);
        fetchStudents();
      } catch (err) {
        alert('Failed to delete student');
      }
    }
  };

  const q = searchTerm.trim().toLowerCase();
  const filteredStudents = useMemo(() => {
    if (!q) return students;
    return students.filter((s) => {
      const name = (s.name || '').toLowerCase();
      const roll = (s.username || '').toLowerCase();
      return name.includes(q) || roll.includes(q);
    });
  }, [students, q]);

  return (
    <div style={{ maxWidth: 1000 }}>
      <h2 style={{ marginTop: 0, marginBottom: '1.25rem' }}>Student registry</h2>

      <div className="dv-card">
        <h4 style={{ marginTop: 0 }}>Register new voter</h4>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}
        >
          <div style={{ flex: '1 1 200px' }}>
            <label
              style={{ display: 'block', fontSize: '0.8rem', color: 'var(--dv-muted)', marginBottom: 4 }}
            >
              Full name
            </label>
            <input
              className="dv-input"
              type="text"
              placeholder="Full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label
              style={{ display: 'block', fontSize: '0.8rem', color: 'var(--dv-muted)', marginBottom: 4 }}
            >
              Roll number / username
            </label>
            <input
              className="dv-input"
              type="text"
              placeholder="Roll number / username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label
              style={{ display: 'block', fontSize: '0.8rem', color: 'var(--dv-muted)', marginBottom: 4 }}
            >
              Password
            </label>
            <input
              className="dv-input"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="dv-btn dv-btn--primary" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" white />
                Adding…
              </>
            ) : (
              'Add student'
            )}
          </button>
        </form>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label
          style={{ display: 'block', fontSize: '0.8rem', color: 'var(--dv-muted)', marginBottom: 4 }}
        >
          Search by name or roll number
        </label>
        <input
          className="dv-input"
          type="search"
          placeholder="Search by name or roll number…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="dv-table-wrap">
        <table className="dv-table">
          <thead>
            <tr>
              <th>Full name</th>
              <th>Roll no (username)</th>
              <th>Voting status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}>
                  <div className="dv-center" style={{ padding: '2rem' }}>
                    <Spinner />
                    <span>Loading students…</span>
                  </div>
                </td>
              </tr>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.username}</td>
                  <td>
                    <span
                      className="dv-badge"
                      style={{
                        background: s.hasVoted ? '#dcfce7' : '#ffedd5',
                        color: s.hasVoted ? '#166534' : '#c2410c',
                      }}
                    >
                      {s.hasVoted ? 'Voted' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="dv-btn dv-btn--danger"
                      onClick={() => deleteStudent(s._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--dv-muted)', padding: '2rem' }}>
                  {students.length === 0
                    ? 'No students registered yet.'
                    : 'No students match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentRegistry;
