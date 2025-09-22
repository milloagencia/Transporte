import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Container,
  Chip,
  Stack,
} from '@mui/material';
import {
  DirectionsCar,
  LocalShipping,
  People,
  Business,
  Star,
  Security,
  WhatsApp,
  Phone,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <DirectionsCar fontSize="large" color="primary" />,
      title: 'Transporte de Pasajeros',
      description: 'Encuentra o ofrece viajes para pasajeros en toda Cuba',
    },
    {
      icon: <LocalShipping fontSize="large" color="primary" />,
      title: 'Transporte de Cargas',
      description: 'Conecta negocios con transportistas para envío de mercancías',
    },
    {
      icon: <People fontSize="large" color="primary" />,
      title: 'Múltiples Roles',
      description: 'Conductores, pasajeros, negocios con cargas y transporte',
    },
    {
      icon: <Star fontSize="large" color="primary" />,
      title: 'Sistema de Calificaciones',
      description: 'Reputación transparente para todos los usuarios',
    },
    {
      icon: <Security fontSize="large" color="primary" />,
      title: 'Control Administrativo',
      description: 'Administración completa con lista negra por incidencias',
    },
    {
      icon: <WhatsApp fontSize="large" color="primary" />,
      title: 'Comunicación Directa',
      description: 'WhatsApp, SMS y llamadas sin proveedores externos',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
          borderRadius: 2,
          mb: 6,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Load Board Cuba
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
            Sistema Unificado de Transporte para Pasajeros y Cargas
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, fontSize: '1.2rem' }}>
            La plataforma cubana que conecta conductores, pasajeros y negocios
            para un transporte eficiente y seguro en toda la isla.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            {!user ? (
              <>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                  onClick={() => navigate('/register')}
                >
                  Comenzar Ahora
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                  onClick={() => navigate('/search')}
                >
                  Buscar Viajes
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                  onClick={() => navigate('/dashboard')}
                >
                  Ir al Dashboard
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                  onClick={() => navigate('/search')}
                >
                  Buscar Viajes
                </Button>
              </>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Características Principales
        </Typography>
        <Typography 
          variant="body1" 
          textAlign="center" 
          color="text.secondary" 
          sx={{ mb: 6 }}
        >
          Todo lo que necesitas para un sistema de transporte moderno y confiable
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Roles Section */}
      <Box sx={{ mt: 8, py: 6, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Roles de Usuario
          </Typography>
          <Typography 
            variant="body1" 
            textAlign="center" 
            color="text.secondary" 
            sx={{ mb: 6 }}
          >
            Diferentes tipos de usuarios para cubrir todas las necesidades de transporte
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Chip 
                    label="Administrador" 
                    color="error" 
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2">
                    Control total del sistema, gestión de usuarios y lista negra
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Chip 
                    label="Conductor" 
                    color="primary" 
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2">
                    Ofrece servicios de transporte para pasajeros y cargas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Chip 
                    label="Pasajero" 
                    color="secondary" 
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2">
                    Busca y reserva viajes a diferentes destinos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Chip 
                    label="Negocio con Cargas" 
                    color="info" 
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2">
                    Necesita enviar mercancías y busca transportistas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Chip 
                    label="Negocio Transporte" 
                    color="success" 
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2">
                    Empresa de transporte que ofrece servicios comerciales
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ mt: 8, py: 6, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom>
            ¿Listo para comenzar?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Únete a la red de transporte más completa de Cuba
          </Typography>
          {!user && (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
            >
              Registrarse Gratis
            </Button>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;