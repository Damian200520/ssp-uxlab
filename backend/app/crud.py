from app.database import get_connection
from app.models import ProyectoCreate, ActualizarEtapaProyecto, RegistroEtapaCreate


# =========================
# Datos estáticos del MVP
# =========================

propositos = [
    {
        "id": 1,
        "titulo": "Propósito 1: Comprender la experiencia actual",
        "descripcion": "Contar con un diagnóstico claro para individualizar desafíos y comprender la experiencia real.",
        "activo": True,
    },
    {
        "id": 2,
        "titulo": "Propósito 2: Incorporar perspectiva usuaria",
        "descripcion": "Ejecutar acciones orientadas a reforzar la orientación a las personas en la institución.",
        "activo": False,
    },
    {
        "id": 3,
        "titulo": "Propósito 3: Mejorar satisfacción con el servicio",
        "descripcion": "Identificar oportunidades de mejora y definir planes para elevar la satisfacción general.",
        "activo": False,
    },
    {
        "id": 4,
        "titulo": "Propósito 4: Mejorar la colaboración interna",
        "descripcion": "Apoyar el trabajo colaborativo para el diseño de servicios coherentes.",
        "activo": False,
    },
    {
        "id": 5,
        "titulo": "Propósito 5: Diseñar un nuevo servicio",
        "descripcion": "Transformar una necesidad no resuelta en una propuesta clara de servicio.",
        "activo": False,
    },
]


etapas = [
    {
        "id": 1,
        "nombre": "Investigación",
        "descripcion": "Diseñar y ejecutar la investigación de las personas usuarias.",
        "pagina_guia": "110-111",
    },
    {
        "id": 2,
        "nombre": "Personas",
        "descripcion": "Describir a las personas usuarias de los servicios institucionales.",
        "pagina_guia": "148-149",
    },
    {
        "id": 3,
        "nombre": "Habilitación y Expectativas",
        "descripcion": "Detectar niveles de habilitación y expectativas de las personas usuarias.",
        "pagina_guia": "102-103",
    },
    {
        "id": 4,
        "nombre": "Necesidades",
        "descripcion": "Comprender motivaciones y necesidades de las personas usuarias.",
        "pagina_guia": "134-135",
    },
    {
        "id": 5,
        "nombre": "Vinculación",
        "descripcion": "Alinear necesidades de las personas usuarias con la oferta de servicio.",
        "pagina_guia": "156-157",
    },
    {
        "id": 6,
        "nombre": "Medición",
        "descripcion": "Observar y medir la experiencia real entregada.",
        "pagina_guia": "118-119",
    },
    {
        "id": 7,
        "nombre": "Momentos Críticos",
        "descripcion": "Identificar momentos de quiebre en la experiencia actual.",
        "pagina_guia": "128-129",
    },
]


herramientas = [
    {
        "id": 1,
        "nombre": "Formulario de registro de investigación",
        "descripcion": "Ingreso de contexto, objetivos y metodología.",
        "etapa_id": 1,
        "etapa_nombre": "Investigación",
        "prioridad": "Alta",
    },
    {
        "id": 2,
        "nombre": "Plantilla de perfiles de persona usuaria",
        "descripcion": "Fichas guiadas para caracterizar perfiles, barreras y motivaciones.",
        "etapa_id": 2,
        "etapa_nombre": "Personas",
        "prioridad": "Alta",
    },
    {
        "id": 3,
        "nombre": "Formulario de declaración de expectativas",
        "descripcion": "Captura de habilitación usuaria, expectativas y criterios de éxito.",
        "etapa_id": 3,
        "etapa_nombre": "Habilitación y Expectativas",
        "prioridad": "Alta",
    },
    {
        "id": 4,
        "nombre": "Tabla de necesidades priorizadas",
        "descripcion": "Lista editable de necesidades con impacto y estado de atención.",
        "etapa_id": 4,
        "etapa_nombre": "Necesidades",
        "prioridad": "Alta",
    },
    {
        "id": 5,
        "nombre": "Tabla de vinculación necesidad–actividad",
        "descripcion": "Relación entre necesidades y actividades del servicio.",
        "etapa_id": 5,
        "etapa_nombre": "Vinculación",
        "prioridad": "Alta",
    },
    {
        "id": 6,
        "nombre": "Plantilla de calendarización de actividades",
        "descripcion": "Planificación temporal de actividades, responsables y estados.",
        "etapa_id": 6,
        "etapa_nombre": "Medición",
        "prioridad": "Alta",
    },
    {
        "id": 7,
        "nombre": "Carga de evidencias por actividad",
        "descripcion": "Repositorio documental asociado a actividades del proceso.",
        "etapa_id": 6,
        "etapa_nombre": "Medición",
        "prioridad": "Media",
    },
    {
        "id": 8,
        "nombre": "Dashboard de resultados del Propósito 1",
        "descripcion": "Vista consolidada de resultados y trazabilidad del diagnóstico.",
        "etapa_id": 7,
        "etapa_nombre": "Momentos Críticos",
        "prioridad": "Alta",
    },
]


# =========================
# Funciones estáticas
# =========================

def listar_propositos():
    return propositos


def listar_etapas():
    return etapas


def listar_herramientas():
    return herramientas


# =========================
# Proyecto conectado a Supabase
# =========================

