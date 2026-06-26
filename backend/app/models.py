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
    nivel_digital: str | None = None
    canales_contacto: list[str] = []
    expectativas: list[str] = []
    relacion_servicio: str | None = None
    fuente_perfil: str | None = "manual"
    estado_perfil: str | None = "borrador"
    completado: bool | None = False


class PersonaUsuariaUpdate(BaseModel):
    nombre_arquetipo: Optional[str] = None
    rol: Optional[str] = None
    descripcion: Optional[str] = None
    necesidades: Optional[list[str]] = None
    barreras: Optional[list[str]] = None
    motivaciones: Optional[list[str]] = None
    foto_url: Optional[str] = None
    sugerencia_ia: Optional[str] = None
    nivel_digital: Optional[str] = None
    canales_contacto: Optional[list[str]] = None
    expectativas: Optional[list[str]] = None
    relacion_servicio: Optional[str] = None
    fuente_perfil: Optional[str] = None
    estado_perfil: Optional[str] = None
    completado: Optional[bool] = None

class HabilitacionCreate(BaseModel):
    proyecto_id: str
    nivel_acceso: str
    nivel_conocimiento: str
    nivel_digital: str
    descripcion_habilitacion: str = Field(..., min_length=3)


class HabilitacionUpdate(BaseModel):
    nivel_acceso: Optional[str] = None
    nivel_conocimiento: Optional[str] = None
    nivel_digital: Optional[str] = None
    descripcion_habilitacion: Optional[str] = None


class ExpectativaCreate(BaseModel):
    proyecto_id: str
    persona_usuaria_id: str | None = None
    expectativa_usuario: str = Field(..., min_length=3)
    nivel_cumplimiento: str
    resultado_esperado: str | None = None
    indicador_exito: str | None = None
    linea_accion: str | None = None
    analisis_ia: str | None = None


class ExpectativaUpdate(BaseModel):
    persona_usuaria_id: Optional[str] = None
    expectativa_usuario: Optional[str] = None
    nivel_cumplimiento: Optional[str] = None
    resultado_esperado: Optional[str] = None
    indicador_exito: Optional[str] = None
    linea_accion: Optional[str] = None
    analisis_ia: Optional[str] = None


class NecesidadCreate(BaseModel):
    proyecto_id: str
    persona_usuaria_id: str | None = None
    descripcion: str = Field(..., min_length=3)
    categoria: str | None = None
    impacto: str
    estado: str = "pendiente"
    sugerencia_ia: str | None = None


class NecesidadUpdate(BaseModel):
    persona_usuaria_id: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    impacto: Optional[str] = None
    estado: Optional[str] = None
    sugerencia_ia: Optional[str] = None


class VinculacionCreate(BaseModel):
    proyecto_id: str
    necesidad_id: str
    actividad_servicio: str = Field(..., min_length=3)
    descripcion_vinculo: str | None = None
    tipo_vinculo: str
    alerta_ia: str | None = None


class VinculacionUpdate(BaseModel):
    necesidad_id: Optional[str] = None
    actividad_servicio: Optional[str] = None
    descripcion_vinculo: Optional[str] = None
    tipo_vinculo: Optional[str] = None
    alerta_ia: Optional[str] = None


class IndicadorCreate(BaseModel):
    proyecto_id: str
    nombre: str = Field(..., min_length=3)
    descripcion: str | None = None
    valor_base: float | None = None
    valor_meta: float | None = None
    unidad: str | None = None
    estado: str = "pendiente"
    sugerencia_ia: str | None = None


class IndicadorUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    valor_base: Optional[float] = None
    valor_meta: Optional[float] = None
    unidad: Optional[str] = None
    estado: Optional[str] = None
    sugerencia_ia: Optional[str] = None


class MomentoCriticoCreate(BaseModel):
    proyecto_id: str
    descripcion: str = Field(..., min_length=3)
    punto_contacto: str = Field(..., min_length=3)
    impacto: str
    causa_raiz: str | None = None
    oportunidad_mejora: str | None = None
    sintesis_ia: str | None = None


class MomentoCriticoUpdate(BaseModel):
    descripcion: Optional[str] = None
    punto_contacto: Optional[str] = None
    impacto: Optional[str] = None
    causa_raiz: Optional[str] = None
    oportunidad_mejora: Optional[str] = None
    sintesis_ia: Optional[str] = None


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


class EvidenciaCreate(BaseModel):
    proyecto_id: str
    calendarizacion_id: Optional[str] = None
    etapa: int
    nombre_archivo: str = Field(..., min_length=2)
    tipo_archivo: str
    url_storage: Optional[str] = None
    descripcion: Optional[str] = None
    responsable: Optional[str] = None


class EvidenciaArchivoCreate(EvidenciaCreate):
    nombre_original: str = Field(..., min_length=2)
    mime_type: Optional[str] = None
    contenido_base64: str = Field(..., min_length=10)

class ImagenPerfilCreate(BaseModel):
    proyecto_id: str
    nombre_original: str = Field(..., min_length=2)
    mime_type: str
    contenido_base64: str = Field(..., min_length=10)


class EvidenciaUpdate(BaseModel):
    calendarizacion_id: Optional[str] = None
    etapa: Optional[int] = None
    nombre_archivo: Optional[str] = None
    tipo_archivo: Optional[str] = None
    url_storage: Optional[str] = None
    descripcion: Optional[str] = None
    responsable: Optional[str] = None

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
