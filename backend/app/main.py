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
    CalendarizacionCreate,
    CalendarizacionUpdate,
    UsuarioAccesoCreate,
    InvestigacionUpdate,
    IASintesisRequest,
    IASugerenciaRequest,
    IAMejoraRedaccionRequest,
)
from app import crud, ai_service


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

# =========================
# Herramientas del Propósito 1
# =========================

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
    proyecto = await crud.avanzar_ruta_proposito_1(proyecto_id)

    if not proyecto:
        return {
            "message": "No se encontró el proyecto solicitado para avanzar la ruta",
            "data": None,
        }

    ruta_actualizada = await crud.obtener_ruta_proposito_1(proyecto_id)

    return {
        "message": "Ruta del proyecto avanzada correctamente",
        "proyecto": proyecto,
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