async def crear_proyecto(data: ProyectoCreate):
    conn = await get_connection()

    try:
        query = """
            insert into proyecto (
                nombre_proyecto,
                proposito_id,
                estado,
                etapa_actual
            )
            values ($1, $2, 'en_progreso', 1)
            returning
                id::text,
                nombre_proyecto,
                proposito_id,
                estado::text,
                etapa_actual,
                created_at::text,
                updated_at::text;
        """

        row = await conn.fetchrow(
            query,
            data.nombre_proyecto,
            data.proposito_id,
        )

        return dict(row)

    finally:
        await conn.close()


async def obtener_proyecto(proyecto_id: str):
    conn = await get_connection()

    try:
        query = """
            select
                id::text,
                nombre_proyecto,
                proposito_id,
                estado::text,
                etapa_actual,
                created_at::text,
                updated_at::text
            from proyecto
            where id = $1::uuid;
        """

        row = await conn.fetchrow(query, proyecto_id)

        if not row:
            return None

        return dict(row)

    finally:
        await conn.close()


async def actualizar_etapa(proyecto_id: str, data: ActualizarEtapaProyecto):
    conn = await get_connection()

    try:
        query = """
            update proyecto
            set etapa_actual = $2
            where id = $1::uuid
            returning
                id::text,
                nombre_proyecto,
                proposito_id,
                estado::text,
                etapa_actual,
                created_at::text,
                updated_at::text;
        """

        row = await conn.fetchrow(
            query,
            proyecto_id,
            data.etapa_actual,
        )

        if not row:
            return None

        return dict(row)

    finally:
        await conn.close()

# =========================
# Investigación conectada a Supabase
# =========================

async def crear_investigacion(data):
    conn = await get_connection()

    try:
        query = """
            insert into investigacion (
                proyecto_id,
                nombre_servicio,
                contexto_servicio,
                objetivo_investigacion,
                metodologia,
                documentos_consultados,
                sugerencia_ia,
                completado
            )
            values (
                $1::uuid,
                $2,
                $3,
                $4,
                $5,
                $6::text[],
                $7,
                $8
            )
            returning
                id::text,
                proyecto_id::text,
                nombre_servicio,
                contexto_servicio,
                objetivo_investigacion,
                metodologia,
                documentos_consultados,
                sugerencia_ia,
                completado,
                created_at::text,
                updated_at::text;
        """

        row = await conn.fetchrow(
            query,
            data.proyecto_id,
            data.nombre_servicio,
            data.contexto_servicio,
            data.objetivo_investigacion,
            data.metodologia,
            data.documentos_consultados,
            data.sugerencia_ia,
            data.completado,
        )

        return dict(row)

    finally:
        await conn.close()


async def obtener_investigacion_por_proyecto(proyecto_id: str):
    conn = await get_connection()

    try:
        query = """
            select
                id::text,
                proyecto_id::text,
                nombre_servicio,
                contexto_servicio,
                objetivo_investigacion,
                metodologia,
                documentos_consultados,
                sugerencia_ia,
                completado,
                created_at::text,
                updated_at::text
            from investigacion
            where proyecto_id = $1::uuid
            order by created_at desc
            limit 1;
        """

        row = await conn.fetchrow(query, proyecto_id)

        if not row:
            return None

        return dict(row)

    finally:
        await conn.close()


# =========================
# Personas usuarias conectadas a Supabase
# =========================

async def crear_persona_usuaria(data):
    conn = await get_connection()

    try:
        query = """
            insert into persona_usuaria (
                proyecto_id,
                nombre_arquetipo,
                rol,
                descripcion,
                necesidades,
                barreras,
                motivaciones,
                foto_url,
                sugerencia_ia
            )
            values (
                $1::uuid,
                $2,
                $3,
                $4,
                $5::text[],
                $6::text[],
                $7::text[],
                $8,
                $9
            )
            returning
                id::text,
                proyecto_id::text,
                nombre_arquetipo,
                rol,
                descripcion,
                necesidades,
                barreras,
                motivaciones,
                foto_url,
                sugerencia_ia,
                created_at::text;
        """

        row = await conn.fetchrow(
            query,
            data.proyecto_id,
            data.nombre_arquetipo,
            data.rol,
            data.descripcion,
            data.necesidades,
            data.barreras,
            data.motivaciones,
            data.foto_url,
            data.sugerencia_ia,
        )

        return dict(row)

    finally:
        await conn.close()


async def listar_personas_usuarias_por_proyecto(proyecto_id: str):
    conn = await get_connection()

    try:
        query = """
            select
                id::text,
                proyecto_id::text,
                nombre_arquetipo,
                rol,
                descripcion,
                necesidades,
                barreras,
                motivaciones,
                foto_url,
                sugerencia_ia,
                created_at::text
            from persona_usuaria
            where proyecto_id = $1::uuid
            order by created_at asc;
        """

        rows = await conn.fetch(query, proyecto_id)

        return [dict(row) for row in rows]

    finally:
        await conn.close()

# =========================
# Habilitación conectada a Supabase
# =========================

