# Collage Transport — Estado del proyecto y guía para continuar

> Documento de traspaso (handoff). Escrito para que una persona o un modelo de IA pueda retomar el trabajo
> sin el historial de la conversación. Última actualización: **2026-10-07**.
> Dueño del proyecto: **Manuel Millo** (no programa; hay que guiarlo paso a paso y en español).

---

## 1. Qué es

Marketplace de transporte en **Nebraska** (bilingüe es/en) que conecta:

- **Conductores** con asientos vacíos o espacio de carga (carro, pickup, van, camión de caja, tráiler).
- **Clientes** que necesitan viajar o mandar carga (paquetes, muebles, mudanzas, refrigerados).

Ambos publican (ofertas / solicitudes), negocian el precio con contraofertas, hacen un **acuerdo (Deal)**,
pagan (**simulado en Fase 0**), confirman el viaje completado y se califican.
Especificación original: `docs/PRD.md` (Fase 0 = sin Stripe, sin mapas, verificación manual).

---

## 2. Dónde vive cada cosa (plataformas)

| Pieza | Plataforma | Detalle |
|---|---|---|
| App en producción | **Hostinger** (plan *Business Web Hosting*, función **Node.js Web Apps**) | `https://app.collagetaxi.com` (subdominio de collagetaxi.com, cuyo sitio principal es WordPress). Plan renovado hasta 2027-10-03. |
| Base de datos | **Neon** (PostgreSQL, plan gratis) | Proyecto **"Transporte USA"**, rama `production`, base `neondb`, región AWS US East 1. Se usa la conexión **directa (sin pooling)**. |
| Correo saliente (magic links y alertas) | **Titan Email** (incluido con Hostinger) | Buzón `noreply@collagetaxi.com`. SMTP `smtp.titan.email:465` (¡no `smtp.hostinger.com`!). |
| Código fuente | **GitHub** `milloagencia/Transporte` | `main` ya contiene la aplicación completa. La descripción histórica de ramas que aparece en §8 puede estar desactualizada; revisar las ramas y PR actuales antes de desplegar. |
| Admin de la app | Cuenta `collagetropical@gmail.com` | Se vuelve admin automáticamente al iniciar sesión (variable `ADMIN_EMAIL`). |

### Variables de entorno (en Hostinger → app.collagetaxi.com → Environment variables)

Los **valores secretos solo están en Hostinger** (nunca en el código ni en este documento).

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Conexión directa a Neon (`postgresql://neondb_owner:…@ep-…neon.tech/neondb?sslmode=require`) |
| `AUTH_SECRET` | Secreto de Auth.js (⚠️ quedó escrito en una conversación: **rotarlo**) |
| `AUTH_URL` | `https://app.collagetaxi.com` (también lo usa SEO/sitemap como URL base) |
| `ADMIN_EMAIL` | `collagetropical@gmail.com` (lista separada por comas) |
| `EMAIL_FROM` | `Collage Transport <noreply@collagetaxi.com>` |
| `EMAIL_HOST` | `smtp.titan.email` |
| `EMAIL_USER` | `noreply@collagetaxi.com` |
| `EMAIL_PASSWORD` | Contraseña del buzón (solo letras y números: con `$`, `#` o `%` falló). ⚠️ Se compartió en el chat: **rotarla**. |
| `DEMO_DATA` | Solo fuera de producción: `on` crea demos y `off` los borra; en builds de producción se omiten ambos cambios |
| `ABLY_API_KEY` | (opcional) Clave privada de Ably para eventos de ubicación; si falta, los clientes usan polling |
| `LOCATION_CLEANUP_SECRET` | Secreto del cron diario que elimina historial de ubicación de más de 30 días |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | (opcional) Token público `pk.*` de Mapbox, restringido a los dominios permitidos de la app; si falta o no funciona, Admin muestra la lista sin mapa. No habilita rutas ni ETA. |
| `EXPO_PUBLIC_API_URL` | Dirección pública de la API que se establece en la terminal antes de iniciar Expo; para esta prueba: `https://app.collagetaxi.com`. No hace falta agregarla a Hostinger. |
| (opcional) `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` | Verificación de Search Console / Bing |

Guardar variables en Hostinger requiere pulsar **"Apply changes"** (o "Save and redeploy"); eso vuelve a construir la app.

