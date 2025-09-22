import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Profile = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center">
        <Typography variant="h4" component="h1" gutterBottom>
          👤 Mi Perfil
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Esta página permitirá editar la información del perfil del usuario.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Funcionalidades por implementar:
        </Typography>
        <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '16px' }}>
          <li>Edición de información personal</li>
          <li>Gestión de información del vehículo (choferes)</li>
          <li>Gestión de información del negocio</li>
          <li>Configuración de preferencias de comunicación</li>
          <li>Solicitud de verificación de teléfono</li>
        </ul>
      </Box>
    </Container>
  );
};

export default Profile;