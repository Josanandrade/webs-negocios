# Un solo servicio: API + worker + web compilada.
#   docker build -t banco-preguntas demos/banco-preguntas

# ---- 1. Web estática ------------------------------------------------------------
FROM node:22.22.0-bookworm-slim AS web
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json frontend/.npmrc ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npx tsc -b && npx vite build

# ---- 2. API -----------------------------------------------------------------------
FROM python:3.12.12-slim-bookworm
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
# OCR en español y LibreOffice (solo Writer, sin interfaz) para convertir DOCX a PDF.
RUN apt-get update \
 && apt-get install -y --no-install-recommends tesseract-ocr tesseract-ocr-spa libreoffice-writer-nogui fonts-dejavu-core \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/pyproject.toml ./
COPY backend/app ./app
COPY backend/migrations ./migrations
RUN pip install .
COPY --from=web /web/dist ./web

ENV WEB_DIR=/app/web RUN_WORKER=true STORAGE_DIR=/data/storage HOME=/tmp
EXPOSE 8000
# Un único proceso uvicorn: lleva dentro el worker de trabajos largos.
CMD ["sh", "-c", "python -m app.bootstrap && exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips='*'"]
