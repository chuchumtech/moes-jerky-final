import React, { useEffect, useState } from 'react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ username: '', pin: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load admin users');
        setLoading(false);
      });
  }, [refresh]);

  function openModal(user) {
    setEditUser(user);
    setForm(user ? { username: user.username || '', pin: '' } : { username: '', pin: '' });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditUser(null);
    setForm({ username: '', pin: '' });
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const method = editUser ? 'PUT' : 'POST';
    const url = editUser ? `/api/admin/users/${editUser._id}` : '/api/admin/users';
    const body = editUser ? { username: form.username } : { username: form.username, pin: form.pin };
    if (editUser && form.pin) body.pin = form.pin;
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(() => {
        setSaving(false);
        setShowModal(false);
        setRefresh(r => r + 1);
      })
      .catch(() => {
        setError('Failed to save admin user');
        setSaving(false);
      });
  }

  function handleDelete(userId) {
    if (!window.confirm('Delete this admin user?')) return;
    setDeleting(userId);
    fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        setDeleting(null);
        setRefresh(r => r + 1);
      })
      .catch(() => {
        setError('Failed to delete admin user');
        setDeleting(null);
      });
  }

  return (
    <div className="main-content">
      <h2>Admin Users</h2>
      <button style={{marginBottom:16}} onClick={() => openModal(null)}>Add Admin User</button>
      {loading ? <div>Loading...</div> : error ? <div className="admin-error">{error}</div> : (
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={2} style={{textAlign:'center'}}>No admin users found.</td></tr>
              )}
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>
                    <button onClick={() => openModal(user)}>Edit</button>
                    <button style={{marginLeft:8}} onClick={() => handleDelete(user._id)} disabled={deleting===user._id}>
                      {deleting===user._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div className="modal-bg" onClick={closeModal}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3>{editUser ? 'Edit Admin User' : 'Add Admin User'}</h3>
            <form onSubmit={handleSave}>
              <div style={{marginBottom:12}}>
                <label>Username:<br />
                  <input name="username" required value={form.username} onChange={handleChange} style={{width:'100%'}} />
                </label>
              </div>
              <div style={{marginBottom:12}}>
                <label>PIN (6 digits):<br />
                  <input name="pin" type="password" maxLength={6} minLength={6} pattern="[0-9]{6}" value={form.pin} onChange={handleChange} style={{width:'100%'}} placeholder={editUser ? 'Leave blank to keep current PIN' : ''} />
                </label>
              </div>
              <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" style={{marginLeft:12}} onClick={closeModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
