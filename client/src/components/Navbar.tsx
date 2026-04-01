import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Chip,
} from '@mui/material';
import {
  DirectionsCar,
  AccountCircle,
  ExitToApp,
  Dashboard,
  Person,
  AdminPanelSettings,
  Search,
  Add,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'driver': return 'primary';
      case 'passenger': return 'secondary';
      case 'cargo_business': return 'info';
      case 'transport_business': return 'success';
      default: return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'driver': return 'Conductor';
      case 'passenger': return 'Pasajero';
      case 'cargo_business': return 'Negocio Cargas';
      case 'transport_business': return 'Negocio Transporte';
      default: return role;
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <DirectionsCar sx={{ mr: 2 }} />
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold',
          }}
        >
          Load Board Cuba
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            color="inherit"
            startIcon={<Search />}
            component={RouterLink}
            to="/search"
          >
            Buscar Viajes
          </Button>

          {user ? (
            <>
              <Button
                color="inherit"
                startIcon={<Dashboard />}
                component={RouterLink}
                to="/dashboard"
              >
                Dashboard
              </Button>

              {(['driver', 'transport_business'].includes(user.role)) && (
                <Button
                  color="inherit"
                  startIcon={<Add />}
                  component={RouterLink}
                  to="/create-trip"
                >
                  Crear Viaje
                </Button>
              )}

              {user.role === 'admin' && (
                <Button
                  color="inherit"
                  startIcon={<AdminPanelSettings />}
                  component={RouterLink}
                  to="/admin"
                >
                  Admin
                </Button>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                <Chip
                  label={getRoleLabel(user.role)}
                  color={getRoleColor(user.role) as any}
                  size="small"
                  variant="outlined"
                  sx={{ color: 'white', borderColor: 'white' }}
                />
                
                {user.isBlacklisted && (
                  <Chip
                    label="Lista Negra"
                    color="error"
                    size="small"
                    variant="filled"
                  />
                )}
                
                {user.verificationStatus === 'pending' && (
                  <Chip
                    label="Pendiente"
                    color="warning"
                    size="small"
                    variant="outlined"
                    sx={{ color: 'white', borderColor: 'white' }}
                  />
                )}
                
                {user.verificationStatus === 'verified' && (
                  <Chip
                    label="Verificado"
                    color="success"
                    size="small"
                    variant="outlined"
                    sx={{ color: 'white', borderColor: 'white' }}
                  />
                )}

                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  {user.profileImage ? (
                    <Avatar
                      src={user.profileImage}
                      alt={`${user.firstName} ${user.lastName}`}
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                    <Person sx={{ mr: 1 }} />
                    Perfil
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ExitToApp sx={{ mr: 1 }} />
                    Cerrar Sesión
                  </MenuItem>
                </Menu>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" component={RouterLink} to="/login">
                Iniciar Sesión
              </Button>
              <Button 
                variant="outlined" 
                sx={{ 
                  color: 'white', 
                  borderColor: 'white',
                  '&:hover': { 
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
                component={RouterLink} 
                to="/register"
              >
                Registrarse
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;