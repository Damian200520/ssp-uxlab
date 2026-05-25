# SSP-UXLab

Plataforma web para digitalizar y guiar el recorrido metodológico del Propósito 1 de la Guía de Innovación en Servicios Públicos (SSP) desde la experiencia usuaria.

---

## Objetivo del MVP

Permitir que equipos de servicios públicos registren información metodológica por etapa, visualicen resultados, gestionen evidencias y cuenten con apoyo de asistencia IA en modo demostrativo, todo dentro de un entorno digital alineado con la Guía UXLab.

## Tecnologías

| Frontend | Backend | Base de datos | Diseño |
|---|---|---|---|
| Next.js 16 | FastAPI (Python) | Supabase / PostgreSQL | Tailwind CSS v4 |
| React 19 | asyncpg | — | lucide-react |
| TypeScript | Uvicorn | — | — |

## Funcionalidades implementadas

- Acceso inicial con registro de usuario.
- Selección del Propósito 1 entre 5 propósitos (solo el 1 habilitado en MVP).
- Wizard metodológico con navegación por etapas (tabs + sidebar).
- **Investigación** — Plan de investigación de experiencia usuaria.
- **Personas usuarias** — Perfiles, roles, nivel digital, expectativas y barreras.
- **Habilitación y expectativas** — Niveles de habilitación y expectativas por perfil.
- **Necesidades** — Mapa de problemas y necesidades priorizado.
- **Evidencias** — Registro transversal de respaldos por etapa.
- Síntesis IA demo de evidencias.
- Asistencia IA demo por etapa (sugerencias metodológicas).
- Backend FastAPI con endpoints para registros, investigación, ruta de avance e IA demo.

## Estructura del proyecto

```
ssp-uxlab/
├── app/                          # Frontend Next.js (App Router)
│   ├── components/               # Componentes React
│   │   ├── AsistenciaIAEtapa.tsx
│   │   ├── EvidenciasFlow.tsx
│   │   ├── HabilitacionFlow.tsx
│   │   ├── InvestigacionFlow.tsx
│   │   ├── NecesidadesFlow.tsx
│   │   ├── PersonasFlow.tsx
│   │   └── supabaseClient.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Página principal (3 vistas)
├── backend/
│   └── app/
│       ├── ai_service.py         # Servicio IA demo
│       ├── crud.py               # Operaciones de base de datos
│       ├── database.py           # Conexión PostgreSQL
│       ├── main.py               # FastAPI endpoints
│       └── models.py             # Pydantic models
├── lib/
│   └── api.ts                    # Utilidades compartidas
├── public/
├── .env.local                    # Variables de entorno frontend (no trackear)
└── .gitignore
```

## Variables de entorno

### Frontend (`.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_PROYECTO_ID=ID_DEL_PROYECTO
NEXT_PUBLIC_SUPABASE_URL=URL_DE_SUPABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=CLAVE_PUBLICA_SUPABASE
```

### Backend (`backend/.env`)

```
DATABASE_URL=URL_DE_CONEXION_POSTGRESQL
IA_MODO=demo
```

> **Importante:** No subir archivos `.env` ni `.env.local` al repositorio. El `.gitignore` ya incluye la regla `.env*` para evitarlo.

## Cómo ejecutar

### Frontend

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### Backend

```bash
cd backend
..\venv\Scripts\activate
uvicorn app.main:app --reload
```

El backend se ejecuta en [http://localhost:8000](http://localhost:8000). La documentación interactiva de la API está disponible en `/docs`.

## IA demo

Actualmente el módulo de inteligencia artificial opera en **modo demo** (`IA_MODO=demo`). Esto significa que:

- No requiere API key ni genera costos.
- Las respuestas son plantillas de texto predefinidas con consejos metodológicos.
- La arquitectura (servicio separado `ai_service.py`, endpoints dedicados, frontend conectado) queda preparada para integrar una API real (OpenAI, Claude, etc.) si UXLab lo autoriza en el futuro.
- En una etapa posterior, si UXLab autoriza el uso de una cuenta/API institucional, se podrá incorporar un modo real de IA mediante una variable como `IA_MODO=openai` y las credenciales correspondientes, manteniendo la lógica encapsulada en `ai_service.py`.

## Seguridad

- Los archivos `.env` y `.env.local` están excluidos del repositorio mediante `.gitignore`.
- No se deben subir contraseñas, DATABASE_URL, claves privadas ni archivos de entorno con valores reales. Las variables públicas del frontend deben configurarse en el entorno de despliegue correspondiente.
- La conexión a la base de datos usa SSL, aunque en entorno local está deshabilitada la verificación de certificado.
- Actualmente no hay autenticación; el "acceso" almacena datos del usuario en `localStorage`.

## Próximos pasos

- Completar las etapas de Vinculación, Medición y Momentos críticos (pendientes de desarrollo).
- Migrar las consultas directas a Supabase desde los componentes frontend hacia el backend FastAPI.
- Extraer componentes duplicados (sidebar, toasts, tab bar) para reducir código repetido.
- Implementar autenticación real (JWT / Supabase Auth).
- Evaluar integración real con IA (OpenAI, Claude u otro proveedor).
- Agregar pruebas automatizadas (frontend y backend).
- Agregar Error Boundaries para evitar crashes totales de la interfaz.
- Mejorar estados de carga con skeleton loaders.

---

Proyecto desarrollado en el contexto de la **Guía de Innovación en Servicios Públicos desde la Experiencia Usuaria (UXLab)**.
