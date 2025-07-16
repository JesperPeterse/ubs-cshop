import React, { useEffect, useState } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', image: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    axios.get('http://localhost:4000/api/products').then(res => {
      setProducts(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenDialog = (product = null) => {
    setEditProduct(product);
    setForm(product ? { ...product, price: product.price.toString() } : { name: '', description: '', price: '', image: '' });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditProduct(null);
    setForm({ name: '', description: '', price: '', image: '' });
  };

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      setSnackbar('Name and price are required');
      return;
    }
    try {
      if (editProduct) {
        await axios.put(`http://localhost:4000/api/products/${editProduct.id}`, {
          ...form,
          price: parseFloat(form.price)
        });
        setSnackbar('Product updated');
      } else {
        await axios.post('http://localhost:4000/api/products', {
          ...form,
          price: parseFloat(form.price)
        });
        setSnackbar('Product added');
      }
      handleCloseDialog();
      fetchProducts();
    } catch (err) {
      setSnackbar('Error saving product');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`http://localhost:4000/api/products/${id}`);
      setSnackbar('Product deleted');
      fetchProducts();
    } catch (err) {
      setSnackbar('Error deleting product');
    }
  };

  return (
    <Box maxWidth={900} mx="auto">
      <Typography variant="h4" gutterBottom>Admin Panel</Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => handleOpenDialog()}>Add Product</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(product => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>€{product.price.toFixed(2)}</TableCell>
                <TableCell>{product.image ? <img src={product.image} alt={product.name} style={{ width: 60 }} /> : ''}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(product)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(product.id)} color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" name="name" value={form.name} onChange={handleFormChange} fullWidth margin="normal" required />
          <TextField label="Description" name="description" value={form.description} onChange={handleFormChange} fullWidth margin="normal" />
          <TextField label="Price" name="price" value={form.price} onChange={handleFormChange} fullWidth margin="normal" required type="number" />
          <TextField label="Image URL" name="image" value={form.image} onChange={handleFormChange} fullWidth margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!snackbar} autoHideDuration={2000} onClose={() => setSnackbar('')} message={snackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}

export default AdminPanel; 