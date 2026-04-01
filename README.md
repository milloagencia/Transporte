# Load Board Cuba 🇨🇺

Sistema unificado de transporte para pasajeros y cargas en Cuba. Una plataforma que conecta conductores, pasajeros y negocios para un transporte eficiente y seguro en toda la isla.

## 🚀 Características Principales

### Tipos de Usuario
- **👨‍💼 Administrador**: Control total del sistema, gestión de usuarios y lista negra
- **🚗 Conductor**: Ofrece servicios de transporte para pasajeros y cargas
- **👤 Pasajero**: Busca y reserva viajes a diferentes destinos
- **📦 Negocio con Cargas**: Necesita enviar mercancías y busca transportistas
- **🚛 Negocio de Transporte**: Empresa de transporte que ofrece servicios comerciales

### Funcionalidades Clave
- **🔄 Sistema Unificado**: Pasajeros y cargas en una sola plataforma
- **⭐ Sistema de Calificaciones**: Reputación transparente para todos los usuarios
- **🔒 Control Administrativo**: Lista negra por incidencias con gestión completa
- **📱 Comunicación Directa**: WhatsApp, SMS y llamadas sin proveedores externos
- **🗺️ Geolocalización**: Rutas y ubicaciones precisas
- **💰 Gestión de Precios**: Precios fijos, por km, por kg o negociables
- **🔔 Notificaciones en Tiempo Real**: Actualizaciones instantáneas de viajes

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** con **TypeScript**
- **Express.js** para la API REST
- **MongoDB** con **Mongoose** para la base de datos
- **Socket.IO** para comunicación en tiempo real
- **JWT** para autenticación
- **bcryptjs** para encriptación de contraseñas

### Frontend
- **React** con **TypeScript**
- **Material-UI (MUI)** para la interfaz de usuario
- **React Router** para navegación
- **React Query** para gestión de estado del servidor
- **Axios** para llamadas a la API
- **Leaflet** para mapas

### Comunicación
- **WhatsApp Business API** para mensajería
- **SMS** para notificaciones
- **Llamadas telefónicas** para contacto directo

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- MongoDB
- npm o yarn

### Clonar el repositorio
```bash
git clone https://github.com/milloagencia/Transporte.git
cd Transporte
```

### Instalación de dependencias
```bash
# Instalar dependencias del proyecto raíz y ambos sub-proyectos
npm run setup
```

### Configuración del entorno
```bash
# Copiar el archivo de ejemplo de variables de entorno
cp server/.env.example server/.env

# Editar las variables de entorno según tu configuración
# - MONGODB_URI: URL de conexión a MongoDB
# - JWT_SECRET: Clave secreta para JWT
# - Configuración de WhatsApp, SMS, etc.
```

### Ejecutar el proyecto
```bash
# Desarrollo - Ejecuta servidor y cliente simultáneamente
npm run dev

# Solo servidor
npm run server:dev

# Solo cliente
npm run client:dev
```

### URLs de acceso
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📚 Estructura del Proyecto

```
Transporte/
├── client/                    # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── contexts/          # Contextos de React
│   │   ├── pages/            # Páginas principales
│   │   ├── services/         # Servicios para API
│   │   ├── types/            # Tipos TypeScript
│   │   └── utils/            # Utilidades
│   └── package.json
├── server/                   # Backend Node.js
│   ├── src/
│   │   ├── controllers/      # Controladores de rutas
│   │   ├── middleware/       # Middleware personalizado
│   │   ├── models/          # Modelos de MongoDB
│   │   ├── routes/          # Rutas de la API
│   │   └── utils/           # Utilidades del servidor
│   └── package.json
└── package.json             # Configuración raíz
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/refresh` - Refrescar token

### Usuarios
- `GET /api/users` - Listar usuarios (solo admin)
- `GET /api/users/profile/:userId` - Obtener perfil
- `PUT /api/users/profile/:userId` - Actualizar perfil

### Viajes
- `GET /api/trips` - Buscar viajes
- `POST /api/trips` - Crear viaje
- `GET /api/trips/:id` - Obtener viaje específico
- `POST /api/trips/:id/book-passenger` - Reservar asiento

### Calificaciones
- `POST /api/ratings` - Crear calificación
- `GET /api/ratings/user/:userId` - Obtener calificaciones de usuario

### Administración
- `GET /api/admin/dashboard` - Estadísticas del sistema
- `POST /api/admin/blacklist/:userId` - Añadir a lista negra
- `POST /api/admin/unblacklist/:userId` - Remover de lista negra
- `GET /api/admin/incidents` - Obtener incidencias
- `POST /api/admin/incidents/:id/resolve` - Resolver incidencia

## 🔐 Roles y Permisos

### Administrador
- Acceso completo al sistema
- Gestión de usuarios y lista negra
- Resolución de incidencias
- Verificación de usuarios
- Estadísticas y monitoreo

### Conductor / Negocio de Transporte
- Crear y gestionar viajes
- Ver reservas y cargas
- Comunicación con pasajeros/negocios
- Gestión de vehículos

### Pasajero
- Buscar y reservar viajes
- Calificar conductores
- Gestionar reservas

### Negocio con Cargas
- Publicar necesidades de transporte
- Gestionar envíos
- Calificar transportistas

## 🚦 Estados y Flujos

### Estados de Usuario
- `pending` - Pendiente de verificación
- `verified` - Usuario verificado
- `rejected` - Verificación rechazada

### Estados de Viaje
- `planned` - Viaje planificado
- `active` - Viaje en curso
- `completed` - Viaje completado
- `cancelled` - Viaje cancelado

### Estados de Reserva
- `booked` - Reservado
- `confirmed` - Confirmado
- `cancelled` - Cancelado
- `completed` - Completado

## 🔧 Desarrollo

### Comandos disponibles
```bash
# Instalar dependencias
npm run setup

# Desarrollo
npm run dev

# Construcción
npm run build

# Iniciar producción
npm start

# Pruebas
npm test

# Linting
npm run lint
```

### Contribuir
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📋 Por Implementar

### Próximas Funcionalidades
- [ ] Integración completa de WhatsApp Business API
- [ ] Sistema de pagos
- [ ] Aplicación móvil
- [ ] Notificaciones push
- [ ] Sistema de chat en tiempo real
- [ ] Tracking GPS de viajes
- [ ] Sistema de documentos y verificaciones
- [ ] Reportes y analytics avanzados
- [ ] API para integración con terceros

### Integraciones de Comunicación
- [ ] WhatsApp Business API
- [ ] SMS (Twilio/otros proveedores locales)
- [ ] Llamadas telefónicas
- [ ] Email notifications

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

**Millo Agencia**
- Website: [milloagencia.com](https://milloagencia.com)
- Email: info@milloagencia.com

---

🇨🇺 **Hecho con ❤️ para Cuba**
