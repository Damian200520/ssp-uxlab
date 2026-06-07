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
- Mantener operaciones del frontend mediadas por FastAPI y agregar validación de permisos por usuario/proyecto.
- Implementar Supabase Auth o autenticación equivalente.
- Normalizar valores de `estado_necesidad`.
- Completar flujos reales de Vinculación, Medición, Momentos críticos y Resultados.
- Agregar pruebas automatizadas.

## Actividad 80 - Desarrollo UI de ejecucion paso a paso

Criterios de aceptacion del cronograma:

- Dado que la actividad 80 desarrolla la interfaz de ejecucion paso a paso, cuando se cargue la pantalla, entonces deben visualizarse los elementos principales definidos para esa funcion.
- Dado que la interfaz debe ser usable, cuando el usuario interactue con botones, formularios o navegacion, entonces debe recibir retroalimentacion visual clara sin bloquear el recorrido.
- Dado que la actividad 80 debe integrarse al MVP, cuando se ejecute la aplicacion, entonces la vista debe mantener coherencia visual con el flujo del Proposito 1.

Cambios implementados:

- Se creo la vista `EjecucionPasoAPasoProp1`.
- Se agrego una pestana "Ejecucion" dentro del Proposito 1.
- La vista muestra etapa activa, avance, progreso, accion recomendada y recorrido de 7 etapas.
- Se agregaron acciones directas para abrir etapa activa, calendarizacion, evidencias y actualizar ruta.
- Se reutiliza el estado del motor de ruta existente sin crear persistencia nueva.

Archivos modificados o creados:

- `app/components/EjecucionPasoAPasoProp1.tsx`
- `app/page.tsx`
- `EVIDENCIAS_HITO3.md`

Evidencias sugeridas:

- Captura de la pestana "Ejecucion" visible en el Proposito 1.
- Captura de la cabecera "Ejecucion paso a paso".
- Captura de las cuatro acciones: Planificar, Ejecutar, Respaldar y Revisar.
- Captura del listado de 7 etapas con estados visuales.
- Captura haciendo clic en "Abrir etapa activa" y mostrando que navega a la etapa correspondiente.
- Captura haciendo clic en "Abrir calendarizacion" y "Abrir evidencias".

Resultado:

- Estado: Cumplido.
- Observacion: la vista usa el motor de ruta existente y no agrega nuevas tablas ni endpoints.

## Actividad 81 - Desarrollo del flujo Vinculacion

Criterios de aceptacion del cronograma:

- Dado que la actividad 81 implementa el flujo de vinculacion, cuando el usuario complete el formulario, entonces debe poder registrar actores, relaciones, canales y nivel de vinculacion con la experiencia de servicio.
- Dado que la vinculacion debe ser revisable, cuando el usuario consulte los registros, entonces debe poder visualizar, editar o validar la informacion segun el alcance definido.
- Dado que la actividad 81 forma parte del Proposito 1, cuando la etapa sea validada, entonces el sistema debe preservar trazabilidad y habilitar el avance metodologico correspondiente.

Cambios implementados:

- Se fortalecio el formulario de Vinculacion con campos de actor responsable, actor externo, canal de vinculacion y nivel de vinculacion.
- Se agrego edicion de vinculaciones existentes desde registros y lienzo metodologico.
- Se agrego validacion de vinculaciones para diferenciar registros en borrador y registros validados.
- Se ajusto el motor de ruta para que Vinculacion no se marque como completada solo por existir un registro, sino cuando exista una vinculacion validada.
- Se mantuvo la persistencia mediante FastAPI y Supabase, sin enviar columnas inexistentes a la tabla.

Archivos modificados:

- `app/components/VinculacionFlow.tsx`
- `backend/app/models.py`
- `backend/app/crud.py`
- `backend/app/main.py`
- `EVIDENCIAS_HITO3.md`

Endpoints utilizados:

- `POST /vinculaciones`
- `GET /proyectos/{proyecto_id}/vinculaciones`
- `PATCH /vinculaciones/{vinculacion_id}`

Evidencias sugeridas:

- Captura del formulario de Vinculacion mostrando actor responsable, canal y nivel.
- Captura de validacion obligatoria al intentar guardar sin actor o canal.
- Captura de una vinculacion guardada en la pestana Registros.
- Captura del boton Editar cargando nuevamente la informacion en el formulario.
- Captura del lienzo metodologico con necesidad, actores, canal, nivel, relacion y observaciones.
- Captura del boton Validar y estado visual "Validada".
- Captura del avance metodologico posterior a validar la etapa.

Resultado:

- Estado: Cumplido.
- Observacion: la validacion de etapa se guarda como metadato dentro de `descripcion_vinculo`, ya que la tabla actual no tiene una columna dedicada para estado de validacion de vinculacion. Se recomienda normalizar este dato en una columna propia cuando se realice una migracion futura.

## Actividad 82 - Mejora UI de carga de evidencias

Cambios implementados:

- Se agrego carga de archivos mediante zona de arrastrar y soltar en la vista Evidencias.
- Se mantuvo el registro por URL como alternativa para Drive, Figma, Miro u otros repositorios.
- Se agrego seleccion manual de archivo desde el equipo.
- Se valida tamano maximo de archivo de 10 MB en frontend y backend.
- Se guarda el archivo mediante FastAPI y se registra la referencia en el campo existente `url_storage`.
- Se preparo integracion con Supabase Storage para permitir uso remoto por parte de UXLab.
- Se evita exponer Supabase directo en el frontend.

Archivos modificados:

- `app/components/EvidenciasFlow.tsx`
- `backend/app/main.py`
- `backend/app/models.py`
- `backend/app/storage_service.py`
- `.gitignore`
- `backend/Procfile`
- `EVIDENCIAS_HITO3.md`

Endpoints agregados:

- `POST /evidencias/archivo`
- `PATCH /evidencias/{evidencia_id}/archivo`
- Archivos servidos desde `/uploads/evidencias/{archivo}`
- En despliegue, archivos servidos desde Supabase Storage mediante `SUPABASE_STORAGE_BUCKET`.

Evidencias sugeridas:

- Captura de la pestana Evidencias con la zona "Arrastra un archivo aqui".
- Captura arrastrando o seleccionando un archivo.
- Captura del archivo seleccionado con nombre, tipo y tamano.
- Captura de evidencia guardada correctamente.
- Captura del listado mostrando la evidencia creada.
- Captura usando "Abrir evidencia" y visualizando el archivo servido por backend.

Resultado:

- Estado: Cumplido.
- Observacion: la carga queda preparada para Supabase Storage en despliegue y mantiene respaldo local para desarrollo. Como deuda tecnica, se recomienda configurar bucket privado con URLs firmadas, Supabase Auth, RLS y storage policies cuando se defina seguridad real por usuario/proyecto.

## Actividad 83 - Desarrollo UI de resultados por actividad

Criterios de aceptacion:

- Dado que la actividad 83 consolida resultados por actividad, cuando se cargue la vista, entonces debe mostrar los resultados esperados y observados por etapa del Proposito 1.
- Dado que la vista debe facilitar revision, cuando el usuario consulte una etapa, entonces debe ver registros, actividades calendarizadas, evidencias y pendientes controlados.
- Dado que la actividad forma parte del MVP, cuando el usuario interactue con la vista, entonces debe poder volver a la etapa correspondiente o revisar evidencias sin romper la navegacion.

Cambios implementados:

