import hashlib
import io
import zipfile
from datetime import datetime
from pathlib import PurePath
from typing import Any
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.deps import current_user_id, db_session
from app.storage import document_key, get_storage

router = APIRouter(prefix="/api", tags=["documents"])

PDF_MIME = "application/pdf"
DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


class JobOut(BaseModel):
    id: UUID
    document_id: UUID | None
    kind: str
    status: str
    stage: str
    progress_current: int
    progress_total: int
    message: str | None
    attempts: int
    max_attempts: int
    last_error: str | None
    created_at: datetime
    started_at: datetime | None
    finished_at: datetime | None


class DocumentOut(BaseModel):
    id: UUID
    title: str
    original_filename: str
    mime_type: str
    size_bytes: int
    status: str
    page_count: int | None
    text_layer: str | None
    stats: dict[str, Any]
    error: str | None
    created_at: datetime
    latest_job: JobOut | None = None


_JOB_COLUMNS = ("id, document_id, kind, status, stage, progress_current, progress_total, message, "
                "attempts, max_attempts, last_error, created_at, started_at, finished_at")
_DOC_COLUMNS = ("id, title, original_filename, mime_type, size_bytes, status, page_count, "
                "text_layer, stats, error, created_at")


def detect_mime(data: bytes) -> str | None:
    """Tipo real por contenido (no por extensión ni por la cabecera del cliente)."""
    if data[:5] == b"%PDF-":
        return PDF_MIME
    if data[:4] == b"PK\x03\x04":
        try:
            with zipfile.ZipFile(io.BytesIO(data)) as zf:
                if "word/document.xml" in zf.namelist():
                    return DOCX_MIME
        except zipfile.BadZipFile:
            return None
    return None


def _latest_job(db: Session, user_id: UUID, document_id: UUID) -> JobOut | None:
    row = db.execute(
        text(f"select {_JOB_COLUMNS} from processing_jobs "
             "where document_id = :d and user_id = :u order by created_at desc limit 1"),
        {"d": document_id, "u": user_id},
    ).mappings().first()
    return JobOut(**row) if row else None


@router.post("/documents", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    user_id: UUID = Depends(current_user_id),
    db: Session = Depends(db_session),
) -> DocumentOut:
    max_bytes = get_settings().max_upload_mb * 1024 * 1024
    data = await file.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise HTTPException(status.HTTP_413_CONTENT_TOO_LARGE, "El documento supera el tamaño máximo permitido")
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "El fichero está vacío")
    mime = detect_mime(data)
    if mime is None:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Solo se admiten documentos PDF o DOCX")

    sha256 = hashlib.sha256(data).hexdigest()
    existing = db.execute(text("select id from documents where user_id = :u and sha256 = :h"),
                          {"u": user_id, "h": sha256}).first()
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT,
                            {"message": "Este documento ya está subido", "document_id": str(existing.id)})

    filename = PurePath(file.filename or "documento").name[:255]
    document_id = uuid4()
    key = document_key(user_id, document_id, "pdf" if mime == PDF_MIME else "docx")
    storage = get_storage()
    storage.save(key, data)
    try:
        db.execute(
            text("insert into documents (id, user_id, title, original_filename, mime_type, size_bytes, sha256, storage_key)"
                 " values (:id, :u, :title, :fn, :mime, :size, :sha, :key)"),
            {"id": document_id, "u": user_id, "title": PurePath(filename).stem or filename, "fn": filename,
             "mime": mime, "size": len(data), "sha": sha256, "key": key},
        )
        db.execute(
            text("insert into processing_jobs (user_id, document_id, kind, message)"
                 " values (:u, :d, 'ingest', 'En cola')"),
            {"u": user_id, "d": document_id},
        )
        db.flush()
    except Exception:
        storage.delete(key)
        raise
    return get_document(document_id, user_id, db)


@router.get("/documents", response_model=list[DocumentOut])
def list_documents(user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> list[DocumentOut]:
    rows = db.execute(text(f"select {_DOC_COLUMNS} from documents where user_id = :u order by created_at desc"),
                      {"u": user_id}).mappings().all()
    return [DocumentOut(**r, latest_job=_latest_job(db, user_id, r["id"])) for r in rows]


@router.get("/documents/{document_id}", response_model=DocumentOut)
def get_document(document_id: UUID, user_id: UUID = Depends(current_user_id),
                 db: Session = Depends(db_session)) -> DocumentOut:
    row = db.execute(text(f"select {_DOC_COLUMNS} from documents where id = :id and user_id = :u"),
                     {"id": document_id, "u": user_id}).mappings().first()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Documento no encontrado")
    return DocumentOut(**row, latest_job=_latest_job(db, user_id, document_id))


@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: UUID, user_id: UUID = Depends(current_user_id),
                    db: Session = Depends(db_session)) -> None:
    row = db.execute(text("delete from documents where id = :id and user_id = :u returning storage_key"),
                     {"id": document_id, "u": user_id}).first()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Documento no encontrado")
    get_storage().delete(row.storage_key)


@router.get("/jobs/{job_id}", response_model=JobOut)
def get_job(job_id: UUID, user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> JobOut:
    row = db.execute(text(f"select {_JOB_COLUMNS} from processing_jobs where id = :id and user_id = :u"),
                     {"id": job_id, "u": user_id}).mappings().first()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Trabajo no encontrado")
    return JobOut(**row)
