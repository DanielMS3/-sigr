# CHANGELOG — SIGR

Todos los cambios notables de este proyecto están documentados en este archivo.

El formato sigue el estándar [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

---

## [1.0.0] — 2026-05-10 — Línea Base Inicial

Esta versión constituye la **línea base oficial** del Sistema Integral de Gestión de Restaurante (SIGR), incluyendo todos los módulos funcionales especificados en el documento técnico (sección 4.2).

### Agregado

#### Módulo de autenticación de usuarios
- Sistema de login con validación de credenciales
- Tres roles definidos: `admin`, `mesero` (extensible a `cliente`)
- Control de acceso por rol: el rol `mesero` no accede a Caja ni a edición de menú
- Cierre de sesión disponible desde la barra lateral
- Pantalla de login con instrucciones de credenciales de prueba

#### Módulo de menú digital
- Listado de platos con nombre, categoría, precio y descripción
- Filtrado por categoría (Entradas, Principales, Postres, Bebidas)
- Búsqueda en tiempo real por nombre de plato
- CRUD completo: crear, editar, eliminar platos (solo admin)
- Toggle de disponibilidad por plato (activar / desactivar)
- Integración con IA: sugerencias de nuevos platos generadas por Claude

#### Módulo de pedidos en tiempo real
- Creación de pedidos asignados a mesa y mesero
- Selección de ítems desde el menú disponible con cantidades
- Cálculo automático del total del pedido
- Flujo de estados: `pendiente → en_cocina → listo → cerrado`
- Filtrado de pedidos por estado
- Integración con IA: análisis de rendimiento y top platos

#### Módulo de reservas
- Registro de reservas con cliente, fecha, hora, número de personas y mesa
- Estados de reserva: `pendiente`, `confirmada`, `cancelada`
- Filtrado por fecha específica
- Confirmación y cancelación de reservas con un clic
- Integración con IA: análisis de carga operativa del día

#### Módulo de cierre de caja y reportes
- Resumen de ventas del día: total, pedidos cerrados, ticket promedio
- Top platos por ingresos generados
- Lista de pedidos activos pendientes de cierre
- Cierre manual de pedidos listos
- Integración con IA: reporte ejecutivo del día generado automáticamente

#### Asistente IA flotante (SIGR Assistant)
- Chat persistente disponible en todos los módulos
- Contexto dinámico del restaurante inyectado en cada consulta
- Acceso mediante botón flotante ✦ en esquina inferior derecha
- Historial de conversación dentro de la sesión

#### Interfaz general
- Navegación lateral (sidebar) con acceso a módulos según rol
- Tema oscuro con paleta de colores personalizada (tokens CSS)
- Sistema de componentes reutilizables: `Card`, `Btn`, `Badge`, `Input`, `Select`
- Datos de demostración precargados (menú, pedidos, reservas de ejemplo)

### Datos de prueba incluidos

- 10 platos distribuidos en 4 categorías
- 3 pedidos de ejemplo con diferentes estados
- 3 reservas de ejemplo (2 confirmadas, 1 pendiente)
- 10 mesas configuradas con diferentes capacidades

---

## [Próximas versiones — Planificadas]

### [1.1.0] — Prevista
- Persistencia de datos con backend (Node.js + PostgreSQL o Firebase)
- Impresión de comandas y recibos
- Notificaciones en tiempo real entre módulos (WebSockets)

### [1.2.0] — Prevista
- Panel de cliente con menú digital público y seguimiento de pedido
- Historial de ventas por período (semanal, mensual)
- Exportación de reportes a PDF

### [2.0.0] — Prevista
- Aplicación móvil para meseros (React Native)
- Integración con sistemas de pago electrónico
- Dashboard analítico avanzado con gráficos históricos
