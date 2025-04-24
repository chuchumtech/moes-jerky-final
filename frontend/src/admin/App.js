import React, { useState } from 'react';
import './admin.css';
import logo from '../assets/moes-jerky-logo.png';

function AdminLogin({ onLogin, error }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [active, setActive] = useState(0);

  function handleChange(e, idx) {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) return;
    const next = [...code];
    next[idx] = val[0];
    setCode(next);
    if (idx < 5) setActive(idx + 1);
    if (next.join('').length === 6) onLogin(next.join(''));
  }

  function handleKeyDown(e, idx) {
    if (e.key === 'Backspace' && code[idx] === '' && idx > 0) {
      setActive(idx - 1);
    }
  }

  return (
    <div className="admin-login">
      <img src={logo} alt="Moe's Jerky Logo" className="admin-logo" />
      <h2>Welcome to Moe's Jerky Admin</h2>
      <div className="admin-code-inputs">
        {code.map((digit, i) => (
          <input
            key={i}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className="admin-code-box"
            value={digit}
            autoFocus={active === i}
            onChange={e => handleChange(e, i)}
            onKeyDown={e => handleKeyDown(e, i)}
            onFocus={() => setActive(i)}
          />
        ))}
      </div>
      {error && <div className="admin-error">{error}</div>}
    </div>
  );
}

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(pin) {
    setError('');
    const resp = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    if (resp.ok) {
      setLoggedIn(true);
    } else {
      const data = await resp.json();
      setError(data.error || 'Login failed');
    }
  }

  if (!loggedIn) return <AdminLogin onLogin={handleLogin} error={error} />;

  return (
    <div style={{ textAlign: 'center', marginTop: 80 }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome! (Sidebar and dashboard coming next...)</p>
    </div>
  );
}
