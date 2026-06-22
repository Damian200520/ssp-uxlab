import base64
import os
from functools import lru_cache

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

PREFIX = "enc:v1:"


@lru_cache(maxsize=1)
def _obtener_clave() -> bytes | None:
    encoded_key = os.getenv("DATA_ENCRYPTION_KEY")
    if not encoded_key:
        return None

    try:
        key = base64.b64decode(encoded_key, validate=True)
    except ValueError as exc:
        raise RuntimeError("DATA_ENCRYPTION_KEY no es base64 válido.") from exc

    if len(key) != 32:
        raise RuntimeError(
            "DATA_ENCRYPTION_KEY debe contener exactamente 32 bytes codificados en base64."
        )

    return key


def cifrado_habilitado() -> bool:
    return _obtener_clave() is not None


def cifrar_texto(value: str | None, contexto: str) -> str | None:
    if value is None or value.startswith(PREFIX):
        return value

    key = _obtener_clave()
    if not key:
        return value

    nonce = os.urandom(12)
    ciphertext = AESGCM(key).encrypt(
        nonce,
        value.encode("utf-8"),
        contexto.encode("utf-8"),
    )
    payload = base64.urlsafe_b64encode(nonce + ciphertext).decode("ascii")
    return f"{PREFIX}{payload}"


def descifrar_texto(value: str | None, contexto: str) -> str | None:
    if value is None or not value.startswith(PREFIX):
        return value

    key = _obtener_clave()
    if not key:
        return "[Dato cifrado: clave no disponible]"

    try:
        payload = base64.urlsafe_b64decode(value[len(PREFIX) :])
        nonce, ciphertext = payload[:12], payload[12:]
        plaintext = AESGCM(key).decrypt(
            nonce,
            ciphertext,
            contexto.encode("utf-8"),
        )
        return plaintext.decode("utf-8")
    except (ValueError, UnicodeDecodeError) as exc:
        raise RuntimeError("No fue posible descifrar un dato protegido.") from exc
