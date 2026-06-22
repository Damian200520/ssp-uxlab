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
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=CLAVE_PUBLICABLE
```

En Vercel, `NEXT_PUBLIC_API_URL` debe apuntar al backend desplegado en Render.

En Supabase Auth, configura:

- **Site URL:** `https://ssp-uxlab.vercel.app`
- **Redirect URLs:** `https://ssp-uxlab.vercel.app/**`

El registro también envía `emailRedirectTo` con el origen actual, por lo que en
desarrollo puede utilizar `http://localhost:3000/**` como URL adicional.

### Backend: `backend/.env`

```env
DATABASE_URL=URL_DE_CONEXION_POSTGRESQL
IA_MODO=demo
SUPABASE_URL=https://TU_PROYECTO.supabase.co
# Opcional si SUPABASE_SERVICE_ROLE_KEY ya está configurada en el backend:
SUPABASE_ANON_KEY=CLAVE_PUBLICABLE
SUPABASE_SERVICE_ROLE_KEY=CLAVE_SOLO_BACKEND
SUPABASE_STORAGE_BUCKET=evidencias-uxlab
EVIDENCIA_STORAGE_MODE=supabase
FRONTEND_URLS=http://localhost:3000,https://ssp-uxlab.vercel.app
DATA_ENCRYPTION_KEY=CLAVE_BASE64_DE_32_BYTES
DATABASE_SSL_VERIFY=false
ENABLE_DIAGNOSTIC_ENDPOINTS=false
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
- Registro e inicio de sesión mediante Supabase Auth.
- JWT validado por FastAPI antes de acceder a información del proyecto.
- Flujo de datos principal mediado por FastAPI.
- Validaciones de entrada mediante modelos Pydantic.
- RLS aplicado mediante `auth.uid()` en las tablas principales.
- FastAPI ejecuta las consultas de usuario con el rol PostgreSQL
  `authenticated`, evitando el bypass de RLS del rol `postgres`.
- Aislamiento de registros por cuenta y proyecto.
- Cifrado AES-256-GCM opcional para observaciones de calendarización y
  descripciones de evidencias.
- Logs técnicos sin cuerpos de formularios, tokens ni datos personales.
- Archivos activos como HTML, SVG y JavaScript bloqueados en evidencias.
- Evidencias nuevas entregadas mediante URL firmada, salvo que se configure
  explícitamente almacenamiento público.
- CORS restringido a los orígenes configurados.
- Cabeceras CSP, HSTS, anti-clickjacking, `nosniff` y Permissions Policy.
- Endpoint de diagnóstico de base de datos deshabilitado por defecto.
- Dependencias de producción auditadas sin vulnerabilidades conocidas.

### Limitaciones conocidas

- El perfil y el proyecto activo se reconstruyen desde el backend al restaurar
  la sesión; no se guardan datos del proyecto en `localStorage`.
- El modelo actual asocia cada proyecto a un usuario. Una colaboración
  multiusuario requerirá una tabla de membresías y roles.
- El cifrado de campos solo se activa cuando `DATA_ENCRYPTION_KEY` está
  configurada en el backend.
- Las claves de cifrado requieren un procedimiento formal de respaldo y
  rotación antes de producción.
- La verificación completa del certificado PostgreSQL requiere configurar
  `DATABASE_SSL_VERIFY=true` junto con una cadena CA compatible. TLS continúa
  siendo obligatorio cuando esta opción está desactivada.
- Falta incorporar retención centralizada y alertas sobre eventos de seguridad.

El diagnóstico y la estrategia de endurecimiento están documentados en
[`SEGURIDAD_HITO3.md`](SEGURIDAD_HITO3.md).

## Próximos pasos

1. Configurar los nuevos secretos de autenticación y cifrado en Render.
2. Incorporar membresías y roles para proyectos colaborativos.
3. Definir respaldo y rotación de `DATA_ENCRYPTION_KEY`.
4. Migrar gradualmente los campos sensibles históricos que aún están en texto
   plano.
5. Configurar una CA compatible y habilitar verificación TLS completa.
6. Normalizar enums y reforzar validaciones backend.
7. Agregar pruebas automatizadas de autorización, persistencia y aislamiento.
8. Configurar retención, consulta y alertas para logs de seguridad.

---

Proyecto desarrollado en colaboración académica con UXLab, utilizando como
referencia la Guía de Innovación en Servicios Públicos desde la Experiencia
Usuaria.
