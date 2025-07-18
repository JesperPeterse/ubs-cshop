import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [naam, setNaam] = useState('');
  const [straat, setStraat] = useState('');
  const [postcode, setPostcode] = useState('');
  const [plaats, setPlaats] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      await axios.post('http://localhost:4000/api/register', {
        email,
        password,
        name: naam,
        street: straat,
        postcode,
        city: plaats
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError('Registratie mislukt. E-mailadres al in gebruik?');
    }
  };

  return (
    <Box maxWidth={400} mx="auto">
      <Typography variant="h5" gutterBottom>Registreren</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Registratie gelukt! Je wordt doorgestuurd...</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField label="E-mailadres" type="email" value={email} onChange={e => setEmail(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Wachtwoord" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Naam" value={naam} onChange={e => setNaam(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Straat en huisnummer" value={straat} onChange={e => setStraat(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Postcode" value={postcode} onChange={e => setPostcode(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Plaats" value={plaats} onChange={e => setPlaats(e.target.value)} fullWidth margin="normal" required />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Registreren
        </Button>
      </form>
    </Box>
  );
}

export default RegisterPage; 