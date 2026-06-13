import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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
    VinculacionUpdate,
    IndicadorCreate,
    IndicadorUpdate,
    MomentoCriticoCreate,
    MomentoCriticoUpdate,
    CalendarizacionCreate,
    CalendarizacionUpdate,
    UsuarioAccesoCreate,
    InvestigacionUpdate,
    PersonaUsuariaUpdate,
    HabilitacionUpdate,
    ExpectativaUpdate,
    NecesidadUpdate,
    EvidenciaCreate,
    EvidenciaArchivoCreate,
    EvidenciaUpdate,
    IASintesisRequest,
    IASugerenciaRequest,
    IAMejoraRedaccionRequest,
)
from app import crud, ai_service, storage_service

DEFAULT_FRONTEND_URLS = [
    "https://ssp-uxlab.vercel.app",
]

FRONTEND_URLS = [
    url.strip()
    for url in os.getenv("FRONTEND_URLS", "").split(",")
    if url.strip()
]
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    *DEFAULT_FRONTEND_URLS,
    *FRONTEND_URLS,
]


app = FastAPI(
    title="Backend Plataforma UXLab",
    description="API base para el MVP del Propósito 1 de la Guía UXLab",
    version="0.1.0",
)

app.mount("/uploads", StaticFiles(directory=str(storage_service.UPLOAD_ROOT)), name="uploads")


app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(ALLOWED_ORIGINS)),
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
        "storage": {
            "mode": storage_service.EVIDENCIA_STORAGE_MODE,
            "supabase_configured": bool(
                storage_service.SUPABASE_URL and storage_service.SUPABASE_SERVICE_ROLE_KEY
            ),
            "bucket": storage_service.SUPABASE_STORAGE_BUCKET,
        },
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
async def obtener_etapas_proyecto(proyecto_id: str):
    proyecto = await crud.obtener_proyecto(proyecto_id)

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
async def guardar_registro_etapa(data: RegistroEtapaCreate):
    proyecto = await crud.obtener_proyecto(data.proyecto_id)

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

    registro = await crud.guardar_registro_etapa(data)

    return {
        "message": "Registro de etapa guardado correctamente",
        "data": registro,
    }


