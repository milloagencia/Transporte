import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const AdminPanel = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center">
        <Typography variant="h4" component="h1" gutterBottom>
          🛡️ Panel de Administración
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Panel completo de administración con control total del sistema.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Funcionalidades por implementar:
        </Typography>
        <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '16px' }}>
          <li>Gestión de usuarios (blacklist, verificación)</li>
          <li>Moderación de calificaciones y reseñas</li>
          <li>Resolución de disputas</li>
          <li>Estadísticas del sistema</li>
          <li>Verificación manual de teléfonos</li>
          <li>Monitoreo de actividad</li>
        </ul>
      </Box>
    </Container>
  );
};

export default AdminPanel;