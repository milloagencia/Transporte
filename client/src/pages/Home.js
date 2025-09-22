import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import StarIcon from '@mui/icons-material/Star';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <LocalShippingIcon fontSize="large" />,
      title: 'Transporte de Pasajeros',
      description: 'Encuentra y ofrece viajes para pasajeros por toda Cuba'
    },
    {
      icon: <BusinessIcon fontSize="large" />,
      title: 'Transporte de Cargas',
      description: 'Servicios de logística y transporte de mercancías'
    },
    {
      icon: <PersonIcon fontSize="large" />,
      title: 'Sistema de Calificaciones',
      description: 'Califica y revisa conductores, pasajeros y negocios'
    },
    {
      icon: <StarIcon fontSize="large" />,
      title: 'Comunicación Integrada',
      description: 'WhatsApp, SMS y llamadas sin proveedores externos'
    }
  ];

  const userRoles = [
    { key: 'chofer', label: 'Chofer', description: 'Ofrece servicios de transporte' },
    { key: 'pasajero', label: 'Pasajero', description: 'Busca viajes y transporte' },
    { key: 'negocio_cargas', label: 'Negocio con Cargas', description: 'Empresas que necesitan transportar mercancías' },
    { key: 'negocio_transporte', label: 'Negocio de Transporte', description: 'Empresas de transporte y logística' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom>
          🚛 Load Board Cuba
        </Typography>
        <Typography variant="h5" color="textSecondary" gutterBottom>
          La plataforma completa de transporte para Cuba
        </Typography>
        <Typography variant="body1" paragraph>
          Conectamos pasajeros, choferes y negocios en una sola plataforma. 
          Sistema de calificaciones, comunicación integrada y control administrativo total.
        </Typography>
        
        {!user && (
          <Box mt={3}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/register')}
              sx={{ mr: 2 }}
            >
              Registrarse
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => navigate('/login')}
            >
              Iniciar Sesión
            </Button>
          </Box>
        )}
        
        {user && (
          <Box mt={3}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/dashboard')}
            >
              Ir al Dashboard
            </Button>
          </Box>
        )}
      </Box>

      {/* Features Section */}
      <Typography variant="h4" component="h2" textAlign="center" gutterBottom mb={4}>
        Características Principales
      </Typography>
      
      <Grid container spacing={4} mb={6}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <Box color="primary.main" mb={2}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* User Roles Section */}
      <Typography variant="h4" component="h2" textAlign="center" gutterBottom mb={4}>
        Tipos de Usuario
      </Typography>
      
      <Grid container spacing={3} mb={6}>
        {userRoles.map((role, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Chip 
                    label={role.label} 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {role.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Admin Features */}
      <Box textAlign="center" mt={6} p={4} bgcolor="grey.100" borderRadius={2}>
        <Typography variant="h5" component="h3" gutterBottom>
          Control Administrativo Total
        </Typography>
        <Typography variant="body1" paragraph>
          Los administradores tienen control completo del sistema con capacidades de:
        </Typography>
        <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1}>
          <Chip label="Lista Negra de Usuarios" />
          <Chip label="Verificación Manual de Teléfonos" />
          <Chip label="Moderación de Calificaciones" />
          <Chip label="Resolución de Disputas" />
          <Chip label="Monitoreo del Sistema" />
        </Box>
      </Box>
    </Container>
  );
};

export default Home;