async def crear_habilitacion(data):
    conn = await get_connection()

    try:
        query = """
            insert into habilitacion (
                proyecto_id,
                nivel_acceso,
                nivel_conocimiento,
                nivel_digital,
                descripcion_habilitacion
            )
            values (
                $1::uuid,
                $2::text::nivel_basico,
                $3::text::nivel_basico,
                $4::text::nivel_basico,
                $5
            )
            returning
                id::text,
                proyecto_id::text,
                nivel_acceso::text,
                nivel_conocimiento::text,
                nivel_digital::text,
                descripcion_habilitacion,
                created_at::text;
        """

        row = await conn.fetchrow(
            query,
            data.proyecto_id,
            data.nivel_acceso,
            data.nivel_conocimiento,
            data.nivel_digital,
            data.descripcion_habilitacion,
        )

        return dict(row)

    finally:
        await conn.close()


async def obtener_habilitacion_por_proyecto(proyecto_id: str):
    conn = await get_connection()

    try:
        query = """
            select
                id::text,
                proyecto_id::text,
                nivel_acceso::text,
                nivel_conocimiento::text,
                nivel_digital::text,
                descripcion_habilitacion,
                created_at::text
            from habilitacion
            where proyecto_id = $1::uuid
            order by created_at desc
            limit 1;
        """

        row = await conn.fetchrow(query, proyecto_id)

        if not row:
            return None

        return dict(row)

    finally:
        await conn.close()


# =========================
# Expectativas conectadas a Supabase
# =========================

async def crear_expectativa(data):
    conn = await get_connection()

    try:
        query = """
            insert into expectativa (
                proyecto_id,
                persona_usuaria_id,
                expectativa_usuario,
                nivel_cumplimiento,
                resultado_esperado,
                indicador_exito,
                linea_accion,
                analisis_ia
            )
            values (
                $1::uuid,
                $2::uuid,
                $3,
                $4::nivel_cumplimiento,
                $5,
                $6,
                $7,
                $8
            )
            returning
                id::text,
                proyecto_id::text,
                persona_usuaria_id::text,
                expectativa_usuario,
                nivel_cumplimiento::text,
                resultado_esperado,
                indicador_exito,
                linea_accion,
                analisis_ia,
                created_at::text;
        """

        row = await conn.fetchrow(
            query,
            data.proyecto_id,
            data.persona_usuaria_id,
            data.expectativa_usuario,
            data.nivel_cumplimiento,
            data.resultado_esperado,
            data.indicador_exito,
            data.linea_accion,
            data.analisis_ia,
        )

        return dict(row)

    finally:
        await conn.close()


async def listar_expectativas_por_proyecto(proyecto_id: str):
    conn = await get_connection()

    try:
        query = """
            select
                id::text,
                proyecto_id::text,
                persona_usuaria_id::text,
                expectativa_usuario,
                nivel_cumplimiento::text,
                resultado_esperado,
                indicador_exito,
                linea_accion,
                analisis_ia,
                created_at::text
            from expectativa
            where proyecto_id = $1::uuid
            order by created_at asc;
        """

        rows = await conn.fetch(query, proyecto_id)

        return [dict(row) for row in rows]

    finally:
        await conn.close()


# =========================
# Necesidades conectadas a Supabase
# =========================

async def crear_necesidad(data):
    conn = await get_connection()

    try:
        query = """
            insert into necesidad (
                proyecto_id,
                persona_usuaria_id,
                descripcion,
                categoria,
                impacto,
                estado,
                sugerencia_ia
            )
            values (
                $1::uuid,
                $2::uuid,
                $3,
                $4,
                $5::impacto_tipo,
                $6::estado_necesidad,
                $7
            )
            returning
                id::text,
                proyecto_id::text,
                persona_usuaria_id::text,
                descripcion,
                categoria,
                impacto::text,
                estado::text,
                sugerencia_ia,
                created_at::text;
        """

        row = await conn.fetchrow(
            query,
            data.proyecto_id,
            data.persona_usuaria_id,
            data.descripcion,
            data.categoria,
            data.impacto,
            data.estado,
            data.sugerencia_ia,
        )

        return dict(row)

    finally:
        await conn.close()


async def listar_necesidades_por_proyecto(proyecto_id: str):
    conn = await get_connection()

    try:
        query = """
            select
                id::text,
                proyecto_id::text,
                persona_usuaria_id::text,
                descripcion,
                categoria,
                impacto::text,
                estado::text,
                sugerencia_ia,
                created_at::text
            from necesidad
            where proyecto_id = $1::uuid
            order by created_at asc;
        """

        rows = await conn.fetch(query, proyecto_id)

        return [dict(row) for row in rows]

    finally:
        await conn.close()

# =========================
# Vinculación conectada a Supabase
# =========================

async def crear_vinculacion(data):
    conn = await get_connection()

    try:
        query = """
            insert into vinculacion (
                proyecto_id,
                necesidad_id,
                actividad_servicio,
                descripcion_vinculo,
                tipo_vinculo,
                alerta_ia
            )
            values (
                $1::uuid,
                $2::uuid,
                $3,
                $4,
                $5::text::tipo_vinculo,
                $6
            )
            returning
                id::text,
                proyecto_id::text,
                necesidad_id::text,
                actividad_servicio,
                descripcion_vinculo,
                tipo_vinculo::text,
                alerta_ia,
                created_at::text;
        """

        row = await conn.fetchrow(
            query,
            data.proyecto_id,
            data.necesidad_id,
            data.actividad_servicio,
            data.descripcion_vinculo,
            data.tipo_vinculo,
            data.alerta_ia,
        )

        return dict(row)

    finally:
        await conn.close()


