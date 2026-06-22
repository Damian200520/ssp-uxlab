import os
import ssl
import asyncpg
from dotenv import load_dotenv
from pathlib import Path
from app.security import current_auth_user_id

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL no está definida en el archivo .env")


def _ssl_context():
    verificar = os.getenv("DATABASE_SSL_VERIFY", "false").lower() in {
        "1",
        "true",
        "yes",
    }
    if not verificar:
        return "require"

    return ssl.create_default_context()


async def get_admin_connection():
    return await asyncpg.connect(
        DATABASE_URL,
        ssl=_ssl_context(),
        statement_cache_size=0
    )


async def get_connection():
    user_id = current_auth_user_id.get()
    if not user_id:
        raise RuntimeError("Se intentó acceder a datos sin una sesión autenticada.")

    conn = await get_admin_connection()
    try:
        await conn.execute(
            "select set_config('request.jwt.claim.sub', $1, false)",
            user_id,
        )
        await conn.execute("set role authenticated")
        return conn
    except Exception:
        await conn.close()
        raise
