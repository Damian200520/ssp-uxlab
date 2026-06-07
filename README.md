# SSP-UXLab

Plataforma web para digitalizar y guiar el recorrido metodológico del Propósito 1 de la Guía de Innovación en Servicios Públicos (SSP) desde la experiencia usuaria.

---

## Objetivo del MVP

Permitir que equipos de servicios públicos registren información metodológica por etapa, visualicen resultados, gestionen evidencias y cuenten con apoyo de asistencia IA en modo demostrativo, alcance validado con UXLab para el MVP, todo dentro de un entorno digital alineado con la Guía UXLab.

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
```

### Backend (`backend/.env`)

```
DATABASE_URL=URL_DE_CONEXION_POSTGRESQL
IA_MODO=demo
SUPABASE_URL=https://TU_PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SOLO_EN_BACKEND
SUPABASE_STORAGE_BUCKET=evidencias-uxlab
EVIDENCIA_STORAGE_MODE=supabase
FRONTEND_URLS=https://URL_FRONTEND_DESPLEGADA
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

Actualmente el módulo de inteligencia artificial opera en **modo demo** (`IA_MODO=demo`). Este alcance fue acordado con UXLab como contraparte del proyecto, por lo que la IA se presenta como una demostración funcional de apoyo metodológico y no como una integración productiva con un proveedor externo. Esto significa que:

- No requiere API key ni genera costos.
- Las respuestas son plantillas de texto predefinidas con consejos metodológicos.
- La arquitectura (servicio separado `ai_service.py`, endpoints dedicados, frontend conectado) permite demostrar el flujo completo de asistencia IA sin depender de servicios externos.
- La integración con una API real de IA queda fuera del alcance actual del MVP, salvo que UXLab defina explícitamente un nuevo requerimiento en una etapa posterior.

## Seguridad

- Los archivos `.env` y `.env.local` están excluidos del repositorio mediante `.gitignore`.
- No se deben subir contraseñas, DATABASE_URL, claves privadas ni archivos de entorno con valores reales. Las variables públicas del frontend deben configurarse en el entorno de despliegue correspondiente.
- La conexión a la base de datos usa SSL, aunque en entorno local está deshabilitada la verificación de certificado.
- La clave `SUPABASE_SERVICE_ROLE_KEY` solo debe configurarse en el backend desplegado. Nunca debe usarse como variable `NEXT_PUBLIC_*`.
- Actualmente no hay autenticación; el "acceso" almacena datos del usuario en `localStorage`.
- El frontend consume FastAPI para las operaciones del Propósito 1; no mantiene un cliente Supabase directo en componentes React.
- RLS de Supabase queda como deuda de seguridad productiva porque aún falta autenticación real y membresía por proyecto. El plan de seguridad del Hito 3 queda documentado en `SEGURIDAD_HITO3.md`.
- La auditoría y el plan de mitigación RLS quedan documentados en `SEGURIDAD_HITO3.md`. No se incluyen scripts SQL ejecutables en el repositorio para evitar confusión durante la demo.

## Próximos pasos

- Completar las etapas de Vinculación, Medición y Momentos críticos (pendientes de desarrollo).
- Fortalecer la validación backend por etapa y agregar pruebas automatizadas de persistencia.
- Extraer componentes duplicados (sidebar, toasts, tab bar) para reducir código repetido.
- Implementar autenticación real (JWT / Supabase Auth).
- Activar RLS por `proyecto_id` una vez que exista Supabase Auth y membresía por proyecto.
- Mantener documentado el alcance demo de IA validado con UXLab.
- Agregar pruebas automatizadas (frontend y backend).
- Agregar Error Boundaries para evitar crashes totales de la interfaz.
- Mejorar estados de carga con skeleton loaders.

---

Proyecto desarrollado en el contexto de la **Guía de Innovación en Servicios Públicos desde la Experiencia Usuaria (UXLab)**.
