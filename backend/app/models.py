from pydantic import BaseModel, Field
from typing import Any
from datetime import date
from typing import Optional, List


class ProyectoCreate(BaseModel):
    nombre_proyecto: str = Field(..., min_length=3)
    proposito_id: int = 1


class ActualizarEtapaProyecto(BaseModel):
    etapa_actual: int = Field(..., ge=1, le=7)


class RegistroEtapaCreate(BaseModel):
    proyecto_id: str
    etapa_id: int = Field(..., ge=1, le=7)
    contenido: dict[str, Any]


class InvestigacionCreate(BaseModel):
    proyecto_id: str
    nombre_servicio: str = Field(..., min_length=3)
    contexto_servicio: Optional[str] = None
    objetivo_investigacion: Optional[str] = None
    metodologia: Optional[str] = None
    documentos_consultados: List[str] = Field(default_factory=list)

    aspectos_servicio: List[str] = Field(default_factory=list)
    personas_a_comprender: List[str] = Field(default_factory=list)
    informacion_recolectar: List[str] = Field(default_factory=list)
    tecnicas_investigacion: List[str] = Field(default_factory=list)
    preparativos_logistica: List[str] = Field(default_factory=list)
    preguntas_clave: List[str] = Field(default_factory=list)

    etapa_servicio: Optional[str] = "Descubrimiento"
    estado_plan: Optional[str] = "borrador"
    sugerencia_ia: Optional[str] = None
    completado: bool = False


class PersonaUsuariaCreate(BaseModel):
    proyecto_id: str
    nombre_arquetipo: str = Field(..., min_length=3)
    rol: str = Field(..., min_length=2)
    descripcion: str = Field(..., min_length=3)
    necesidades: list[str] = []
    barreras: list[str] = []
    motivaciones: list[str] = []
    foto_url: str | None = None
    sugerencia_ia: str | None = None

class HabilitacionCreate(BaseModel):
    proyecto_id: str
    nivel_acceso: str
    nivel_conocimiento: str
    nivel_digital: str
    descripcion_habilitacion: str = Field(..., min_length=3)


class ExpectativaCreate(BaseModel):
    proyecto_id: str
    persona_usuaria_id: str | None = None
    expectativa_usuario: str = Field(..., min_length=3)
    nivel_cumplimiento: str
    resultado_esperado: str | None = None
    indicador_exito: str | None = None
    linea_accion: str | None = None
    analisis_ia: str | None = None


class NecesidadCreate(BaseModel):
    proyecto_id: str
    persona_usuaria_id: str | None = None
    descripcion: str = Field(..., min_length=3)
    categoria: str | None = None
    impacto: str
    estado: str = "pendiente"
    sugerencia_ia: str | None = None

class VinculacionCreate(BaseModel):
    proyecto_id: str
    necesidad_id: str
    actividad_servicio: str = Field(..., min_length=3)
    descripcion_vinculo: str | None = None
    tipo_vinculo: str
    alerta_ia: str | None = None


class IndicadorCreate(BaseModel):
    proyecto_id: str
    nombre: str = Field(..., min_length=3)
    descripcion: str | None = None
    valor_base: float | None = None
    valor_meta: float | None = None
    unidad: str | None = None
    estado: str = "pendiente"
    sugerencia_ia: str | None = None

class MomentoCriticoCreate(BaseModel):
    proyecto_id: str
    descripcion: str = Field(..., min_length=3)
    punto_contacto: str = Field(..., min_length=3)
    impacto: str
    causa_raiz: str | None = None
    oportunidad_mejora: str | None = None
    sintesis_ia: str | None = None

class CalendarizacionCreate(BaseModel):
    proyecto_id: str
    etapa: int
    nombre_actividad: str
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    responsable: Optional[str] = None
    estado: Optional[str] = "pendiente"
    observaciones: Optional[str] = None


class CalendarizacionUpdate(BaseModel):
    etapa: Optional[int] = None
    nombre_actividad: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    responsable: Optional[str] = None
    estado: Optional[str] = None
    observaciones: Optional[str] = None

class UsuarioAccesoCreate(BaseModel):
    email: str
    nombre_completo: Optional[str] = None
    institucion: Optional[str] = None
    cargo: Optional[str] = None


class InvestigacionUpdate(BaseModel):
    nombre_servicio: Optional[str] = None
    contexto_servicio: Optional[str] = None
    objetivo_investigacion: Optional[str] = None
    metodologia: Optional[str] = None
    documentos_consultados: Optional[List[str]] = None

    aspectos_servicio: Optional[List[str]] = None
    personas_a_comprender: Optional[List[str]] = None
    informacion_recolectar: Optional[List[str]] = None
    tecnicas_investigacion: Optional[List[str]] = None
    preparativos_logistica: Optional[List[str]] = None
    preguntas_clave: Optional[List[str]] = None

    etapa_servicio: Optional[str] = None
    estado_plan: Optional[str] = None
    sugerencia_ia: Optional[str] = None


class IASintesisRequest(BaseModel):
    proyecto_id: str
    etapa: int | None = None
    evidencias: list[dict] = []


class IASugerenciaRequest(BaseModel):
    etapa: int
    contexto: str
    datos_etapa: dict = {}


class IAMejoraRedaccionRequest(BaseModel):
    texto: str
    tono: str = "formal y claro"