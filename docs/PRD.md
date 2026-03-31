# Collage Transport — PRD (MVP Nebraska)

**Repositorio:** `milloagencia/Transporte`  
**Branch:** `main`  
**Fecha:** 2026-03-31

Este documento define el **Producto Mínimo Viable (MVP)** para lanzar y validar la plataforma **Collage Transport** en **Nebraska**, con foco en pruebas, bajo costo y escalamiento progresivo.

> Nota: En **Fase 0** no habrá integración de Stripe. Se implementará un **pago simulado** ("Simulated Pay") para validar el flujo completo (Deal, penalidades, confirmación, wallet). La arquitectura y la máquina de estados quedarán listas para habilitar Stripe en Fase 1.

---

## 1. Visión
Crear una alternativa para que:
- Conductores no viajen vacíos (pasajeros y/o cargas).
- Solicitantes (personas o negocios) encuentren opciones más económicas y flexibles.
- Ambas partes negocien (acepten o regateen) hasta cerrar un acuerdo.

---

## 2. Alcance geográfico y timezone
- **Cobertura inicial:** Nebraska.
- Se permite publicar viajes que cruzan estado si **origen o destino** está en Nebraska (configurable).
- **Timezone por defecto:** `America/Chicago`.

---

## 3. Idiomas (i18n)
- Interfaz bilingüe: **Español / English**.
- Idioma por defecto: **el del navegador**.
- El usuario puede cambiar el idioma en su perfil (persistente).

---

## 4. Roles y terminología
- **Solicitante (Requester):** busca transporte (personas o cargas).
- **Conductor (Driver):** ofrece transporte.
- **Admin:** configura reglas, revisa documentos, modera.

La misma cuenta puede tener rol de **Solicitante** y también de **Conductor**.

---

## 5. Principios de seguridad y privacidad
- **Direcciones exactas ocultas** hasta que el Deal esté en estado **Pagado (Escrow)** (en Fase 0 será “pagado simulado”).
- Antes del pago: mostrar solo **zona aproximada** (ciudad / ZIP / área) y datos generales.
- Chat in-app. Contacto directo opcional después del pago.
- Historial auditado de propuestas y contraofertas.

---

## 6. Modalidades del servicio
### 6.1 Exclusivo / Compartido
Tanto ofertas como solicitudes permiten:
- **Exclusivo (Exclusive):** el viaje/envío es solo para ese solicitante.
- **Compartido (Shared):** el conductor puede aceptar múltiples solicitantes/envíos en el mismo viaje (según capacidad).
- **Cualquiera (Either):** no tiene preferencia.

Reglas:
- Si cualquiera exige **Exclusivo**, el Deal debe ser exclusivo.
- Si ambos aceptan **Compartido** o **Cualquiera**, el Deal puede ser compartido.

### 6.2 Refrigerados (Cold Chain)
Capacidad del vehículo/oferta:
- `none` (Ninguno)
- `cooler_ice` (Cooler/Ice)
- `active_refrigeration` (Refrigeración activa)

Requerimiento de la carga/solicitud:
- `none | cooler_ice | active_refrigeration`

Matching:
- `cooler_ice` requiere `cooler_ice` o `active_refrigeration`.
- `active_refrigeration` requiere `active_refrigeration`.

---

## 7. Publicaciones
### 7.1 Publicación del Conductor: Trip Offer
**Campos mínimos (Fase 0 sin mapa):**
- Origen aproximado: `city`, `state` (default NE), `zip`.
- Radio de recogida (millas): número (informativo en Fase 0).
- Destino aproximado: `city/state/zip`.
- Ventana de inicio: desde/hasta.
- Desvío máximo dispuesto (millas).
- Tipo de servicio: `people | cargo | mixed`.
- Exclusivo/Compartido/Cualquiera.
- Capacidad: asientos y/o carga (peso y size class S/M/L).
- Cold chain disponible.
- Tarifa propuesta (negociable).
- Recurrente: días + excepciones.

