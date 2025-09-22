import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Bookings = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center">
        <Typography variant="h4" component="h1" gutterBottom>
          📅 Mis Reservas
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Esta página mostrará las reservas y bookings del usuario.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Funcionalidades por implementar:
        </Typography>
        <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '16px' }}>
          <li>Lista de reservas activas</li>
          <li>Historial de viajes</li>
          <li>Estado de pagos</li>
          <li>Sistema de comunicación con conductores/pasajeros</li>
          <li>Calificaciones y reseñas</li>
        </ul>
      </Box>
    </Container>
  );
};

export default Bookings;