# Seguridad Hito 3 - SSP-UXLab

## Estado Actual

El MVP tiene Row Level Security (RLS) habilitado a nivel de varias tablas en Supabase, pero todavia no cuenta con seguridad productiva por institucion, usuario o membresia de proyecto.

El acceso inicial registra datos de usuario y mantiene sesion local en `localStorage`, pero no utiliza Supabase Auth ni `auth.uid()`. Las operaciones del Proposito 1 se canalizan desde el frontend hacia FastAPI, y FastAPI consulta Supabase/PostgreSQL desde el backend.

Algunas politicas existentes permiten acceso a roles `anon` y `authenticated` con condiciones abiertas. Por eso RLS esta encendido tecnicamente, pero aun no restringe por usuario, institucion o proyecto.

## Hallazgo Principal

La aplicacion ya no mantiene componentes React conectados directamente a Supabase para las etapas del Proposito 1. El camino principal de datos queda:

- **Frontend -> FastAPI -> PostgreSQL/Supabase**: usado por Investigacion, Personas, Habilitacion y expectativas, Necesidades, Vinculacion, Medicion, Momentos criticos, Calendarizacion, Evidencias, Resultados y Ruta.

Esto reduce la exposicion del frontend y centraliza validaciones, errores y reglas de acceso en backend. Sin embargo, endurecer RLS directamente sobre la demo todavia requiere autenticacion real y membresia por proyecto para evitar bloquear operaciones legitimas.

## Auditoria RLS Ejecutada

Se ejecutaron consultas de solo lectura contra el catalogo PostgreSQL de Supabase (`pg_class`, `pg_policies` y `pg_enum`). No se modificaron tablas, datos ni politicas.

Se confirmo `rls_enabled = true` en tablas principales como:

- `calendarizacion_actividad`
- `evidencia`
- `expectativa`
- `habilitacion`
- `indicador`
- `investigacion`
- `momento_critico`
- `necesidad`
- `persona_usuaria`
- `proyecto`
- `registro_etapa`
- `usuario`
- `vinculacion`

Las politicas observadas se concentran en `evidencia`, `expectativa`, `habilitacion`, `necesidad` y `persona_usuaria`. Permiten roles `anon` y `authenticated` con condiciones abiertas:

- `qual = true`
- `with_check = true`

Esto significa que RLS esta encendido tecnicamente, pero aun no restringe por `proyecto_id`, usuario autenticado ni membresia institucional.

## Auditoria de Enums

Valores confirmados:

- `estado_calendarizacion`: `pendiente`, `programada`, `en_ejecucion`, `completada`.
- `estado_proyecto`: `en_progreso`, `completado`, `pausado`.

Hallazgo:

- `estado_necesidad` contiene valores mezclados por formato y capitalizacion, como `pendiente`, `Pendiente`, `en_proceso`, `Borrador`, `Validado`, `En analisis`, `Priorizada` y `Resuelta`.

Este punto queda como deuda de normalizacion antes de endurecer validaciones backend o politicas RLS.

## Decision Tecnica

No se incluyen scripts SQL ejecutables en el repositorio para evitar confusion del equipo y evitar una activacion accidental sobre la demo.

Para una activacion productiva futura se propone:

- Implementar Supabase Auth o autenticacion equivalente.
- Asociar usuarios a proyectos mediante una tabla de membresia.
- Mantener operaciones del frontend mediadas por FastAPI y agregar validacion de permisos por usuario/proyecto.
- Definir politicas RLS por `proyecto_id`.
- Probar aislamiento entre usuarios y proyectos antes de produccion.

## Evidencias Para El Informe

- Captura de Supabase mostrando RLS habilitado en tablas principales.
- Captura de policies actuales con roles `anon` y `authenticated`.
- Captura de condiciones abiertas `qual = true` / `with_check = true`.
- Captura de enums reales de Supabase.
- Captura de este documento.
- Captura del frontend consumiendo datos por FastAPI.
- Captura de endpoints FastAPI del Proposito 1 respondiendo correctamente.

