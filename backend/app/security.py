import json
import logging
import os
import urllib.error
import urllib.request
from contextvars import ContextVar
from pathlib import Path
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import HTTPException, Request

load_dotenv(Path(__file__).resolve().parent.parent / ".env")
load_dotenv(Path(__file__).resolve().parents[2] / ".env.local")

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_ANON_KEY = (
    os.getenv("SUPABASE_ANON_KEY")
    or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

current_auth_user_id: ContextVar[str | None] = ContextVar(
    "current_auth_user_id", default=None
)
current_auth_email: ContextVar[str | None] = ContextVar(
    "current_auth_email", default=None
)

logger = logging.getLogger("ssp_uxlab.security")


def request_id() -> str:
    return uuid4().hex


def _limpiar_log(value: str, max_length: int = 160) -> str:
    return value.replace("\r", " ").replace("\n", " ")[:max_length]


def log_event(
    event: str,
    *,
    request_id_value: str,
    status: str,
    path: str,
    user_id: str | None = None,
) -> None:
    payload = {
        "event": _limpiar_log(event),
        "request_id": request_id_value,
        "status": _limpiar_log(status),
        "path": _limpiar_log(path),
    }
    if user_id:
        payload["user_id"] = user_id
    logger.info(json.dumps(payload, ensure_ascii=True))


def _extraer_bearer(request: Request) -> str:
    authorization = request.headers.get("authorization", "")
    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=401,
            detail="Debes iniciar sesión para acceder a este recurso.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return token


def validar_token_supabase(request: Request) -> dict:
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(
            status_code=503,
            detail="La autenticación segura no está configurada en el backend.",
        )

    token = _extraer_bearer(request)
    url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/user"
    auth_request = urllib.request.Request(
        url,
        method="GET",
        headers={
            "Authorization": f"Bearer {token}",
            "apikey": SUPABASE_ANON_KEY,
        },
    )

    try:
        with urllib.request.urlopen(auth_request, timeout=10) as response:
            user = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        if exc.code in (401, 403):
            raise HTTPException(
                status_code=401,
                detail="La sesión expiró o no es válida.",
                headers={"WWW-Authenticate": "Bearer"},
            ) from exc
        raise HTTPException(
            status_code=503,
            detail="No fue posible validar la sesión.",
        ) from exc
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=503,
            detail="El servicio de autenticación no está disponible.",
        ) from exc

    user_id = user.get("id")
    email = user.get("email")
    if not user_id or not email:
        raise HTTPException(status_code=401, detail="Sesión de usuario incompleta.")

    return {"id": str(user_id), "email": str(email).strip().lower()}


def activar_contexto_usuario(user: dict):
    token_user = current_auth_user_id.set(user["id"])
    token_email = current_auth_email.set(user["email"])
    return token_user, token_email


def limpiar_contexto_usuario(tokens) -> None:
    token_user, token_email = tokens
    current_auth_user_id.reset(token_user)
    current_auth_email.reset(token_email)


def obtener_usuario_actual() -> tuple[str, str]:
    user_id = current_auth_user_id.get()
    email = current_auth_email.get()
    if not user_id or not email:
        raise HTTPException(status_code=401, detail="No existe una sesión activa.")
    return user_id, email
