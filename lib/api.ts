const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const PROYECTO_ID =
  process.env.NEXT_PUBLIC_PROYECTO_ID ||
  "31576cfb-4c12-4080-a8c3-1f422b4830de";

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function actualizarEtapaProyecto(etapaActual: number) {
  return apiRequest(`/proyectos/${PROYECTO_ID}/etapa`, {
    method: "PATCH",
    body: JSON.stringify({
      etapa_actual: etapaActual,
    }),
  });
}

export async function guardarInvestigacionDemo() {
  return apiRequest("/investigaciones", {
    method: "POST",
    body: JSON.stringify({
      proyecto_id: PROYECTO_ID,
      nombre_servicio: "Atención ciudadana presencial",
      contexto_servicio:
        "Servicio con alta demanda presencial y dificultades de orientación inicial.",
      objetivo_investigacion:
        "Comprender las principales fricciones que experimentan las personas usuarias durante la atención.",
      metodologia:
        "Entrevistas semiestructuradas, observación en terreno y revisión documental.",
      documentos_consultados: [
        "Guía UXLab",
        "Antecedentes de atención ciudadana",
      ],
      sugerencia_ia:
        "Considerar perfiles con baja alfabetización digital y usuarios frecuentes del canal presencial.",
      completado: true,
    }),
  });
}

export async function guardarPersonaUsuariaDemo() {
  return apiRequest("/personas-usuarias", {
    method: "POST",
    body: JSON.stringify({
      proyecto_id: PROYECTO_ID,
      nombre_arquetipo: "Persona mayor con baja alfabetización digital",
      rol: "Usuario final",
      descripcion:
        "Persona usuaria que requiere apoyo presencial para comprender requisitos, completar trámites y resolver dudas sobre el servicio.",
      necesidades: [
        "Información clara",
        "Acompañamiento presencial",
        "Menos tiempos de espera",
      ],
      barreras: [
        "Baja competencia digital",
        "Lenguaje técnico",
        "Dificultad para reunir documentos",
      ],
      motivaciones: [
        "Resolver el trámite rápido",
        "Evitar viajes innecesarios",
        "Sentirse orientada durante el proceso",
      ],
      foto_url: null,
      sugerencia_ia:
        "Este perfil podría requerir canales asistidos y mensajes en lenguaje claro.",
    }),
  });
}

export async function guardarHabilitacionDemo() {
  return apiRequest("/habilitacion", {
    method: "POST",
    body: JSON.stringify({
      proyecto_id: PROYECTO_ID,
      nivel_acceso: "medio",
      nivel_conocimiento: "bajo",
      nivel_digital: "bajo",
      descripcion_habilitacion:
        "Las personas usuarias tienen acceso parcial al servicio, pero presentan dificultades para comprender requisitos, pasos y canales digitales disponibles.",
    }),
  });
}

export async function guardarExpectativaDemo() {
  return apiRequest("/expectativas", {
    method: "POST",
    body: JSON.stringify({
      proyecto_id: PROYECTO_ID,
      persona_usuaria_id: null,
      expectativa_usuario:
        "Recibir información clara y orientación suficiente para completar el trámite sin tener que acudir varias veces.",
      nivel_cumplimiento: "parcial",
      resultado_esperado:
        "Reducir la confusión de las personas usuarias y mejorar la comprensión del proceso.",
      indicador_exito:
        "Porcentaje de personas usuarias que declaran comprender los pasos del trámite.",
      linea_accion:
        "Simplificar mensajes, mejorar señalética y reforzar la orientación inicial.",
      analisis_ia:
        "La expectativa se relaciona con brechas de información y baja habilitación usuaria.",
    }),
  });
}

export async function guardarNecesidadDemo() {
  return apiRequest("/necesidades", {
    method: "POST",
    body: JSON.stringify({
      proyecto_id: PROYECTO_ID,
      persona_usuaria_id: null,
      descripcion:
        "Necesidad de comprender claramente los requisitos antes de iniciar el trámite.",
      categoria: "Información",
      impacto: "alto",
      estado: "pendiente",
      sugerencia_ia:
        "Esta necesidad podría abordarse mediante lenguaje claro, guía paso a paso y apoyo presencial inicial.",
    }),
  });
}

export async function obtenerNecesidadesProyecto() {
  return apiRequest<{
    necesidades: Array<{ id: string; descripcion: string }>;
  }>(`/proyectos/${PROYECTO_ID}/necesidades`);
}

export async function guardarVinculacionDemo() {
  const data = await obtenerNecesidadesProyecto();
  const necesidad = data.necesidades?.[0];

  if (!necesidad) {
    throw new Error(
      "No existe una necesidad registrada. Primero guarda la etapa Necesidades."
    );
  }

  return apiRequest("/vinculaciones", {
    method: "POST",
    body: JSON.stringify({
      proyecto_id: PROYECTO_ID,
      necesidad_id: necesidad.id,
      actividad_servicio:
        "Orientación inicial presencial y entrega de guía paso a paso",
      descripcion_vinculo:
        "Esta actividad responde a la necesidad de comprender requisitos antes de iniciar el trámite, entregando información clara desde el primer contacto.",
      tipo_vinculo: "directa",
      alerta_ia:
        "La necesidad está parcialmente cubierta si no existe seguimiento posterior o apoyo en canal digital.",
    }),
  });
}

export async function guardarIndicadorDemo() {
  return apiRequest("/indicadores", {
    method: "POST",
    body: JSON.stringify({
      proyecto_id: PROYECTO_ID,
      nombre: "Comprensión de requisitos del trámite",
      descripcion:
        "Mide el porcentaje de personas usuarias que declaran comprender los requisitos y pasos antes de iniciar el trámite.",
      valor_base: 45,
      valor_meta: 75,
      unidad: "%",
      estado: "pendiente",
      sugerencia_ia:
        "Este indicador puede levantarse mediante encuesta breve posterior a la orientación inicial.",
    }),
  });
}

export async function guardarMomentoCriticoDemo() {
  return apiRequest("/momentos-criticos", {
    method: "POST",
    body: JSON.stringify({
      proyecto_id: PROYECTO_ID,
      descripcion:
        "Las personas usuarias no comprenden claramente qué documentos deben presentar antes de iniciar el trámite.",
      punto_contacto: "Orientación inicial presencial",
      impacto: "alto",
      causa_raiz:
        "La información se entrega con lenguaje técnico y no existe una guía simple visible en el primer punto de contacto.",
      oportunidad_mejora:
        "Diseñar una guía paso a paso en lenguaje claro y reforzar la orientación inicial.",
      sintesis_ia:
        "El quiebre afecta la comprensión inicial del trámite y puede generar viajes innecesarios, frustración y repetición de atenciones.",
    }),
  });
}

export async function guardarEtapaDemo(etapaNum: number) {
  if (etapaNum === 1) return guardarInvestigacionDemo();

  if (etapaNum === 2) return guardarPersonaUsuariaDemo();

  if (etapaNum === 3) {
    await guardarHabilitacionDemo();
    return guardarExpectativaDemo();
  }

  if (etapaNum === 4) return guardarNecesidadDemo();

  if (etapaNum === 5) return guardarVinculacionDemo();

  if (etapaNum === 6) return guardarIndicadorDemo();

  if (etapaNum === 7) return guardarMomentoCriticoDemo();

  return null;
}