### 7.2 Publicación del Solicitante: Trip Request
**Campos mínimos (Fase 0 sin mapa):**
- Origen: `city/state/zip`.
- Destino: `city/state/zip`.
- Ventana de tiempo.
- Tipo: `people | cargo`.
- Detalle:
  - people: número de pasajeros
  - cargo: peso + size class + descripción breve
- Cold chain requerido (si aplica).
- Presupuesto propuesto (opcional).
- Exclusivo/Compartido/Cualquiera.

---

## 8. Negociación (Deal) — simétrica
Un Deal puede iniciarse desde:
- Offer → Requester propone/acepta
- Request → Driver propone/acepta

### 8.1 Propuestas versionadas
El Deal contiene una lista de **Proposals**. Cualquiera puede:
- **Aceptar** la propuesta actual
- **Contraofertar** (crea una nueva propuesta)

**Cuando ambos aceptan la misma propuesta**, el Deal pasa a: `accepted_pending_payment`.

---

## 9. Pagos (Fase 0: simulados) y escrow
### 9.1 Fase 0 — pago simulado
- Se implementa un botón/acción “Pagar (Simulado)”.
- Se registran estados de pago como si existiera un gateway real.

### 9.2 Fase 1 — Stripe
- Reemplazar pago simulado por Stripe.
- Usar webhooks para transiciones de estado.

### 9.3 Comisión plataforma
- Default: **10%**.
- Ajustable desde Admin.

---

## 10. Confirmación de completado
- Para liberar escrow (simulado en Fase 0): **ambas partes** deben confirmar “Completado”.
- Fallback (configurable): auto-regla después de X horas si no hay disputa.

Default:
- `auto_release_hours = 24` (si no hay disputa abierta)

---

## 11. Cancelaciones y penalidades (default ajustable)
**Solicitante cancela (antes de inicio):**
- > 24h: 5%
- 24h–6h: 25%
- < 6h: 75%

**Conductor cancela (antes de inicio):**
- > 24h: 25% + crédito $10
- 24h–6h: 50% + crédito $25
- < 6h: 100% + crédito $50

Defaults adicionales:
- `driver_cancel_threshold = 3 / 30 days` → suspensión 7 días

---

## 12. Shared pricing (por distancia) + créditos
### 12.1 Shared pricing por distancia
En compartido, el precio objetivo se normaliza por distancia estimada.

En Fase 0 (sin mapas):
- distancia estimada inicial: aproximación simple (p. ej. por tabla ZIP→lat/lng futura o reglas por ciudad/ZIP).
- UI muestra: “Estimación aproximada”.

### 12.2 Créditos (Wallet)
- Si al sumarse más participantes el precio objetivo baja, el sistema crea un **crédito interno**.
- El crédito puede:
  - aplicarse a futuros viajes
  - solicitarse como reembolso después del viaje

### 12.3 Reembolsos de créditos
- Fase 0: solicitudes manuales (admin las procesa).
- Fase 1+: automatización con proveedor de pagos.

---

## 13. Verificación de conductor (manual)
Para activar ofertas:
- licencia
- seguro
- inspección mecánica

Estados: `pending | approved | rejected | expired`.

---

## 14. Admin panel (MVP)
El Admin puede:
- aprobar/rechazar docs
- configurar:
  - comisión (10% default)
  - penalidades
  - límites (radios/desvíos)
  - categorías permitidas (incluye refrigerado)
  - auto_release_hours
- moderación (reportes, suspensiones)
- aprobar reembolsos de wallet (fase 0 manual)

---

## 15. Fases y estrategia de costos
### Fase 0 (validación, costo mínimo)
- Sin Stripe (pago simulado)
- Sin mapas (solo ciudad/ZIP)
- Verificación manual

### Fase 1 (primer lanzamiento público)
- Stripe real
- Cálculo de rutas real (Mapbox/Google) si hay uso

### Fase 2 (escalamiento)
- Mejor matching geoespacial
- Disputas avanzadas
- Verificación con terceros