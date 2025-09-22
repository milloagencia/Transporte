import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'pasajero',
    // Vehicle info for drivers
    vehicleInfo: {
      make: '',
      model: '',
      year: '',
      plateNumber: '',
      capacity: '',
      type: 'passenger'
    },
    // Business info for businesses
    businessInfo: {
      name: '',
      description: '',
      registrationNumber: '',
      services: []
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('vehicle.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        vehicleInfo: {
          ...formData.vehicleInfo,
          [field]: value
        }
      });
    } else if (name.startsWith('business.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        businessInfo: {
          ...formData.businessInfo,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    const submitData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role
    };

    // Add role-specific data
    if (formData.role === 'chofer') {
      submitData.vehicleInfo = formData.vehicleInfo;
    } else if (['negocio_cargas', 'negocio_transporte'].includes(formData.role)) {
      submitData.businessInfo = formData.businessInfo;
    }

    const result = await register(submitData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'chofer': 'Chofer',
      'pasajero': 'Pasajero',
      'negocio_cargas': 'Negocio con Cargas',
      'negocio_transporte': 'Negocio de Transporte'
    };
    return roleNames[role] || role;
  };

  const showVehicleFields = formData.role === 'chofer';
  const showBusinessFields = ['negocio_cargas', 'negocio_transporte'].includes(formData.role);

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Registro
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="name"
                  label="Nombre Completo"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="email"
                  label="Correo Electrónico"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="phone"
                  label="Teléfono"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Usuario</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <MenuItem value="pasajero">Pasajero</MenuItem>
                    <MenuItem value="chofer">Chofer</MenuItem>
                    <MenuItem value="negocio_cargas">Negocio con Cargas</MenuItem>
                    <MenuItem value="negocio_transporte">Negocio de Transporte</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirmar Contraseña"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            {showVehicleFields && (
              <>
                <Divider sx={{ my: 3 }}>
                  <Typography variant="h6">Información del Vehículo</Typography>
                </Divider>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="vehicle.make"
                      label="Marca del Vehículo"
                      value={formData.vehicleInfo.make}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="vehicle.model"
                      label="Modelo"
                      value={formData.vehicleInfo.model}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      name="vehicle.year"
                      label="Año"
                      type="number"
                      value={formData.vehicleInfo.year}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      name="vehicle.plateNumber"
                      label="Número de Placa"
                      value={formData.vehicleInfo.plateNumber}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      name="vehicle.capacity"
                      label="Capacidad"
                      type="number"
                      value={formData.vehicleInfo.capacity}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Tipo de Transporte</InputLabel>
                      <Select
                        name="vehicle.type"
                        value={formData.vehicleInfo.type}
                        onChange={handleChange}
                      >
                        <MenuItem value="passenger">Pasajeros</MenuItem>
                        <MenuItem value="cargo">Cargas</MenuItem>
                        <MenuItem value="both">Ambos</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </>
            )}

            {showBusinessFields && (
              <>
                <Divider sx={{ my: 3 }}>
                  <Typography variant="h6">Información del Negocio</Typography>
                </Divider>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="business.name"
                      label="Nombre del Negocio"
                      value={formData.businessInfo.name}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="business.description"
                      label="Descripción"
                      multiline
                      rows={3}
                      value={formData.businessInfo.description}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="business.registrationNumber"
                      label="Número de Registro"
                      value={formData.businessInfo.registrationNumber}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
            <Box textAlign="center">
              <Link component={RouterLink} to="/login" variant="body2">
                ¿Ya tienes cuenta? Inicia sesión aquí
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;