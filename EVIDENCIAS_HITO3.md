# Evidencias Hito 3 - Plataforma Web SSP-UXLab

## Actividad 73: UI de Selección de Propósito

Se implementó una pantalla de selección de propósito con foco en el Propósito 1 del MVP.

Resultado:

- Título y descripción del propósito metodológico.
- Propósito 1 visible y habilitado.
- Propósitos 2, 3, 4 y 5 visibles como fuera del alcance del MVP.
- Navegación hacia el flujo del Propósito 1 sin pantalla rota.

Evidencias sugeridas:

- Captura de pantalla inicial.
- Captura de selección de Propósito 1.
- Captura de propósitos bloqueados o próximos.

## Actividad 74: UI del Wizard del Propósito 1

Se implementó y ajustó el wizard del Propósito 1 con siete etapas metodológicas:

1. Investigación
2. Personas usuarias
3. Habilitación y expectativas
4. Necesidades
5. Vinculación
6. Medición
7. Momentos críticos

Resultado:

- Etapas visibles y ordenadas.
- Estado activo diferenciado.
- Navegación Anterior/Siguiente.
- Integración con Investigación, Personas, Habilitación, Necesidades, Evidencias y Asistencia IA.
- Placeholders funcionales para etapas planificadas.

Evidencias sugeridas:

- Captura del wizard completo.
- Captura de cambio entre etapas.
- Captura de una etapa disponible.
- Captura de etapa planificada.

## Actividad 76: Catálogo de Herramientas

Se implementó el componente `CatalogoHerramientasProp1` y el archivo de datos `app/data/herramientasProp1.ts`.

El catálogo muestra exactamente 8 herramientas MVP:

1. Formulario de registro de investigación.
2. Plantilla de perfiles de usuario.
3. Formulario de declaración de expectativas.
4. Tabla de necesidades priorizadas.
5. Tabla de vinculación necesidad-actividad.
6. Plantilla de calendarización de actividades.
7. Carga de evidencias por actividad.
8. Dashboard de resultados del Propósito 1.

Resultado:

- Tarjetas con nombre, tipo, etapa, descripción, viabilidad MVP y estado.
- Filtros por etapa, tipo y estado.
- Herramientas disponibles navegan hacia su etapa o módulo.
- Herramientas en desarrollo quedan visibles sin bloquear el recorrido.

Evidencias sugeridas:

- Captura del catálogo con 8 herramientas.
- Captura filtro Estado = En desarrollo.
- Captura filtro Tipo = Formulario de carga.
- Captura de navegación desde herramienta disponible.

## Actividad 77: Calendarización Metodológica

Se implementó `CalendarizacionProp1` y `app/data/calendarizacionProp1.ts`.

La vista fue corregida para funcionar como calendarización metodológica del Propósito 1, alineada con la guía UXLab. Ya no se usa como cronograma técnico interno.

Actividades metodológicas base:

1. Diseñar y ejecutar la investigación de las personas usuarias.
2. Describir a las personas usuarias de los servicios institucionales.
3. Detectar y consensuar los niveles de habilitación y expectativas de las personas usuarias para el servicio.
4. Comprender a fondo las motivaciones y necesidades de las personas al recurrir al servicio ofrecido por la institución.
5. Alinear las necesidades de las personas usuarias con la oferta de servicio.
6. Observar y medir la experiencia real entregada a través de los estándares de servicio disponibles.
7. Identificar los momentos críticos de la experiencia actual.

Resultado:

- Resumen superior con contadores.
- Filtros por etapa, responsable, estado y semana.
- Tabla/listado de actividades.
- Timeline semanal.
- Botón "Nueva actividad metodológica".
- Formulario alineado con la tabla real `calendarizacion_actividad`.
- Inserción mediante endpoint FastAPI `POST /calendarizacion`.

Campos persistidos:

- `proyecto_id`
- `etapa`
- `nombre_actividad`
- `fecha_inicio`
- `fecha_fin`
- `responsable`
- `estado`
- `observaciones`

Valores confirmados para `estado_calendarizacion`:

- `pendiente`
- `programada`
- `en_ejecucion`
- `completada`

Evidencias sugeridas:

- Captura de la pestaña Calendarización.
- Captura del formulario Nueva actividad metodológica.
- Captura de validaciones obligatorias.
- Captura de actividad creada correctamente.
- Captura de tabla/listado actualizado.
- Captura de timeline actualizado.
- Captura de la fila creada en Supabase.

## Seguridad y Auditoría Supabase

Se realizó auditoría técnica de RLS y enums en Supabase.

Resultado:

- RLS aparece habilitado en tablas principales.
- Las policies actuales son permisivas para `anon` y `authenticated`.
- Se documentó el riesgo en `SEGURIDAD_HITO3.md`.
- No se incluyen scripts SQL ejecutables para evitar confusión del equipo.

Evidencias sugeridas:

- Captura de RLS habilitado.
- Captura de policies abiertas.
- Captura de enums reales.
- Captura de `SEGURIDAD_HITO3.md`.

## Validación Técnica

Comandos ejecutados:

- `npx.cmd tsc --noEmit`
- `npm.cmd run build`
- `python -m py_compile` sobre módulos backend principales.

Resultado:

- TypeScript sin errores.
- Build Next.js compilado correctamente.
- Backend sin errores de sintaxis básica.

Observación:

- `npm.cmd run lint` todavía presenta errores y warnings asociados a deuda técnica previa: uso de `any`, efectos con `setState`, comillas sin escapar, warnings de `<img>` y variables sin uso.

## Deuda Técnica Pendiente

- Resolver errores de ESLint.
- Migrar consultas directas frontend -> Supabase hacia FastAPI o autenticación real.
- Implementar Supabase Auth o autenticación equivalente.
- Normalizar valores de `estado_necesidad`.
- Completar flujos reales de Vinculación, Medición, Momentos críticos y Resultados.
- Agregar pruebas automatizadas.
