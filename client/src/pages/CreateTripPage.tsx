import React from 'react';
import { Typography, Box, Card, CardContent } from '@mui/material';

const CreateTripPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Crear Nuevo Viaje
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Formulario de Creación de Viaje
          </Typography>
          <Typography color="text.secondary">
            Formulario en desarrollo. Aquí podrás crear nuevos viajes especificando origen, destino, fecha, capacidad, precios, etc.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateTripPage;