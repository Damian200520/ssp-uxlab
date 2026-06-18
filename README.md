# SSP-UXLab

Plataforma web para acompañar y digitalizar el recorrido metodológico del
**Propósito 1: Comprender la experiencia actual**, basado en la Guía de
Innovación en Servicios Públicos desde la Experiencia Usuaria de UXLab.

## Demo desplegada

- Frontend: <https://ssp-uxlab.vercel.app/>
- Backend: <https://ssp-uxlab-backend.onrender.com/>
- Documentación API: <https://ssp-uxlab-backend.onrender.com/docs>

> El backend utiliza el plan gratuito de Render, por lo que la primera solicitud
> puede tardar mientras el servicio vuelve a iniciarse.

## Objetivo del MVP

Entregar a equipos de servicios públicos un entorno guiado para registrar,
organizar y relacionar información sobre la experiencia actual de un servicio.
El MVP permite trabajar las siete etapas del Propósito 1, administrar evidencias,
consultar resultados y visualizar el avance del diagnóstico institucional.

Los Propósitos 2, 3, 4 y 5 se muestran como referencia metodológica, pero están
fuera del alcance funcional del MVP actual.

## Recorrido metodológico

El wizard presenta las etapas en el orden definido para el Propósito 1:

1. Investigación.
2. Personas usuarias.
3. Habilitación y expectativas.
4. Necesidades.
5. Vinculación.
6. Medición.
7. Momentos críticos.

El avance se calcula a partir de los registros y validaciones reales de cada
etapa. La información se mantiene asociada al proyecto activo de la cuenta
utilizada en la demo.

## Funcionalidades implementadas

- Acceso básico y creación o recuperación de un proyecto por usuario.
- Selección de propósito, con el Propósito 1 habilitado.
- Wizard con estado activo, pendiente, disponible y completado.
- Formularios y registros para las siete etapas metodológicas.
- Catálogo con las ocho herramientas oficiales del MVP.
- Calendarización de actividades metodológicas.
- Carga de evidencias mediante URL o archivo.
- Ejecución paso a paso integrada al recorrido.
- Resultados consolidados por actividad y etapa.
- Trazabilidad entre registros metodológicos.
- Dashboard de resultados y avance del Propósito 1.
- Asistencia IA en modo demostrativo.
- Persistencia centralizada mediante FastAPI y Supabase/PostgreSQL.
- Archivos de evidencia almacenados en Supabase Storage.
- Separación de datos mediante un proyecto activo asociado al usuario de la demo.

## Arquitectura

```text
Navegador
   |
   v
Next.js / React (Vercel)
   |
   v
FastAPI (Render)
   |
   +--> Supabase PostgreSQL
   |
   +--> Supabase Storage
```

El frontend no utiliza la clave privilegiada de Supabase. Las operaciones del
Propósito 1 pasan por FastAPI, donde se concentran los modelos Pydantic, las
validaciones y el acceso a datos.

## Tecnologías

| Capa | Tecnologías |
|---|---|
| Frontend | Next.js 16.2, React 19, TypeScript |
| Interfaz | Tailwind CSS 4, Lucide React |
| Backend | FastAPI, Python, Uvicorn |
| Datos | Supabase, PostgreSQL, asyncpg |
| Archivos | Supabase Storage |
| Despliegue | Vercel y Render |

## Estructura principal

```text
ssp-uxlab/
|-- app/
|   |-- components/
|   |   |-- InvestigacionFlow.tsx
|   |   |-- PersonasFlow.tsx
|   |   |-- HabilitacionFlow.tsx
|   |   |-- NecesidadesFlow.tsx
|   |   |-- VinculacionFlow.tsx
|   |   |-- MedicionFlow.tsx
|   |   |-- MomentosCriticosFlow.tsx
|   |   |-- EvidenciasFlow.tsx
|   |   |-- CalendarizacionProp1.tsx
|   |   |-- CatalogoHerramientasProp1.tsx
|   |   |-- ResultadosActividadProp1.tsx
|   |   |-- TrazabilidadProcesoProp1.tsx
|   |   `-- DashboardAvanceProp1.tsx
|   |-- data/
|   |-- globals.css
|   |-- layout.tsx
|   `-- page.tsx
|-- backend/
|   |-- app/
|   |   |-- ai_service.py
|   |   |-- crud.py
|   |   |-- database.py
|   |   |-- main.py
|   |   |-- models.py
|   |   `-- storage_service.py
|   |-- Procfile
|   `-- requirements.txt
|-- docs/
|-- EVIDENCIAS_HITO3.md
|-- SEGURIDAD_HITO3.md
`-- package.json
```

## Ejecución local

### 1. Frontend

```powershell
npm.cmd install
npm.cmd run dev
```

Abrir <http://localhost:3000>.

### 2. Backend

Desde la raíz del proyecto:

```powershell
.\venv\Scripts\Activate.ps1
Set-Location backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Abrir:

- API: <http://localhost:8000>
- Swagger: <http://localhost:8000/docs>
- Estado del servicio: <http://localhost:8000/health>

## Variables de entorno

### Frontend: `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_PROYECTO_ID=UUID_DE_PROYECTO_DE_RESPALDO
```

En Vercel, `NEXT_PUBLIC_API_URL` debe apuntar al backend desplegado en Render.

### Backend: `backend/.env`

```env
DATABASE_URL=URL_DE_CONEXION_POSTGRESQL
IA_MODO=demo
SUPABASE_URL=https://TU_PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=CLAVE_SOLO_BACKEND
SUPABASE_STORAGE_BUCKET=evidencias-uxlab
EVIDENCIA_STORAGE_MODE=supabase
FRONTEND_URLS=http://localhost:3000,https://ssp-uxlab.vercel.app
```

Los archivos `.env` están excluidos mediante `.gitignore`. La clave
`SUPABASE_SERVICE_ROLE_KEY` nunca debe exponerse como variable `NEXT_PUBLIC_*`
ni incluirse en GitHub.

## Verificación técnica

Frontend:

```powershell
npx.cmd tsc --noEmit
npm.cmd run build
```

Backend:

```powershell
Set-Location backend
uvicorn app.main:app --reload
```

Comprobaciones recomendadas:

1. Abrir `/health` y confirmar que FastAPI responde.
2. Crear o recuperar un usuario de prueba.
3. Ingresar al Propósito 1.
4. Crear registros en las etapas y verificar su persistencia.
5. Cerrar la sesión local e ingresar con otra cuenta de prueba.
6. Confirmar que cada cuenta recupera su proyecto activo correspondiente.
7. Adjuntar una evidencia y comprobar el registro y el archivo en Supabase.

## Asistencia IA

La asistencia opera con `IA_MODO=demo`, alcance acordado con UXLab para el MVP.
Las respuestas son apoyos metodológicos predefinidos y no utilizan un proveedor
externo ni toman decisiones por las personas usuarias.

La integración productiva con un modelo, prompts auditados, recuperación de
contenido de la guía y controles frente a alucinaciones queda fuera del alcance
actual.

## Seguridad

### Controles disponibles en la demo

- Variables sensibles excluidas del repositorio.
- Clave de servicio de Supabase utilizada solamente por el backend.
- Flujo de datos principal mediado por FastAPI.
- Validaciones de entrada mediante modelos Pydantic.
- Datos organizados por `proyecto_id`.
- RLS habilitado técnicamente en tablas principales de Supabase.
- Archivos administrados mediante Supabase Storage.
- CORS restringido a los orígenes configurados.

### Limitaciones conocidas

- El acceso actual es un mecanismo de demo y no utiliza contraseña, JWT ni
  Supabase Auth.
- La sesión del frontend se conserva en `localStorage`.
- Las políticas RLS existentes todavía no aplican aislamiento estricto mediante
  `auth.uid()` y membresía por proyecto.
- El backend usa credenciales privilegiadas y debe validar autorización antes de
  considerarse apto para producción.
- El cifrado adicional AES-256 a nivel de aplicación todavía no está
  implementado.
- Falta formalizar sanitización de logs, clasificación de datos sensibles,
  rotación de claves y auditoría de accesos.

El diagnóstico y la estrategia de endurecimiento están documentados en
[`SEGURIDAD_HITO3.md`](SEGURIDAD_HITO3.md).

## Próximos pasos

1. Implementar autenticación real con Supabase Auth o un proveedor equivalente.
2. Incorporar membresías de usuario por proyecto e institución.
3. Reemplazar las políticas abiertas por RLS basado en identidad y proyecto.
4. Sanitizar logs y evitar registrar formularios, URLs privadas o datos
   personales.
5. Clasificar los campos sensibles y definir cuáles requieren cifrado
   AES-256-GCM a nivel de aplicación.
6. Gestionar las claves de cifrado mediante secretos de Render y un proceso de
   rotación.
7. Normalizar enums y reforzar validaciones backend.
8. Agregar pruebas automatizadas de autorización, persistencia y aislamiento
   entre cuentas.

---

Proyecto desarrollado en colaboración académica con UXLab, utilizando como
referencia la Guía de Innovación en Servicios Públicos desde la Experiencia
Usuaria.
