from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.database import get_connection

from app.models import (
    ProyectoCreate,
    ActualizarEtapaProyecto,
    RegistroEtapaCreate,
    InvestigacionCreate,
    PersonaUsuariaCreate,
    HabilitacionCreate,
    ExpectativaCreate,
    NecesidadCreate,
    VinculacionCreate,
    IndicadorCreate,
    MomentoCriticoCreate,
)
from app import crud


app = FastAPI(
    title="Backend Plataforma UXLab",
    description="API base para el MVP del Propósito 1 de la Guía UXLab",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Backend UXLab funcionando correctamente",
        "status": "ok",
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "backend-uxlab",
    }

@app.get("/db-test")
async def db_test():
    conn = await get_connection()
    try:
        result = await conn.fetchval("select now();")
        return {
            "status": "ok",
            "message": "Conexión a Supabase/PostgreSQL funcionando",
            "database_time": str(result),
        }
    finally:
        await conn.close()

@app.get("/propositos")
def obtener_propositos():
    return {
        "data": crud.listar_propositos()
    }


@app.get("/etapas")
def obtener_etapas():
    return {
        "data": crud.listar_etapas()
    }


@app.get("/herramientas")
def obtener_herramientas():
    return {
        "data": crud.listar_herramientas()
    }


@app.post("/proyectos")
async def crear_proyecto(data: ProyectoCreate):
    if data.proposito_id != 1:
        raise HTTPException(
            status_code=400,
            detail="En este MVP solo está habilitado el Propósito 1."
        )

    proyecto = await crud.crear_proyecto(data)

    return {
        "message": "Proyecto creado correctamente en Supabase",
        "data": proyecto,
    }

