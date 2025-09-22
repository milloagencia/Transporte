import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'admin': 'Administrador',
      'chofer': 'Chofer',
      'pasajero': 'Pasajero',
      'negocio_cargas': 'Negocio de Cargas',
      'negocio_transporte': 'Negocio de Transporte'
    };
    return roleNames[role] || role;
  };

  const getWelcomeMessage = (role) => {
    const messages = {
      'admin': '¡Bienvenido al panel de administración! Aquí puedes gestionar usuarios, verificar cuentas y moderar contenido.',
      'chofer': '¡Bienvenido! Como chofer puedes crear ofertas de viaje y gestionar tus servicios de transporte.',
      'pasajero': '¡Bienvenido! Busca viajes disponibles y haz tus reservas de manera fácil y segura.',
      'negocio_cargas': '¡Bienvenido! Encuentra servicios de transporte para tus mercancías y cargas.',
      'negocio_transporte': '¡Bienvenido! Ofrece tus servicios de transporte y logística a otros negocios.'
    };
    return messages[role] || '¡Bienvenido a la plataforma!';
  };

  const getQuickActions = (role) => {
    const actions = {
      'admin': [
        { label: 'Panel de Administración', path: '/admin', icon: <AdminPanelSettingsIcon /> },
        { label: 'Ver Usuarios', path: '/admin/users', icon: <PersonIcon /> },
        { label: 'Ver Viajes', path: '/listings', icon: <DirectionsCarIcon /> }
      ],
      'chofer': [
        { label: 'Crear Viaje', path: '/listings/create', icon: <DirectionsCarIcon /> },
        { label: 'Mis Viajes', path: '/listings', icon: <DirectionsCarIcon /> },
        { label: 'Mis Reservas', path: '/bookings', icon: <BookmarkIcon /> }
      ],
      'pasajero': [
        { label: 'Buscar Viajes', path: '/listings', icon: <DirectionsCarIcon /> },
        { label: 'Mis Reservas', path: '/bookings', icon: <BookmarkIcon /> },
        { label: 'Mi Perfil', path: '/profile', icon: <PersonIcon /> }
      ],
      'negocio_cargas': [
        { label: 'Buscar Transporte', path: '/listings?type=cargo', icon: <DirectionsCarIcon /> },
        { label: 'Mis Solicitudes', path: '/bookings', icon: <BookmarkIcon /> },
        { label: 'Mi Perfil', path: '/profile', icon: <PersonIcon /> }
      ],
      'negocio_transporte': [
        { label: 'Crear Servicio', path: '/listings/create', icon: <DirectionsCarIcon /> },
        { label: 'Mis Servicios', path: '/listings', icon: <DirectionsCarIcon /> },
        { label: 'Mis Clientes', path: '/bookings', icon: <BookmarkIcon /> }
      ]
    };
    return actions[role] || [];
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <DashboardIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1">
              Dashboard
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <Typography variant="h6" sx={{ mr: 2 }}>
                {user?.name}
              </Typography>
              <Chip 
                label={getRoleDisplayName(user?.role)} 
                color="primary" 
                variant="outlined"
              />
              {user?.verified && (
                <Chip 
                  label="Verificado" 
                  color="success" 
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </Box>
        </Box>
        
        <Typography variant="body1" color="textSecondary">
          {getWelcomeMessage(user?.role)}
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" component="h2" gutterBottom>
            Acciones Rápidas
          </Typography>
          
          <Grid container spacing={2}>
            {getQuickActions(user?.role).map((action, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    cursor: 'pointer',
                    '&:hover': { elevation: 4 }
                  }}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box color="primary.main" mb={1}>
                      {action.icon}
                    </Box>
                    <Typography variant="h6" component="div">
                      {action.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Profile Summary */}
        <Grid item xs={12} md={4}>
          <Typography variant="h5" component="h2" gutterBottom>
            Mi Perfil
          </Typography>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información Personal
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Email:</strong> {user?.email}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Teléfono:</strong> {user?.phone}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Estado:</strong> {user?.verified ? 'Verificado' : 'Pendiente de verificación'}
              </Typography>
              
              {user?.rating && (
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Calificación:</strong> {user.rating.average || 0}/5 
                    {user.rating.count > 0 && ` (${user.rating.count} calificaciones)`}
                  </Typography>
                </Box>
              )}

              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => navigate('/profile')}
              >
                Editar Perfil
              </Button>
            </CardContent>
          </Card>

          {!user?.verified && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" color="warning.main" gutterBottom>
                  ⚠️ Cuenta No Verificada
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Tu cuenta está pendiente de verificación. Un administrador revisará tu información pronto.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;