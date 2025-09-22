import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Listings = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center">
        <Typography variant="h4" component="h1" gutterBottom>
          🚛 Viajes y Servicios
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Esta página mostrará la lista de viajes y servicios de transporte disponibles.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Funcionalidades por implementar:
        </Typography>
        <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '16px' }}>
          <li>Búsqueda y filtrado de viajes</li>
          <li>Creación de nuevas ofertas de transporte</li>
          <li>Visualización de detalles de cada viaje</li>
          <li>Sistema de reservas</li>
        </ul>
      </Box>
    </Container>
  );
};

export default Listings;