- Se creo la vista `ResultadosActividadProp1`.
- Se agrego una pestana transversal "Resultados" dentro del Proposito 1.
- La vista consume el endpoint existente `GET /proyectos/{proyecto_id}/resultados`.
- Se muestran contadores de etapas validadas, registros metodologicos, evidencias y etapas pendientes.
- Se genera una matriz de resultados para las siete etapas metodologicas.
- Se agrego filtro por estado: todos, validados, con registros y pendientes.
- Se agrego detalle por etapa con resultado esperado, resultado observado, actividades, evidencias y pendientes.
- Se conectaron acciones para abrir la etapa correspondiente y la vista Evidencias.
- Se marco la herramienta de resultados como disponible en el catalogo.

Archivos modificados o creados:

- `app/components/ResultadosActividadProp1.tsx`
- `app/page.tsx`
- `app/data/herramientasProp1.ts`
- `EVIDENCIAS_HITO3.md`

Evidencias sugeridas:

- Captura de la pestana "Resultados" visible en el Proposito 1.
- Captura de la cabecera "Resultados por actividad".
- Captura de los cuatro contadores superiores.
- Captura de la matriz con las siete etapas.
- Captura usando el filtro "Pendientes" o "Validados".
- Captura del detalle de una etapa con resultado esperado y observado.
- Captura de los botones "Abrir etapa" y "Ver evidencias".
- Captura del catalogo mostrando Dashboard de resultados como disponible.

Resultado:

- Estado: Cumplido.
- Observacion: la vista deriva resultados desde registros ya existentes del backend. No se creo tabla nueva de resultados; si UXLab solicita cierre formal por actividad, se recomienda agregar una tabla especifica de aprobacion o resultado validado por etapa.

## Actividad 84 - Desarrollo del flujo Medicion

Criterios de aceptacion:

- Dado que la actividad 84 implementa el flujo de Medicion, cuando el usuario complete el formulario, entonces debe poder registrar indicadores, estandares, metodo de medicion, evidencia observable, linea base y meta.
- Dado que Medicion debe ser revisable, cuando el usuario consulte los registros, entonces debe poder visualizar, editar o validar indicadores segun el alcance definido.
- Dado que Medicion forma parte del Proposito 1, cuando la etapa sea validada, entonces el sistema debe preservar trazabilidad y habilitar el avance metodologico correspondiente hacia Momentos criticos.

Cambios implementados:

- Se fortalecio el flujo `MedicionFlow`.
- Se mantuvo la relacion con Vinculacion para medir respuestas asociadas a necesidades.
- Se agrego edicion de indicadores existentes.
- Se agrego validacion metodologica de indicadores.
- Se ajusto el motor de ruta para que Medicion no se marque como completada solo por existir un indicador, sino por tener un indicador validado.
- Se agrego endpoint `PATCH /indicadores/{indicador_id}`.
- Se mantuvo la persistencia mediante FastAPI y Supabase sin crear columnas nuevas.

Archivos modificados:

- `app/components/MedicionFlow.tsx`
- `backend/app/models.py`
- `backend/app/crud.py`
- `backend/app/main.py`
- `EVIDENCIAS_HITO3.md`

Endpoints utilizados:

- `POST /indicadores`
- `GET /proyectos/{proyecto_id}/indicadores`
- `PATCH /indicadores/{indicador_id}`

Evidencias sugeridas:

- Captura de la etapa Medicion abierta desde el wizard.
- Captura del formulario de indicador con estandar, metodo, evidencia, linea base y meta.
- Captura de validaciones obligatorias.
- Captura de indicador guardado en registros.
- Captura del boton Editar cargando el indicador al formulario.
- Captura del lienzo de medicion con estandar, metodo, evidencia y meta.
- Captura del boton Validar y estado visual validado.
- Captura del avance metodologico hacia Momentos criticos despues de validar.

Resultado:

- Estado: Cumplido.
- Observacion: la validacion metodologica se guarda como metadato dentro de `descripcion`, porque la tabla `indicador` no tiene una columna dedicada para validacion de etapa. Se recomienda normalizar este dato cuando se agregue modelo formal de revision o aprobacion por actividad.

## Actividad 85 - Desarrollo UI de trazabilidad del proceso

