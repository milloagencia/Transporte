import React from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid,
  Button,
  Alert,
  Chip
} from '@mui/material';
import { 
  SupervisorAccount,
  Block,
  Report,
  VerifiedUser 
} from '@mui/icons-material';

const AdminPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Panel de Administración
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Panel de control administrativo con acceso completo al sistema
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SupervisorAccount color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6">Gestión de Usuarios</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Administrar cuentas de usuario
              </Typography>
              <Button variant="outlined" fullWidth>
                Ver Usuarios
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Block color="error" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6">Lista Negra</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Gestionar usuarios bloqueados
              </Typography>
              <Button variant="outlined" color="error" fullWidth>
                Ver Lista Negra
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Report color="warning" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6">Incidencias</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Revisar reportes y problemas
              </Typography>
              <Button variant="outlined" color="warning" fullWidth>
                Ver Incidencias
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <VerifiedUser color="success" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6">Verificaciones</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Aprobar verificaciones de usuarios
              </Typography>
              <Button variant="outlined" color="success" fullWidth>
                Ver Pendientes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estadísticas del Sistema
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">0</Typography>
                    <Typography variant="body2">Usuarios Totales</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">0</Typography>
                    <Typography variant="body2">Usuarios Activos</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="error.main">0</Typography>
                    <Typography variant="body2">En Lista Negra</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">0</Typography>
                    <Typography variant="body2">Incidencias Abiertas</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Acciones Administrativas Recientes
              </Typography>
              <Typography color="text.secondary">
                Aquí aparecerá el historial de acciones administrativas como bloqueos, verificaciones, resolución de incidencias, etc.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminPage;