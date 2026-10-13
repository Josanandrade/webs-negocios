import type { Metadata } from "next";
import Link from "next/link";
import { salon } from "@/content/salon";

export const metadata: Metadata = {
  title: "Propuesta · Helena García Beauty Salon (demo privada)",
};

// Documento interno para enseñar al salón: qué hemos encontrado, qué está
// verificado, qué falta y por qué tener web propia.
export default function Propuesta() {
  return (
    <main className="doc">
      <Link href="/" className="back">
        ← Volver a la demo
      </Link>
      <h1>Tu marca, fuera de Booksy también.</h1>
      <p>
        Propuesta privada de web para <strong>Helena García · Beauty Salon</strong> ({salon.address.line1},{" "}
        {salon.address.line2}, {salon.address.city}). No es la web oficial del salón ni está publicada:
        es una demo para enseñar cómo podría verse.
      </p>

      <div className="callout">
        <p>
          <strong>La idea:</strong> no deberías depender solo de una plataforma para presentar tu
          negocio, tu marca y tus servicios. Booksy es muy buena agenda, pero tu escaparate es de
          Booksy: comparte pantalla con otros salones de Bormujos, con su diseño y sus reglas. Tu web
          es tuya.
        </p>
      </div>

      <h2>Lo que hemos encontrado</h2>
      <ul>
        <li>
          <strong>Booksy</strong>: ficha como salón de uñas, valoración 5,0 con más de 100 reseñas,
          carta con precios y reserva online. Es el canal principal de reserva y la página más
          completa del salón.
        </li>
        <li>
          <strong>Instagram</strong> {salon.instagram.handle}: unos 255 seguidores y ~30
          publicaciones. Bio centrada en que la salud es sinónimo de belleza.
        </li>
        <li>
          <strong>Facebook</strong>: enlazado en Páginas Amarillas (helenagarcianailss); no hemos
          podido confirmar que esté activo.
        </li>
        <li>
          <strong>Directorios</strong> (Páginas Amarillas, Cylex): dirección, teléfono y horario.
        </li>
        <li>
          <strong>Sin web propia</strong> y sin TikTok localizado.
        </li>
      </ul>

      <h2>Qué resuelve la web</h2>
      <ul>
        <li>Una presentación clara del salón y de su forma de trabajar (la salud de la uña primero).</li>
        <li>Servicios ordenados por categorías, con lo más pedido arriba y precios de referencia.</li>
        <li>Reserva en tres toques que termina en tu agenda actual: no hay que cambiar de sistema.</li>
        <li>Prueba social visible (5,0 y +100 reseñas) sin que la clienta tenga que buscarla.</li>
        <li>Un enlace propio para la bio de Instagram, campañas y tarjetas: tu marca primero.</li>
        <li>Pensada para móvil: la mayoría llegará desde redes.</li>
      </ul>

      <h2>Pendiente de confirmar con el salón</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Dato</th>
              <th>Qué hemos visto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Teléfono</td>
              <td>644 69 43 28 (Cylex). Páginas Amarillas recoge también un fijo, 955 712 105.</td>
            </tr>
            <tr>
              <td>WhatsApp</td>
              <td>Sin evidencia pública. Desactivado en la demo.</td>
            </tr>
            <tr>
              <td>Horario</td>
              <td>L–V 10:00–15:00 y 17:00–20:00, sábado 10:00–14:00 (Páginas Amarillas).</td>
            </tr>
            <tr>
              <td>Precios</td>
              <td>
                Tomados de Booksy; algunas capturas no coinciden entre sí (p. ej. láser de cuerpo
                casi completo). Donde había dudas mostramos “Consultar”.
              </td>
            </tr>
            <tr>
              <td>Local 12</td>
              <td>
                Fresha y Cylex asocian la misma dirección a otros nombres (DOBLE-L Centro de
                estética, Fernanda Barahona). Conviene confirmar si compartís espacio o si es un
                dato antiguo.
              </td>
            </tr>
            <tr>
              <td>Reseñas</td>
              <td>Usamos solo fragmentos breves y sin nombre. Antes de publicar, enlazar o pedir permiso.</td>
            </tr>
            <tr>
              <td>Logo</td>
              <td>No hay logo publicado: el de la demo es tipográfico y provisional.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Fotos que necesitaríamos</h2>
      <ul>
        <li>Helena trabajando (retrato vertical, luz natural).</li>
        <li>Manos con manicura terminada, para la portada.</li>
        <li>Detalle de manicura rusa, pedicura y lifting (antes/después si es posible).</li>
        <li>El salón por dentro y la fachada/entrada del Cerro Colarte.</li>
        <li>Carta de colores de semipermanente.</li>
      </ul>
      <p>
        Hasta entonces, cada hueco muestra una composición de marca con la etiqueta “Foto real
        pendiente”. Al subir la foto, se sustituye sola sin tocar el diseño.
      </p>

      <h2>Privacidad de esta demo</h2>
      <ul>
        <li>No indexable (robots, meta noindex y cabecera X-Robots-Tag).</li>
        <li>Sin analítica, sin cookies, sin píxeles, sin mapas embebidos.</li>
        <li>No crea reservas: el asistente solo explica a dónde llevaría.</li>
      </ul>
    </main>
  );
}
