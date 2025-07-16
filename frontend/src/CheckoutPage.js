import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from './App';
import { Typography, TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CheckoutPage() {
  const { cart, clearCart } = useContext(CartContext);
  const [shipping, setShipping] = useState({ naam: '', email: '', straat: '', postcode: '', plaats: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:4000/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setShipping(s => ({
            ...s,
            naam: res.data.name || '',
            straat: res.data.street || '',
            postcode: res.data.postcode || '',
            plaats: res.data.city || '',
            email: res.data.email || ''
          }));
        })
        .finally(() => setProfileLoading(false));
    } else {
      setProfileLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    return /.+@.+\..+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!shipping.naam || !shipping.straat || !shipping.postcode || !shipping.plaats || (!localStorage.getItem('token') && !shipping.email)) {
      setError('Vul alle velden in.');
      return;
    }
    if (!localStorage.getItem('token') && !validateEmail(shipping.email)) {
      setError('Voer een geldig e-mailadres in.');
      return;
    }
    if (cart.length === 0) {
      setError('Je winkelwagen is leeg.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:4000/api/guest-checkout', {
        cart: cart.map(item => ({ productId: item.product.id, quantity: item.quantity })),
        shipping,
      }, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      clearCart();
      navigate(`/confirmation/${response.data.orderId}`);
    } catch (err) {
      setError('Afrekenen mislukt. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) return <CircularProgress />;

  return (
    <Box maxWidth={400} mx="auto">
      <Typography variant="h5" gutterBottom>{localStorage.getItem('token') ? 'Afrekenen' : 'Gast afrekenen'}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Naam"
          name="naam"
          value={shipping.naam}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        { !localStorage.getItem('token') && (
          <TextField
            label="E-mailadres"
            name="email"
            value={shipping.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            type="email"
          />
        )}
        <TextField
          label="Straat en huisnummer"
          name="straat"
          value={shipping.straat}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Postcode"
          name="postcode"
          value={shipping.postcode}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Plaats"
          name="plaats"
          value={shipping.plaats}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Bestelling plaatsen'}
        </Button>
      </form>
    </Box>
  );
}

export default CheckoutPage; 