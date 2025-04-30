import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

const Header = () => (
  <AppBar position="static" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }} elevation={2}>
    <Toolbar>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', py: 2 }}>
        <img
          src="https://firebasestorage.googleapis.com/v0/b/moes-jerky-dd53f.firebasestorage.app/o/LOGO%20(2).png?alt=media&token=76b964e3-8c4a-4cf0-8d67-bcbdc3056489"
          alt="Moe's Jerky Logo"
          style={{ height: 96 }}
        />
      </Box>
    </Toolbar>
  </AppBar>
);

export default Header;