async def listar_vinculaciones_por_proyecto(proyecto_id: str):
    conn = await get_connection()

    try:
        query = """
            select
                id::text,
                proyecto_id::text,
                necesidad_id::text,
                actividad_servicio,
                descripcion_vinculo,
                tipo_vinculo::text,
                alerta_ia,
                created_at::text
            from vinculacion
            where proyecto_id = $1::uuid
            order by created_at asc;
        """

        rows = await conn.fetch(query, proyecto_id)

        return [dict(row) for row in rows]

    finally:
        await conn.close()


# =========================
# Indicadores conectados a Supabase
# =========================

async def crear_indicador(data):
    conn = await get_connection()

    try:
        query = """
            insert into indicador (
                proyecto_id,
                nombre,
                descripcion,
                valor_base,
                valor_meta,
                unidad,
                estado,
                sugerencia_ia
            )
            values (
                $1::uuid,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7::text::estado_indicador,
                $8
            )
            returning
                id::text,
                proyecto_id::text,
                nombre,
                descripcion,
                valor_base::float,
                valor_meta::float,
                unidad,
                estado::text,
                sugerencia_ia,
                created_at::text;
        """

        row = await conn.fetchrow(
            query,
            data.proyecto_id,
            data.nombre,
            data.descripcion,
            data.valor_base,
            data.valor_meta,
            data.unidad,
            data.estado,
            data.sugerencia_ia,
        )

        return dict(row)

    finally:
        await conn.close()


async def listar_indicadores_por_proyecto(proyecto_id: str):
    conn = await get_connection()

    try:
        query = """
            select
                id::text,
                proyecto_id::text,
                nombre,
                descripcion,
                valor_base::float,
                valor_meta::float,
                unidad,
                estado::text,
                sugerencia_ia,
                created_at::text
            from indicador
            where proyecto_id = $1::uuid
            order by created_at asc;
        """

        rows = await conn.fetch(query, proyecto_id)

        return [dict(row) for row in rows]

    finally:
        await conn.close()

# =========================
# Momentos críticos conectados a Supabase
# =========================

async def crear_momento_critico(data):
    conn = await get_connection()

    try:
        query = """
            insert into momento_critico (
                proyecto_id,
                descripcion,
                punto_contacto,
                impacto,
                causa_raiz,
                oportunidad_mejora,
                sintesis_ia
            )
            values (
                $1::uuid,
                $2,
                $3,
                $4::text::impacto_tipo,
                $5,
                $6,
                $7
            )
            returning
                id::text,
                proyecto_id::text,
                descripcion,
                punto_contacto,
                impacto::text,
                causa_raiz,
                oportunidad_mejora,
                sintesis_ia,
                created_at::text;
        """

        row = await conn.fetchrow(
            query,
            data.proyecto_id,
            data.descripcion,
            data.punto_contacto,
            data.impacto,
            data.causa_raiz,
            data.oportunidad_mejora,
            data.sintesis_ia,
        )

        return dict(row)

    finally:
        await conn.close()


async def listar_momentos_criticos_por_proyecto(proyecto_id: str):
    conn = await get_connection()

    try:
        query = """
            select
                id::text,
                proyecto_id::text,
                descripcion,
                punto_contacto,
                impacto::text,
                causa_raiz,
                oportunidad_mejora,
                sintesis_ia,
                created_at::text
            from momento_critico
            where proyecto_id = $1::uuid
            order by created_at asc;
        """

        rows = await conn.fetch(query, proyecto_id)

        return [dict(row) for row in rows]

    finally:
        await conn.close()

# =========================
# Herramientas del Propósito 1
# Catálogo metodológico sin tabla
# =========================

HERRAMIENTAS_PROPOSITO_1 = [
    {
        "id": "herr-01",
        "proposito_id": 1,
        "etapa": 1,
        "nombre_etapa": "Investigación",
        "nombre_herramienta": "Entrevista semiestructurada",
        "descripcion": "Permite levantar información cualitativa desde personas usuarias o actores clave.",
        "uso_sugerido": "Utilizar en la etapa inicial para comprender experiencias, barreras y expectativas.",
    },
    {
        "id": "herr-02",
        "proposito_id": 1,
        "etapa": 1,
        "nombre_etapa": "Investigación",
        "nombre_herramienta": "Observación del servicio",
        "descripcion": "Permite registrar comportamientos, tiempos de espera y puntos de contacto durante la experiencia del servicio.",
        "uso_sugerido": "Aplicar durante la atención presencial o digital para identificar fricciones reales.",
    },
    {
        "id": "herr-03",
        "proposito_id": 1,
        "etapa": 2,
        "nombre_etapa": "Personas",
        "nombre_herramienta": "Perfil de persona usuaria",
        "descripcion": "Permite representar tipos de usuarios según características, necesidades, barreras y motivaciones.",
        "uso_sugerido": "Usar para organizar hallazgos por segmento de usuario.",
    },
    {
        "id": "herr-04",
        "proposito_id": 1,
        "etapa": 3,
        "nombre_etapa": "Habilitación y Expectativas",
        "nombre_herramienta": "Matriz de habilitación y expectativas",
        "descripcion": "Permite identificar nivel de acceso, conocimiento, competencia digital y expectativas frente al servicio.",
        "uso_sugerido": "Aplicar para detectar brechas de acceso y comprensión del servicio.",
    },
    {
        "id": "herr-05",
        "proposito_id": 1,
        "etapa": 4,
        "nombre_etapa": "Necesidades",
        "nombre_herramienta": "Matriz de necesidades",
        "descripcion": "Permite registrar necesidades detectadas, su categoría, impacto y estado.",
        "uso_sugerido": "Usar para priorizar problemáticas relevantes del servicio.",
    },
    {
        "id": "herr-06",
        "proposito_id": 1,
        "etapa": 5,
        "nombre_etapa": "Vinculación",
        "nombre_herramienta": "Mapa necesidad-servicio",
        "descripcion": "Permite relacionar necesidades detectadas con actividades, respuestas institucionales o puntos de contacto.",
        "uso_sugerido": "Usar para detectar brechas entre la oferta del servicio y las necesidades usuarias.",
    },
    {
        "id": "herr-07",
        "proposito_id": 1,
        "etapa": 6,
        "nombre_etapa": "Medición",
        "nombre_herramienta": "Indicadores de experiencia",
        "descripcion": "Permite definir métricas, línea base, metas y formas de evaluación.",
        "uso_sugerido": "Usar para medir avance, impacto o cumplimiento de objetivos del diagnóstico.",
    },
    {
        "id": "herr-08",
        "proposito_id": 1,
        "etapa": 7,
        "nombre_etapa": "Momentos Críticos",
        "nombre_herramienta": "Mapa de momentos críticos",
        "descripcion": "Permite identificar fricciones, causas raíz, impactos y oportunidades de mejora.",
        "uso_sugerido": "Usar para priorizar acciones correctivas dentro de la experiencia usuaria.",
    },
]


