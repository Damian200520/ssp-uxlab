from pydantic import BaseModel, Field
from typing import Any


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
    contexto_servicio: str = Field(..., min_length=3)
    objetivo_investigacion: str = Field(..., min_length=3)
    metodologia: str = Field(..., min_length=3)
    documentos_consultados: list[str] = []
    sugerencia_ia: str | None = None
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