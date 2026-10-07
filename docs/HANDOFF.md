# Collage Transport — Estado del proyecto y guía para continuar

> Documento de traspaso (handoff). Escrito para que una persona o un modelo de IA pueda retomar el trabajo
> sin el historial de la conversación. Última actualización: **2026-10-03**.
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
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | (opcional, fase posterior) Token público restringido por dominio para el mapa web |
| `EXPO_PUBLIC_API_URL` | Dirección de la API para las apps; pública, por defecto `https://app.collagetaxi.com` |
| (opcional) `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` | Verificación de Search Console / Bing |

Guardar variables en Hostinger requiere pulsar **"Apply changes"** (o "Save and redeploy"); eso vuelve a construir la app.

---

## 3. Cómo se despliega (importante)

No hay CI ni conexión GitHub→Hostinger (no tenemos permiso de escritura en GitHub). El flujo usado:

1. Trabajar en una copia local del repo (rama `fix/seguridad-mvp`, creada desde `origin/copilot/collage-transport-nebraska`).
2. `git commit` y luego `git archive --format=zip -o collage-transport.zip HEAD`.
3. En **hPanel → Websites → app.collagetaxi.com → Deployments → Redeploy → "Upload new files"**, subir el zip y pulsar **"Save and redeploy"**.
4. Hostinger ejecuta: `npm install` (con `postinstall: prisma generate`) y `npm run build`, que es:
   `prisma generate && prisma db push --skip-generate && node prisma/seed.mjs && next build`
   - `prisma db push` sincroniza el esquema con Neon (**no hay migraciones**; cambios destructivos pedirían confirmación y fallarían).
   - `prisma/seed.mjs` carga el catálogo de vehículos. `DEMO_DATA` solo modifica demos fuera de producción; en `NODE_ENV=production` el seed nunca crea ni borra demos.
5. Revisar el log del deployment (debe terminar en "Deployment completed") y **Runtime logs** para errores en ejecución.

Detalles de Hostinger: Node 20, Next.js detectado automáticamente, salida `.next`, la app se "duerme" sin tráfico
(primera visita lenta). El zip se sube desde el navegador (Claude in Chrome con `file_upload`).

Desarrollo local: `docker-compose up -d` (Postgres) + `.env` (ver `.env.example`) + `npm run dev`.
Sin `EMAIL_*` el magic link se imprime en la consola.

Los workspaces Expo viven en `apps/passenger` y `apps/driver`; el cliente API y el almacenamiento protegido (`expo-secure-store`) están en `packages/shared`. Después de `npm install` en la raíz, inicia cualquiera con `cd apps/passenger && npx expo start` o `cd apps/driver && npx expo start`. El login móvil usa un código que se copia desde la página de confirmación; las apps guardan el token en el almacenamiento seguro del dispositivo.

---

## 4. Stack técnico

- **Next.js 15.5** (App Router, TypeScript, React 19), **Tailwind 4**, componentes UI propios en `components/ui`.
- **Prisma 5.22** + PostgreSQL (Neon). Esquema en `prisma/schema.prisma`.
- **Auth.js v5 (next-auth beta)**: login sin contraseña por **magic link** (proveedor Nodemailer con id `"email"`),
  sesiones en base de datos (PrismaAdapter). El envío se hace con una **server action** (`app/auth/signin/actions.ts`).
- **next-intl 4**: español/inglés. Textos en `messages/es.json` y `messages/en.json`. El idioma de la app sale de la
  cookie `NEXT_LOCALE`; en páginas públicas lo fuerza la URL (middleware pone el header `x-page-locale`).
- **nodemailer 10** (con `overrides` en package.json para satisfacer el peer de next-auth).
- `npm audit --omit=dev` → 0 vulnerabilidades (los 11 avisos de Hostinger son de devDependencies).

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

### Panel de Admin (`/admin/*`, refresco automático cada 30 s que se pausa al escribir)
- **Resumen**: totales, acuerdos recientes, botones para recrear/borrar datos demo.
- **Usuarios**: estado (activo / en espera por pago / suspendido / eliminar), verificación de conductores.
- **Ofertas y solicitudes**: cancelar, reactivar, borrar (solo sin acuerdos).
- **Acuerdos**: cancelar (reembolso simulado).
- **Calificaciones**: cola de comentarios, publicar/rechazar, ocultar.
- **Registro** (`AdminLog`): toda acción de admin con motivo.
- **Sesiones móviles**: en Admin → Usuarios, «Cerrar sesiones móviles» revoca los tokens del usuario.

### API móvil y ubicación (base Fase 1)
- Login móvil por enlace mágico, confirmación web y código PKCE de un solo uso (10 minutos); el token se almacena como hash y vence tras 30 días sin actividad.
- Las rutas `/api/v1/trips/*` validan el estado de la cuenta y la pertenencia al viaje; solo el chofer aprobado de un viaje pagado y activo puede enviar ubicación. El pasajero de ese viaje y Admin pueden leerla.
- Las posiciones se guardan en `DriverLocation`; el endpoint `/api/v1/admin/live` entrega solo viajes activos a Admin.
- Ably es opcional (`ABLY_API_KEY`): el polling sigue funcionando si no hay clave o el servicio falla.
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
