import { reasonText, score } from "./labels";

test("los motivos de descarte se traducen a frases legibles", () => {
  expect(reasonText("termino_ajeno_al_documento:siglas,significado")).toBe("Usaba palabras que no están en el temario");
  expect(reasonText("solo_2_distractores")).toBe("Solo 2 alternativas válidas en el temario");
  expect(reasonText("verificador_respondio_B")).toBe("El verificador eligió otra respuesta");
  expect(reasonText("codigo_nuevo_desconocido")).toBe("codigo nuevo desconocido");
});

test("las notas usan coma decimal y como mucho dos decimales", () => {
  expect(score(6.333)).toBe("6,33");
  expect(score(null)).toBe("—");
});