**Para la prueba móvil:** no reemplaces las variables existentes `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `ADMIN_EMAIL` ni `EMAIL_*`; comprueba que ya estén configuradas. Agrega `LOCATION_CLEANUP_SECRET` si aún falta (lo necesita el cron para hacer cumplir los 30 días). `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` es opcional; `ABLY_API_KEY` también es opcional y no se necesita para el polling de esta prueba. `EXPO_PUBLIC_API_URL` se exporta en la Terminal del iMac, no se añade a Hostinger.

---

## 3. Cómo se despliega (importante)

No hay CI ni conexión GitHub→Hostinger (no tenemos permiso de escritura en GitHub). El flujo usado:

1. Revisar y fusionar el PR aprobado; **no desplegar mientras el PR siga en borrador o sin aprobación**. Esta fase no se despliega automáticamente.
2. Desde el repositorio actualizado y con la web en la raíz, generar un ZIP que excluye los proyectos móviles:
   ```bash
   git archive --format=zip --output=collage-transport-web.zip HEAD . ':(exclude)apps' ':(exclude)packages'
   ```
   La raíz no tiene `workspaces`; su `package-lock.json` contiene las dependencias web. Por eso `npm install` de Hostinger no instala Expo, React Native ni las dependencias móviles. Las apps tienen lockfiles separados en sus propias carpetas.
3. En **hPanel → Websites → app.collagetaxi.com → Deployments → Redeploy → "Upload new files"**, subir el zip y pulsar **"Save and redeploy"**.
4. Hostinger ejecuta `npm install` (con `postinstall: prisma generate`) y `npm run build`, que es:
   `prisma generate && prisma db push --skip-generate && node prisma/seed.mjs && next build`
   - `prisma db push` sincroniza el esquema con Neon (**no hay migraciones**; cambios destructivos pedirían confirmación y fallarían).
   - `prisma/seed.mjs` carga el catálogo de vehículos. `DEMO_DATA` solo modifica demos fuera de producción; en `NODE_ENV=production` el seed nunca crea ni borra demos.
5. Revisar el log del deployment (debe terminar en "Deployment completed") y **Runtime logs** para errores en ejecución.

Antes de cualquier futuro despliegue, confirmar respaldo de Neon y revisar el SQL Prisma: el contrato aprobado permite únicamente adiciones compatibles, sin borrar/renombrar objetos ni aceptar pérdida de datos.

Detalles de Hostinger: Node 20, Next.js detectado automáticamente, salida `.next`, la app se "duerme" sin tráfico
(primera visita lenta). El zip se sube desde el navegador (Claude in Chrome con `file_upload`).

Desarrollo local de la web: `docker compose up -d postgres`, configurar `.env` (ver `.env.example`) y ejecutar `npm run dev`. Sin `EMAIL_*`, el enlace mágico se imprime en la consola.

### Preparar cuentas y viaje de prueba en la web de producción

Hazlo **después** de que el propietario revise y fusione el PR y despliegue la versión actualizada. No pruebes las apps contra una web que todavía no contiene `/api/v1/mobile/*` y las rutas de seguimiento. El propietario indica que ya creó una rama de respaldo de Neon y conserva el despliegue anterior de Hostinger. Mantén las pruebas controladas, sin pasajero físico ni transporte real: el pago es simulado y no cobra dinero.

1. Abre `https://app.collagetaxi.com` y crea/inicia sesión con `collagetropical+chofer@gmail.com`. Completa el onboarding como persona que ofrece transporte. Gmail entrega los mensajes de las direcciones con `+chofer` y `+pasajero` en el buzón base `collagetropical@gmail.com`.
2. En la cuenta de chofer, ve a **Perfil**. Envía la solicitud de verificación y agrega un vehículo desde **Vehículos**. El formulario de verificación pide licencia, seguro e inspección; usa solo información correcta y no publiques esos datos en chats o capturas.
3. Cierra la sesión web del chofer e inicia sesión con la cuenta administradora (`ADMIN_EMAIL`, actualmente `collagetropical@gmail.com`). Abre **Admin → Usuarios**, busca `collagetropical+chofer@gmail.com` y pulsa **Aprobar** junto a su estado de verificación. La cuenta adquiere el rol de chofer aprobado.
4. Vuelve a iniciar sesión como chofer. Abre **Ofertas → Publicar oferta**. Selecciona el vehículo; elige una ruta de prueba, por ejemplo Omaha → Lincoln, número de asientos, precio bajo, y un horario futuro que puedas probar. Publica la oferta.
5. Inicia sesión como pasajero con `collagetropical+pasajero@gmail.com`, completa el onboarding como persona que necesita transporte y abre **Ofertas**. Elige la oferta de prueba y pulsa **Start Deal / Iniciar acuerdo**.
6. En el acuerdo, como pasajero, envía una propuesta de precio. Cambia a la cuenta del chofer, abre **Acuerdos**, entra al acuerdo y pulsa **Aceptar** en la propuesta pendiente.
7. Vuelve a la cuenta pasajero: el estado debe indicar que espera pago. Pulsa **Pay (Simulated) / Pagar (simulado)**. No se cobra tarjeta ni se transfiere dinero. El acuerdo pasa a `paid_escrow`, que habilita los controles de estado y GPS móvil.
8. Mantén a mano la URL o el acuerdo para seleccionar el viaje correcto en las apps. Para probar GPS, estaciona en un lugar seguro, permite ubicación “al usar la app” en el teléfono del chofer y comparte la ubicación solo durante la prueba.

### Probar las apps en iMac/macOS con Expo Go (solo primer plano)

Haz estos pasos después de que el backend actualizado esté disponible en `https://app.collagetaxi.com`. Expo Go transporta el código de desarrollo por el túnel; la API de la app sigue usando HTTPS y producción.

1. Instala **Expo Go** desde App Store y/o Google Play en los teléfonos de prueba. En el iMac abre **Terminal** y comprueba las herramientas:
   ```bash
   node -v
   git --version
   ```
   Se necesita Node.js 20 o posterior. Si no aparece Node, instala Homebrew desde `https://brew.sh` siguiendo su instrucción oficial y ejecuta:
   ```bash
   brew install node@20
   ```
   Cierra y vuelve a abrir Terminal y confirma `node -v`. Si `brew` no está disponible, instala la versión LTS de Node desde `https://nodejs.org`.
2. Clona la rama principal ya actualizada después del merge:
   ```bash
   mkdir -p ~/proyectos
   cd ~/proyectos
   git clone https://github.com/milloagencia/Transporte.git
   cd Transporte
   git checkout main
   git pull origin main
   ```
   Si ya tienes el repositorio clonado en el iMac, entra a su carpeta y ejecuta `git checkout main` y `git pull origin main`.
3. En la primera ventana de Terminal, instala y arranca la app de chofer (cada app instala sus dependencias desde su propia carpeta; no ejecutes `npm install` en la raíz):
   ```bash
   cd ~/proyectos/Transporte/apps/driver
   npm ci
   export EXPO_PUBLIC_API_URL="https://app.collagetaxi.com"
   npx expo start --tunnel
   ```
   Si Expo pregunta si instala el soporte de túnel, responde `y`. Espera a que aparezca el QR y ábrelo con Expo Go.
4. Deja la ventana de chofer abierta. Abre una **segunda** ventana de Terminal y lanza pasajero:
   ```bash
   cd ~/proyectos/Transporte/apps/passenger
   npm ci
   export EXPO_PUBLIC_API_URL="https://app.collagetaxi.com"
   npx expo start --tunnel
   ```
   Escanea el segundo QR con el teléfono del pasajero. Si solo tienes un teléfono, detén la app Chofer con `Ctrl+C` antes de iniciar Pasajero; no podrás ver ambas apps a la vez en ese teléfono.
5. En cada app inicia sesión con el correo correspondiente. Abre el enlace mágico que recibirás en el teléfono o en el correo del iMac; confirma en la página segura y escribe en la app el código de un solo uso. La sesión móvil se guarda en SecureStore.
6. En Chofer selecciona el acuerdo pagado, marca **Voy en camino** y pulsa **Compartir mi ubicación**. Acepta el permiso mientras se usa la app y conserva Chofer abierto en primer plano. Pasajero selecciona el mismo viaje y verá estado/posición cuando consulte de nuevo (polling). En `/admin`, una sesión administradora ve la lista y, si está habilitado Mapbox, el mapa.
7. Al terminar pulsa **Dejar de compartir** y cierra sesión si ya no vas a usar la app. No pongas la app en segundo plano: esa función no está incluida ni probada.

**Alternativa breve para Windows PowerShell:** entra en el checkout actualizado (`C:\proyectos\transporte`), luego para Chofer ejecuta `cd C:\proyectos\transporte\apps\driver; npm ci; $env:EXPO_PUBLIC_API_URL="https://app.collagetaxi.com"; npx expo start --tunnel`. Para Pasajero repite en `C:\proyectos\transporte\apps\passenger`. Escanea cada QR con Expo Go.

### Variables y servicios opcionales

- Para que se borren automáticamente las ubicaciones tras 30 días, configura `LOCATION_CLEANUP_SECRET` en Hostinger y un cron diario que llame `GET https://app.collagetaxi.com/api/cron/cleanup-locations`. La tarea debe enviar el encabezado HTTP `Authorization` usando el esquema `Bearer`; el texto que sigue a `Bearer` debe ser exactamente el valor de `LOCATION_CLEANUP_SECRET`. No publiques ese valor. Confirma una respuesta HTTP 200. **Sin tarea programada, la retención de 30 días no se cumple automáticamente**; es una limitación de privacidad, no un requisito para iniciar sesión.
- Mapbox web: opcional. Para dibujar el mapa de Admin crea un token público `pk.*` con permiso de estilos mínimo y restricción de URL al dominio de la app. Guárdalo como `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` y reconstruye. Sin token la lista sigue disponible. No crees ni uses un token privado `sk.*`.
- Ably: opcional; no se necesita para esta prueba, que consulta el backend por polling. No crees cuenta ni pegues secretos para comenzar.
- `EXPO_PUBLIC_API_URL` se configura en Terminal, **no en Hostinger**. No contiene secreto. No hay que añadir nuevos tokens o claves de móvil en las apps.

---

## 4. Stack técnico

- **Next.js 15.5** (App Router, TypeScript, React 19), **Tailwind 4**, componentes UI propios en `components/ui`.
- **Prisma 5.22** + PostgreSQL (Neon). Esquema en `prisma/schema.prisma`.
- **Auth.js v5 (next-auth beta)**: login sin contraseña por **magic link** (proveedor Nodemailer con id `"email"`),
  sesiones en base de datos (PrismaAdapter). El envío se hace con una **server action** (`app/auth/signin/actions.ts`).
- **next-intl 4**: español/inglés. Textos en `messages/es.json` y `messages/en.json`. El idioma de la app sale de la
  cookie `NEXT_LOCALE`; en páginas públicas lo fuerza la URL (middleware pone el header `x-page-locale`).
- **nodemailer 10** (con `overrides` en package.json para satisfacer el peer de next-auth).
- `npm audit --omit=dev` en la web → 0 vulnerabilidades. Las apps Expo conservan avisos altos transitivos en `braces` y `node-forge` del toolchain Expo/Metro; se actualizó `uuid` sin forzar versiones incompatibles. `npm audit fix --force` propone bajar Expo a la versión 44 y no es seguro para el SDK 57, así que no se aplicó.

---

## 5. Qué hace la app (funcionalidades)

### Registro y tipo de cuenta (onboarding)
- Login sin contraseña (magic link). La primera vez, `/onboarding` pregunta: **necesito transporte** y/o **ofrezco transporte**,
  **persona o empresa**, nombre (o empresa + contacto), teléfono opcional, idioma y USDOT opcional para transportistas.
- Campos en `User`: `wantsToShip`, `wantsToDrive`, `accountType` (individual|company), `contactName`, `phone`, `usdotNumber`, `onboardedAt`.
  Para empresas, `name` = nombre de la empresa (es el nombre público).
- El layout del panel redirige a `/onboarding` mientras `onboardedAt` sea null. Los botones de la página pública mandan
  `?as=shipper|driver` a `/auth/signin`, que lo pasa a `/onboarding`.
- El dashboard muestra "Próximos pasos" según lo elegido (vehículo → verificación → publicar; o publicar solicitud → alertas).
- El teléfono solo se muestra a la otra parte cuando el acuerdo está pagado. "Mis vehículos" solo aparece a quien ofrece transporte.

### Usuarios y roles
- Roles: `user`, `driver`, `admin`. Estado de cuenta (`AccountStatus`): `active`, `payment_hold` (no puede publicar
  ni cerrar acuerdos nuevos; sus anuncios se ocultan), `suspended` (sesión cerrada, no puede hacer nada), `deleted`
  (anonimizada, no puede volver a entrar).
- Conductor: pide verificación en **Perfil** (licencia/seguro/inspección como texto) → admin aprueba → rol `driver`.
- Perfil público `/users/[id]` (requiere sesión): nombre, ★ promedio, viajes completados, comentarios aprobados. Nunca muestra email.

### Vehículos (`/vehicles`)
- Catálogo `VehicleModel` (54 modelos comunes de EE. UU., **medidas aproximadas** escritas a mano en
  `prisma/vehicle-catalog.mjs`): asientos, largo/ancho/alto de carga (pulgadas), abierto arriba, carga máxima (lb).
- El conductor elige marca/modelo (o "Otro") y ajusta los valores → `Vehicle`.

### Ofertas y solicitudes
- Oferta = vehículo + ruta + ventana de tiempo + servicio (personas/carga/mixto) + precio. Capacidad copiada del vehículo.
- Solicitud: personas → nº de pasajeros; carga → peso, bultos, medidas del bulto más grande, refrigeración, descripción.
- Validación en servidor (`lib/validation.ts`, `lib/trip-input.ts`): fechas no pasadas (10 min de margen), Hasta>Desde,
  máx. 1 año adelante y 14 días de rango; ciudad válida; estado de EE. UU.; ZIP 5 dígitos; **origen o destino en NE**;
  precio $1–$100,000. Errores como códigos traducidos (`messages/*.json → errors`).
- Fechas: el navegador las convierte a ISO; se muestran en hora de Nebraska (`lib/format.ts`).

### Tablas tipo load board (Truckstop)
- `/offers` y `/requests` (`components/board/*`): columnas ordenables, filtros (origen/destino, **radio en millas con DH-O**,
  fechas, tipo, vehículo, frío, peso, precio, "solo las mías"), $/milla, ★ del usuario.
- Millas **aproximadas**: coordenadas de ~30 ciudades en `lib/geo.ts` (línea recta × 1.2). Ciudades fuera de la lista → "—".
- Solicitudes: filtro **"que quepa en mi vehículo"** y aviso **"Hay N solicitudes nuevas"** (consulta
  `/api/requests/updates?since=` cada 30 s, solo cuenta las que pasan los filtros).

### Compatibilidad (`lib/matching.ts`)
- `boxFits`: el bulto puede rotar; en caja abierta (pickup/plataforma) se limita solo la altura de pie a 72".
- `matchOfferToRequest`: asientos, medidas, peso, refrigeración. `matchTrip`: además misma ruta (ciudad/estado) y fechas que se cruzan.
- El detalle de oferta/solicitud muestra qué cabe y por qué no.

### Negociación y acuerdos (Deal)
- Estados: `negotiating → accepted_pending_payment → paid_escrow → completed` (o `cancelled`).
- Propuestas versionadas; solo se acepta la propuesta pendiente del otro. Pago **simulado** con comisión 10%.
- Completado: ambos confirman. Cancelación con penalidades del PRD (tabla en `app/api/deals/[id]/cancel`).
- Privacidad: el email del otro solo se ve cuando el acuerdo está pagado o completado.

### Calificaciones (`lib/ratings.ts`, modelo `Review`)
- Tras acuerdo **completado**, ambos califican 1–5 y comentario opcional, dentro de 30 días, una vez.
- **A ciegas**: se revelan cuando ambos califican o a los 14 días. Las estrellas cuentan al revelarse;
  **el comentario solo se publica si el admin lo aprueba**; el admin puede **ocultar** una calificación entera.

### Alertas por correo (`lib/alerts.ts`, modelo `TripAlert`)
- `kind="offers"`: cliente quiere saber de ofertas nuevas (desde su solicitud o desde filtros de /offers).
- `kind="requests"`: conductor quiere saber de solicitudes nuevas (desde filtros de /requests, opcionalmente su vehículo).
- Se disparan con `after()` al crear oferta/solicitud. Máx. 1 correo cada 3 h por alerta, máx. 20 activas por usuario,
  expiran con sus fechas (o 60 días), enlace de baja `/api/alerts/unsubscribe?token=` → página `/unsubscribed`.
- Gestión en `/alerts`. Limitación conocida: coincidencias dentro de las 3 h no generan correo (no hay cola ni cron).

### Panel de Admin (`/admin/*`, refresco automático general cada 30 s que se pausa al escribir)
- **Resumen**: totales, acuerdos recientes, botones para recrear/borrar datos demo.
- **Usuarios**: estado (activo / en espera por pago / suspendido / eliminar), verificación de conductores.
- **Ofertas y solicitudes**: cancelar, reactivar, borrar (solo sin acuerdos).
- **Acuerdos**: cancelar (reembolso simulado).
- **Calificaciones**: cola de comentarios, publicar/rechazar, ocultar.
- **Seguimiento en vivo**: viajes activos y antigüedad de posición; lista siempre disponible y mapa Mapbox opcional. La sección consulta la API cada 10 s.
- **Registro** (`AdminLog`): toda acción de admin con motivo.
- **Sesiones móviles**: en Admin → Usuarios, «Cerrar sesiones móviles» revoca los tokens del usuario.

### API móvil, apps y ubicación (Fases 1–3 en primer plano)
- Login móvil por enlace mágico, confirmación web y código PKCE de un solo uso (10 minutos); el token se almacena como hash y vence tras 30 días sin actividad.
- Las rutas `/api/v1/trips/*` validan el estado de la cuenta y la pertenencia al viaje; solo el chofer aprobado de un viaje pagado y activo puede enviar ubicación. El pasajero de ese viaje y Admin pueden leerla.
- Las posiciones se guardan en `DriverLocation`; el endpoint `/api/v1/admin/live` entrega solo viajes activos a Admin.
- Ably es opcional (`ABLY_API_KEY`): el polling sigue funcionando si no hay clave o el servicio falla.
- Las apps Expo tienen lockfiles separados; la raíz/ZIP web no instala Expo ni React Native. El mapa móvil usa `react-native-maps`. Solo Chofer pide ubicación en primer plano y deja de enviarla al salir de la app; no se solicita permiso en segundo plano.
- Mapbox usa un token público `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` restringido por dominio. Si falta o no carga, Admin conserva la lista; no se calcula ETA de carretera.
- Configurar en Hostinger un cron diario para `GET /api/cron/cleanup-locations`; el encabezado `Authorization` debe contener el valor de `LOCATION_CLEANUP_SECRET`. Así se eliminan ubicaciones con más de 30 días y credenciales vencidas.

### Páginas públicas y SEO
- `/` (inglés) y `/es` (español), 3 servicios (`/services/*`, `/es/servicios/*`) y 8 ciudades
  (`/nebraska/[city]`, `/es/nebraska/[city]`): contenido en `lib/seo-content.ts`.
- Metadatos, canonical, hreflang, Open Graph + imagen OG, JSON-LD (Organization, WebSite, Service, FAQPage, BreadcrumbList),
  `robots.txt`, `sitemap.xml`, `manifest`, ícono. Las zonas privadas están en `Disallow`.

### Confianza, contacto y precios públicos
- Páginas públicas nuevas (es/en, en el sitemap, enlazadas en el pie): Quiénes somos (`/about`, `/es/sobre-nosotros`),
  Contacto (`/contact`, `/es/contacto`), Términos (`/terms`, `/es/terminos`), Privacidad (`/privacy`, `/es/privacidad`),
  Precios (`/pricing`, `/es/precios`) y el índice de Servicios (`/services`, `/es/servicios`).
- ⚠️ Términos y Privacidad son un **borrador** que describe cómo funciona la app hoy (`components/public/legal-pages.tsx`): un abogado debe revisarlos antes del lanzamiento.
- Contacto: formulario → modelo `ContactMessage` + correo a `CONTACT_EMAIL` (o `ADMIN_EMAIL`); anti-spam con campo oculto y 5 mensajes/hora por IP. Bandeja en Admin → Mensajes.
- Calculadora de precios sin registro (`lib/pricing.ts`): rangos por milla y mínimos por tipo (asiento, paquetes, mueble, van, mudanza). Son supuestos de lanzamiento: ajustarlos con datos reales. Las páginas de ciudad muestran precios de referencia por ruta.
- Inicio de sesión: los enlaces públicos llevan `?lang=es|en` (el middleware fija el idioma y guarda la cookie). El correo del enlace de acceso es bilingüe.

### Datos de prueba (`prisma/demo-data.mjs`)
- Usuarios `*@demo.collagetaxi.com` con nombres "· Demo": 5 conductores, 5 clientes, vehículos, 10 ofertas,
  8 solicitudes, 7 acuerdos en todos los estados y 4 calificaciones (una con teléfono para practicar moderación).
- Se borran con el botón de Admin o `DEMO_DATA=off`. **Borrar antes de abrir al público.**

### Seguridad aplicada
- Rutas privadas protegidas en `middleware.ts` (solo revisa cookie; cada página/API valida con `auth()`).
- `lib/guards.ts`: `getSessionUser`, `requireUser(level)`, `requireAdmin`, `accountBlock`, `logAdmin`, `ACTIVE_OWNER`.
- APIs de listados requieren sesión; PATCH con lista blanca de campos y la misma validación que al crear.
- Middleware rechaza escrituras a `/api/*` desde otro origen (defensa CSRF extra; Auth.js tiene la suya).
- Límite de magic links: 3 por email y 10 por IP cada 15 min (`lib/rate-limit.ts`, en memoria).
- Cabeceras: HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy; sin `X-Powered-By`.

---

## 6. Mapa del código

```
apps/
  passenger/  app Expo de cliente/pasajero
  driver/     app Expo de chofer
packages/shared/  login PKCE, cliente API y almacenamiento seguro Expo
app/
  page.tsx, es/, nebraska/, services/, es/servicios/   páginas públicas (SEO)
  robots.ts, sitemap.ts, manifest.ts, opengraph-image.tsx, icon.svg
  auth/signin (server action), auth/verify, unsubscribed/
  (dashboard)/  offers, requests, deals, vehicles, alerts, profile, users/[id], dashboard
  (dashboard)/admin/  layout (pestañas + AutoRefresh), users, trips, deals, reviews, log, AdminAction.tsx
  api/  offers, requests (+updates), deals (+proposals, accept, pay, complete, cancel, review),
        v1/mobile/auth (request, login, exchange, logout), v1/trips (location, status), v1/admin/live, v1/live/token,
        vehicles, vehicle-models, driver, profile, alerts (+[id], unsubscribe), admin/* (users, offers, requests, deals, reviews, demo, config, drivers)
components/  board/ (tablas), public/ (landing, ciudad, servicio, shell, json-ld), formularios, stars, alert-button
lib/  validation, trip-input, matching, geo, ratings, alerts, mail, guards, rate-limit, format, seo-content, seo-meta, board-rows
prisma/  schema.prisma, seed.mjs, vehicle-catalog.mjs, demo-data.mjs
messages/  es.json, en.json
docs/  PRD.md, SETUP.md, HANDOFF.md (este archivo), MOBILE_PLAN.md
```

Modelos Prisma: User, Account, Session, VerificationToken, DriverProfile, Vehicle, VehicleModel, TripOffer, TripRequest,
Deal, Proposal, Payment, CompletionConfirmation, Cancellation, WalletCredit, PlatformConfig, Review, AdminLog, TripAlert,
MobileAuthRequest, MobileSession, DriverLocation.

---

## 7. Lecciones / trampas encontradas

- El correo de collagetaxi.com es **Titan**, no Hostinger Mail → `EMAIL_HOST=smtp.titan.email`.
- Contraseñas con `$`, `#`, `%` en variables de entorno dieron "535 authentication failed": usar solo alfanuméricos.
- En Hostinger, cambiar variables exige "Apply changes"; si no, no se aplican.
- Prisma no puede correr en el middleware (Edge) → el middleware solo revisa la cookie de sesión.
- `prisma generate` no descarga motores en el sandbox de Claude: para revisar tipos localmente se usó
  `PRISMA_QUERY_ENGINE_LIBRARY=<archivo vacío> PRISMA_SCHEMA_ENGINE_BINARY=/bin/true PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate`.
  `next build` local funciona (avisa de Prisma al recolectar datos, sin fallar).
- `git push` desde el sandbox fue rechazado: la sesión solo tenía lectura del repo.
- No usar `pkill -f "next start"` en el sandbox: mata el propio shell.

---

## 8. Pendientes (prioridad)

**Antes de abrir al público**
1. Rotar `EMAIL_PASSWORD` y `AUTH_SECRET` (se vieron en el chat).
2. Revisión por abogado de los Términos y la Privacidad (ya hay un borrador publicado).
3. Revisión legal: en Nebraska la PSC regula las TNC (LB 629, 2015); carga por pago entre estados puede requerir USDOT. Seguros.
4. Borrar datos demo y quitar `DEMO_DATA`.
5. **Subir el código a GitHub**: dar permiso de escritura a la sesión (push de la rama `fix/seguridad-mvp` + PR a `main`)
   o subir el zip por la web. La rama `copilot/collage-transport-nebraska` es la base; otras ramas `copilot/*` son intentos viejos sin relación.

**Fase 1**
6. Pagos reales con Stripe (webhooks) y retención automática por falta de pago.
7. Liberación automática del pago a las 24 h (`autoReleaseAt` existe, falta un cron).
8. Chat interno y direcciones exactas visibles solo tras el pago (PRD §5).
9. Documentos del conductor como archivos en almacenamiento privado (hoy son texto en la BD).
10. Reportes/disputas, correos de aviso (propuesta nueva, acuerdo aceptado, recordatorio de calificar), resumen diario de alertas.
11. Respaldo diario de Neon o plan pagado.
12. Millas reales (Mapbox/Google), Google Search Console + Google Business Profile, pruebas automáticas.
13. Dinero como `Decimal`/centavos (hoy `Float`); migraciones Prisma en vez de `db push`.

**No hacer**: cobrar dinero real sin Stripe y revisión legal; mostrar teléfonos/correos antes del pago; borrar acuerdos pagados;
aprobar conductores sin revisar documentos.

---

## 9. Historial de commits (rama `fix/seguridad-mvp`, sobre `copilot/collage-transport-nebraska`)

1. `fix: seguridad y reglas del MVP` — rol admin en sesión, deals privados, emails ocultos, PATCH con lista blanca, verificación de conductores.
2. `chore: preparar despliegue en Hostinger` — SMTP, ADMIN_EMAIL, middleware sin Prisma, `db push` en build.
3. `feat: SMTP con EMAIL_USER/EMAIL_PASSWORD`.
4. `feat: vehículos, catálogo de capacidades y compatibilidad de carga`.
5. `fix: validación de datos` — fechas, lugares, precios, zona horaria, ruta+fechas en compatibilidad, enlace Admin.
6. `feat: datos demo y SEO público (es/en)`.
7. `feat: ofertas y solicitudes como tablas tipo load board`.
8. `feat: control total de admin, calificaciones moderadas y seguridad`.
9. `feat: aviso de solicitudes nuevas, alertas por correo y auto-refresco de admin`.
10. `docs: HANDOFF.md`.
11. `feat: registro con tipo de cuenta (busca/ofrece transporte, persona/empresa) y próximos pasos`.
12. `feat: páginas de confianza (quiénes somos, contacto, términos, privacidad), calculadora de precios e índice de servicios`.
13. `fix: redirigir /es/auth/signin y URLs adivinadas al inicio de sesión; página 404 con marca` — `middleware.ts` redirige `/es|en/<ruta de app>` y alias (`/login`, `/es/iniciar-sesion`, `/registro`…) a `/auth/signin?lang=`; `app/not-found.tsx` bilingüe con SiteShell. Vista móvil pública revisada a 390 px (sin desbordes).
14. `feat: placa del vehículo, catálogo ampliado, disponibilidad clara con "cualquier destino" y arreglo de sesión al volver atrás`:
    - Vehicle: `plateNumber` (obligatoria para vehículos nuevos), `plateState`, `color`. Privada: dueño, admin y la otra parte de un deal pagado (`deals/[id]`).
    - Catálogo: 179 modelos / 29 marcas; opción "mi modelo no está en la lista" dentro de cada marca.
    - TripOffer: `anyDestination`, `maxTripMiles`, `rateUnit` ("trip" | "mile"). Con destino libre `destCity = ""` y precio por milla. `matchTrip` y alertas lo aceptan para cualquier destino (respetando `maxTripMiles`). Etiquetas en `lib/trip-labels.ts`.
    - Formulario "Publicar mi disponibilidad": ciudad + ventana de hora (rellena +1 h) + "a una ciudad" / "a donde el cliente necesite".
    - Sesión: `/auth/signin` y `/auth/verify` redirigen a `/dashboard` si ya hay sesión; `RefreshOnBack` recarga páginas restauradas del caché del navegador; páginas públicas muestran "Mi panel" (`components/public/account-link.tsx`); `session.user` ya no expone toda la fila del usuario.
