import React, { useContext, useState } from 'react';
import { CartContext } from './App';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // State for confirmation dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const handleDeleteClick = (productId) => {
    setToDelete(productId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    removeFromCart(toDelete);
    setConfirmOpen(false);
    setToDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setToDelete(null);
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>Cart</Typography>
      {cart.length === 0 ? (
        <Typography variant="body1">Your cart is empty.</Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Subtotal</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map(item => (
                  <TableRow key={item.product.id}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell>${item.product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={item.quantity}
                        inputProps={{ min: 1, style: { width: 50 } }}
                        onChange={e => updateQuantity(item.product.id, Math.max(1, Number(e.target.value)))}
                      />
                    </TableCell>
                    <TableCell>${(item.product.price * item.quantity).toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleDeleteClick(item.product.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="h6" sx={{ mb: 2 }}>Total: ${total.toFixed(2)}</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/checkout')}>Proceed to Checkout</Button>

          {/* Confirmation Dialog */}
          <Dialog open={confirmOpen} onClose={handleCancelDelete}>
            <DialogTitle>Remove Item</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to remove this item from your cart?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDelete}>Cancel</Button>
              <Button onClick={handleConfirmDelete} color="error">Remove</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </div>
  );
}

export default CartPage; 