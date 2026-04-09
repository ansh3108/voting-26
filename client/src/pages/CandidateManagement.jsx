import { useState, useEffect } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { Users } from 'lucide-react';

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', category: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [resCand, resCat] = await Promise.all([
        API.get('/admin/candidates'),
        API.get('/categories')
      ]);
      setCandidates(resCand.data);
      setCategories(resCat.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // 10MB LIMIT CHECK (10 * 1024 * 1024 bytes)
    const limit = 10 * 1024 * 1024;
    if (selectedFile.size > limit) {
      toast.error('File is too large (max 10MB).');
      e.target.value = ""; // Clear the input
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please upload a photo.');

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('image', file);

    try {
      setSubmitting(true);
      await API.post('/admin/add-candidate', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ name: '', category: '' });
      setFile(null);
      document.getElementById('fileInput').value = "";
      await fetchData();
      toast.success('Candidate added.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding candidate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete candidate?")) {
      try {
        await API.delete(`/admin/candidate/${id}`);
        await fetchData();
        toast.success('Candidate deleted.');
      } catch {
        toast.error('Failed to delete candidate.');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Candidate management</h2>
        <div className="dv-card">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12 }}>
            <Skeleton style={{ height: 44 }} />
            <Skeleton style={{ height: 44 }} />
            <Skeleton style={{ height: 44 }} />
            <Skeleton style={{ height: 44 }} />
          </div>
        </div>
        <div className="dv-card">
          <Skeleton style={{ height: 18, width: 220, marginBottom: 14 }} />
          <Skeleton style={{ height: 42, marginBottom: 10 }} />
          <Skeleton style={{ height: 42, marginBottom: 10 }} />
          <Skeleton style={{ height: 42 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginTop: 0 }}>Candidate management</h2>

      {/* FORM */}
      <div className="dv-card">
        <h4 style={{ marginTop: 0 }}>Add candidate</h4>
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.2fr 1.2fr auto',
            gap: 12,
            alignItems: 'end',
          }}
        >
          <div>
            <label style={labelStyle}>Candidate name</label>
            <input
              className="dv-input"
              placeholder="Candidate name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Post (category)</label>
            <select
              className="dv-input"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Photo</label>
            <input
              id="fileInput"
              className="dv-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>
          <button type="submit" className="dv-btn dv-btn--success" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size={18} color="#fff" />
                Adding…
              </>
            ) : (
              'Add'
            )}
          </button>
        </form>
        <p style={{ margin: '0.75rem 0 0', color: 'var(--dv-muted)', fontSize: '0.9rem' }}>
          Max file size: 10MB (JPG, PNG, WEBP)
        </p>
      </div>

      {/* TABLE */}
      <div className="dv-card">
        <h4 style={{ marginTop: 0 }}>Candidates</h4>
        {candidates.length === 0 ? (
          <EmptyState
            title="No candidates yet"
            description="Add candidates to start the election and show live rankings."
            Icon={Users}
          />
        ) : (
          <div className="dv-table-wrap">
            <table className="dv-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <img
                        src={c.imageUrl ? `http://localhost:5000${c.imageUrl}` : 'https://placehold.co/40'}
                        alt=""
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          objectFit: 'cover',
                          border: '1px solid var(--dv-border)',
                        }}
                      />
                    </td>
                    <td>
                      <strong>{c.name}</strong>
                    </td>
                    <td>{c.category}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="dv-btn dv-btn--danger" onClick={() => handleDelete(c._id)}>
                        Delete
                      </button>
                    </td>
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

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  color: 'var(--dv-muted)',
  marginBottom: 4,
};

export default CandidateManagement;