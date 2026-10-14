// Tras exportar: copia la configuración del servidor estático, elimina
// cualquier documento interno que se haya colado desde public/ y falla si
// aparece una ruta o un texto que no pertenezca a la web pública.
import { copyFileSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const out = new URL("../out/", import.meta.url).pathname;
copyFileSync(new URL("../serve.json", import.meta.url).pathname, join(out, "serve.json"));

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

for (const file of walk(out)) {
  if (/\.(md|mdx)$/i.test(file)) {
    rmSync(file);
    console.log(`postbuild: eliminado ${relative(out, file)}`);
  }
}

const forbidden = /propuesta|auditor[ií]a|investigaci[oó]n|internal|fotos? pendientes?|sin verificar|README_ASSETS/i;
const problems = [];
for (const file of walk(out)) {
  const rel = relative(out, file);
  if (forbidden.test(rel)) problems.push(`ruta: ${rel}`);
  if (/\.(html|txt|json)$/.test(file) && forbidden.test(readFileSync(file, "utf8"))) problems.push(`contenido: ${rel}`);
}
if (problems.length) {
  console.error("postbuild: contenido interno en la exportación pública:\n" + problems.join("\n"));
  process.exit(1);
}
console.log("postbuild: exportación pública limpia.");
