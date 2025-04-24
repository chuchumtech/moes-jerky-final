import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load dashboard data');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="main-content">Loading...</div>;
  if (error) return <div className="main-content admin-error">{error}</div>;

  return (
    <div className="main-content">
      <h2>Dashboard</h2>
      <div style={{display:'flex',gap:32,flexWrap:'wrap',marginBottom:28}}>
        <div style={{background:'#ffeaea',borderRadius:12,padding:'24px 32px',minWidth:180,boxShadow:'0 2px 12px rgba(139,0,0,0.07)'}}>
          <div style={{fontSize:'1.3em',color:'#8b0000',fontWeight:700}}>Next Delivery</div>
          <div style={{fontSize:'1.1em',marginTop:6}}>{data.nextDate ? `${data.nextDate.label || data.nextDate.date}` : 'None'}</div>
        </div>
        <div style={{background:'#ffeaea',borderRadius:12,padding:'24px 32px',minWidth:180,boxShadow:'0 2px 12px rgba(139,0,0,0.07)'}}>
          <div style={{fontSize:'1.3em',color:'#8b0000',fontWeight:700}}>Orders for Next Delivery</div>
          <div style={{fontSize:'2em',marginTop:6}}>{data.orderCount}</div>
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{fontWeight:600,marginBottom:6}}>Items for Next Delivery:</div>
        {Object.keys(data.itemCounts||{}).length === 0 ? <div>No items.</div> : (
          <ul>
            {Object.entries(data.itemCounts).map(([name, qty]) => (
              <li key={name}>{name}: <b>{qty}</b></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
