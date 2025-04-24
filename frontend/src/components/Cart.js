import React, { useEffect, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import DeleteIcon from '@mui/icons-material/Delete';

import { getDeliveryDates } from '../api/deliveryDates';

const Cart = ({ open, onClose, cartItems = [], onRemove, onCheckout, onUpdateQty, deliveryType, onDeliveryTypeChange, deliveryDate, onDeliveryDateChange }) => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [deliveryDates, setDeliveryDates] = useState([]);
  useEffect(() => {
    getDeliveryDates().then(dates => {
      setDeliveryDates(dates);
      // If deliveryDate is missing or empty, set it to the first date as an object
      if (dates.length > 0 && (!deliveryDate || !deliveryDate.id)) {
        const first = dates[0];
        const raw = first.date || first;
        const id = first._id || raw;
        const d = new Date(raw);
        const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        onDeliveryDateChange({ id, label, raw });
      }
    });
    // eslint-disable-next-line
  }, []);

  const [selectedDate, setSelectedDate] = useState(deliveryDate?.id || '');

  useEffect(() => {
    // Keep local selection in sync with parent
    setSelectedDate(deliveryDate?.id || '');
  }, [deliveryDate]);

  const handleDateChange = (event) => {
    const selectedId = event.target.value;
    setSelectedDate(selectedId);
    const selectedObj = deliveryDates.find(date => (date._id || date) === selectedId);
    let label = '';
    let raw = '';
    if (selectedObj) {
      raw = selectedObj.date || selectedObj;
      const d = new Date(raw);
      label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }
    onDeliveryDateChange({ id: selectedId, label, raw });
  };


  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          mb: 10, // leaves space for bottom FAB
          borderTopRightRadius: 24,
          borderBottomRightRadius: 0,
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 0,
          maxWidth: 400,
          width: '100%',
        }
      }}
    >
      <Box sx={{ width: 380, p: 0 }}>
        {/* Cart Header */}
        <Box sx={{ borderBottom: '1px solid #e0e0e0', px: 3, py: 2, bgcolor: 'background.paper', position: 'relative' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center' }}>
            Cart
          </Typography>
      <IconButton onClick={onClose} sx={{ color: 'grey.700', position: 'absolute', top: 12, right: 12 }} aria-label="Close cart">
        <span style={{ fontSize: 26, fontWeight: 700, color: '#b71c1c' }}>&times;</span>
      </IconButton>
      {/* Pickup/Delivery Selector */}
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography sx={{ fontWeight: 600, mb: 1, fontSize: 16 }}>Order Type:</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={deliveryType === 'pickup' ? 'contained' : 'outlined'}
            onClick={() => onDeliveryTypeChange('pickup')}
            sx={{ fontWeight: 700, borderRadius: 2, px: 3, fontSize: 15 }}
            color={deliveryType === 'pickup' ? 'primary' : 'inherit'}
          >
            Pickup
          </Button>
          <Button
            variant={deliveryType === 'delivery' ? 'contained' : 'outlined'}
            onClick={() => onDeliveryTypeChange('delivery')}
            sx={{ fontWeight: 700, borderRadius: 2, px: 3, fontSize: 15 }}
            color={deliveryType === 'delivery' ? 'primary' : 'inherit'}
          >
            Delivery ($1.99)
          </Button>
        </Box>
      </Box>
    </Box>
    <Box sx={{ px: 3, py: 2 }}>
      <List sx={{ mb: 1 }}>
        {cartItems.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center', color: 'grey.500' }}>
            <img src="https://firebasestorage.googleapis.com/v0/b/moes-jerky-dd53f.firebasestorage.app/o/logo.png?alt=media&token=e721a51b-0de2-4925-bbcb-5001f6109745" alt="Empty Cart" style={{ width: 48, opacity: 0.15, marginBottom: 8 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'text.secondary', mb: 1 }}>
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add some delicious jerky!
            </Typography>
          </Box>
        ) : (
          cartItems.map((item) => (
            <ListItem key={item._id} sx={{ alignItems: 'center', mb: 1, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
              <ListItemText
                primary={<Typography sx={{ fontWeight: 600, color: 'text.primary' }}>{item.name}</Typography>}
                secondary={<span style={{ color: '#555', fontWeight: 400 }}>${item.price.toFixed(2)} x {item.quantity}</span>}
              />
              <Button size="small" variant="outlined" onClick={() => item.quantity === 1 ? onRemove(item._id) : onUpdateQty(item._id, item.quantity - 1)} sx={{ minWidth: 28, color: 'primary.main', fontWeight: 700, borderColor: 'primary.main', mx: 0.5 }}>
                -
              </Button>
              <Typography sx={{ mx: 1, fontWeight: 700, color: 'primary.main', display: 'inline-block', minWidth: 22, textAlign: 'center' }}>{item.quantity}</Typography>
              <Button size="small" variant="outlined" onClick={() => onUpdateQty(item._id, item.quantity + 1)} sx={{ minWidth: 28, color: 'primary.main', fontWeight: 700, borderColor: 'primary.main', mx: 0.5 }}>
                +
              </Button>
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => onRemove(item._id)} sx={{ color: 'primary.main' }}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))
        )}
      </List>
      <Box sx={{ my: 2 }}>
        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: 0 }} />
      </Box>
      <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 0.5, px: 2, py: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: 0.5 }}>
            Subtotal
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            ${subtotal.toFixed(2)}
          </Typography>
        </Box>
        {deliveryType === 'delivery' && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Delivery Fee</Typography>
            <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>$1.99</Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: 0.5 }}>Total</Typography>
          <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>${(subtotal + (deliveryType === 'delivery' ? 1.99 : 0)).toFixed(2)}</Typography>
        </Box>
      </Box>
      <FormControl fullWidth sx={{ mt: 2, mb: 1 }} size="small">
        <InputLabel id="delivery-date-label" sx={{ fontWeight: 600, color: 'primary.main' }}>Delivery/Pickup Date</InputLabel>
        <Select
          labelId="delivery-date-label"
          value={selectedDate}
          label="Delivery/Pickup Date"
          onChange={handleDateChange}
          sx={{ fontWeight: 600, bgcolor: '#fff', borderRadius: 2 }}
        >
          {deliveryDates.map((date) => {
  const raw = date.date || date;
  const d = new Date(raw);
  const formatted = d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  return (
    <MenuItem key={date._id || raw} value={date._id || raw}>
      {formatted}
    </MenuItem>
  );
})}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 1, borderRadius: 2, fontWeight: 700, fontSize: 16, py: 1.1, boxShadow: 'none', letterSpacing: 0.5 }}
        disabled={cartItems.length === 0}
        onClick={onCheckout}
      >
        Checkout
      </Button>
    </Box>
  </Box>
</Drawer>

  );
};

export default Cart;
