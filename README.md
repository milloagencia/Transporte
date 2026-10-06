# Collage Transport

**Viajes compartidos y envío de carga entre ciudades de Nebraska.**
Rides and cargo between Nebraska cities.

🌐 En vivo / Live: **https://app.collagetaxi.com**

Collage Transport conecta a conductores que ya viajan entre ciudades —y tienen asientos o espacio de carga libres— con personas y negocios que necesitan viajar o mandar algo. El cliente publica lo que necesita, el conductor publica cuándo y dónde está disponible, acuerdan el precio y se califican al terminar. Bilingüe (español / inglés), pensado también para la comunidad hispana de Nebraska.

---

## Qué hace

**Para clientes (pasajeros, personas y empresas que envían carga)**
- Publicar una solicitud de viaje o de carga (medidas, peso, piezas, refrigeración).
- Ver los viajes disponibles en una tabla con filtros, estilo *load board*.
- Alertas por correo cuando aparece un viaje que coincide con lo que busca.
- Calculadora pública de precios sin registrarse.

**Para conductores**
- Registrar sus vehículos (marca, modelo, placa, asientos, medidas de carga). Catálogo de 179 modelos con capacidades aproximadas.
- Publicar su disponibilidad: ciudad, día y hora, y destino fijo **o "a donde el cliente necesite"** (precio por milla).
- Ver solicitudes compatibles con su vehículo y aviso de solicitudes nuevas.

**Acuerdos y confianza**
- Negociación de precio, aceptación, pago, cancelación y confirmación de entrega.
- Calificaciones en ambos sentidos (ciegas hasta que ambos califican); los comentarios los aprueba el admin.
- Los datos de contacto y la placa solo se comparten cuando el viaje está pagado.

**Administración**
- Control total: suspender, eliminar o poner en espera por falta de pago a usuarios; moderar viajes, acuerdos, reseñas y mensajes; registro de acciones. Se refresca cada 30 s.

**Público / SEO**
- Páginas por ciudad y por servicio en español e inglés, precios, quiénes somos, contacto, términos y privacidad, sitemap, datos estructurados.

## Tecnología

| Parte | Herramienta |
|---|---|
| Web | Next.js 15 (App Router, React 19, TypeScript), Tailwind CSS 4 |
| Idiomas | next-intl (es / en) |
| Base de datos | PostgreSQL en Neon, Prisma 5 |
| Inicio de sesión | Auth.js v5 con enlace mágico por correo |
| Correo | SMTP (Titan, `noreply@collagetaxi.com`) |
| Hosting | Hostinger — Node.js Web App |

## Correr en local

```bash
cp .env.example .env      # completar DATABASE_URL, AUTH_SECRET, EMAIL_* …
npm install
npm run build             # genera Prisma, aplica el esquema, carga el catálogo y compila
npm run dev               # http://localhost:3000
```

Variables principales: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`, `ADMIN_EMAIL`, `DEMO_DATA` (`on` carga datos de ejemplo). **Nunca** subas valores reales al repositorio.

## Documentación

- [`docs/HANDOFF.md`](docs/HANDOFF.md) — estado completo del proyecto, plataformas, cómo se despliega, mapa del código, lecciones aprendidas y pendientes.
- [`docs/PRD.md`](docs/PRD.md) — documento de producto original.
- [`docs/SETUP.md`](docs/SETUP.md) — instrucciones de instalación iniciales.

## Pendientes principales

Pagos con Stripe, liberación automática de pagos, chat entre usuarios, subida de documentos del conductor, rastreo en vivo, app móvil, revisión legal de términos y privacidad (reglas de la PSC de Nebraska / USDOT).

---

© Collage Transport · Nebraska, USA
