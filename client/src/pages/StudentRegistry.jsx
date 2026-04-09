import { useState, useEffect, useMemo } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import { UserSearch } from 'lucide-react';

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
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/add-user', formData);
      setFormData({ name: '', username: '', password: '' });
      await fetchStudents();
      toast.success('Student added.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding student');
    }
  };

  const handleModifySave = async (id) => {
    try {
      await API.put(`/admin/user/${id}`, editData);
      setEditId(null);
      await fetchStudents();
      toast.success('Student updated.');
    } catch {
      toast.error('Modify failed');
    }
  };

  const startEdit = (s) => {
    setEditId(s._id);
    setEditData({ name: s.name, username: s.username, password: s.password });
  };

  const deleteStudent = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await API.delete(`/admin/user/${id}`);
      await fetchStudents();
      toast.success('Student deleted.');
    } catch {
      toast.error('Failed to delete student.');
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const name = (s.name || '').toLowerCase();
      const roll = (s.username || '').toLowerCase();
      return name.includes(q) || roll.includes(q);
    });
  }, [students, searchTerm]);

  return (
    <div style={{ padding: 20, maxWidth: 1100 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginBottom: 18,
          flexWrap: 'wrap',
        }}
      >
        <h2 style={{ margin: 0 }}>Student registry</h2>
        <button
          type="button"
          className="dv-btn dv-btn--ghost"
          onClick={() => setShowPasswords((v) => !v)}
          style={{ padding: '10px 14px' }}
        >
          {showPasswords ? 'Hide passwords' : 'Show passwords'}
        </button>
      </div>

      <div className="dv-card">
        <h4 style={{ marginTop: 0 }}>Register new voter</h4>
        <form
          onSubmit={handleAdd}
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1fr auto',
            gap: 12,
            alignItems: 'end',
          }}
        >
          <div>
            <label style={labelStyle}>Full name</label>
            <input
              className="dv-input"
              placeholder="Full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Roll number / username</label>
            <input
              className="dv-input"
              placeholder="Roll number / username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              className="dv-input"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="dv-btn dv-btn--primary">
            Add
          </button>
        </form>
      </div>

      <div style={{ marginBottom: 14 }}>
        <input
          className="dv-input"
          placeholder="Search by name or roll number…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="dv-card">
        <h4 style={{ marginTop: 0 }}>Students</h4>
        {loading ? (
          <div>
            <Skeleton style={{ height: 44, marginBottom: 10 }} />
            <Skeleton style={{ height: 44, marginBottom: 10 }} />
            <Skeleton style={{ height: 44, marginBottom: 10 }} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No students found"
            description="Try a different search, or add a new student above."
            Icon={UserSearch}
          />
        ) : (
          <div className="dv-table-wrap">
            <table className="dv-table">
              <thead>
                <tr>
                  <th>Full name</th>
                  <th>Roll no (username)</th>
                  <th>Password</th>
                  <th>Voting status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id}>
                    {editId === s._id ? (
                      <>
                        <td>
                          <input
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            style={editInput}
                          />
                        </td>
                        <td>
                          <input
                            value={editData.username}
                            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                            style={editInput}
                          />
                        </td>
                        <td>
                          <input
                            value={editData.password}
                            onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                            style={editInput}
                          />
                        </td>
                        <td>—</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="dv-btn dv-btn--success"
                            style={{ padding: '8px 12px' }}
                            onClick={() => handleModifySave(s._id)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="dv-btn dv-btn--ghost"
                            style={{ padding: '8px 12px', marginLeft: 8 }}
                            onClick={() => setEditId(null)}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <strong>{s.name}</strong>
                        </td>
                        <td>{s.username}</td>
                        <td>
                          {/* Keep plain-text password visibility logic as-is */}
                          <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                            {showPasswords ? s.password : '••••••••'}
                          </span>
                        </td>
                        <td>
                          <span
                            className="dv-badge"
                            style={{
                              background: s.hasVoted ? '#dcfce7' : '#ffedd5',
                              color: s.hasVoted ? '#166534' : '#9a3412',
                            }}
                          >
                            {s.hasVoted ? 'Voted' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="dv-btn dv-btn--ghost"
                            style={{ padding: '8px 12px' }}
                            onClick={() => startEdit(s)}
                          >
                            Modify
                          </button>
                          <button
                            type="button"
                            className="dv-btn dv-btn--danger"
                            style={{ padding: '8px 12px', marginLeft: 8 }}
                            onClick={() => deleteStudent(s._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const labelStyle = { display: 'block', fontSize: '0.8rem', color: 'var(--dv-muted)', marginBottom: 4 };
const editInput = { width: '92%', padding: '10px', borderRadius: 10, border: '1px solid var(--dv-border)' };

export default StudentRegistry;