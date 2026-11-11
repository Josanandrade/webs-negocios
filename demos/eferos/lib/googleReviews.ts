/**
 * Reseñas de Google mediante Places API (New), solo en servidor.
 *
 * - La API key nunca llega al cliente: se lee aquí y se usa desde la ruta
 *   /api/google-reviews.
 * - Google devuelve como máximo 5 reseñas, en el orden de relevancia de Google.
 * - Los términos de Google Maps Platform prohíben guardar en caché el contenido
 *   de Places (salvo el Place ID): cada consulta va a Google y no se almacena.
 * - Al mostrar reseñas hay que atribuir al autor (nombre, foto y enlace a su
 *   perfil), enlazar a Google Maps, ofrecer el enlace para denunciar la reseña
 *   (flagContentUri) e indicar que es Google quien las ordena.
 */

const PLACES_ENDPOINT = "https://places.googleapis.com/v1/places/";
const FIELD_MASK = "displayName,rating,userRatingCount,googleMapsUri,googleMapsLinks,reviews";

export function isReviewsConfigured() {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY && process.env.GOOGLE_PLACE_ID);
}

/** Lo único que se envía al navegador: nada de claves ni campos sin usar. */
export type ReviewsPayload = {
  rating: number | null;
  total: number | null;
  placeUri: string | null;
  reviewsUri: string | null;
  writeReviewUri: string | null;
  reviews: {
    id: string;
    rating: number;
    text: string;
    relativeTime: string;
    authorName: string;
    authorUri: string | null;
    authorPhoto: string | null;
    reviewUri: string | null;
    flagUri: string | null;
  }[];
};

type PlacesReview = {
  name?: string;
  rating?: number;
  relativePublishTimeDescription?: string;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  googleMapsUri?: string;
  flagContentUri?: string;
};

type PlacesResponse = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  googleMapsLinks?: { reviewsUri?: string; writeAReviewUri?: string; placeUri?: string };
  reviews?: PlacesReview[];
};

export async function fetchGoogleReviews(): Promise<ReviewsPayload> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) throw new Error("Reseñas de Google no configuradas");

  const url = `${PLACES_ENDPOINT}${encodeURIComponent(placeId)}?languageCode=es&regionCode=ES`;
  const res = await fetch(url, {
    headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": FIELD_MASK },
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`Places API respondió ${res.status}`);
  const data = (await res.json()) as PlacesResponse;

  return {
    rating: data.rating ?? null,
    total: data.userRatingCount ?? null,
    placeUri: data.googleMapsLinks?.placeUri ?? data.googleMapsUri ?? null,
    reviewsUri: data.googleMapsLinks?.reviewsUri ?? data.googleMapsUri ?? null,
    writeReviewUri: data.googleMapsLinks?.writeAReviewUri ?? null,
    reviews: (data.reviews ?? [])
      // Se muestran tal cual las entrega Google; solo se descartan las que no traen texto
      .filter((r) => (r.text?.text ?? r.originalText?.text ?? "").trim().length > 0)
      .map((r, i) => ({
        id: r.name ?? String(i),
        rating: r.rating ?? 0,
        text: (r.text?.text ?? r.originalText?.text ?? "").trim(),
        relativeTime: r.relativePublishTimeDescription ?? "",
        authorName: r.authorAttribution?.displayName ?? "Usuario de Google",
        authorUri: r.authorAttribution?.uri ?? null,
        authorPhoto: r.authorAttribution?.photoUri ?? null,
        reviewUri: r.googleMapsUri ?? null,
        flagUri: r.flagContentUri ?? null,
      })),
  };
}
