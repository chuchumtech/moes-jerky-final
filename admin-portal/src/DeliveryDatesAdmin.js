import React, { useEffect, useState } from 'react';

export default function DeliveryDatesAdmin() {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editDate, setEditDate] = useState(null);
  const [form, setForm] = useState({ date: '', label: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/deliverydates')
      .then(res => res.json())
      .then(data => {
        setDates(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load delivery dates');
        setLoading(false);
      });
  }, [refresh]);

  function openModal(date) {
    setEditDate(date);
    setForm(date ? {
      date: date.date || '',
      label: date.label || ''
    } : { date: '', label: '' });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditDate(null);
    setForm({ date: '', label: '' });
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const method = editDate ? 'PUT' : 'POST';
    const url = editDate ? `/api/admin/deliverydates/${editDate._id}` : '/api/admin/deliverydates';
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(() => {
        setSaving(false);
        setShowModal(false);
        setRefresh(r => r + 1);
      })
      .catch(() => {
        setError('Failed to save delivery date');
        setSaving(false);
      });
  }

  function handleDelete(dateId) {
    if (!window.confirm('Delete this delivery date?')) return;
    setDeleting(dateId);
    fetch(`/api/admin/deliverydates/${dateId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        setDeleting(null);
        setRefresh(r => r + 1);
      })
      .catch(() => {
        setError('Failed to delete delivery date');
        setDeleting(null);
      });
  }

  return (
    <div className="main-content">
      <h2>Delivery Dates</h2>
      <button style={{marginBottom:16}} onClick={() => openModal(null)}>Add Delivery Date</button>
      {loading ? <div>Loading...</div> : error ? <div className="admin-error">{error}</div> : (
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Label</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dates.length === 0 && (
                <tr><td colSpan={3} style={{textAlign:'center'}}>No delivery dates found.</td></tr>
              )}
              {dates.map(date => (
                <tr key={date._id}>
                  <td>{date.date}</td>
                  <td>{date.label}</td>
                  <td>
                    <button onClick={() => openModal(date)}>Edit</button>
                    <button style={{marginLeft:8}} onClick={() => handleDelete(date._id)} disabled={deleting===date._id}>
                      {deleting===date._id ? 'Deleting...' : 'Delete'}
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
            <h3>{editDate ? 'Edit Delivery Date' : 'Add Delivery Date'}</h3>
            <form onSubmit={handleSave}>
              <div style={{marginBottom:12}}>
                <label>Date (YYYY-MM-DD):<br />
                  <input name="date" required value={form.date} onChange={handleChange} style={{width:'100%'}} />
                </label>
              </div>
              <div style={{marginBottom:12}}>
                <label>Label:<br />
                  <input name="label" value={form.label} onChange={handleChange} style={{width:'100%'}} />
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
