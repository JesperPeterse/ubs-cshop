import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress, Alert, Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function ConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:4000/api/orders/${orderId}`)
      .then(res => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Bestelling niet gevonden.');
        setLoading(false);
      });
  }, [orderId]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box maxWidth={500} mx="auto">
      <Typography variant="h5" gutterBottom>Bedankt voor je bestelling!</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Je ordernummer is <b>{order.id}</b>.<br />
        Totaalbedrag: <b>€{order.total.toFixed(2)}</b>
      </Typography>
      <Typography variant="h6" sx={{ mt: 3 }}>Bestelde producten:</Typography>
      <ul>
        {order.items.map(item => (
          <li key={item.id}>
            {item.product.name} &times; {item.quantity} — €{item.price.toFixed(2)} per stuk
          </li>
        ))}
      </ul>
    </Box>
  );
}

export default ConfirmationPage; 