@app.get("/proyectos/{proyecto_id}")
async def obtener_proyecto(proyecto_id: str):
    proyecto = await crud.obtener_proyecto(proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    return {
        "data": proyecto,
    }

@app.patch("/proyectos/{proyecto_id}/etapa")
async def actualizar_etapa_proyecto(
    proyecto_id: str,
    data: ActualizarEtapaProyecto
):
    proyecto = await crud.actualizar_etapa(proyecto_id, data)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    return {
        "message": "Etapa actualizada correctamente en Supabase",
        "data": proyecto,
    }


@app.get("/proyectos/{proyecto_id}/etapas")
def obtener_etapas_proyecto(proyecto_id: int):
    proyecto = crud.obtener_proyecto(proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    return {
        "proyecto": proyecto,
        "etapas": crud.listar_etapas(),
    }


@app.post("/registros-etapa")
def guardar_registro_etapa(data: RegistroEtapaCreate):
    proyecto = crud.obtener_proyecto(data.proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    if data.etapa_id < 1 or data.etapa_id > 7:
        raise HTTPException(
            status_code=400,
            detail="La etapa debe estar entre 1 y 7."
        )

    registro = crud.guardar_registro_etapa(data)

    return {
        "message": "Registro de etapa guardado correctamente",
        "data": registro,
    }


@app.get("/proyectos/{proyecto_id}/registros")
def obtener_registros_proyecto(proyecto_id: int):
    proyecto = crud.obtener_proyecto(proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    registros = crud.listar_registros_por_proyecto(proyecto_id)

    return {
        "proyecto": proyecto,
        "registros": registros,
    }

# =========================
# Endpoints Investigación
# =========================

@app.post("/investigaciones")
async def crear_investigacion(data: InvestigacionCreate):
    proyecto = await crud.obtener_proyecto(data.proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    investigacion = await crud.crear_investigacion(data)

    return {
        "message": "Investigación creada correctamente en Supabase",
        "data": investigacion,
    }


@app.get("/proyectos/{proyecto_id}/investigacion")
async def obtener_investigacion_proyecto(proyecto_id: str):
    proyecto = await crud.obtener_proyecto(proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    investigacion = await crud.obtener_investigacion_por_proyecto(proyecto_id)

    if not investigacion:
        raise HTTPException(
            status_code=404,
            detail="Investigación no encontrada para este proyecto."
        )

    return {
        "proyecto": proyecto,
        "investigacion": investigacion,
    }


# =========================
# Endpoints Personas usuarias
# =========================

@app.post("/personas-usuarias")
async def crear_persona_usuaria(data: PersonaUsuariaCreate):
    proyecto = await crud.obtener_proyecto(data.proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    persona = await crud.crear_persona_usuaria(data)

    return {
        "message": "Persona usuaria creada correctamente en Supabase",
        "data": persona,
    }


@app.get("/proyectos/{proyecto_id}/personas-usuarias")
async def listar_personas_usuarias(proyecto_id: str):
    proyecto = await crud.obtener_proyecto(proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    personas = await crud.listar_personas_usuarias_por_proyecto(proyecto_id)

    return {
        "proyecto": proyecto,
        "personas_usuarias": personas,
    }

# =========================
# Endpoints Habilitación
# =========================

@app.post("/habilitacion")
async def crear_habilitacion(data: HabilitacionCreate):
    proyecto = await crud.obtener_proyecto(data.proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    habilitacion = await crud.crear_habilitacion(data)

    return {
        "message": "Habilitación creada correctamente en Supabase",
        "data": habilitacion,
    }


@app.get("/proyectos/{proyecto_id}/habilitacion")
async def obtener_habilitacion_proyecto(proyecto_id: str):
    proyecto = await crud.obtener_proyecto(proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    habilitacion = await crud.obtener_habilitacion_por_proyecto(proyecto_id)

    if not habilitacion:
        raise HTTPException(
            status_code=404,
            detail="Habilitación no encontrada para este proyecto."
        )

    return {
        "proyecto": proyecto,
        "habilitacion": habilitacion,
    }


# =========================
# Endpoints Expectativas
# =========================

@app.post("/expectativas")
async def crear_expectativa(data: ExpectativaCreate):
    proyecto = await crud.obtener_proyecto(data.proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    expectativa = await crud.crear_expectativa(data)

    return {
        "message": "Expectativa creada correctamente en Supabase",
        "data": expectativa,
    }


@app.get("/proyectos/{proyecto_id}/expectativas")
async def listar_expectativas(proyecto_id: str):
    proyecto = await crud.obtener_proyecto(proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    expectativas = await crud.listar_expectativas_por_proyecto(proyecto_id)

    return {
        "proyecto": proyecto,
        "expectativas": expectativas,
    }


# =========================
# Endpoints Necesidades
# =========================

@app.post("/necesidades")
async def crear_necesidad(data: NecesidadCreate):
    proyecto = await crud.obtener_proyecto(data.proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    necesidad = await crud.crear_necesidad(data)

    return {
        "message": "Necesidad creada correctamente en Supabase",
        "data": necesidad,
    }


@app.get("/proyectos/{proyecto_id}/necesidades")
async def listar_necesidades(proyecto_id: str):
    proyecto = await crud.obtener_proyecto(proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    necesidades = await crud.listar_necesidades_por_proyecto(proyecto_id)

    return {
        "proyecto": proyecto,
        "necesidades": necesidades,
    }

# =========================
# Endpoints Vinculación
# =========================

@app.post("/vinculaciones")
async def crear_vinculacion(data: VinculacionCreate):
    proyecto = await crud.obtener_proyecto(data.proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    vinculacion = await crud.crear_vinculacion(data)

    return {
        "message": "Vinculación creada correctamente en Supabase",
        "data": vinculacion,
    }


@app.get("/proyectos/{proyecto_id}/vinculaciones")
async def listar_vinculaciones(proyecto_id: str):
    proyecto = await crud.obtener_proyecto(proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    vinculaciones = await crud.listar_vinculaciones_por_proyecto(proyecto_id)

    return {
        "proyecto": proyecto,
        "vinculaciones": vinculaciones,
    }


# =========================
# Endpoints Indicadores / Medición
# =========================

@app.post("/indicadores")
async def crear_indicador(data: IndicadorCreate):
    proyecto = await crud.obtener_proyecto(data.proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    indicador = await crud.crear_indicador(data)

    return {
        "message": "Indicador creado correctamente en Supabase",
        "data": indicador,
    }


@app.get("/proyectos/{proyecto_id}/indicadores")
async def listar_indicadores(proyecto_id: str):
    proyecto = await crud.obtener_proyecto(proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    indicadores = await crud.listar_indicadores_por_proyecto(proyecto_id)

    return {
        "proyecto": proyecto,
        "indicadores": indicadores,
    }

# =========================
# Endpoints Momentos Críticos
# =========================

@app.post("/momentos-criticos")
async def crear_momento_critico(data: MomentoCriticoCreate):
    proyecto = await crud.obtener_proyecto(data.proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    momento = await crud.crear_momento_critico(data)

    return {
        "message": "Momento crítico creado correctamente en Supabase",
        "data": momento,
    }


@app.get("/proyectos/{proyecto_id}/momentos-criticos")
async def listar_momentos_criticos(proyecto_id: str):
    proyecto = await crud.obtener_proyecto(proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    momentos = await crud.listar_momentos_criticos_por_proyecto(proyecto_id)

    return {
        "proyecto": proyecto,
        "momentos_criticos": momentos,
    }