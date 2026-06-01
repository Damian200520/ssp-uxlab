export type EstadoHerramienta = "Disponible" | "En desarrollo" | "Planificada";

export type TipoHerramienta =
  | "Formulario de carga"
  | "Plantilla de análisis"
  | "Tabla de seguimiento"
  | "Visualización de datos";

export type EtapaProp1 =
  | "Investigación"
  | "Personas"
  | "Habilitación y expectativas"
  | "Necesidades"
  | "Vinculación"
  | "Calendarización"
  | "Evidencias"
  | "Resultados";

export type FlujoHerramienta =
  | "investigacion"
  | "personas"
  | "habilitacion"
  | "necesidades"
  | "vinculacion"
  | "calendarizacion"
  | "evidencias"
  | "resultados";

export type HerramientaProp1 = {
  id: string;
  nombre: string;
  tipo: TipoHerramienta;
  etapa: EtapaProp1;
  descripcion: string;
  viabilidadMvp: "Alta";
  estado: EstadoHerramienta;
  flujo: FlujoHerramienta;
};

export const herramientasProp1: HerramientaProp1[] = [
  {
    id: "registro-investigacion",
    nombre: "Formulario de registro de investigación",
    tipo: "Formulario de carga",
    etapa: "Investigación",
    descripcion:
      "Permite al funcionario ingresar los datos del proceso de investigación: contexto, objetivos y metodología.",
    viabilidadMvp: "Alta",
    estado: "Disponible",
    flujo: "investigacion",
  },
  {
    id: "perfiles-usuario",
    nombre: "Plantilla de perfiles de usuario",
    tipo: "Plantilla de análisis",
    etapa: "Personas",
    descripcion:
      "Estructura guiada para construir fichas de personas usuarias, considerando nombre, rol, necesidades, barreras y motivaciones.",
    viabilidadMvp: "Alta",
    estado: "Disponible",
    flujo: "personas",
  },
  {
    id: "declaracion-expectativas",
    nombre: "Formulario de declaración de expectativas",
    tipo: "Formulario de carga",
    etapa: "Habilitación y expectativas",
    descripcion:
      "Captura los objetivos y expectativas que el equipo define antes de iniciar la innovación del servicio.",
    viabilidadMvp: "Alta",
    estado: "Disponible",
    flujo: "habilitacion",
  },
  {
    id: "necesidades-priorizadas",
    nombre: "Tabla de necesidades priorizadas",
    tipo: "Tabla de seguimiento",
    etapa: "Necesidades",
    descripcion:
      "Lista editable de necesidades ciudadanas con columnas de impacto estimado y estado de atención.",
    viabilidadMvp: "Alta",
    estado: "Disponible",
    flujo: "necesidades",
  },
  {
    id: "vinculacion-necesidad-actividad",
    nombre: "Tabla de vinculación necesidad–actividad",
    tipo: "Tabla de seguimiento",
    etapa: "Vinculación",
    descripcion:
      "Relaciona cada necesidad con la actividad del propósito que la aborda, generando trazabilidad.",
    viabilidadMvp: "Alta",
    estado: "En desarrollo",
    flujo: "vinculacion",
  },
  {
    id: "calendarizacion-actividades",
    nombre: "Plantilla de calendarización de actividades",
    tipo: "Plantilla de análisis",
    etapa: "Calendarización",
    descripcion:
      "Vista de agenda donde el funcionario programa cuándo ejecutará cada actividad del propósito.",
    viabilidadMvp: "Alta",
    estado: "En desarrollo",
    flujo: "calendarizacion",
  },
  {
    id: "evidencias-actividad",
    nombre: "Carga de evidencias por actividad",
    tipo: "Formulario de carga",
    etapa: "Evidencias",
    descripcion:
      "Permite adjuntar o registrar resultados, documentos y evidencias generadas en cada actividad.",
    viabilidadMvp: "Alta",
    estado: "Disponible",
    flujo: "evidencias",
  },
  {
    id: "dashboard-resultados",
    nombre: "Dashboard de resultados del Propósito 1",
    tipo: "Visualización de datos",
    etapa: "Resultados",
    descripcion:
      "Vista consolidada con el avance del recorrido, actividades completadas, indicadores y resultados.",
    viabilidadMvp: "Alta",
    estado: "En desarrollo",
    flujo: "resultados",
  },
];
