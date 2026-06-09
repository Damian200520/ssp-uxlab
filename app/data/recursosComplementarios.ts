export type RecursoExterno = {
  id: string;
  nombre: string;
  url: string;
  fuente: string;
  descripcion: string;
};

export const recursosDisponibles: RecursoExterno[] = [
  {
    id: "chequeo-buenos-servicios",
    nombre: "Chequeo de Buenos Servicios",
    url: "https://lab.gob.cl/herramientas/chequeo-buenos-servicios",
    fuente: "Guía de herramientas [LabGob]",
    descripcion:
      "Genera un diagnóstico general de la experiencia con un servicio, adaptado de '15 principles for good Service Design' de Lou Downe.",
  },
  {
    id: "definicion-problema-inicial",
    nombre: "Definición de un Problema Inicial",
    url: "https://lab.gob.cl/herramientas/definicion-problema-inicial",
    fuente: "Guía de herramientas [LabGob]",
    descripcion:
      "Define el punto de partida para un proyecto de innovación. Ayuda a alinear al equipo y orienta la investigación usuaria.",
  },
  {
    id: "plan-investigacion",
    nombre: "Plan de Investigación",
    url: "https://lab.gob.cl/herramientas/plan-investigacion",
    fuente: "Guía de herramientas [LabGob]",
    descripcion:
      "Guía para definir y planificar un proceso de investigación, identificando técnicas, tareas y responsables.",
  },
  {
    id: "mapa-usuarios-investigar",
    nombre: "Mapa de Usuarios a Investigar",
    url: "https://lab.gob.cl/herramientas/mapa-usuarios-investigar",
    fuente: "Guía de herramientas [LabGob]",
    descripcion:
      "Representa visualmente a personas e instituciones relacionadas con un servicio o problema para planificar el trabajo de campo.",
  },
  {
    id: "herramientas-investigacion-cualitativa",
    nombre: "Herramientas de Investigación Cualitativa",
    url: "https://www.innovadorespublicos.cl",
    fuente: "Guía Permitido Innovar: ¿Cómo podemos resolver problemas públicos?",
    descripcion:
      "Selección de técnicas cualitativas apropiadas para desarrollar actividades de diagnóstico en un proyecto de innovación pública.",
  },
  {
    id: "perfil-persona-usuaria",
    nombre: "Perfil de Persona Usuaria",
    url: "https://lab.gob.cl/herramientas/perfil-persona-usuaria",
    fuente: "Guía de herramientas [LabGob]",
    descripcion:
      "Representa gráficamente a un grupo de personas con características comunes en relación a un servicio.",
  },
  {
    id: "charla-chileatiende",
    nombre: "La experiencia de ChileAtiende: ¿Cómo perfilar usuarios usando arquetipos ciudadanos?",
    url: "https://www.innovadorespublicos.cl",
    fuente: "Red de Innovadores Públicos — Agenda de Aprendizaje 2023",
    descripcion:
      "Charla que presenta conceptos, herramientas y casos prácticos de herramientas de Diseño de Servicios para perfilar personas usuarias.",
  },
  {
    id: "charla-medir-satisfaccion",
    nombre: "¿Cómo podemos medir la satisfacción usuaria en el Estado? Experiencias y aprendizajes",
    url: "https://www.innovadorespublicos.cl",
    fuente: "Red de Innovadores Públicos — Agenda de Aprendizaje 2023",
    descripcion:
      "Presenta herramientas de medición de satisfacción usuaria en el Estado y ejemplos de implementación de mejoras en servicios.",
  },
  {
    id: "curso-experiencia-usuaria",
    nombre: "Curso online: Mejorando la Experiencia Usuaria para la Confianza",
    url: "https://escuela.innovadorespublicos.cl/courses/experiencia-usuaria",
    fuente: "Escuela de Innovación Pública — LabGob",
    descripcion:
      "Curso asíncrono y gratuito que entrega la base conceptual necesaria para aplicar esta guía.",
  },
  {
    id: "sistema-calidad-servicio",
    nombre: "Sistema de Calidad de Servicio y Experiencia Usuaria",
    url: "https://satisfaccion.gob.cl/sistema-de-calidad-de-servicio-y-experiencia-usuaria",
    fuente: "Secretaría de Modernización",
    descripcion:
      "Plataforma que centraliza la medición de satisfacción usuaria y coordina las fases de implementación del Sistema.",
  },
  {
    id: "viaje-persona-usuaria",
    nombre: "Viaje de Persona Usuaria",
    url: "https://lab.gob.cl/herramientas/viaje-actual",
    fuente: "Guía de herramientas [LabGob]",
    descripcion:
      "Representa visualmente la secuencia de interacciones de una persona con un servicio para identificar momentos críticos.",
  },
  {
    id: "charla-perfiles-viajes",
    nombre: "¿Cómo conocer las necesidades usuarias a partir de herramientas de perfiles y viajes?",
    url: "https://www.innovadorespublicos.cl",
    fuente: "Red de Innovadores Públicos — Agenda de Aprendizaje 2023",
    descripcion:
      "Charla sobre conceptos de Diseño de Servicios y aplicación de herramientas de perfiles y viaje de usuarios.",
  },
  {
    id: "taller-cultura-innovacion",
    nombre: "Taller: ¿Cómo desarrollar una cultura de innovación pública en mi institución?",
    url: "https://www.innovadorespublicos.cl",
    fuente: "Red de Innovadores Públicos — Agenda de Aprendizaje 2021",
    descripcion:
      "Presenta conceptos, herramientas aplicadas y buenas prácticas para desarrollar una cultura de innovación pública.",
  },
];

type RecursosPorActividad = Record<string, string[]>;

export const recursosPorActividad: RecursosPorActividad = {
  investigacion: [
    "chequeo-buenos-servicios",
    "definicion-problema-inicial",
    "plan-investigacion",
    "mapa-usuarios-investigar",
    "herramientas-investigacion-cualitativa",
    "curso-experiencia-usuaria",
  ],
  personas: [
    "perfil-persona-usuaria",
    "charla-chileatiende",
  ],
  habilitacion: [
    "taller-cultura-innovacion",
  ],
  momentos: [
    "viaje-persona-usuaria",
    "charla-perfiles-viajes",
  ],
  medicion: [
    "charla-medir-satisfaccion",
  ],
  vinculacion: [
    "chequeo-buenos-servicios",
  ],
  base: [
    "sistema-calidad-servicio",
    "curso-experiencia-usuaria",
  ],
};