async def obtener_herramientas_por_proposito(proposito_id: int):
    if proposito_id != 1:
        return []

    return HERRAMIENTAS_PROPOSITO_1


async def obtener_herramientas_por_etapa(proposito_id: int, etapa: int):
    if proposito_id != 1:
        return []

    return [
        herramienta
        for herramienta in HERRAMIENTAS_PROPOSITO_1
        if herramienta["etapa"] == etapa
    ]

# =========================
# Calendarización
# =========================

async def crear_calendarizacion(data):
    conn = await get_connection()

    try:
        query = """
            insert into calendarizacion_actividad (
                proyecto_id,
                etapa,
                nombre_actividad,
                fecha_inicio,
                fecha_fin,
                responsable,
                estado,
                observaciones
            )
            values (
                $1::uuid,
                $2::int,
                $3,
                $4::date,
                $5::date,
                $6,
                $7::estado_calendarizacion,
                $8
            )
            returning
                id::text,
                proyecto_id::text,
                etapa,
                nombre_actividad,
                fecha_inicio::text,
                fecha_fin::text,
                responsable,
                estado::text,
                observaciones,
                created_at::text,
                updated_at::text;
        """

        row = await conn.fetchrow(
            query,
            data.proyecto_id,
            data.etapa,
            data.nombre_actividad,
            data.fecha_inicio,
            data.fecha_fin,
            data.responsable,
            data.estado,
            data.observaciones,
        )

        return dict(row)

    finally:
        await conn.close()


async def obtener_calendarizacion_por_proyecto(proyecto_id: str):
    conn = await get_connection()

    try:
        query = """
            select
                id::text,
                proyecto_id::text,
                etapa,
                nombre_actividad,
                fecha_inicio::text,
                fecha_fin::text,
                responsable,
                estado::text,
                observaciones,
                created_at::text,
                updated_at::text
            from calendarizacion_actividad
            where proyecto_id = $1::uuid
            order by etapa asc, fecha_inicio asc nulls last, created_at asc;
        """

        rows = await conn.fetch(query, proyecto_id)

        return [dict(row) for row in rows]

    finally:
        await conn.close()


async def obtener_calendarizacion_por_id(calendarizacion_id: str):
    conn = await get_connection()

    try:
        query = """
            select
                id::text,
                proyecto_id::text,
                etapa,
                nombre_actividad,
                fecha_inicio::text,
                fecha_fin::text,
                responsable,
                estado::text,
                observaciones,
                created_at::text,
                updated_at::text
            from calendarizacion_actividad
            where id = $1::uuid;
        """

        row = await conn.fetchrow(query, calendarizacion_id)

        if not row:
            return None

        return dict(row)

    finally:
        await conn.close()


async def actualizar_calendarizacion(calendarizacion_id: str, data):
    conn = await get_connection()

    try:
        query = """
            update calendarizacion_actividad
            set
                etapa = coalesce($2::int, etapa),
                nombre_actividad = coalesce($3, nombre_actividad),
                fecha_inicio = coalesce($4::date, fecha_inicio),
                fecha_fin = coalesce($5::date, fecha_fin),
                responsable = coalesce($6, responsable),
                estado = coalesce($7::estado_calendarizacion, estado),
                observaciones = coalesce($8, observaciones),
                updated_at = now()
            where id = $1::uuid
            returning
                id::text,
                proyecto_id::text,
                etapa,
                nombre_actividad,
                fecha_inicio::text,
                fecha_fin::text,
                responsable,
                estado::text,
                observaciones,
                created_at::text,
                updated_at::text;
        """

        row = await conn.fetchrow(
            query,
            calendarizacion_id,
            data.etapa,
            data.nombre_actividad,
            data.fecha_inicio,
            data.fecha_fin,
            data.responsable,
            data.estado,
            data.observaciones,
        )

        if not row:
            return None

        return dict(row)

    finally:
        await conn.close()


