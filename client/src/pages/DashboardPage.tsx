import React from 'react';
import { Typography, Box, Card, CardContent, Grid, Chip, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getRoleWelcome = () => {
    switch (user?.role) {
      case 'admin':
        return 'Panel de Administración';
      case 'driver':
        return 'Dashboard del Conductor';
      case 'passenger':
        return 'Dashboard del Pasajero';
      case 'cargo_business':
        return 'Dashboard de Negocio con Cargas';
      case 'transport_business':
        return 'Dashboard de Negocio de Transporte';
      default:
        return 'Dashboard';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {getRoleWelcome()}
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Bienvenido, {user?.firstName} {user?.lastName}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información de la Cuenta
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography><strong>Email:</strong> {user?.email}</Typography>
                <Typography><strong>Teléfono:</strong> {user?.phone}</Typography>
                <Typography><strong>WhatsApp:</strong> {user?.whatsappNumber}</Typography>
                <Typography><strong>Ciudad:</strong> {user?.address.city}</Typography>
                <Typography><strong>Provincia:</strong> {user?.address.province}</Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={`Estado: ${user?.verificationStatus}`}
                    color={user?.verificationStatus === 'verified' ? 'success' : 'warning'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={`Calificación: ${user?.rating.average.toFixed(1)} ⭐ (${user?.rating.totalRatings})`}
                    color="primary"
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Acciones Rápidas
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/search')}
                  fullWidth
                >
                  Buscar Viajes
                </Button>
                
                {(['driver', 'transport_business'].includes(user?.role || '')) && (
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/create-trip')}
                    fullWidth
                  >
                    Crear Nuevo Viaje
                  </Button>
                )}
                
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/profile')}
                  fullWidth
                >
                  Editar Perfil
                </Button>
                
                {user?.role === 'admin' && (
                  <Button 
                    variant="contained" 
                    color="error"
                    onClick={() => navigate('/admin')}
                    fullWidth
                  >
                    Panel de Admin
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actividad Reciente
              </Typography>
              <Typography color="text.secondary">
                Aquí aparecerán tus viajes recientes, reservas y calificaciones.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;