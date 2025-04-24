import React, { useEffect, useState } from 'react';

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', description: '', image: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load products');
        setLoading(false);
      });
  }, [refresh]);

  function openModal(product) {
    setEditProduct(product);
    setForm(product ? {
      name: product.name || '',
      price: product.price || '',
      description: product.description || '',
      image: product.image || ''
    } : { name: '', price: '', description: '', image: '' });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditProduct(null);
    setForm({ name: '', price: '', description: '', image: '' });
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const method = editProduct ? 'PUT' : 'POST';
    const url = editProduct ? `/api/admin/products/${editProduct._id}` : '/api/admin/products';
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) })
    })
      .then(res => res.json())
      .then(() => {
        setSaving(false);
        setShowModal(false);
        setRefresh(r => r + 1);
      })
      .catch(() => {
        setError('Failed to save product');
        setSaving(false);
      });
  }

  function handleDelete(productId) {
    if (!window.confirm('Delete this product?')) return;
    setDeleting(productId);
    fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        setDeleting(null);
        setRefresh(r => r + 1);
      })
      .catch(() => {
        setError('Failed to delete product');
        setDeleting(null);
      });
  }

  return (
    <div className="main-content">
      <h2>Products</h2>
      <button style={{marginBottom:16}} onClick={() => openModal(null)}>Add Product</button>
      {loading ? <div>Loading...</div> : error ? <div className="admin-error">{error}</div> : (
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Description</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr><td colSpan={5} style={{textAlign:'center'}}>No products found.</td></tr>
              )}
              {products.map(product => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>${product.price?.toFixed(2)}</td>
                  <td>{product.description}</td>
                  <td>{product.image ? <img src={product.image} alt="" style={{width:48,borderRadius:6}} /> : '-'}</td>
                  <td>
                    <button onClick={() => openModal(product)}>Edit</button>
                    <button style={{marginLeft:8}} onClick={() => handleDelete(product._id)} disabled={deleting===product._id}>
                      {deleting===product._id ? 'Deleting...' : 'Delete'}
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
            <h3>{editProduct ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSave}>
              <div style={{marginBottom:12}}>
                <label>Name:<br />
                  <input name="name" required value={form.name} onChange={handleChange} style={{width:'100%'}} />
                </label>
              </div>
              <div style={{marginBottom:12}}>
                <label>Price:<br />
                  <input name="price" type="number" step="0.01" required value={form.price} onChange={handleChange} style={{width:'100%'}} />
                </label>
              </div>
              <div style={{marginBottom:12}}>
                <label>Description:<br />
                  <input name="description" value={form.description} onChange={handleChange} style={{width:'100%'}} />
                </label>
              </div>
              <div style={{marginBottom:12}}>
                <label>Image URL:<br />
                  <input name="image" value={form.image} onChange={handleChange} style={{width:'100%'}} />
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
