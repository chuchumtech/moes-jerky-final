// Safe admin-only build script for Moe's Jerky admin portal
// This script builds ONLY the admin portal into frontend/admin-build without touching the main build/

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ADMIN_SRC = path.join(__dirname, 'src', 'admin');
const ADMIN_BUILD = path.join(__dirname, 'admin-build');
const PUBLIC = path.join(__dirname, 'public');

// Ensure admin-build exists
if (!fs.existsSync(ADMIN_BUILD)) {
  fs.mkdirSync(ADMIN_BUILD);
}

// Copy backend.html as index.html for SPA routing
fs.copyFileSync(path.join(PUBLIC, 'backend.html'), path.join(ADMIN_BUILD, 'index.html'));

// Copy admin.css
const ADMIN_STATIC = path.join(ADMIN_BUILD, 'static', 'admin');
fs.mkdirSync(ADMIN_STATIC, { recursive: true });
fs.copyFileSync(path.join(ADMIN_SRC, 'admin.css'), path.join(ADMIN_STATIC, 'admin.css'));

// Use Babel to transpile admin React app (for demo, but recommend using a bundler for production)
execSync('npx babel src/admin --out-dir admin-build/static/admin', { stdio: 'inherit', cwd: __dirname });

console.log('Admin portal built safely to admin-build/. Main customer build untouched.');
