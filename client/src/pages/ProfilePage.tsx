import React from 'react';
import { Typography, Box, Card, CardContent } from '@mui/material';

const ProfilePage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mi Perfil
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Editar Perfil
          </Typography>
          <Typography color="text.secondary">
            Funcionalidad de edición de perfil en desarrollo. Aquí podrás actualizar tu información personal, documentos, foto de perfil, etc.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;