async def eliminar_calendarizacion(calendarizacion_id: str):
    conn = await get_connection()

    try:
        query = """
            delete from calendarizacion_actividad
            where id = $1::uuid
            returning id::text;
        """

        row = await conn.fetchrow(query, calendarizacion_id)

        if not row:
            return None

        return dict(row)

    finally:
        await conn.close()

# =========================
# Resultados consolidados del Propósito 1
# =========================

async def obtener_resultados_proyecto(proyecto_id: str):
    conn = await get_connection()

    try:
        proyecto = await conn.fetchrow(
            """
            select
                id::text,
                usuario_id::text,
                nombre_proyecto,
                proposito_id,
                estado::text,
                etapa_actual,
                created_at::text,
                updated_at::text
            from proyecto
            where id = $1::uuid;
            """,
            proyecto_id,
        )

        if not proyecto:
            return None

        investigacion = await conn.fetchrow(
            """
            select
                id::text,
                proyecto_id::text,
                nombre_servicio,
                contexto_servicio,
                objetivo_investigacion,
                metodologia,
                documentos_consultados,
                sugerencia_ia,
                completado,
                created_at::text,
                updated_at::text
            from investigacion
            where proyecto_id = $1::uuid
            order by created_at desc
            limit 1;
            """,
            proyecto_id,
        )

        personas = await conn.fetch(
            """
            select
                id::text,
                proyecto_id::text,
                nombre_arquetipo,
                rol,
                descripcion,
                necesidades,
                barreras,
                motivaciones,
                foto_url,
                sugerencia_ia,
                created_at::text
            from persona_usuaria
            where proyecto_id = $1::uuid
            order by created_at asc;
            """,
            proyecto_id,
        )

        habilitacion = await conn.fetchrow(
            """
            select
                id::text,
                proyecto_id::text,
                nivel_acceso::text,
                nivel_conocimiento::text,
                nivel_digital::text,
                descripcion_habilitacion,
                created_at::text
            from habilitacion
            where proyecto_id = $1::uuid
            order by created_at desc
            limit 1;
            """,
            proyecto_id,
        )

        expectativas = await conn.fetch(
            """
            select
                id::text,
                proyecto_id::text,
                persona_usuaria_id::text,
                expectativa_usuario,
                nivel_cumplimiento::text,
                resultado_esperado,
                indicador_exito,
                linea_accion,
                analisis_ia,
                created_at::text
            from expectativa
            where proyecto_id = $1::uuid
            order by created_at asc;
            """,
            proyecto_id,
        )

        necesidades = await conn.fetch(
            """
            select
                id::text,
                proyecto_id::text,
                persona_usuaria_id::text,
                descripcion,
                categoria,
                impacto::text,
                estado::text,
                sugerencia_ia,
                created_at::text
            from necesidad
            where proyecto_id = $1::uuid
            order by created_at asc;
            """,
            proyecto_id,
        )

        vinculaciones = await conn.fetch(
            """
            select
                id::text,
                proyecto_id::text,
                necesidad_id::text,
                actividad_servicio,
                descripcion_vinculo,
                tipo_vinculo::text,
                alerta_ia,
                created_at::text
            from vinculacion
            where proyecto_id = $1::uuid
            order by created_at asc;
            """,
            proyecto_id,
        )

        indicadores = await conn.fetch(
            """
            select
                id::text,
                proyecto_id::text,
                nombre,
                descripcion,
                valor_base::text,
                valor_meta::text,
                unidad,
                estado::text,
                sugerencia_ia,
                created_at::text
            from indicador
            where proyecto_id = $1::uuid
            order by created_at asc;
            """,
            proyecto_id,
        )

        calendarizacion = await conn.fetch(
            """
            select
                id::text,
                proyecto_id::text,
                etapa,
                nombre_actividad,
                fecha_inicio::text,
                fecha_fin::text,
                responsable,
                estado::text,
                observaciones,
                created_at::text,
                updated_at::text
            from calendarizacion_actividad
            where proyecto_id = $1::uuid
            order by etapa asc, fecha_inicio asc nulls last, created_at asc;
            """,
            proyecto_id,
        )

        evidencias = await conn.fetch(
            """
            select
                id::text,
                proyecto_id::text,
                calendarizacion_id::text,
                etapa,
                nombre_archivo,
                tipo_archivo,
                url_storage,
                descripcion,
                created_at::text
            from evidencia
            where proyecto_id = $1::uuid
            order by etapa asc, created_at asc;
            """,
            proyecto_id,
        )

        momentos_criticos = await conn.fetch(
            """
            select
                id::text,
                proyecto_id::text,
                descripcion,
                punto_contacto,
                impacto::text,
                causa_raiz,
                oportunidad_mejora,
                sintesis_ia,
                created_at::text
            from momento_critico
            where proyecto_id = $1::uuid
            order by created_at asc;
            """,
            proyecto_id,
        )

        total_etapas = 7
        etapa_actual = proyecto["etapa_actual"] or 0
        porcentaje_avance = round((etapa_actual / total_etapas) * 100, 2)

        resumen = {
            "total_personas_usuarias": len(personas),
            "total_expectativas": len(expectativas),
            "total_necesidades": len(necesidades),
            "total_vinculaciones": len(vinculaciones),
            "total_indicadores": len(indicadores),
            "total_actividades_calendarizadas": len(calendarizacion),
            "total_evidencias": len(evidencias),
            "total_momentos_criticos": len(momentos_criticos),
            "etapa_actual": etapa_actual,
            "total_etapas": total_etapas,
            "porcentaje_avance": porcentaje_avance,
        }

        return {
            "proyecto": dict(proyecto),
            "resumen": resumen,
            "etapas": {
                "investigacion": dict(investigacion) if investigacion else None,
                "personas_usuarias": [dict(row) for row in personas],
                "habilitacion": dict(habilitacion) if habilitacion else None,
                "expectativas": [dict(row) for row in expectativas],
                "necesidades": [dict(row) for row in necesidades],
                "vinculaciones": [dict(row) for row in vinculaciones],
                "indicadores": [dict(row) for row in indicadores],
                "calendarizacion": [dict(row) for row in calendarizacion],
                "evidencias": [dict(row) for row in evidencias],
                "momentos_criticos": [dict(row) for row in momentos_criticos],
            },
        }

    finally:
        await conn.close()