@app.get("/proyectos/{proyecto_id}/registros")
async def obtener_registros_proyecto(proyecto_id: str):
    proyecto = await crud.obtener_proyecto(proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    registros = await crud.listar_registros_por_proyecto(proyecto_id)

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

@app.patch("/personas-usuarias/{persona_id}")
async def actualizar_persona_usuaria(persona_id: str, data: PersonaUsuariaUpdate):
    persona = await crud.actualizar_persona_usuaria(persona_id, data)

    if not persona:
        raise HTTPException(
            status_code=404,
            detail="Persona usuaria no encontrada."
        )

    return {
        "message": "Persona usuaria actualizada correctamente en Supabase",
        "data": persona,
    }


@app.patch("/personas-usuarias/{persona_id}/validar")
async def validar_persona_usuaria(persona_id: str):
    persona = await crud.actualizar_persona_usuaria(
        persona_id,
        PersonaUsuariaUpdate(estado_perfil="validado", completado=True),
    )

    if not persona:
        raise HTTPException(
            status_code=404,
            detail="Persona usuaria no encontrada para validar."
        )

    return {
        "message": "Persona usuaria validada correctamente",
        "data": persona,
    }


@app.delete("/personas-usuarias/{persona_id}")
async def eliminar_persona_usuaria(persona_id: str):
    resultado = await crud.eliminar_persona_usuaria(persona_id)

    if not resultado:
        raise HTTPException(
            status_code=404,
            detail="Persona usuaria no encontrada para eliminar."
        )

    return {
        "message": "Persona usuaria eliminada correctamente",
        "data": resultado,
    }


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

@app.get("/proyectos/{proyecto_id}/habilitaciones")
async def listar_habilitaciones_proyecto(proyecto_id: str):
    proyecto = await crud.obtener_proyecto(proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    habilitaciones = await crud.listar_habilitaciones_por_proyecto(proyecto_id)

    return {
        "proyecto": proyecto,
        "habilitaciones": habilitaciones,
    }


@app.patch("/habilitacion/{habilitacion_id}")
async def actualizar_habilitacion(habilitacion_id: str, data: HabilitacionUpdate):
    habilitacion = await crud.actualizar_habilitacion(habilitacion_id, data)

    if not habilitacion:
        raise HTTPException(
            status_code=404,
            detail="Habilitacion no encontrada para actualizar."
        )

    return {
        "message": "Habilitacion actualizada correctamente",
        "data": habilitacion,
    }


@app.delete("/habilitacion/{habilitacion_id}")
async def eliminar_habilitacion(habilitacion_id: str):
    resultado = await crud.eliminar_habilitacion(habilitacion_id)

    if not resultado:
        raise HTTPException(
            status_code=404,
            detail="Habilitacion no encontrada para eliminar."
        )

    return {
        "message": "Habilitacion eliminada correctamente",
        "data": resultado,
    }


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


@app.get("/expectativas/{expectativa_id}")
async def obtener_expectativa(expectativa_id: str):
    expectativa = await crud.obtener_expectativa_por_id(expectativa_id)

    if not expectativa:
        raise HTTPException(
            status_code=404,
            detail="Expectativa no encontrada."
        )

    return {
        "message": "Expectativa obtenida correctamente",
        "data": expectativa,
    }


@app.patch("/expectativas/{expectativa_id}")
async def actualizar_expectativa(expectativa_id: str, data: ExpectativaUpdate):
    expectativa = await crud.actualizar_expectativa(expectativa_id, data)

    if not expectativa:
        raise HTTPException(
            status_code=404,
            detail="Expectativa no encontrada para actualizar."
        )

    return {
        "message": "Expectativa actualizada correctamente",
        "data": expectativa,
    }


@app.delete("/expectativas/{expectativa_id}")
async def eliminar_expectativa(expectativa_id: str):
    resultado = await crud.eliminar_expectativa(expectativa_id)

    if not resultado:
        raise HTTPException(
            status_code=404,
            detail="Expectativa no encontrada para eliminar."
        )

    return {
        "message": "Expectativa eliminada correctamente",
        "data": resultado,
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

@app.patch("/necesidades/{necesidad_id}")
async def actualizar_necesidad(necesidad_id: str, data: NecesidadUpdate):
    necesidad = await crud.actualizar_necesidad(necesidad_id, data)

    if not necesidad:
        raise HTTPException(
            status_code=404,
            detail="Necesidad no encontrada para actualizar."
        )

    return {
        "message": "Necesidad actualizada correctamente",
        "data": necesidad,
    }


@app.delete("/necesidades/{necesidad_id}")
async def eliminar_necesidad(necesidad_id: str):
    resultado = await crud.eliminar_necesidad(necesidad_id)

    if not resultado:
        raise HTTPException(
            status_code=404,
            detail="Necesidad no encontrada para eliminar."
        )

    return {
        "message": "Necesidad eliminada correctamente",
        "data": resultado,
    }


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


@app.patch("/vinculaciones/{vinculacion_id}")
async def actualizar_vinculacion(vinculacion_id: str, data: VinculacionUpdate):
    vinculacion = await crud.actualizar_vinculacion(vinculacion_id, data)

    if not vinculacion:
        raise HTTPException(
            status_code=404,
            detail="Vinculacion no encontrada para actualizar."
        )

    return {
        "message": "Vinculacion actualizada correctamente",
        "data": vinculacion,
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


@app.patch("/indicadores/{indicador_id}")
async def actualizar_indicador(indicador_id: str, data: IndicadorUpdate):
    indicador = await crud.actualizar_indicador(indicador_id, data)

    if not indicador:
        raise HTTPException(
            status_code=404,
            detail="Indicador no encontrado para actualizar."
        )

    return {
        "message": "Indicador actualizado correctamente",
        "data": indicador,
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

# =========================
# Herramientas del Propósito 1
# =========================

@app.patch("/momentos-criticos/{momento_id}")
async def actualizar_momento_critico(momento_id: str, data: MomentoCriticoUpdate):
    momento = await crud.actualizar_momento_critico(momento_id, data)

    if not momento:
        raise HTTPException(
            status_code=404,
            detail="Momento critico no encontrado para actualizar."
        )

    return {
        "message": "Momento critico actualizado correctamente",
        "data": momento,
    }


@app.get("/herramientas/proposito/{proposito_id}")
async def listar_herramientas_proposito(proposito_id: int):
    herramientas = await crud.obtener_herramientas_por_proposito(proposito_id)

    return {
        "message": "Herramientas del propósito obtenidas correctamente",
        "proposito_id": proposito_id,
        "total": len(herramientas),
        "data": herramientas,
    }


@app.get("/herramientas/proposito/{proposito_id}/etapa/{etapa}")
async def listar_herramientas_por_etapa(proposito_id: int, etapa: int):
    herramientas = await crud.obtener_herramientas_por_etapa(proposito_id, etapa)

    return {
        "message": "Herramientas de la etapa obtenidas correctamente",
        "proposito_id": proposito_id,
        "etapa": etapa,
        "total": len(herramientas),
        "data": herramientas,
    }

# =========================
# Calendarización
# =========================

@app.post("/calendarizacion")
async def crear_calendarizacion(data: CalendarizacionCreate):
    calendarizacion = await crud.crear_calendarizacion(data)

    return {
        "message": "Actividad calendarizada correctamente",
        "data": calendarizacion,
    }


@app.get("/proyectos/{proyecto_id}/calendarizacion")
async def listar_calendarizacion_proyecto(proyecto_id: str):
    calendarizacion = await crud.obtener_calendarizacion_por_proyecto(proyecto_id)

    return {
        "message": "Calendarización del proyecto obtenida correctamente",
        "proyecto_id": proyecto_id,
        "total": len(calendarizacion),
        "data": calendarizacion,
    }


@app.get("/calendarizacion/{calendarizacion_id}")
async def obtener_calendarizacion(calendarizacion_id: str):
    calendarizacion = await crud.obtener_calendarizacion_por_id(calendarizacion_id)

    if not calendarizacion:
        return {
            "message": "No se encontró la actividad calendarizada",
            "data": None,
        }

    return {
        "message": "Actividad calendarizada obtenida correctamente",
        "data": calendarizacion,
    }


@app.patch("/calendarizacion/{calendarizacion_id}")
async def actualizar_calendarizacion(calendarizacion_id: str, data: CalendarizacionUpdate):
    calendarizacion = await crud.actualizar_calendarizacion(calendarizacion_id, data)

    if not calendarizacion:
        return {
            "message": "No se encontró la actividad calendarizada para actualizar",
            "data": None,
        }

    return {
        "message": "Actividad calendarizada actualizada correctamente",
        "data": calendarizacion,
    }


@app.delete("/calendarizacion/{calendarizacion_id}")
async def eliminar_calendarizacion(calendarizacion_id: str):
    resultado = await crud.eliminar_calendarizacion(calendarizacion_id)

    if not resultado:
        return {
            "message": "No se encontró la actividad calendarizada para eliminar",
            "data": None,
        }

    return {
        "message": "Actividad calendarizada eliminada correctamente",
        "data": resultado,
    }


# =========================
# Evidencias
# =========================

@app.post("/evidencias")
async def crear_evidencia(data: EvidenciaCreate):
    proyecto = await crud.obtener_proyecto(data.proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    evidencia = await crud.crear_evidencia(data)

    return {
        "message": "Evidencia creada correctamente",
        "data": evidencia,
    }


@app.post("/evidencias/archivo")
async def crear_evidencia_archivo(data: EvidenciaArchivoCreate):
    proyecto = await crud.obtener_proyecto(data.proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    url_archivo = storage_service.guardar_archivo_evidencia(data)
    evidencia = await crud.crear_evidencia(
        EvidenciaCreate(
            proyecto_id=data.proyecto_id,
            calendarizacion_id=data.calendarizacion_id,
            etapa=data.etapa,
            nombre_archivo=data.nombre_archivo,
            tipo_archivo=data.tipo_archivo,
            url_storage=url_archivo,
            descripcion=data.descripcion,
            responsable=data.responsable,
        )
    )

    return {
        "message": "Evidencia con archivo creada correctamente",
        "data": evidencia,
    }


@app.get("/proyectos/{proyecto_id}/evidencias")
async def listar_evidencias_proyecto(proyecto_id: str):
    proyecto = await crud.obtener_proyecto(proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    evidencias = await crud.listar_evidencias_por_proyecto(proyecto_id)

    return {
        "proyecto": proyecto,
        "evidencias": evidencias,
    }


@app.patch("/evidencias/{evidencia_id}")
async def actualizar_evidencia(evidencia_id: str, data: EvidenciaUpdate):
    evidencia = await crud.actualizar_evidencia(evidencia_id, data)

    if not evidencia:
        raise HTTPException(
            status_code=404,
            detail="Evidencia no encontrada para actualizar."
        )

    return {
        "message": "Evidencia actualizada correctamente",
        "data": evidencia,
    }


@app.patch("/evidencias/{evidencia_id}/archivo")
async def actualizar_evidencia_archivo(evidencia_id: str, data: EvidenciaArchivoCreate):
    proyecto = await crud.obtener_proyecto(data.proyecto_id)

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado."
        )

    url_archivo = storage_service.guardar_archivo_evidencia(data)
    evidencia = await crud.actualizar_evidencia(
        evidencia_id,
        EvidenciaUpdate(
            calendarizacion_id=data.calendarizacion_id,
            etapa=data.etapa,
            nombre_archivo=data.nombre_archivo,
            tipo_archivo=data.tipo_archivo,
            url_storage=url_archivo,
            descripcion=data.descripcion,
            responsable=data.responsable,
        )
    )

    if not evidencia:
        raise HTTPException(
            status_code=404,
            detail="Evidencia no encontrada para actualizar."
        )

    return {
        "message": "Archivo de evidencia actualizado correctamente",
        "data": evidencia,
    }


@app.delete("/evidencias/{evidencia_id}")
async def eliminar_evidencia(evidencia_id: str):
    resultado = await crud.eliminar_evidencia(evidencia_id)

    if not resultado:
        raise HTTPException(
            status_code=404,
            detail="Evidencia no encontrada para eliminar."
        )

    return {
        "message": "Evidencia eliminada correctamente",
        "data": resultado,
    }

# =========================
# Resultados consolidados
# =========================

@app.get("/proyectos/{proyecto_id}/resultados")
async def obtener_resultados_proyecto(proyecto_id: str):
    resultados = await crud.obtener_resultados_proyecto(proyecto_id)

    if not resultados:
        return {
            "message": "No se encontró el proyecto solicitado",
            "data": None,
        }

    return {
        "message": "Resultados consolidados del proyecto obtenidos correctamente",
        "data": resultados,
    }

# =========================
# Acceso básico de usuario
# =========================

@app.post("/usuarios/acceso")
async def acceso_basico_usuario(data: UsuarioAccesoCreate):
    resultado = await crud.crear_o_actualizar_usuario_basico(data)

    return {
        "message": "Acceso básico de usuario procesado correctamente",
        "data": resultado,
    }


@app.get("/usuarios/buscar")
async def buscar_usuario_por_email(email: str):
    usuario = await crud.obtener_usuario_por_email(email)

    if not usuario:
        return {
            "message": "No se encontró usuario con el correo indicado",
            "data": None,
        }

    return {
        "message": "Usuario obtenido correctamente",
        "data": usuario,
    }


@app.get("/usuarios/{usuario_id}")
async def obtener_usuario(usuario_id: str):
    usuario = await crud.obtener_usuario_por_id(usuario_id)

    if not usuario:
        return {
            "message": "No se encontró el usuario solicitado",
            "data": None,
        }

    return {
        "message": "Usuario obtenido correctamente",
        "data": usuario,
    }


@app.patch("/proyectos/{proyecto_id}/usuario/{usuario_id}")
async def asociar_usuario_proyecto(proyecto_id: str, usuario_id: str):
    proyecto = await crud.asociar_usuario_a_proyecto(proyecto_id, usuario_id)

    if not proyecto:
        return {
            "message": "No se encontró el proyecto para asociar el usuario",
            "data": None,
        }

    return {
        "message": "Usuario asociado correctamente al proyecto",
        "data": proyecto,
    }

# =========================
# Motor de ruta del Propósito 1
# =========================

@app.get("/proyectos/{proyecto_id}/ruta")
async def obtener_ruta_proyecto(proyecto_id: str):
    ruta = await crud.obtener_ruta_proposito_1(proyecto_id)

    if not ruta:
        return {
            "message": "No se encontró el proyecto solicitado",
            "data": None,
        }

    return {
        "message": "Ruta del Propósito 1 obtenida correctamente",
        "data": ruta,
    }


@app.patch("/proyectos/{proyecto_id}/ruta/avanzar")
async def avanzar_ruta_proyecto(proyecto_id: str):
    resultado = await crud.avanzar_ruta_proposito_1(proyecto_id)

    if not resultado:
        return {
            "message": "No se encontró el proyecto solicitado para avanzar la ruta",
            "data": None,
        }

    if resultado.get("bloqueado"):
        raise HTTPException(
            status_code=409,
            detail={
                "message": resultado["message"],
                "ruta_actualizada": resultado["ruta_actualizada"],
            },
        )

    ruta_actualizada = await crud.obtener_ruta_proposito_1(proyecto_id)

    return {
        "message": "Ruta del proyecto avanzada correctamente",
        "proyecto": resultado,
        "ruta_actualizada": ruta_actualizada,
    }

# =========================
# Flujo Investigación
# =========================


@app.get("/proyectos/{proyecto_id}/investigaciones")
async def listar_investigaciones_proyecto(proyecto_id: str):
    investigaciones = await crud.listar_investigaciones_proyecto(proyecto_id)

    return {
        "message": "Planes de investigación obtenidos correctamente",
        "data": investigaciones,
    }

@app.get("/investigaciones/{investigacion_id}")
async def obtener_investigacion(investigacion_id: str):
    investigacion = await crud.obtener_investigacion_por_id(investigacion_id)

    if not investigacion:
        raise HTTPException(
            status_code=404,
            detail="No se encontró el plan de investigación solicitado."
        )

    return {
        "message": "Plan de investigación obtenido correctamente",
        "data": investigacion,
    }


@app.patch("/investigaciones/{investigacion_id}")
async def actualizar_investigacion(investigacion_id: str, data: InvestigacionUpdate):
    investigacion = await crud.actualizar_investigacion(investigacion_id, data)

    if not investigacion:
        raise HTTPException(
            status_code=404,
            detail="No se encontró el plan de investigación para actualizar."
        )

    return {
        "message": "Plan de investigación actualizado correctamente",
        "data": investigacion,
    }


@app.delete("/investigaciones/{investigacion_id}")
async def eliminar_investigacion(investigacion_id: str):
    resultado = await crud.eliminar_investigacion(investigacion_id)

    if not resultado:
        raise HTTPException(
            status_code=404,
            detail="No se encontró el plan de investigación para eliminar."
        )

    return {
        "message": "Plan de investigación eliminado correctamente",
        "data": resultado,
    }


@app.patch("/investigaciones/{investigacion_id}/validar")
async def validar_plan_investigacion(investigacion_id: str):
    investigacion = await crud.validar_plan_investigacion(investigacion_id)

    if not investigacion:
        raise HTTPException(
            status_code=404,
            detail="No se encontró el plan de investigación para validar."
        )

    return {
        "message": "Plan de investigación validado correctamente",
        "data": investigacion,
    }


@app.post("/ia/sintetizar-evidencias")
async def ia_sintetizar_evidencias(data: IASintesisRequest):
    resultado = await ai_service.sintetizar_evidencias(data.evidencias, data.etapa)

    return {
        "modo": ai_service.MODO,
        "resultado": resultado,
    }


@app.post("/ia/sugerir-proximos-pasos")
async def ia_sugerir_proximos_pasos(data: IASugerenciaRequest):
    if data.etapa < 1 or data.etapa > 7:
        raise HTTPException(
            status_code=400,
            detail="La etapa debe estar entre 1 y 7."
        )

    resultado = await ai_service.sugerir_proximos_pasos(
        data.etapa, data.contexto, data.datos_etapa
    )

    return {
        "modo": ai_service.MODO,
        "resultado": resultado,
    }


@app.post("/ia/mejorar-redaccion")
async def ia_mejorar_redaccion(data: IAMejoraRedaccionRequest):
    resultado = await ai_service.mejorar_redaccion(data.texto, data.tono)

    return {
        "modo": ai_service.MODO,
        "resultado": resultado,
    }
