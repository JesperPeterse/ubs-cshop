import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, Divider } from '@mui/material';
import axios from 'axios';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Je bent niet ingelogd.');
      setLoading(false);
      return;
    }
    axios.get('http://localhost:4000/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Kon bestellingen niet ophalen. Log opnieuw in.');
        setLoading(false);
      });
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box maxWidth={700} mx="auto">
      <Typography variant="h5" gutterBottom>Mijn Bestellingen</Typography>
      {orders.length === 0 ? (
        <Typography>Geen bestellingen gevonden.</Typography>
      ) : (
        <List>
          {orders.map(order => (
            <React.Fragment key={order.id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={`Order #${order.id} — €${order.total.toFixed(2)} — ${new Date(order.createdAt).toLocaleString()}`}
                  secondary={
                    <>
                      {order.items.map(item => (
                        <div key={item.id}>
                          {item.product.name} &times; {item.quantity} — €{item.price.toFixed(2)} per stuk
                        </div>
                      ))}
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
}

export default OrdersPage; 