# =========================
# Acceso básico de usuario
# =========================

async def crear_o_actualizar_usuario_basico(data):
    conn = await get_connection()

    try:
        usuario_existente = await conn.fetchrow(
            """
            select
                id::text,
                email,
                nombre_completo,
                institucion,
                cargo,
                created_at::text
            from usuario
            where lower(email) = lower($1)
            limit 1;
            """,
            data.email,
        )

        if usuario_existente:
            row = await conn.fetchrow(
                """
                update usuario
                set
                    nombre_completo = coalesce($2, nombre_completo),
                    institucion = coalesce($3, institucion),
                    cargo = coalesce($4, cargo)
                where id = $1::uuid
                returning
                    id::text,
                    email,
                    nombre_completo,
                    institucion,
                    cargo,
                    created_at::text;
                """,
                usuario_existente["id"],
                data.nombre_completo,
                data.institucion,
                data.cargo,
            )

            return {
                "accion": "usuario_existente_actualizado",
                "usuario": dict(row),
            }

        row = await conn.fetchrow(
            """
            insert into usuario (
                email,
                nombre_completo,
                institucion,
                cargo
            )
            values (
                $1,
                $2,
                $3,
                $4
            )
            returning
                id::text,
                email,
                nombre_completo,
                institucion,
                cargo,
                created_at::text;
            """,
            data.email,
            data.nombre_completo,
            data.institucion,
            data.cargo,
        )

        return {
            "accion": "usuario_creado",
            "usuario": dict(row),
        }

    finally:
        await conn.close()


async def obtener_usuario_por_id(usuario_id: str):
    conn = await get_connection()

    try:
        row = await conn.fetchrow(
            """
            select
                id::text,
                email,
                nombre_completo,
                institucion,
                cargo,
                created_at::text
            from usuario
            where id = $1::uuid;
            """,
            usuario_id,
        )

        if not row:
            return None

        return dict(row)

    finally:
        await conn.close()


async def obtener_usuario_por_email(email: str):
    conn = await get_connection()

    try:
        row = await conn.fetchrow(
            """
            select
                id::text,
                email,
                nombre_completo,
                institucion,
                cargo,
                created_at::text
            from usuario
            where lower(email) = lower($1)
            limit 1;
            """,
            email,
        )

        if not row:
            return None

        return dict(row)

    finally:
        await conn.close()


async def asociar_usuario_a_proyecto(proyecto_id: str, usuario_id: str):
    conn = await get_connection()

    try:
        row = await conn.fetchrow(
            """
            update proyecto
            set
                usuario_id = $2::uuid,
                updated_at = now()
            where id = $1::uuid
            returning
                id::text,
                usuario_id::text,
                nombre_proyecto,
                proposito_id,
                estado::text,
                etapa_actual,
                created_at::text,
                updated_at::text;
            """,
            proyecto_id,
            usuario_id,
        )

        if not row:
            return None

        return dict(row)

    finally:
        await conn.close()

# =========================
# Motor de ruta del Propósito 1
# =========================

ETAPAS_PROPOSITO_1 = [
    {
        "numero": 1,
        "clave": "investigacion",
        "nombre": "Investigación",
        "descripcion": "Levantamiento inicial de contexto, servicio, objetivo y metodología.",
    },
    {
        "numero": 2,
        "clave": "personas",
        "nombre": "Personas usuarias",
        "descripcion": "Identificación y caracterización de perfiles de personas usuarias.",
    },
    {
        "numero": 3,
        "clave": "habilitacion_expectativas",
        "nombre": "Habilitación y expectativas",
        "descripcion": "Registro de niveles de acceso, conocimiento, competencias digitales y expectativas.",
    },
    {
        "numero": 4,
        "clave": "necesidades",
        "nombre": "Necesidades",
        "descripcion": "Documentación de necesidades detectadas, impacto, categoría y estado.",
    },
    {
        "numero": 5,
        "clave": "vinculacion",
        "nombre": "Vinculación",
        "descripcion": "Relación entre necesidades detectadas y actividades o respuestas del servicio.",
    },
    {
        "numero": 6,
        "clave": "medicion",
        "nombre": "Medición",
        "descripcion": "Definición de indicadores, línea base, metas y evidencias de evaluación.",
    },
    {
        "numero": 7,
        "clave": "momentos_criticos",
        "nombre": "Momentos críticos",
        "descripcion": "Identificación de fricciones, causas raíz y oportunidades de mejora.",
    },
]


