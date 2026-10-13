// Servidor estático mínimo para la preview: sirve dist/ con cabeceras de
// privacidad (noindex) y seguridad. Sin dependencias.
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { createGzip } from "node:zlib";

const root = resolve("dist");
const port = Number(process.env.PORT) || 4173;

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
};

const security = {
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Content-Security-Policy":
    "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
};

const send = (res, status, body) => {
  res.writeHead(status, { ...security, "Content-Type": "text/plain; charset=utf-8" });
  res.end(body);
};

createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method Not Allowed");

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  } catch {
    return send(res, 400, "Bad Request");
  }
  if (pathname.endsWith("/")) pathname += "index.html";

  const file = normalize(join(root, pathname));
  const type = types[extname(file).toLowerCase()];
  // Solo se sirven tipos conocidos y dentro de dist/. Una única página pública:
  // cualquier otra ruta devuelve 404.
  if (!file.startsWith(root + "/") || !type) return send(res, 404, "Not Found");

  let stat;
  try {
    stat = statSync(file);
    if (!stat.isFile()) throw new Error("not a file");
  } catch {
    return send(res, 404, "Not Found");
  }

  const immutable = pathname.startsWith("/assets/") && !pathname.startsWith("/assets/factoria-tattoo/");
  const gzip = /^(text\/|image\/svg)/.test(type) && /\bgzip\b/.test(req.headers["accept-encoding"] ?? "");
  res.writeHead(200, {
    ...security,
    "Content-Type": type,
    Vary: "Accept-Encoding",
    ...(gzip ? { "Content-Encoding": "gzip" } : { "Content-Length": stat.size }),
    "Cache-Control": immutable
      ? "public, max-age=31536000, immutable"
      : type.startsWith("text/html")
        ? "no-cache"
        : "public, max-age=86400",
  });
  if (req.method === "HEAD") return res.end();
  const stream = createReadStream(file);
  if (gzip) stream.pipe(createGzip()).pipe(res);
  else stream.pipe(res);
}).listen(port, "0.0.0.0", () => {
  console.log(`Factoría Tattoo preview en http://localhost:${port}`);
});
