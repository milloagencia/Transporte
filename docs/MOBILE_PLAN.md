# Plan de apps móviles y seguimiento en vivo

**Estado:** aprobada por el propietario el 7 de octubre de 2026. Cada fase de implementación tendrá su propio PR.

## 1. Auditoría del repositorio

Revisé `main` en GitHub y el checkout disponible:

- `main` está en `8ef06542` (merge del 6 de octubre de 2026) y contiene la aplicación Next.js completa: `app/`, `components/`, `lib/`, `prisma/`, `messages/` y `docs/`. El checkout local está limpio y en ese mismo commit, aunque su rama de trabajo se llama `copilot/feature-movil-apps-y-admin`.
- Por eso, estas afirmaciones de `docs/HANDOFF.md` ya están desactualizadas: que `main` solo tiene documentación y que los cambios de `fix/seguridad-mvp` no llegaron a GitHub. Esa rama `fix/seguridad-mvp` no aparece entre las ramas remotas actuales.
- Sí siguen siendo útiles el resumen del producto, el esquema Prisma, la autenticación con enlace mágico, las reglas de acceso, el despliegue y las advertencias legales del handoff. La app actual usa Next.js 15.5, Prisma 5.22, Neon y Auth.js v5; tiene panel de administración y refresco periódico, pero no tiene apps Expo, API `/api/v1`, ubicación ni mapas.
- `package.json` ofrece `lint` y `build`, pero no un script de pruebas. El build de producción ejecuta `prisma db push` y seed; los cambios de esquema deben revisarse con cuidado.
- No puedo confirmar desde GitHub qué commit está desplegado ahora mismo en Hostinger. Antes de desplegar una fase habrá que comparar el commit y revisar los logs en hPanel.

## 2. Arquitectura propuesta

### Monorepo sin poner en riesgo la web

El objetivo funcional sigue siendo tres experiencias: pasajero, chofer y administración web, con un backend y una sola base Neon. Propongo **no mover de inmediato la web existente** desde la raíz a `apps/web`: Hostinger construye actualmente desde la raíz con `npm run build`, y moverla podría romper el despliegue. Primero añadiremos workspaces con `apps/passenger`, `apps/driver` y `packages/shared`, manteniendo Next.js en la raíz; trasladar la web a `apps/web` sería un cambio separado después de validar el despliegue. Es una diferencia temporal y deliberada respecto al árbol sugerido.

`packages/shared` podrá contener tipos, esquemas Zod, cliente HTTP e idiomas es/en compartidos. La web y las apps seguirán usando el mismo contrato de API; no se duplicará la lógica de negocio ni se conectarán móviles directamente a Neon.

### API y autenticación móvil

- Añadir rutas versionadas `/api/v1/...` en Next.js para sesión móvil, estado del viaje, ubicación y suscripción a actualizaciones.
- Mantener el enlace mágico existente. Tras verificarlo, la API entregará credenciales móviles revocables; la app guardará el token seguro en el almacenamiento nativo del teléfono. Los tokens se validarán en **cada** endpoint y se invalidarán al cerrar sesión o suspender la cuenta. No se guardarán secretos de servidor en las apps.
- Autorizar el seguimiento solo para el chofer del viaje activo, el pasajero de ese mismo viaje y administradores. Choferes suspendidos, no verificados o sin un viaje habilitado no podrán iniciar el envío. El admin verá únicamente choferes que estén compartiendo ubicación o tengan un viaje activo.
- Separar los estados operativos del viaje (aceptado, en camino, llegó, en viaje, completado y cancelado) de los estados financieros existentes del `Deal`, sin alterar negociación, pagos simulados, reseñas ciegas, roles ni suspensiones.

### Ubicación y tiempo real

- Guardar la posición actual y las posiciones históricas en PostgreSQL, asociadas al chofer y al viaje, con índices y límites de frecuencia/precisión. Retención inicial aprobada: **30 días**, sujeta a revisión legal; eliminarla automáticamente mediante una tarea programada.
- Usar **Ably** como primera opción: servicio administrado, adecuado para canales privados y evita operar WebSockets en Hostinger. Next.js autorizará canales y emitirá credenciales temporales; la clave privada solo vivirá en variables de entorno del servidor.
- Mantener polling autenticado como respaldo si la conexión en vivo cae o no está disponible. El cliente mostrará cuándo la ubicación está desactualizada.
- Alternativas consideradas: Pusher también es administrado; Supabase Realtime incorporaría otra plataforma además de Neon; Socket.IO en otro servidor exige más operación y disponibilidad. Si se prefiere otra opción, se decidirá antes de implementarla.

### Mapas, ETA y costos