async def obtener_ruta_proposito_1(proyecto_id: str):
    conn = await get_connection()

    try:
        proyecto = await conn.fetchrow(
            """
            select
                id::text,
                usuario_id::text,
                nombre_proyecto,
                proposito_id,
                estado::text,
                etapa_actual,
                created_at::text,
                updated_at::text
            from proyecto
            where id = $1::uuid;
            """,
            proyecto_id,
        )

        if not proyecto:
            return None

        conteos = await conn.fetchrow(
            """
            select
                (select count(*) from investigacion where proyecto_id = $1::uuid) as total_investigacion,
                (select count(*) from persona_usuaria where proyecto_id = $1::uuid) as total_personas,
                (select count(*) from habilitacion where proyecto_id = $1::uuid) as total_habilitacion,
                (select count(*) from expectativa where proyecto_id = $1::uuid) as total_expectativas,
                (select count(*) from necesidad where proyecto_id = $1::uuid) as total_necesidades,
                (select count(*) from vinculacion where proyecto_id = $1::uuid) as total_vinculaciones,
                (select count(*) from indicador where proyecto_id = $1::uuid) as total_indicadores,
                (select count(*) from momento_critico where proyecto_id = $1::uuid) as total_momentos_criticos;
            """,
            proyecto_id,
        )

        etapa_actual = proyecto["etapa_actual"] or 1

        completitud = {
            1: conteos["total_investigacion"] > 0,
            2: conteos["total_personas"] > 0,
            3: conteos["total_habilitacion"] > 0 and conteos["total_expectativas"] > 0,
            4: conteos["total_necesidades"] > 0,
            5: conteos["total_vinculaciones"] > 0,
            6: conteos["total_indicadores"] > 0,
            7: conteos["total_momentos_criticos"] > 0,
        }

        detalle_conteos = {
            1: {
                "investigacion": conteos["total_investigacion"],
            },
            2: {
                "personas_usuarias": conteos["total_personas"],
            },
            3: {
                "habilitacion": conteos["total_habilitacion"],
                "expectativas": conteos["total_expectativas"],
            },
            4: {
                "necesidades": conteos["total_necesidades"],
            },
            5: {
                "vinculaciones": conteos["total_vinculaciones"],
            },
            6: {
                "indicadores": conteos["total_indicadores"],
            },
            7: {
                "momentos_criticos": conteos["total_momentos_criticos"],
            },
        }

        ruta = []

        for etapa in ETAPAS_PROPOSITO_1:
            numero = etapa["numero"]
            completada = completitud[numero]

            if numero == etapa_actual:
                estado_ruta = "actual"
            elif completada:
                estado_ruta = "completada"
            elif numero < etapa_actual:
                estado_ruta = "incompleta"
            else:
                estado_ruta = "pendiente"

            ruta.append(
                {
                    "numero": numero,
                    "clave": etapa["clave"],
                    "nombre": etapa["nombre"],
                    "descripcion": etapa["descripcion"],
                    "estado_ruta": estado_ruta,
                    "completada": completada,
                    "es_actual": numero == etapa_actual,
                    "conteos": detalle_conteos[numero],
                }
            )

        etapas_completadas = [
            etapa["numero"] for etapa in ruta if etapa["completada"]
        ]

        etapas_pendientes = [
            etapa["numero"] for etapa in ruta if not etapa["completada"]
        ]

        siguiente_etapa = None

        for etapa in ruta:
            if not etapa["completada"]:
                siguiente_etapa = etapa
                break

        total_etapas = len(ETAPAS_PROPOSITO_1)
        total_completadas = len(etapas_completadas)

        porcentaje_completitud = round(
            (total_completadas / total_etapas) * 100,
            2,
        )

        porcentaje_avance_por_etapa_actual = round(
            (etapa_actual / total_etapas) * 100,
            2,
        )

        return {
            "proyecto": dict(proyecto),
            "resumen_ruta": {
                "etapa_actual": etapa_actual,
                "total_etapas": total_etapas,
                "total_etapas_completadas": total_completadas,
                "etapas_completadas": etapas_completadas,
                "etapas_pendientes": etapas_pendientes,
                "porcentaje_completitud": porcentaje_completitud,
                "porcentaje_avance_por_etapa_actual": porcentaje_avance_por_etapa_actual,
                "siguiente_etapa_sugerida": siguiente_etapa,
            },
            "ruta": ruta,
        }

    finally:
        await conn.close()


async def avanzar_ruta_proposito_1(proyecto_id: str):
    conn = await get_connection()

    try:
        proyecto_actual = await conn.fetchrow(
            """
            select
                id::text,
                etapa_actual
            from proyecto
            where id = $1::uuid;
            """,
            proyecto_id,
        )

        if not proyecto_actual:
            return None

        etapa_actual = proyecto_actual["etapa_actual"] or 1
        nueva_etapa = etapa_actual + 1

        if nueva_etapa > 7:
            nueva_etapa = 7

        proyecto_actualizado = await conn.fetchrow(
            """
            update proyecto
            set
                etapa_actual = $2,
                updated_at = now()
            where id = $1::uuid
            returning
                id::text,
                usuario_id::text,
                nombre_proyecto,
                proposito_id,
                estado::text,
                etapa_actual,
                created_at::text,
                updated_at::text;
            """,
            proyecto_id,
            nueva_etapa,
        )

        return dict(proyecto_actualizado)

    finally:
        await conn.close()