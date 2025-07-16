import React, { useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, Badge } from '@mui/material';
import ProductCatalog from './ProductCatalog';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import ConfirmationPage from './ConfirmationPage';
import AdminPanel from './AdminPanel';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import OrdersPage from './OrdersPage';

export const CartContext = createContext();

function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCart(prev => prev.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = React.useState(!!localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    window.location.href = '/';
  };

  React.useEffect(() => {
    const onStorage = () => setLoggedIn(!!localStorage.getItem('token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <CartProvider>
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              USB-C Cable Shop
            </Typography>
            <Button color="inherit" component={Link} to="/">Products</Button>
            <Button color="inherit" component={Link} to="/cart">Cart</Button>
            {loggedIn ? (
              <>
                <Button color="inherit" component={Link} to="/orders">Mijn Bestellingen</Button>
                <Button color="inherit" onClick={handleLogout}>Uitloggen</Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">Inloggen</Button>
                <Button color="inherit" component={Link} to="/register">Registreren</Button>
              </>
            )}
            <Button color="inherit" component={Link} to="/admin">Admin</Button>
          </Toolbar>
        </AppBar>
        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<ProductCatalog />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation/:orderId" element={<ConfirmationPage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </Container>
      </Router>
    </CartProvider>
  );
}

export default App; 