import React, { useEffect, useState, useContext } from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Button, CircularProgress, Snackbar } from '@mui/material';
import axios from 'axios';
import { CartContext } from './App';

function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:4000/api/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    setSnackbarOpen(true);
  };

  if (loading) return <CircularProgress />;

  return (
    <>
      <Grid container spacing={3}>
        {products.map(product => (
          <Grid item xs={12} sm={6} md={4} key={product.id} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card sx={{ width: 300, height: 350, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <CardMedia
                component="img"
                height="140"
                image={product.image}
                alt={product.name}
                sx={{ objectFit: 'contain', p: 2, background: '#fafafa' }}
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <Typography gutterBottom variant="h6" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.description}
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle1" sx={{ mt: 1 }}>
                    ${product.price.toFixed(2)}
                  </Typography>
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleAddToCart(product)} fullWidth>
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="Item added to cart"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}

export default ProductCatalog; 