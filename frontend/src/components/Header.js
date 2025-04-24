import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

const Header = () => (
  <AppBar position="static" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }} elevation={2}>
    <Toolbar>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', py: 2 }}>
        <img
          src="https://firebasestorage.googleapis.com/v0/b/moes-jerky-dd53f.firebasestorage.app/o/logo.png?alt=media&token=e721a51b-0de2-4925-bbcb-5001f6109745"
          alt="Moe's Jerky Logo"
          style={{ height: 96 }}
        />
      </Box>
    </Toolbar>
  </AppBar>
);

export default Header;
