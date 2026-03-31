# PRD for Collage Transport MVP Nebraska

## Alcance / Scope
Este documento detalla el producto mínimo viable (MVP) para el servicio de transporte Collage en Nebraska, que incluye las funcionalidades básicas necesarias para las operaciones iniciales y el camino hacia futuras mejoras.

## Roles
- **Solicitante:** Usuario que necesita el servicio de transporte.  
- **Conductor:** Proveedor del servicio de transporte.  
- **Admin:** Responsable de la gestión de la plataforma.

## Reglas de privacidad
- Los usuarios serán anónimos hasta que se realice el pago.  
- Para la Fase 0, se harán pagos simulados (sin Stripe). Sin embargo, la máquina de estados se diseñará para futuros pagos en escrow.

## Documentación de verificación
Se proporcionará documentación manual para el proceso de verificación.

## Cadena de frío
- Ninguna  
- Cooler Ice  
- Refrigeración activa

## Exclusivo / Compartido / Cualquiera 
La opción de transporte será:  
- Exclusivo  
- Compartido  
- Cualquiera

## Precios compartidos por distancia
Los precios se ajustarán por distancia y se establecerán radii de precio igual por defecto.

## Créditos en la billetera y solicitudes de reembolso
- Las solicitudes de reembolso serán manuales.  

## Penaltis por cancelación
Los penaltis por cancelación serán establecidos por defecto en la plataforma.

## Comisión de la plataforma
Se cobrará una comisión del 10% que será ajustable.

## Zona horaria
Se utilizará la zona horaria America/Chicago.

## i18n
La localización estará basada en la configuración del navegador del usuario.

## Fases
### Fase 0 (sin Stripe)
- Implementación de pagos simulados.
- Las funcionalidades iniciales están alineadas con las reglas de privacidad, verificación y precios mencionados.

### Fase 1 (Stripe)
- Implementación de pagos reales a través de Stripe.
- Mejora del sistema de gestión de pagos y microtransacciones con reglas de privacidad actualizadas.