// Textos en español para los códigos de la API.

export const DIFFICULTY: Record<string, string> = { easy: "Fácil", medium: "Media", hard: "Difícil", mixed: "Mezcla" };

export const QUESTION_STATUS: Record<string, string> = {
  generated: "Generada",
  auto_validated: "Verificada",
  manually_reviewed: "Revisada",
  discarded: "Descartada",
};

export const DOC_STATUS: Record<string, string> = {
  uploaded: "En cola",
  processing: "Procesando",
  ready: "Listo",
  error: "Error",
};

export const JOB_STAGE: Record<string, string> = {
  pending: "En cola",
  extracting: "Extrayendo texto",
  ocr: "Reconociendo texto (OCR)",
  cleaning: "Limpiando",
  analyzing_structure: "Detectando temas",
  structure: "Detectando temas",
  indexing: "Indexando",
  facts: "Extrayendo datos del temario",
  extracting_facts: "Extrayendo datos del temario",
  generating: "Redactando y verificando preguntas",
  validating: "Verificando",
  done: "Terminado",
};

export const SELECTION: Record<string, string> = {
  random: "Al azar",
  unseen: "No vistas",
  failed: "Falladas",
  weak: "Puntos débiles",
  retry: "Repaso de fallos",
};

export const CANDIDATE_STATUS: Record<string, string> = {
  accepted: "Aceptadas",
  rejected_no_distractors: "Sin 3 alternativas en el temario",
  rejected_generation: "Omitidas por la IA",
  rejected_deterministic: "Descartadas por las reglas",
  rejected_verification: "Rechazadas por el verificador",
  rejected_duplicate: "Duplicadas",
};

const REASONS: Record<string, string> = {
  termino_ajeno_al_documento: "Usaba palabras que no están en el temario",
  longitud_delata_la_correcta: "La longitud delataba la respuesta",
  pista_lexica_en_enunciado: "El enunciado daba una pista",
  correcta_repite_el_sujeto: "La respuesta repetía lo preguntado",
  opcion_contenida_en_otra: "Una opción estaba contenida en otra",
  opciones_casi_iguales: "Opciones casi iguales",
  enunciado_no_menciona_el_sujeto: "El enunciado no nombraba el concepto",
  enunciado_contiene_una_opcion: "El enunciado contenía una opción",
  enunciado_sin_pregunta: "Enunciado mal formado",
  enunciado_longitud: "Enunciado demasiado corto o largo",
  formula_prohibida: "Fórmula prohibida («según el texto», «todas las anteriores»…)",
  referente_perdido_en_enunciado: "Referencia ambigua («este», «dicho»…)",
  cifra_del_enunciado_no_esta_en_documento: "Cifra que no está en el temario",
  opciones_no_homogeneas: "Opciones no homogéneas",
  opciones_duplicadas: "Opciones repetidas",
  omitida_por_generador: "La IA no encontró una buena pregunta",
  distractores_elegidos_invalidos: "La IA eligió alternativas no válidas",
  salida_corrupta_del_generador: "Respuesta corrupta de la IA",
  sin_respuesta_del_generador: "La IA no respondió",
  sin_respuesta_del_verificador: "El verificador no respondió",
  falla_distractors_plausible: "Alternativas que desentonaban",
  falla_two_could_be_correct: "Dos opciones podían ser correctas",
  falla_single_correct: "No había una única correcta",
  falla_ambiguous: "Ambigua",
  falla_answerable_from_evidence: "No se podía responder con el temario",
  falla_correct_explicitly_supported: "La correcta no estaba explícita",
  falla_needs_external_knowledge: "Requería información externa",
  falla_distractors_are_incorrect: "Alguna alternativa era cierta",
  falla_clear_wording: "Redacción poco clara",
  confianza_insuficiente: "El verificador no estaba seguro",
  duplicada_al_guardar: "Duplicada",
};

/** "longitud_delata_la_correcta" o "solo_2_distractores" → frase legible. */
export function reasonText(code: string): string {
  const base = code.split(":")[0];
  if (REASONS[base]) return REASONS[base];
  if (base.startsWith("solo_")) return `Solo ${base.match(/\d+/)?.[0] ?? 0} alternativas válidas en el temario`;
  if (base.startsWith("verificador_respondio")) return "El verificador eligió otra respuesta";
  if (base.startsWith("duplicada") || base.startsWith("mismo_")) return "Duplicada";
  return base.replaceAll("_", " ");
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
}

export function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function pct(v: number | null | undefined): string {
  return v === null || v === undefined ? "—" : `${Math.round(v * 100)} %`;
}

export function score(v: number | null | undefined): string {
  return v === null || v === undefined ? "—" : v.toLocaleString("es-ES", { maximumFractionDigits: 2 });
}
