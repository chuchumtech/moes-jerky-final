import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminApp from './App';
import './admin.css';

const root = createRoot(document.getElementById('root'));
root.render(<AdminApp />);
