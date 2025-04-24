import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import CheckoutDialog from './components/CheckoutDialog';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge from '@mui/material/Badge';
import Snackbar from '@mui/material/Snackbar';
import axios from 'axios';

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [deliveryDate, setDeliveryDate] = useState({ id: '', label: '', raw: '' });

  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  const handleCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleUpdateQty = (id, qty) => {
    if (qty <= 0) {
      setCartItems(prev => prev.filter(item => item._id !== id));
    } else {
      setCartItems(prev => prev.map(item => item._id === id ? { ...item, quantity: qty } : item));
    }
  };


  const handleOrderSubmit = async (orderData) => {
    try {
      const orderPayload = {
        ...orderData,
        deliveryDate: deliveryDate.id,
        deliveryDateLabel: deliveryDate.label
      };
      const resp = await axios.post('http://localhost:3050/api/orders', orderPayload);
      setCartItems([]);
      setCheckoutOpen(false);
      // Pass order details as query param for thank you page
      const orderNumber = resp.data?.orderNumber || '';
      const details = encodeURIComponent(JSON.stringify({ ...orderPayload, orderNumber }));
      window.location.href = `/thankyou.html?orderDetails=${details}`;
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to place order.' });
    }
  };

  return (
    <div className="App">
      <Header onCartClick={() => setCartOpen(true)} cartCount={cartItems.length} />
      <Container maxWidth="md" sx={{ minHeight: '72vh', mt: 6, mb: 6 }}>
        <Typography variant="h3" align="center" sx={{ fontWeight: 800, mt: 2, mb: 1, letterSpacing: 1, color: 'primary.main' }}>
          Welcome to Moe's Jerky
        </Typography>
        <Typography variant="h6" align="center" sx={{ mb: 4, color: 'text.secondary', fontWeight: 400 }}>
          The best jerky in town, delivered to your door or ready for pickup!
        </Typography>
        <ProductList onAddToCart={handleAddToCart} cartItems={cartItems} onUpdateQty={handleUpdateQty} onOpenCart={() => setCartOpen(true)} />

        <Cart
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          cartItems={cartItems}
          onRemove={handleRemoveFromCart}
          onUpdateQty={handleUpdateQty}
          onCheckout={handleCheckout}
          deliveryType={deliveryType}
          onDeliveryTypeChange={setDeliveryType}
          deliveryDate={deliveryDate}
          onDeliveryDateChange={setDeliveryDate}
        />
        <CheckoutDialog
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          cartItems={cartItems}
          onSubmit={handleOrderSubmit}
          deliveryType={deliveryType}
          deliveryDate={deliveryDate}
        />
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
        />
      </Container>
      <Footer />
      {/* Sticky Cart FAB */}
      <Fab
        color="primary"
        aria-label="cart"
        onClick={() => setCartOpen(true)}
        sx={{
          position: 'fixed',
          right: 32,
          bottom: 32,
          zIndex: 1300,
          boxShadow: 6,
        }}
      >
        <Badge badgeContent={cartItems.length} color="error" overlap="circular">
          <ShoppingCartIcon />
        </Badge>
      </Fab>
    </div>
  );
}

export default App;
