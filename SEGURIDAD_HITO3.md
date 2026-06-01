# Seguridad Hito 3 - SSP-UXLab

## Estado Actual

El MVP tiene Row Level Security (RLS) habilitado a nivel de varias tablas en Supabase, pero todavía no cuenta con seguridad productiva por institución, usuario o membresía de proyecto.

El acceso inicial registra datos de usuario y mantiene sesión local en `localStorage`, pero no utiliza Supabase Auth ni `auth.uid()`. Además, algunas políticas existentes permiten acceso a roles `anon` y `authenticated` con condiciones abiertas.

## Hallazgo Principal

La aplicación mezcla dos caminos de datos:

- **FastAPI -> PostgreSQL/Supabase**: usado por Investigación, Calendarización, Resultados, Ruta y otros endpoints.
- **Frontend -> Supabase directo con anon key**: usado todavía en Personas, Habilitación, Necesidades y Evidencias.

Endurecer RLS directamente sobre la demo puede romper flujos actuales que dependen de `NEXT_PUBLIC_SUPABASE_ANON_KEY` sin Supabase Auth.

## Auditoría RLS Ejecutada

Se ejecutaron consultas de solo lectura contra el catálogo PostgreSQL de Supabase (`pg_class`, `pg_policies` y `pg_enum`). No se modificaron tablas, datos ni políticas.

Se confirmó `rls_enabled = true` en tablas principales como:

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

Las políticas observadas se concentran en `evidencia`, `expectativa`, `habilitacion`, `necesidad` y `persona_usuaria`. Permiten roles `anon` y `authenticated` con condiciones abiertas:

- `qual = true`
- `with_check = true`

Esto significa que RLS está encendido técnicamente, pero aún no restringe por `proyecto_id`, usuario autenticado ni membresía institucional.

## Auditoría de Enums

Valores confirmados:

- `estado_calendarizacion`: `pendiente`, `programada`, `en_ejecucion`, `completada`.
- `estado_proyecto`: `en_progreso`, `completado`, `pausado`.

Hallazgo:

- `estado_necesidad` contiene valores mezclados por formato y capitalización, como `pendiente`, `Pendiente`, `en_proceso`, `Borrador`, `Validado`, `En análisis`, `Priorizada` y `Resuelta`.

Este punto queda como deuda de normalización antes de endurecer validaciones backend o políticas RLS.

## Decisión Técnica

No se incluyen scripts SQL ejecutables en el repositorio para evitar confusión del equipo y evitar una activación accidental sobre la demo.

Para una activación productiva futura se propone:

- Implementar Supabase Auth o autenticación equivalente.
- Asociar usuarios a proyectos mediante una tabla de membresía.
- Migrar operaciones directas de frontend hacia FastAPI o autenticarlas correctamente.
- Definir políticas RLS por `proyecto_id`.
- Probar aislamiento entre usuarios y proyectos antes de producción.

## Evidencias Para El Informe

- Captura de Supabase mostrando RLS habilitado en tablas principales.
- Captura de policies actuales con roles `anon` y `authenticated`.
- Captura de condiciones abiertas `qual = true` / `with_check = true`.
- Captura de enums reales de Supabase.
- Captura de este documento.

## Frase Sugerida Para Presentación

> La auditoría muestra que RLS está habilitado en tablas principales, pero varias políticas siguen abiertas para `anon` y `authenticated` con condiciones `true`. No se endurecieron directamente en la demo porque el MVP aún conserva flujos con acceso directo desde frontend usando anon key. Como mitigación del Hito 3, se documentó el riesgo, se confirmó el estado real de Supabase y se definió una ruta futura de seguridad por `proyecto_id`, condicionada a Supabase Auth y membresía por proyecto.

## Riesgo Residual

Mientras no se reemplacen las políticas abiertas por RLS con Supabase Auth y membresía por proyecto, el MVP debe considerarse una demo controlada y no un despliegue productivo multiinstitución.
