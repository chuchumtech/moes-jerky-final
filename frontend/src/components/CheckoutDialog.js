import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SquarePaymentForm from './SquarePaymentForm';
import PlacesAutocomplete from 'react-places-autocomplete';
import axios from 'axios';





const DELIVERY_FEE = 1.99;
const CREDIT_MIN = 15;

const SQUARE_APP_ID = 'sandbox-sq0idb-LEAuGlM5uV3GUPF741VOOw';
const SQUARE_LOCATION_ID = 'LEJEJJ3DENNN4';

const CheckoutDialog = ({ open, onClose, cartItems = [], onSubmit, deliveryType, deliveryDate }) => {
  // deliveryDate: { id, label, raw }

  // Load Google Maps script for Places Autocomplete
  

  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [fields, setFields] = useState({ name: '', phone: '', email: '', address: '' });
  const [errors, setErrors] = useState({});
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = deliveryType === 'delivery' ? subtotal + DELIVERY_FEE : subtotal;

  // If total drops below $15, auto-select Zelle
  React.useEffect(() => {
    if (total < CREDIT_MIN && paymentMethod !== 'zelle') {
      setPaymentMethod('zelle');
    }
    // Do not auto-switch if total goes above $15
    // eslint-disable-next-line
  }, [total]);


  const validate = () => {
    let newErrors = {};
    if (!fields.name) newErrors.name = 'Required';
    if (!fields.phone) newErrors.phone = 'Required';
    if (!fields.email) newErrors.email = 'Required';
    if (deliveryType === 'delivery' && !fields.address) newErrors.address = 'Required';
    if (paymentMethod === 'credit' && total < CREDIT_MIN) {
      newErrors.payment = `Credit card minimum is $${CREDIT_MIN}`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };



  const handleCreditPayment = async (token) => {
    setPaying(true);
    setPaymentError('');
    try {
      const resp = await axios.post('http://localhost:3050/api/square/pay', {
        sourceId: token,
        amount: total,
        orderInfo: { name: fields.name, email: fields.email },
      });
      if (resp.data.success) {
        handleFinalSubmit('paid', resp.data.payment);
      } else {
        setPaymentError(resp.data.error || 'Payment failed');
      }
    } catch (err) {
      setPaymentError(err.response?.data?.error || err.message);
    } finally {
      setPaying(false);
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setPaying(true);
    if (paymentMethod === 'credit') {
      // Instead of dispatching a native form submit, trigger SquarePaymentForm's tokenization
      if (window.squareCardOnToken) {
        window.squareCardOnToken(); // Will call handleCreditPayment with the token
      } else {
        setPaymentError('Credit card form not ready. Please try again.');
        setPaying(false);
      }
      return;
    }
    handleFinalSubmit('pending');
    setPaying(false);
  };

  // Expose a global function for SquarePaymentForm to call when "Place Order" is clicked
  React.useEffect(() => {
    window.squareCardOnToken = null;
    if (paymentMethod === 'credit') {
      window.squareCardOnToken = () => {
        if (window.squareCardTokenize) {
          window.squareCardTokenize();
        }
      };
    }
    return () => {
      window.squareCardOnToken = null;
    };
  }, [paymentMethod]);

  const handleFinalSubmit = (paymentStatus, paymentInfo) => {
    onSubmit({
      ...fields,
      deliveryType,
      deliveryDate: deliveryDate.id,
      deliveryDateLabel: deliveryDate.label,
      paymentMethod,
      cartItems,
      subtotal,
      deliveryFee: deliveryType === 'delivery' ? DELIVERY_FEE : 0,
      total,
      paymentStatus,
      paymentInfo,
    });
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 8, bgcolor: '#f7f8fa', boxShadow: 10 } }}>
      <DialogTitle sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1, textAlign: 'center', py: 3, fontSize: 28, bgcolor: '#fff', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
        Checkout
      </DialogTitle>
      <DialogContent sx={{ pb: 0, px: { xs: 1, sm: 4 }, pt: 1 }}>
        <Box sx={{ bgcolor: '#fff', borderRadius: 3, px: { xs: 2, sm: 5 }, py: 2, mb: 2, width: '100%', maxWidth: 520, mx: 'auto' }}>
          <FormLabel component="legend" sx={{ fontWeight: 700, color: 'primary.main', mb: 1.5, mt: 2, fontSize: 16, textAlign: 'left', pl: 0 }}>
            Payment Information
          </FormLabel>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
            <Button
              variant={paymentMethod === 'credit' ? 'contained' : 'outlined'}
              color={paymentMethod === 'credit' ? 'primary' : 'inherit'}
              onClick={() => setPaymentMethod('credit')}
              disabled={total < CREDIT_MIN}
              sx={{ fontWeight: 700, fontSize: 16, px: 4, py: 1.2, borderRadius: 2, minWidth: 160 }}
            >
              Credit Card
            </Button>
            <Button
              variant={paymentMethod === 'zelle' ? 'contained' : 'outlined'}
              color={paymentMethod === 'zelle' ? 'primary' : 'inherit'}
              onClick={() => setPaymentMethod('zelle')}
              sx={{ fontWeight: 700, fontSize: 16, px: 4, py: 1.2, borderRadius: 2, minWidth: 160 }}
            >
              Zelle
            </Button>
          </Box>
          {total < CREDIT_MIN && (
            <Typography color="error" sx={{ mt: 0, mb: 1, fontWeight: 600, fontSize: 15, textAlign: 'center' }}>
              $15 minimum for credit card orders
            </Typography>
          )}
          {errors.payment && (
            <Typography color="error" sx={{ mt: 1, fontWeight: 600, fontSize: 16 }}>{errors.payment}</Typography>
          )}
        </Box>
        <Box sx={{ bgcolor: '#fff', borderRadius: 3, px: { xs: 2, sm: 5 }, py: 2, mb: 2, width: '100%', maxWidth: 520, mx: 'auto' }}>
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', py: 2, maxWidth: 520, mx: 'auto' }}>
            <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: 520 }}>
              <TextField
                label="Name"
                name="name"
                value={fields.name}
                onChange={handleFieldChange}
                error={!!errors.name}
                helperText={errors.name}
                size="small"
                sx={{ flex: 1, mb: 0, fontSize: 16 }}
                InputProps={{ sx: { fontSize: 16, py: 0.7 } }}
                InputLabelProps={{ sx: { fontSize: 14 } }}
              />
              <TextField
                label="Phone"
                name="phone"
                value={fields.phone}
                onChange={handleFieldChange}
                error={!!errors.phone}
                helperText={errors.phone}
                size="small"
                sx={{ flex: 1, mb: 0, fontSize: 16 }}
                InputProps={{ sx: { fontSize: 16, py: 0.7 } }}
                InputLabelProps={{ sx: { fontSize: 14 } }}
              />
            </Box>
            <TextField
              label="Email"
              name="email"
              value={fields.email}
              onChange={handleFieldChange}
              error={!!errors.email}
              helperText={errors.email}
              size="small"
              sx={{ width: '100%', maxWidth: 520, mb: 2, fontSize: 16 }}
              InputProps={{ sx: { fontSize: 16, py: 0.7 } }}
              InputLabelProps={{ sx: { fontSize: 14 } }}
            />
            {deliveryType === 'delivery' && (
              <PlacesAutocomplete
                value={fields.address}
                onChange={address => setFields({ ...fields, address })}
                onSelect={address => setFields({ ...fields, address })}
                searchOptions={{ types: ['address'] }}
              >
                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                  <div style={{ width: '100%', maxWidth: 520, marginBottom: 16 }}>
                    <TextField
                      label="Delivery Address"
                      name="address"
                      {...getInputProps({
                        placeholder: 'Enter delivery address',
                      })}
                      error={!!errors.address}
                      helperText={errors.address}
                      size="small"
                      sx={{ width: '100%', maxWidth: 520, mb: 2, fontSize: 16 }}
                      InputProps={{ sx: { fontSize: 16, py: 0.7 } }}
                      InputLabelProps={{ sx: { fontSize: 14 } }}
                    />
                    <div style={{ position: 'absolute', zIndex: 1000, background: '#fff', width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                      {loading && <div>Loading...</div>}
                      {suggestions.map(suggestion => {
                        const style = {
                          backgroundColor: suggestion.active ? '#f0f0f0' : '#fff',
                          padding: '8px 16px',
                          cursor: 'pointer',
                        };
                        return (
                          <div {...getSuggestionItemProps(suggestion, { style })} key={suggestion.placeId || suggestion.description}>
                            {suggestion.description}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </PlacesAutocomplete>
            )}

            {paymentMethod === 'credit' && total >= CREDIT_MIN && (
              <div style={{ width: '100%', maxWidth: 520 }}>
                <SquarePaymentForm
                  applicationId={SQUARE_APP_ID}
                  locationId={SQUARE_LOCATION_ID}
                  onToken={handleCreditPayment}
                  onError={setPaymentError}
                  disabled={paying}
                />
              </div>
            )}
            {paymentError && (
              <Typography color="error" sx={{ mt: 1, fontWeight: 600, fontSize: 16 }}>{paymentError}</Typography>
            )}
          </Box>
        </Box>
        {/* Order summary always visible at bottom */}
        <Box sx={{ my: 3, p: 2.5, bgcolor: '#fff', borderRadius: 3, boxShadow: 0, border: '1px solid #e0e0e0', position: 'sticky', top: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', mb: 2, letterSpacing: 0.5, fontSize: 20 }}>
            Order Summary
          </Typography>
          {cartItems.map((item) => (
            <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: 16 }}>{item.name} × {item.quantity}</Typography>
              <Typography sx={{ fontWeight: 500, color: 'text.primary', fontSize: 16 }}>${(item.price * item.quantity).toFixed(2)}</Typography>
            </Box>
          ))}
          <Box sx={{ my: 1 }}><hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: 0 }} /></Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <Typography>Subtotal</Typography>
            <Typography>${subtotal.toFixed(2)}</Typography>
          </Box>
          {deliveryType === 'delivery' && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Delivery Fee</Typography>
              <Typography>${DELIVERY_FEE.toFixed(2)}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: 0.5 }}>Total</Typography>
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 900 }}>${total.toFixed(2)}</Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 3, bgcolor: '#fff', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, mt: 1 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, fontWeight: 700, px: 4, py: 1.2, fontSize: 16, color: 'primary.main', border: '2px solid #b71c1c', mr: 2 }}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ minWidth: 160, fontWeight: 800, borderRadius: 2, bgcolor: 'primary.main', color: '#fff', letterSpacing: 0.5, boxShadow: 'none', fontSize: 18, py: 1.2, '&:hover': { bgcolor: '#8a1e1e' } }}
          disabled={paying}
        >
          {paying ? 'Processing...' : 'Place Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );

};

export default CheckoutDialog;
