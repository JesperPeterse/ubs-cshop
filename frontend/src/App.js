import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, Badge, Menu, MenuItem, Avatar } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
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
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

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

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = React.useState(!!localStorage.getItem('token'));
  const [userName, setUserName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLogoutMenu = () => {
    handleLogout();
    handleMenuClose();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch('http://localhost:4000/api/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUserName(data.name || data.email);
          }
        } catch {}
      } else {
        setUserName('');
      }
    };
    fetchProfile();
    const onStorage = () => {
      setLoggedIn(!!localStorage.getItem('token'));
      fetchProfile();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <CartProvider>
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              USB-C Cable Shop
            </Typography>
            <Button color="inherit" component={Link} to="/">Products</Button>
            <CartContext.Consumer>
              {({ cart }) => (
                <Button color="inherit" component={Link} to="/cart">
                  <Badge badgeContent={cart.reduce((sum, item) => sum + item.quantity, 0)} color="secondary">
                    Cart
                  </Badge>
                </Button>
              )}
            </CartContext.Consumer>
            {loggedIn && userName && (
              <>
                <Button
                  color="inherit"
                  onClick={handleMenuClick}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderBottom: open ? 2 : 0,
                    borderColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    backgroundColor: open ? 'action.selected' : 'inherit',
                    '&:hover': { backgroundColor: 'action.hover', cursor: 'pointer' }
                  }}
                  endIcon={<ArrowDropDownIcon />}
                  startIcon={<AccountCircleIcon />}
                >
                  Hallo {userName}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem component={Link} to="/orders" onClick={handleMenuClose}>Mijn Bestellingen</MenuItem>
                  <MenuItem onClick={handleLogoutMenu}>Uitloggen</MenuItem>
                </Menu>
              </>
            )}
            {!loggedIn && (
              <>
                <Button color="inherit" component={Link} to="/login">Inloggen</Button>
                <Button color="inherit" component={Link} to="/register">Registreren</Button>
              </>
            )}
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