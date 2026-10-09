// Cliente de la API: añade el token, traduce errores a mensajes legibles y cierra la
// sesión si el token caduca.

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const TOKEN_KEY = "banco.token";

export class ApiError extends Error {
  constructor(public status: number, message: string, public detail?: unknown) {
    super(message);
  }
}

let onUnauthorized: () => void = () => {};
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* almacenamiento no disponible (modo privado): la sesión dura lo que la pestaña */
  }
}

function messageFrom(detail: unknown, status: number): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    // Errores de validación de FastAPI
    return detail.map((d) => (d && typeof d === "object" && "msg" in d ? String(d.msg) : String(d))).join(". ");
  }
  if (detail && typeof detail === "object" && "message" in detail) return String(detail.message);
  if (status === 0) return "No hay conexión con el servidor. Si acaba de despertar, espera unos segundos.";
  return `Error ${status}`;
}

type Query = Record<string, string | number | boolean | null | undefined>;

export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown; query?: Query; form?: FormData; signal?: AbortSignal } = {},
): Promise<T> {
  const url = new URL(BASE + path, window.location.origin);
  for (const [k, v] of Object.entries(options.query ?? {})) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let body: BodyInit | undefined;
  if (options.form) body = options.form;
  else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }
  let res: Response;
  try {
    res = await fetch(url, { method: options.method ?? "GET", headers, body, signal: options.signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new ApiError(0, messageFrom(null, 0));
  }
  if (res.status === 401 && token) {
    setToken(null);
    onUnauthorized();
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, messageFrom(data?.detail, res.status), data?.detail);
  return data as T;
}

/** Subida de fichero con progreso (fetch no informa del progreso de subida). */
export function uploadFile<T>(path: string, file: File, onProgress: (fraction: number) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", new URL(BASE + path, window.location.origin));
    const token = getToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onerror = () => reject(new ApiError(0, messageFrom(null, 0)));
    xhr.onload = () => {
      let data: { detail?: unknown } | null = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* respuesta vacía */
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data as T);
      else reject(new ApiError(xhr.status, messageFrom(data?.detail, xhr.status), data?.detail));
    };
    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}