Criterios de aceptacion:

- Dado que la actividad 85 desarrolla la trazabilidad del proceso, cuando el usuario cargue la vista, entonces debe visualizar el recorrido metodologico completo del Proposito 1.
- Dado que el proceso debe ser auditable, cuando el usuario revise una etapa, entonces debe visualizar registros, actividades calendarizadas, evidencias, validacion y pendientes asociados.
- Dado que la trazabilidad debe integrarse al MVP, cuando el usuario interactue con la vista, entonces debe poder navegar hacia la etapa correspondiente o hacia Evidencias sin romper el recorrido.

Cambios implementados:

- Se creo la vista `TrazabilidadProcesoProp1`.
- Se agrego una pestana transversal "Trazabilidad" dentro del Proposito 1.
- La vista consume el endpoint existente `GET /proyectos/{proyecto_id}/resultados`.
- Se muestra una linea de trazabilidad con las siete etapas metodologicas.
- Cada etapa muestra estado, registros, actividades, evidencias y ultimo movimiento.
- Se agrego detalle auditable por etapa con trazas y riesgo/observacion de auditoria.
- Se agregaron acciones para abrir la etapa correspondiente y revisar evidencias.
- No se creo persistencia nueva; la trazabilidad se deriva de registros ya existentes.

Archivos modificados o creados:

- `app/components/TrazabilidadProcesoProp1.tsx`
- `app/page.tsx`
- `EVIDENCIAS_HITO3.md`

Evidencias sugeridas:

- Captura de la pestana "Trazabilidad" visible en el Proposito 1.
- Captura de la cabecera "Trazabilidad del proceso".
- Captura de los contadores superiores: registros trazables, evidencias, etapas con respaldo y etapas auditables.
- Captura de la linea de trazabilidad con las siete etapas.
- Captura del detalle auditable de una etapa.
- Captura de una etapa con riesgo o pendiente controlado.
- Captura de los botones "Abrir etapa" y "Ver evidencias".

Resultado:

- Estado: Cumplido.
- Observacion: la vista es derivada y no guarda auditoria historica independiente. Si UXLab solicita bitacora formal, se recomienda agregar una tabla de eventos o historial de cambios por etapa.

## Actividad 86 - Desarrollo del flujo Momentos criticos

Criterios de aceptacion:

- Dado que Momentos criticos corresponde al cierre metodologico del Proposito 1, cuando el usuario ingrese a la etapa, entonces debe poder identificar quiebres, fricciones o fallas relevantes del recorrido de experiencia.
- Dado que la etapa debe ser revisable, cuando el usuario consulte los registros, entonces debe poder visualizar, editar y validar momentos criticos sin perder el lienzo metodologico.
- Dado que el motor de ruta debe reflejar avance real, cuando exista un momento critico validado, entonces la etapa 7 debe marcarse como validada; si solo existe un borrador, debe mantenerse pendiente.

Cambios implementados:

- Se fortalecio `MomentosCriticosFlow` con edicion de registros existentes.
- Se agrego estado visual "Borrador" / "Validado" en registros, lienzo y recorrido secuencial.
- Se agrego accion "Validar etapa" para confirmar metodologicamente un momento critico.
- Se agrego endpoint `PATCH /momentos-criticos/{momento_id}` para actualizar momentos criticos persistidos en Supabase.
- Se ajusto el motor de ruta para que Momentos criticos no se complete solo por existir un registro.
- La validacion se guarda como metadato controlado dentro de `causa_raiz` usando el prefijo `::uxlab-momento-meta::`, sin crear columnas nuevas.
- Se mantuvo la relacion con indicadores de Medicion para apoyar la identificacion de puntos de quiebre.

Archivos modificados:

- `app/components/MomentosCriticosFlow.tsx`
- `backend/app/models.py`
- `backend/app/crud.py`
- `backend/app/main.py`
- `EVIDENCIAS_HITO3.md`

