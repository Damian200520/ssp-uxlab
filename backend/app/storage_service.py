import base64
import binascii
import json
import os
import re
import urllib.error
import urllib.request
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException

MAX_EVIDENCIA_BYTES = 10 * 1024 * 1024
UPLOAD_ROOT = Path(__file__).resolve().parent.parent / "uploads"
EVIDENCIAS_UPLOAD_DIR = UPLOAD_ROOT / "evidencias"
EVIDENCIAS_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_STORAGE_KEY")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "evidencias-uxlab")
EVIDENCIA_STORAGE_MODE = os.getenv("EVIDENCIA_STORAGE_MODE", "auto").lower()


def decodificar_archivo_base64(contenido_base64: str) -> bytes:
    contenido = contenido_base64

    if "," in contenido:
        contenido = contenido.split(",", 1)[1]

    try:
        archivo_bytes = base64.b64decode(contenido, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise HTTPException(
            status_code=400,
            detail="El archivo recibido no tiene un formato base64 valido.",
        ) from exc

    if len(archivo_bytes) > MAX_EVIDENCIA_BYTES:
        raise HTTPException(
            status_code=413,
            detail="El archivo supera el limite de 10 MB permitido para evidencias.",
        )

    return archivo_bytes


def nombre_seguro_archivo(nombre_original: str) -> str:
    nombre_seguro = re.sub(r"[^a-zA-Z0-9._-]+", "-", nombre_original).strip("-")
    if not nombre_seguro:
        nombre_seguro = "evidencia"

    extension = Path(nombre_seguro).suffix.lower()
    return f"{uuid4().hex}{extension}"


def usar_supabase_storage() -> bool:
    if EVIDENCIA_STORAGE_MODE == "local":
        return False

    if EVIDENCIA_STORAGE_MODE == "supabase":
        return True

    return bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)


def guardar_archivo_evidencia(data) -> str:
    archivo_bytes = decodificar_archivo_base64(data.contenido_base64)
    nombre_final = nombre_seguro_archivo(data.nombre_original)

    if usar_supabase_storage():
        return subir_a_supabase_storage(
            archivo_bytes=archivo_bytes,
            nombre_final=nombre_final,
            mime_type=data.mime_type or "application/octet-stream",
            proyecto_id=data.proyecto_id,
            etapa=data.etapa,
        )

    ruta_final = EVIDENCIAS_UPLOAD_DIR / nombre_final
    ruta_final.write_bytes(archivo_bytes)
    return f"/uploads/evidencias/{nombre_final}"


def subir_a_supabase_storage(
    archivo_bytes: bytes,
    nombre_final: str,
    mime_type: str,
    proyecto_id: str,
    etapa: int,
) -> str:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(
            status_code=500,
            detail=(
                "Supabase Storage no esta configurado. Define SUPABASE_URL, "
                "SUPABASE_SERVICE_ROLE_KEY y SUPABASE_STORAGE_BUCKET en el backend."
            ),
        )

    base_url = SUPABASE_URL.rstrip("/")
    path = f"proyectos/{proyecto_id}/etapa-{etapa}/{nombre_final}"
    upload_url = f"{base_url}/storage/v1/object/{SUPABASE_STORAGE_BUCKET}/{path}"

    request = urllib.request.Request(
        upload_url,
        data=archivo_bytes,
        method="POST",
        headers={
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type": mime_type,
            "x-upsert": "false",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            if response.status not in (200, 201):
                raise HTTPException(
                    status_code=response.status,
                    detail="Supabase Storage no acepto la carga del archivo.",
                )
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        raise HTTPException(
            status_code=502,
            detail=f"Error al subir archivo a Supabase Storage: {error_body}",
        ) from exc
    except urllib.error.URLError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"No se pudo conectar con Supabase Storage: {exc.reason}",
        ) from exc

    if EVIDENCIA_STORAGE_MODE == "private":
        return crear_signed_url(path)

    return f"{base_url}/storage/v1/object/public/{SUPABASE_STORAGE_BUCKET}/{path}"


def crear_signed_url(path: str) -> str:
    base_url = SUPABASE_URL.rstrip("/")
    sign_url = f"{base_url}/storage/v1/object/sign/{SUPABASE_STORAGE_BUCKET}/{path}"
    payload = json.dumps({"expiresIn": 60 * 60 * 24 * 7}).encode("utf-8")

    request = urllib.request.Request(
        sign_url,
        data=payload,
        method="POST",
        headers={
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        raise HTTPException(
            status_code=502,
            detail=f"No se pudo crear URL firmada de Supabase Storage: {error_body}",
        ) from exc
    except urllib.error.URLError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"No se pudo conectar con Supabase Storage: {exc.reason}",
        ) from exc

    signed_url = body.get("signedURL") or body.get("signedUrl") or body.get("signed_url")
    if not signed_url:
        raise HTTPException(
            status_code=502,
            detail="Supabase Storage no retorno una URL firmada valida.",
        )

    if signed_url.startswith("http"):
        return signed_url

    return f"{base_url}{signed_url}"
