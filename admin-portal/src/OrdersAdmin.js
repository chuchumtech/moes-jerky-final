import React, { useEffect, useState } from 'react';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString();
}

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewOrder, setViewOrder] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load orders');
        setLoading(false);
      });
  }, [refresh]);

  function handleDelete(orderId) {
    if (!window.confirm('Delete this order?')) return;
    setDeleting(orderId);
    fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        setRefresh(r => r + 1);
        setDeleting(null);
      })
      .catch(() => {
        setError('Failed to delete order');
        setDeleting(null);
      });
  }

  return (
    <div className="main-content">
      <h2>Orders</h2>
      {loading ? <div>Loading...</div> : error ? <div className="admin-error">{error}</div> : (
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={7} style={{textAlign:'center'}}>No orders found.</td></tr>
              )}
              {orders.map(order => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.name}</td>
                  <td>{order.email}</td>
                  <td>${order.total?.toFixed(2)}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <select
                      value={order.orderStatus || 'processing'}
                      onChange={async e => {
                        const status = e.target.value;
                        await fetch(`/api/admin/orders/${order._id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ orderStatus: status })
                        });
                        setRefresh(r => r + 1);
                      }}
                      style={{ minWidth: 110, backgroundColor: order.orderStatus === 'fulfilled' ? '#4caf50' : order.orderStatus === 'shipped' ? '#2196f3' : '#ff9800', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600 }}
                    >
                      <option value="processing" style={{background:'#ff9800',color:'#fff'}}>Processing</option>
                      <option value="shipped" style={{background:'#2196f3',color:'#fff'}}>Shipped</option>
                      <option value="fulfilled" style={{background:'#4caf50',color:'#fff'}}>Fulfilled</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => setViewOrder(order)}>View</button>
                    <button style={{marginLeft:8}} onClick={() => handleDelete(order._id)} disabled={deleting===order._id}>
                      {deleting===order._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {viewOrder && (
        <div className="modal-bg" onClick={()=>setViewOrder(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3>Order #{viewOrder.orderNumber}</h3>
            <p><b>Name:</b> {viewOrder.name}</p>
            <p><b>Email:</b> {viewOrder.email}</p>
            <p><b>Phone:</b> {viewOrder.phone}</p>
            <p><b>Address:</b> {viewOrder.address}</p>
            <p><b>Delivery Date:</b> {viewOrder.deliveryDate}</p>
            <p><b>Status:</b> 
              <select
                value={viewOrder.orderStatus || 'processing'}
                onChange={async e => {
                  const status = e.target.value;
                  await fetch(`/api/admin/orders/${viewOrder._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderStatus: status })
                  });
                  setViewOrder({ ...viewOrder, orderStatus: status });
                  setRefresh(r => r + 1);
                }}
                style={{ minWidth: 110, backgroundColor: viewOrder.orderStatus === 'fulfilled' ? '#4caf50' : viewOrder.orderStatus === 'shipped' ? '#2196f3' : '#ff9800', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600 }}
              >
                <option value="processing" style={{background:'#ff9800',color:'#fff'}}>Processing</option>
                <option value="shipped" style={{background:'#2196f3',color:'#fff'}}>Shipped</option>
                <option value="fulfilled" style={{background:'#4caf50',color:'#fff'}}>Fulfilled</option>
              </select>
            </p>
            <p><b>Cart:</b></p>
            <ul>
              {(viewOrder.cartItems || []).map((item, idx) => (
                <li key={idx}>{item.name} x{item.quantity}</li>
              ))}
            </ul>
            <button onClick={()=>setViewOrder(null)} style={{marginTop:18}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
