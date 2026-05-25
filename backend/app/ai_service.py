import os
from typing import Optional

MODO = os.getenv("IA_MODO", "demo")

ETAPAS = {
    1: "Investigación",
    2: "Personas usuarias",
    3: "Habilitación y expectativas",
    4: "Necesidades",
    5: "Vinculación",
    6: "Medición",
    7: "Momentos críticos",
}

SUGERENCIAS_POR_ETAPA = {
    1: (
        "Diseñar y ejecutar al menos 3 entrevistas semiestructuradas con personas usuarias "
        "representativas del servicio. Complementar con observación en terreno para registrar "
        "fricciones reales durante la atención presencial o digital."
    ),
    2: (
        "Construir un arquetipo de persona usuaria primaria basado en los hallazgos de la "
        "investigación. Incluir necesidades, barreras, motivaciones y nivel de habilitación "
        "digital. Validar el perfil con actores clave del servicio."
    ),
    3: (
        "Aplicar la matriz de habilitación para cada perfil identificado, evaluando nivel de "
        "acceso, conocimiento técnico y competencia digital. Registrar expectativas explícitas "
        "frente al servicio y su nivel de cumplimiento actual."
    ),
    4: (
        "Priorizar las necesidades detectadas según su impacto y urgencia. Clasificarlas por "
        "categoría (información, acceso, acompañamiento, etc.) y vincularlas a los perfiles "
        "de persona usuaria correspondientes."
    ),
    5: (
        "Cruzar cada necesidad priorizada con las actividades del servicio actual para "
        "identificar brechas de cobertura. Documentar el tipo de vínculo (directo, parcial "
        "o inexistente) y proponer acciones de ajuste."
    ),
    6: (
        "Definir indicadores de experiencia para medir avance en las necesidades priorizadas. "
        "Establecer línea base, meta y periodicidad de medición. Calendarizar las actividades "
        "de evaluación y asignar responsables."
    ),
    7: (
        "Identificar los momentos de mayor fricción en el recorrido de la persona usuaria. "
        "Analizar causas raíz, impacto y oportunidades de mejora. Priorizar los hallazgos "
        "para la toma de decisiones."
    ),
}


async def sintetizar_evidencias(evidencias: list[dict], etapa: Optional[int] = None) -> str:
    if not evidencias:
        return (
            "Aún no se han registrado evidencias suficientes para generar una síntesis "
            "representativa. Se recomienda completar el registro de hallazgos en las etapas "
            "pendientes antes de solicitar un análisis consolidado."
        )

    total = len(evidencias)
    nombres = [e.get("nombre_archivo", "documento") for e in evidencias[:3]]
    lista = ", ".join(nombres)
    etapa_texto = ETAPAS.get(etapa, "el proceso") if etapa else "el proceso"

    return (
        f"Se analizaron {total} evidencia(s) correspondiente(s) a {etapa_texto}. "
        f"Documentos considerados: {lista}. "
        "Los hallazgos preliminares sugieren patrones consistentes en cuanto a las principales "
        "fricciones y oportunidades de mejora identificadas. Se recomienda complementar este "
        "análisis con entrevistas de profundización y sesiones de validación con personas "
        "usuarias para robustecer las conclusiones."
    )


async def sugerir_proximos_pasos(etapa: int, contexto: str, datos_etapa: dict) -> str:
    if etapa not in SUGERENCIAS_POR_ETAPA:
        return (
            f"La etapa {etapa} no corresponde al Propósito 1. "
            "Las sugerencias están disponibles para las etapas 1 a 7."
        )

    sugerencia_base = SUGERENCIAS_POR_ETAPA[etapa]

    if not contexto.strip():
        return (
            f"Considerando la etapa actual ({ETAPAS[etapa]}), se sugiere:\n"
            f"{sugerencia_base}\n\n"
            "Se recomienda documentar el contexto del proyecto para obtener sugerencias "
            "más personalizadas en futuras consultas."
        )

    return (
        f"De acuerdo al contexto proporcionado y la etapa actual ({ETAPAS[etapa]}), "
        f"se recomienda:\n{sugerencia_base}\n\n"
        "Como siguiente paso, se sugiere validar estas recomendaciones con el equipo "
        "del proyecto y ajustar el plan de trabajo según la realidad institucional."
    )


async def mejorar_redaccion(texto: str, tono: str = "formal y claro") -> str:
    if not texto.strip():
        return "No se ingresó texto para mejorar. Por favor, proporciona un texto de al menos 10 caracteres."

    return (
        f"De acuerdo al tono solicitado ('{tono}'), se presenta la siguiente versión "
        f"mejorada del texto ingresado:\n\n"
        f"{texto.strip().rstrip('.')}. Este enfoque permite comunicar los hallazgos "
        "de manera estructurada y profesional, facilitando su comprensión por parte "
        "de los equipos involucrados en el diagnóstico y la toma de decisiones."
    )
