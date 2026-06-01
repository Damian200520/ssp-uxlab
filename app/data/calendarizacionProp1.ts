export type EstadoActividad =
  | "Planificada"
  | "En ejecución"
  | "Completada"
  | "Pendiente"
  | "Atrasada";

export type EstadoCalendarizacionDb =
  | "pendiente"
  | "programada"
  | "en_ejecucion"
  | "completada";

export type EtapaProp1 =
  | "Investigación"
  | "Personas usuarias"
  | "Habilitación y expectativas"
  | "Necesidades"
  | "Vinculación"
  | "Medición"
  | "Momentos críticos";

export type ResponsableActividad =
  | "Equipo SSP"
  | "Contraparte UXLab"
  | "Facilitación"
  | "Equipo metodológico"
  | "Validación institucional";

export type ActividadCalendarizada = {
  id: string;
  actividad: string;
  etapa: EtapaProp1;
  herramienta: string;
  responsable: ResponsableActividad | string;
  fechaInicio: string;
  fechaTermino: string;
  estado: EstadoActividad;
  evidencia: string;
  semana: string;
};

export type CalendarizacionBackend = {
  id?: string;
  etapa?: number;
  nombre_actividad?: string;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  responsable?: string | null;
  estado?: string | null;
  observaciones?: string | null;
};

export type CalendarizacionCreatePayload = {
  proyecto_id: string;
  etapa: number;
  nombre_actividad: string;
  fecha_inicio: string;
  fecha_fin: string;
  responsable: string;
  estado: EstadoCalendarizacionDb;
  observaciones?: string | null;
};

export const estadosCalendarizacionDb: Array<{
  value: EstadoCalendarizacionDb;
  label: string;
}> = [
  {
    value: "pendiente",
    label: "Pendiente",
  },
  {
    value: "programada",
    label: "Programada",
  },
  {
    value: "en_ejecucion",
    label: "En ejecución",
  },
  {
    value: "completada",
    label: "Completada",
  },
];

export const etapasCalendarizacionDb = [
  { value: 1, label: "Investigación" },
  { value: 2, label: "Personas usuarias" },
  { value: 3, label: "Habilitación y expectativas" },
  { value: 4, label: "Necesidades" },
  { value: 5, label: "Vinculación" },
  { value: 6, label: "Medición" },
  { value: 7, label: "Momentos críticos" },
];

export const actividadesMetodologicasBase: ActividadCalendarizada[] = [
  {
    id: "met-1-investigacion",
    actividad: "Diseñar y ejecutar la investigación de las personas usuarias",
    etapa: "Investigación",
    herramienta: "Diseñar y ejecutar la investigación de las personas usuarias",
    responsable: "Equipo SSP",
    fechaInicio: "2026-06-03",
    fechaTermino: "2026-06-07",
    estado: "Planificada",
    evidencia: "Sin evidencia registrada",
    semana: "Semana metodológica 1",
  },
  {
    id: "met-2-personas",
    actividad: "Describir a las personas usuarias de los servicios institucionales",
    etapa: "Personas usuarias",
    herramienta: "Describir a las personas usuarias de los servicios institucionales",
    responsable: "Equipo SSP",
    fechaInicio: "2026-06-08",
    fechaTermino: "2026-06-11",
    estado: "Planificada",
    evidencia: "Sin evidencia registrada",
    semana: "Semana metodológica 2",
  },
  {
    id: "met-3-habilitacion-expectativas",
    actividad: "Detectar y consensuar los niveles de habilitación y expectativas de las personas usuarias para el servicio",
    etapa: "Habilitación y expectativas",
    herramienta: "Detectar y consensuar niveles de habilitación y expectativas",
    responsable: "Contraparte UXLab",
    fechaInicio: "2026-06-12",
    fechaTermino: "2026-06-16",
    estado: "Planificada",
    evidencia: "Sin evidencia registrada",
    semana: "Semana metodológica 2",
  },
  {
    id: "met-4-necesidades",
    actividad: "Comprender a fondo las motivaciones y necesidades de las personas al recurrir al servicio ofrecido por la institución",
    etapa: "Necesidades",
    herramienta: "Comprender motivaciones y necesidades de las personas usuarias",
    responsable: "Equipo metodológico",
    fechaInicio: "2026-06-17",
    fechaTermino: "2026-06-21",
    estado: "Planificada",
    evidencia: "Sin evidencia registrada",
    semana: "Semana metodológica 3",
  },
  {
    id: "met-5-vinculacion",
    actividad: "Alinear las necesidades de las personas usuarias con la oferta de servicio",
    etapa: "Vinculación",
    herramienta: "Alinear necesidades de personas usuarias con la oferta de servicio",
    responsable: "Equipo SSP",
    fechaInicio: "2026-06-22",
    fechaTermino: "2026-06-25",
    estado: "Pendiente",
    evidencia: "Sin evidencia registrada",
    semana: "Semana metodológica 4",
  },
  {
    id: "met-6-medicion",
    actividad: "Observar y medir la experiencia real entregada a través de los estándares de servicio disponibles",
    etapa: "Medición",
    herramienta: "Observar y medir la experiencia real entregada",
    responsable: "Equipo metodológico",
    fechaInicio: "2026-06-26",
    fechaTermino: "2026-06-30",
    estado: "Pendiente",
    evidencia: "Sin evidencia registrada",
    semana: "Semana metodológica 4",
  },
  {
    id: "met-7-momentos-criticos",
    actividad: "Identificar los momentos críticos de la experiencia actual",
    etapa: "Momentos críticos",
    herramienta: "Identificar los momentos críticos de la experiencia actual",
    responsable: "Validación institucional",
    fechaInicio: "2026-07-01",
    fechaTermino: "2026-07-04",
    estado: "Pendiente",
    evidencia: "Sin evidencia registrada",
    semana: "Semana metodológica 5",
  },
];

export const etapaDesdeNumero: Record<number, EtapaProp1> = {
  1: "Investigación",
  2: "Personas usuarias",
  3: "Habilitación y expectativas",
  4: "Necesidades",
  5: "Vinculación",
  6: "Medición",
  7: "Momentos críticos",
};

export const herramientaPorEtapa: Record<EtapaProp1, string> = {
  "Investigación": "Diseñar y ejecutar la investigación de las personas usuarias",
  "Personas usuarias": "Describir a las personas usuarias de los servicios institucionales",
  "Habilitación y expectativas": "Detectar y consensuar niveles de habilitación y expectativas",
  Necesidades: "Comprender motivaciones y necesidades de las personas usuarias",
  "Vinculación": "Alinear necesidades de personas usuarias con la oferta de servicio",
  "Medición": "Observar y medir la experiencia real entregada",
  "Momentos críticos": "Identificar los momentos críticos de la experiencia actual",
};

export const actividadesTecnicasOcultas = [
  "setup react",
  "desarrollo ui",
  "integración frontend",
  "integracion frontend",
  "integración frontend-backend",
  "integracion frontend-backend",
  "validación técnica",
  "validacion tecnica",
  "build",
  "catálogo de herramientas",
  "catalogo de herramientas",
  "dashboard de avance",
  "trazabilidad del proceso",
];
