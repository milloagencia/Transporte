import React from 'react';
import { Typography, Box, Card, CardContent } from '@mui/material';

const SearchTripsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Buscar Viajes
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Búsqueda de Viajes
          </Typography>
          <Typography color="text.secondary">
            Funcionalidad de búsqueda en desarrollo. Aquí podrás buscar viajes por origen, destino, fecha, tipo de transporte, etc.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SearchTripsPage;