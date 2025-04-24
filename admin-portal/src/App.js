import React, { useState, useRef } from 'react';
import './admin.css';
import Dashboard from './Dashboard';
import OrdersAdmin from './OrdersAdmin';
import ProductsAdmin from './ProductsAdmin';
import DeliveryDatesAdmin from './DeliveryDatesAdmin';
import AdminUsers from './AdminUsers';

function AdminLogin({ onLogin, error }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // Auto-focus first input on mount
  React.useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  function handleChange(e, idx) {
    const val = e.target.value.replace(/\D/g, '');
    let next = [...code];
    if (val.length > 1) {
      // Paste: fill as many as possible
      for (let i = 0; i < val.length && idx + i < 6; i++) {
        next[idx + i] = val[i];
      }
      setCode(next);
      const nextEmpty = next.findIndex(d => d === '');
      setTimeout(() => {
        if (next.join('').length === 6) {
          onLogin(next.join(''));
        } else if (nextEmpty !== -1 && inputRefs.current[nextEmpty]) {
          inputRefs.current[nextEmpty].focus();
        }
      }, 0);
    } else if (val.length === 1) {
      // Single digit: set and move
      next[idx] = val;
      setCode(next);
      setTimeout(() => {
        if (idx < 5 && inputRefs.current[idx + 1]) {
          inputRefs.current[idx + 1].focus();
        }
        if (next.join('').length === 6) onLogin(next.join(''));
      }, 0);
    }
  }

  function handleKeyDown(e, idx) {
    if (e.key === 'Backspace') {
      let next = [...code];
      if (code[idx] !== '') {
        // Clear current field
        next[idx] = '';
        setCode(next);
      } else if (idx > 0) {
        // Move to previous and clear
        next[idx - 1] = '';
        setCode(next);
        setTimeout(() => {
          if (inputRefs.current[idx - 1]) inputRefs.current[idx - 1].focus();
        }, 0);
      }
      e.preventDefault();
    }
  }

  return (
    <div className="admin-login">
      <img src={process.env.PUBLIC_URL + '/moes-jerky-logo.png'} alt="Moe's Jerky Logo" className="admin-logo" />
      <h2>Welcome to Moe's Jerky Admin</h2>
      <div className="admin-code-inputs">
        {code.map((digit, i) => (
          <input
            key={i}
            ref={el => inputRefs.current[i] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className="admin-code-box"
            value={digit}
            onChange={e => handleChange(e, i)}
            onKeyDown={e => handleKeyDown(e, i)}
            onFocus={() => inputRefs.current[i]?.select()}
          />
        ))}
      </div>
      {error && <div className="admin-error">{error}</div>}
    </div>
  );
}

function Sidebar({ section, setSection, onLogout }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <img src="https://firebasestorage.googleapis.com/v0/b/moes-jerky-dd53f.firebasestorage.app/o/logo.png?alt=media&token=e721a51b-0de2-4925-bbcb-5001f6109745" alt="Logo" />
        <span>Moe's Jerky Admin</span>
      </div>
      <ul>
        <li className={section==='dashboard' ? 'active' : ''} onClick={()=>setSection('dashboard')}>Dashboard</li>
        <li className={section==='orders' ? 'active' : ''} onClick={()=>setSection('orders')}>Orders</li>
        <li className={section==='products' ? 'active' : ''} onClick={()=>setSection('products')}>Products</li>
        <li className={section==='delivery' ? 'active' : ''} onClick={()=>setSection('delivery')}>Delivery Dates</li>
        <li className={section==='admins' ? 'active' : ''} onClick={()=>setSection('admins')}>Admin Users</li>
      </ul>
      <button className="sidebar-logout" onClick={onLogout}>Logout</button>
    </nav>
  );
}


function MainContent({ section }) {
  switch(section) {
    case 'dashboard':
      return <Dashboard />;
    case 'orders':
      return <OrdersAdmin />;
    case 'products':
      return <ProductsAdmin />;
    case 'delivery':
      return <DeliveryDatesAdmin />;
    case 'admins':
      return <AdminUsers />;
    default:
      return <div className="main-content"><h2>Dashboard</h2></div>;
  }
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [section, setSection] = useState('dashboard');

  async function handleLogin(pin) {
    setError('');
    try {
      const resp = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      if (resp.ok) {
        setLoggedIn(true);
      } else {
        setError('Invalid code.');
      }
    } catch (e) {
      setError('Network error.');
    }
  }

  function handleLogout() {
    setLoggedIn(false);
    setSection('dashboard');
  }

  if (!loggedIn) {
    return (
      <div className="admin-login">
        <img className="admin-logo" src="https://firebasestorage.googleapis.com/v0/b/moes-jerky-dd53f.firebasestorage.app/o/logo.png?alt=media&token=e721a51b-0de2-4925-bbcb-5001f6109745" alt="Moe's Jerky Logo" />
        <AdminLogin onLogin={handleLogin} error={error} />
      </div>
    );
  }
  return (
    <div className="admin-portal-layout">
      <Sidebar section={section} setSection={setSection} onLogout={handleLogout} />
      <MainContent section={section} />
    </div>
  );
}

export default App;
