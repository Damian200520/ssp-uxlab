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