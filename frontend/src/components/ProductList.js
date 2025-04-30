import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const ProductList = ({ onAddToCart, cartItems, onUpdateQty, onOpenCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://moes-jerky-final.onrender.com/api/items')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Typography>Loading products...</Typography>;

  return (
    <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
      {products.map(product => {
        const cartItem = cartItems.find(item => item._id === product._id);
        return (
          <Grid item xs={12} sm={8} md={6} lg={5} key={product._id} display="flex" justifyContent="center">
            <Card sx={{
              width: 400,
              transition: 'box-shadow 0.2s',
              boxShadow: '0 1px 6px rgba(50,50,50,0.07)',
              borderRadius: 8,
              border: '1px solid #e0e0e0',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              mx: 'auto',
              bgcolor: 'background.paper',
            }}>
            {product.image ? (
              <CardMedia
                component="img"
                height="180"
                image={product.image}
                alt={product.name}
                sx={{ objectFit: 'cover', bgcolor: '#f4f4f6', borderBottom: '1px solid #e0e0e0' }}
              />
            ) : (
              <Box sx={{ position: 'relative', height: 180, bgcolor: '#f4f4f6', borderBottom: '1px solid #e0e0e0' }}>
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/moes-jerky-dd53f.firebasestorage.app/o/LOGO%20(2).png?alt=media&token=76b964e3-8c4a-4cf0-8d67-bcbdc3056489"
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.25 }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: 28,
                    textShadow: '2px 2px 8px #222',
                    textAlign: 'center',
                    width: '90%',
                    letterSpacing: 1,
                    lineHeight: 1.1,
                  }}
                >
                  {product.name}
                </Typography>
              </Box>
            )}
            <CardContent sx={{ flexGrow: 1, pb: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: 0.2 }}>{product.name}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 1 }}>
                {product.description}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
                {product.price != null ? `$${product.price.toFixed(2)}` : <span style={{color:'#b02a2a'}}>Out of Stock</span>}
              </Typography>
            </CardContent>
            <Box sx={{ px: 3, pb: 2, pt: 1, minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartItem ? (
                  <>
                    <Button size="small" variant="outlined" onClick={() => {
  if (cartItem.quantity === 1) {
    onUpdateQty(product._id, 0);
  } else {
    onUpdateQty(product._id, cartItem.quantity - 1);
  }
}} sx={{ minWidth: 28, color: 'primary.main', fontWeight: 700, borderColor: 'primary.main', mx: 0.5 }}>-</Button>
                    <Typography sx={{ mx: 1, fontWeight: 700, color: 'primary.main', display: 'inline-block', minWidth: 22, textAlign: 'center' }}>{cartItem.quantity}</Typography>
                    <Button size="small" variant="outlined" onClick={() => onUpdateQty(product._id, cartItem.quantity + 1)} sx={{ minWidth: 28, color: 'primary.main', fontWeight: 700, borderColor: 'primary.main', mx: 0.5 }}>+</Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => { onAddToCart(product); onOpenCart(); }}
                    disabled={product.price == null}
                    sx={{ borderRadius: 2, fontWeight: 600, py: 1, width: 150, mx: 'auto', display: 'block', fontSize: 15 }}
                  >
                    Add to Cart
                  </Button>
                )}
              </Box>
          </Card>
        </Grid>
      );
      })}
    </Grid>
  );
};

export default ProductList;