Endpoints utilizados:

- `POST /momentos-criticos`
- `GET /proyectos/{proyecto_id}/momentos-criticos`
- `PATCH /momentos-criticos/{momento_id}`
- `GET /proyectos/{proyecto_id}/indicadores`
- `GET /proyectos/{proyecto_id}/ruta`

Evidencias sugeridas:

- Captura de la etapa "Momentos criticos" abierta desde el wizard.
- Captura del formulario con paso del recorrido, punto de contacto, canal, tipo de quiebre, causa raiz y oportunidad de mejora.
- Captura de validaciones obligatorias del formulario.
- Captura de un momento critico guardado como "Borrador".
- Captura del boton "Editar" cargando el registro al formulario.
- Captura del lienzo metodologico con causa raiz, oportunidad de mejora y sintesis IA demo.
- Captura del boton "Validar etapa" y estado visual "Validado".
- Captura del motor de ruta mostrando la etapa 7 validada despues de la validacion.

Resultado:

- Estado: Cumplido.
- Observacion: la tabla `momento_critico` no tiene una columna formal de estado o validacion. Para no modificar el esquema, la validacion de ruta se persiste como metadato dentro de `causa_raiz`. Se recomienda crear una columna o tabla de revision metodologica si UXLab solicita auditoria formal de aprobaciones.

## Actividad 87 - Desarrollo UI de dashboard de avance

Criterios de aceptacion:

- Dado que la actividad 87 desarrolla el dashboard de avance, cuando el usuario cargue la vista, entonces debe visualizar el estado global del Proposito 1 con indicadores claros de avance.
- Dado que el dashboard debe apoyar la gestion del proceso, cuando el usuario revise las etapas, entonces debe distinguir validaciones, registros, actividades, evidencias y riesgos pendientes.
- Dado que el dashboard debe integrarse al MVP, cuando el usuario interactue con accesos rapidos, entonces debe poder abrir etapas, evidencias, resultados o trazabilidad sin romper la navegacion.

Cambios implementados:

- Se creo el componente `DashboardAvanceProp1`.
- Se agrego una pestana transversal "Dashboard" dentro del Proposito 1.
- La vista consume el endpoint existente `GET /proyectos/{proyecto_id}/resultados`.
- Se combinan datos consolidados del backend con el motor de ruta para calcular avance, validaciones y observaciones.
- Se agregaron KPI superiores: completitud metodologica, registros, evidencias y estado general.
- Se agrego matriz de avance por etapa con estado, riesgo, registros, actividades y evidencias.
- Se agrego panel de "Siguiente foco" para orientar la proxima accion metodologica.
- Se agregaron accesos rapidos a Resultados, Trazabilidad y Evidencias.
- No se creo persistencia nueva; el dashboard es una lectura ejecutiva derivada de datos existentes.

Archivos modificados o creados:

- `app/components/DashboardAvanceProp1.tsx`
- `app/page.tsx`
- `EVIDENCIAS_HITO3.md`

Endpoints utilizados:

- `GET /proyectos/{proyecto_id}/resultados`
- `GET /proyectos/{proyecto_id}/ruta`

Evidencias sugeridas:

- Captura de la pestana "Dashboard" visible dentro del Proposito 1.
- Captura de la cabecera "Dashboard de avance".
- Captura de los KPI superiores: completitud metodologica, registros, evidencias y estado general.
- Captura de la matriz de avance por etapa con badges de estado y riesgo.
- Captura del panel "Siguiente foco".
- Captura de los accesos rapidos hacia Resultados, Trazabilidad y Evidencias.
- Captura de una etapa con riesgo medio o alto si faltan evidencias o registros.

Resultado:

- Estado: Cumplido.
- Observacion: el dashboard es una vista derivada para seguimiento ejecutivo. Si UXLab solicita metricas historicas de avance por semana, se recomienda agregar una tabla de snapshot o bitacora de indicadores.