- En móvil: `react-native-maps`, con Apple Maps en iOS y Google Maps en Android.
- En web: recomiendo empezar evaluando **Mapbox** por control de estilo y costos de mapas configurables; mantener el proveedor detrás de una interfaz para poder cambiarlo. No contratar rutas/ETA hasta comprobar precios y volumen estimado. Si se priorizan cobertura y familiaridad sobre control de costos, Google Maps es alternativa válida.
- Las claves de mapas que deban ir en cliente son públicas por diseño y se restringirán por aplicación, dominio y uso; nunca incluir credenciales privadas. La ETA requiere un proveedor de rutas; se medirá su consumo y no se presentará una estimación en línea recta como ETA de carretera.

## 3. Fases de trabajo

Cada fase termina con validación y un PR independiente. No se iniciará la siguiente hasta que la anterior esté revisada.

### Fase 0 — Plan y decisiones (PR de planificación)

- Entregar esta auditoría, la arquitectura, las fases y las tareas del propietario.
- **Sin cambios de código ni cambios en Neon/Hostinger.**

### Fase 1 — Base segura: workspaces, API y datos

- Añadir workspaces móviles manteniendo la web en la raíz.
- Diseñar e implementar la sesión móvil, permisos, estados operativos y almacenamiento de ubicación.
- Añadir endpoints de escritura/lectura con autorización por viaje, rate limits y validación.
- Añadir publicación de eventos en tiempo real con respaldo de polling y un mecanismo programado para borrar historial vencido.
- Probar autorización, expiración/revocación de tokens, cuentas suspendidas, permisos cruzados, datos inválidos y compatibilidad de build en Hostinger.

### Fase 2 — Mapa en vivo del administrador web

- Añadir a `/admin` un mapa con viajes activos, última ubicación y antigüedad de cada posición.
- Incorporar lista/estados como alternativa accesible al mapa.
- Verificar que el mapa nunca revela ubicaciones a usuarios no administradores y que la vista se actualiza por Ably o polling.

### Fase 3 — Prueba vertical en teléfonos con Expo Go

- Crear las apps Expo de chofer y pasajero, con español/inglés y cliente compartido.
- Chofer: iniciar sesión, otorgar permiso de ubicación mientras usa la app e iniciar/detener el envío durante el viaje.
- Pasajero: iniciar sesión y ver el estado, la posición y la ETA del chofer de su viaje; comprobar que no puede consultar viajes ajenos.
- Probar primero ubicación **en primer plano** en Expo Go. El seguimiento real en segundo plano requiere configuración nativa y una build de desarrollo/EAS; Expo Go no es una prueba fiable de ese comportamiento en todos los dispositivos/versiones.
- Entregar instrucciones exactas, sencillas y reproducibles para probar con dos teléfonos y cuentas de prueba.

### Fase 4 — Preparación para publicación

- Añadir seguimiento en segundo plano con permisos y textos de privacidad de iOS/Android; probarlo en builds EAS de desarrollo.
- Añadir push para solicitud nueva, oferta aceptada, llegada y mensajes cuando exista el flujo de mensajes.
- Completar pruebas de dispositivo, accesibilidad, privacidad, retención, carga y recuperación ante desconexión.
- Documentar builds EAS, revisión/publicación en App Store y Google Play, variables de entorno y redeploy de la web en Hostinger.

## 4. Qué tendrás que hacer tú

**Decisiones aprobadas:**

1. Mantener la web en la raíz durante las primeras fases.
2. Usar Ably como servicio en tiempo real.
3. Evaluar Mapbox primero para el mapa web y comenzar con ETA de rutas solo después de comprobar el costo.
4. Retener el historial de ubicación 30 días inicialmente.

Además, el propietario aprobó el acceso móvil por enlace mágico, confirmación segura, código PKCE de un solo uso válido 10 minutos y token almacenado como hash en Neon. La sesión móvil tiene expiración móvil de 30 días desde el último uso y se guarda en el teléfono con Expo SecureStore.

**Cuando corresponda, no ahora:** crear/configurar una cuenta de Ably y una de Mapbox; guardar sus claves solo en las variables de servidor y restringir los tokens públicos que requiera el mapa. Para distribución móvil se necesitará una cuenta Expo/EAS, acceso a la cuenta de Apple Developer existente y crear una cuenta de Google Play. No compartas claves ni contraseñas por el chat.

Antes de un lanzamiento público también habrá que revisar con asesoría legal el consentimiento y privacidad de ubicación en Nebraska, la actividad regulada, seguros, términos y retención de datos, como ya advierte el handoff.

La Fase 1 está en implementación en el PR de esta fase. No se desplegará en Hostinger ni se modificarán las variables de producción desde esta sesión.
