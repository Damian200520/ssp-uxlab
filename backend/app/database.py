import os
import ssl
import asyncpg
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL no está definida en el archivo .env")


async def get_connection():
    ssl_context = ssl.create_default_context()

    # Solo para desarrollo local en Windows:
    # evita errores de certificados self-signed en la cadena SSL.
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    return await asyncpg.connect(
        DATABASE_URL,
        ssl=ssl_context,
        statement_cache_size=0
    )