"""Almacenamiento de ficheros originales.

Interfaz mínima para poder cambiar a Supabase Storage / S3 sin tocar el resto.
"""
from pathlib import Path
from typing import Protocol
from uuid import UUID


class Storage(Protocol):
    def save(self, key: str, data: bytes) -> None: ...
    def read(self, key: str) -> bytes: ...
    def delete(self, key: str) -> None: ...


def document_key(user_id: UUID, document_id: UUID, extension: str) -> str:
    return f"{user_id}/{document_id}.{extension}"


class LocalStorage:
    def __init__(self, root: Path):
        self.root = root.resolve()

    def _path(self, key: str) -> Path:
        path = (self.root / key).resolve()
        if not path.is_relative_to(self.root):
            raise ValueError("Clave de almacenamiento no válida")
        return path

    def save(self, key: str, data: bytes) -> None:
        path = self._path(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_suffix(path.suffix + ".tmp")
        tmp.write_bytes(data)
        tmp.replace(path)

    def read(self, key: str) -> bytes:
        return self._path(key).read_bytes()

    def delete(self, key: str) -> None:
        self._path(key).unlink(missing_ok=True)


def get_storage() -> Storage:
    from app.config import get_settings

    return LocalStorage(get_settings().storage_dir)
