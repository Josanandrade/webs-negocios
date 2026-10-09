// Recorrido completo de la web con un navegador real, en PC y en móvil.
//   E2E_EMAIL=... E2E_PASSWORD=... node e2e/recorrido.mjs [http://localhost:5173]
// Requiere la API y el worker en marcha y una cuenta con al menos un documento con preguntas.
// Los tests que crea se borran al terminar (no ensucia las estadísticas de la cuenta).
// Guarda capturas en e2e-shots/ y termina con error si la consola muestra errores o
// alguna petición a la API falla de forma inesperada.
import { mkdirSync } from "node:fs";
import { chromium, devices } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:5173";
const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;
if (!EMAIL || !PASSWORD) throw new Error("Define E2E_EMAIL y E2E_PASSWORD");
mkdirSync("e2e-shots", { recursive: true });

const problems = [];
function watch(page, name) {
  page.on("console", (m) => m.type() === "error" && problems.push(`[${name}] consola: ${m.text()}`));
  page.on("pageerror", (e) => problems.push(`[${name}] excepción: ${e.message}`));
  page.on("response", (r) => {
    if (r.url().includes("/api/") && r.status() >= 500) problems.push(`[${name}] ${r.status()} ${r.url()}`);
  });
}
async function shot(page, file) {
  await page.waitForTimeout(300); // que terminen las transiciones de color
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 1) problems.push(`[${file}] desbordamiento horizontal de ${overflow}px`);
  await page.screenshot({ path: `e2e-shots/${file}.png`, fullPage: true });
}

const quizIds = (page) =>
  page.evaluate(async () => {
    const r = await fetch("/api/quizzes?limit=200", { headers: { Authorization: `Bearer ${localStorage.getItem("banco.token")}` } });
    return (await r.json()).items.map((q) => q.id);
  });
const deleteQuizzes = (page, ids) =>
  page.evaluate(async (ids) => {
    for (const id of ids)
      await fetch(`/api/quizzes/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("banco.token")}` } });
  }, ids);

async function login(page) {
  await page.goto(BASE + "/");
  await page.getByLabel("Correo electrónico").fill(EMAIL);
  await page.getByLabel("Contraseña").fill(PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).last().click();
  await page.getByRole("heading", { name: "Tests", exact: true }).waitFor();
}

async function practice(page, prefix) {
  await page.goto(BASE + "/tests/nuevo");
  await page.getByRole("button", { name: /Práctica/ }).click();
  await page.getByLabel("Número de preguntas").fill("4");
  await shot(page, `${prefix}-nuevo-test`);
  await page.getByRole("button", { name: "Empezar" }).click();
  await page.getByText("Pregunta 1 de 4").waitFor();
  for (let i = 1; i <= 4; i++) {
    await page.getByText(`Pregunta ${i} de 4`).waitFor();
    if (i === 3) await page.getByRole("button", { name: "No lo sé" }).click();
    else await page.getByRole("radio").nth(i % 4).click();
    await page.getByText(/^(¡Correcto!|Incorrecto|En blanco)/).waitFor();
    if (i === 1) await shot(page, `${prefix}-practica-correccion`);
    if (i < 4) await page.getByRole("button", { name: "Siguiente" }).click();
  }
  await page.getByRole("button", { name: "Entregar" }).last().click();
  await page.getByRole("dialog").getByRole("button", { name: "Entregar" }).click();
  await page.getByRole("heading", { name: "Corrección" }).waitFor();
  await shot(page, `${prefix}-resultados`);
}

async function exam(page, prefix) {
  await page.goto(BASE + "/tests/nuevo");
  await page.getByRole("button", { name: /Examen/ }).click();
  await page.getByLabel("Número de preguntas").fill("3");
  await page.getByLabel("Tiempo límite (minutos)").fill("10");
  await page.getByRole("button", { name: "Empezar" }).click();
  await page.getByRole("timer").waitFor();
  await page.getByRole("radio").first().click();               // pasa sola a la siguiente
  await page.getByText("Pregunta 2 de 3").waitFor();
  if (await page.getByText(/¡Correcto!|Incorrecto/).count()) problems.push(`[${prefix}] el examen reveló la corrección antes de entregar`);
  await shot(page, `${prefix}-examen`);
  await page.getByRole("button", { name: "Entregar" }).first().click();
  await page.getByRole("dialog").getByText(/Te quedan 2 preguntas sin responder/).waitFor();
  await page.getByRole("dialog").getByRole("button", { name: "Entregar" }).click();
  await page.getByRole("heading", { name: "Corrección" }).waitFor();
  await page.getByRole("tab", { name: "En blanco" }).click();
  const blanks = await page.locator("li", { hasText: "En blanco" }).count();
  if (blanks < 2) problems.push(`[${prefix}] se esperaban 2 en blanco en la corrección, hay ${blanks}`);
}

async function browse(page, prefix) {
  await page.goto(BASE + "/documentos");
  await page.getByRole("heading", { name: "Documentos" }).waitFor();
  await shot(page, `${prefix}-documentos`);
  await page.locator("main li a").first().click();
  await page.getByRole("heading", { name: "Generar preguntas" }).waitFor();
  await page.getByRole("heading", { name: "Preguntas por tema" }).waitFor();
  await shot(page, `${prefix}-documento`);

  await page.goto(BASE + "/banco");
  await page.getByText(/\d+ preguntas$/).waitFor();
  await page.getByLabel("Buscar").fill("protocolo");
  await page.getByLabel("Buscar").press("Enter");
  await page.waitForURL(/q=protocolo/);
  await page.getByText(/\d+ preguntas$/).waitFor();
  await shot(page, `${prefix}-banco`);
  await page.locator("main li a").first().click();
  await page.getByRole("heading", { name: "Opciones y su origen en el temario" }).waitFor();
  await page.getByRole("button", { name: "Ver contexto en el temario" }).first().click();
  await page.locator("mark").first().waitFor();
  await shot(page, `${prefix}-pregunta`);

  await page.goto(BASE + "/estadisticas");
  await page.getByRole("heading", { name: "Aciertos por tema" }).waitFor();
  await shot(page, `${prefix}-estadisticas`);
  await page.goto(BASE + "/tests");
  await shot(page, `${prefix}-tests`);
}

const browser = await chromium.launch();
for (const [prefix, opts] of [
  ["pc", { viewport: { width: 1280, height: 860 } }],
  ["movil", { ...devices["iPhone 13"] }],
]) {
  const ctx = await browser.newContext({ ...opts, locale: "es-ES" });
  const page = await ctx.newPage();
  watch(page, prefix);
  await page.goto(BASE + "/");
  await shot(page, `${prefix}-login`);
  await login(page);
  const before = new Set(await quizIds(page));
  await practice(page, prefix);
  await exam(page, prefix);
  await browse(page, prefix);
  await deleteQuizzes(page, (await quizIds(page)).filter((id) => !before.has(id)));
  await ctx.close();
}
await browser.close();

if (problems.length) {
  console.error("PROBLEMAS:\n" + problems.join("\n"));
  process.exit(1);
}
console.log("Recorrido completo sin errores. Capturas en e2e-shots/");
