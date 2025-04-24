import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Footer = () => (
  <Box
    component="footer"
    sx={{
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      py: 2,
      px: { xs: 2, sm: 6 },
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: 16,
    }}
  >
    <Typography sx={{ fontWeight: 500, fontSize: 15 }}>
      &copy; 2025 Mo's Jerky
    </Typography>
    <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
      <img src="https://firebasestorage.googleapis.com/v0/b/moes-jerky-dd53f.firebasestorage.app/o/chuchum.png?alt=media&token=a6586f4a-0a8e-46a9-bd45-07089c4791ee" alt="Chuchum Logo" style={{ height: 28, verticalAlign: 'middle' }} />
    </Box>
  </Box>
);

export default Footer;
