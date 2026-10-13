import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Notas de la propuesta · Pura Bellezza",
  robots: { index: false, follow: false },
};

/* Documento interno para la conversación comercial con el centro. */
export default function Propuesta() {
  return (
    <main className="notes">
      <Link href="/">Volver a la demo</Link>
      <h1>Un espacio propio para {site.name}</h1>
      <p>
        Hoy {site.name} se encuentra a través de su ficha de reservas, Instagram y
        directorios. Funciona: tiene una valoración excelente. Pero no tiene un sitio
        propio que explique con calma qué hace, cómo trabaja y por qué merece la pena
        venir. Esta demo es esa pieza: elegante, fácil de entender y pensada para quien
        llega desde Instagram o Google con el móvil en la mano.
      </p>

      <h2>Lo que hemos encontrado</h2>
      <ul>
        <li>
          <strong>Web propia:</strong> no hemos encontrado ninguna. Los directorios no
          enlazan a dominio propio.
        </li>
        <li>
          <strong>Reservas:</strong> agenda online en {site.booking.platform}, con{" "}
          {site.rating.score} de valoración y más de 500 reseñas. También aparece una
          ficha en Fresha que el propio Fresha marca como no afiliada.
        </li>
        <li>
          <strong>Redes:</strong> Instagram {site.instagram.handle}, enlazado desde su
          ficha de reservas.
        </li>
        <li>
          <strong>Fotos:</strong> no hemos podido descargar ni verificar material propio,
          así que la demo usa composiciones gráficas listas para cambiarse por fotos
          reales.
        </li>
      </ul>

      <h2>Qué propone la demo</h2>
      <ul>
        <li>Decir en una frase qué es el centro y dónde está, con la cita a un toque.</li>
        <li>Ordenar la oferta en cuatro familias: rostro, mirada, manos y pies, cuerpo.</li>
        <li>Mostrar la confianza que ya tiene (sus reseñas) sin exagerar nada.</li>
        <li>
          Mantener {site.booking.platform} como motor de reservas: la web lleva a la
          agenda que ya usa, no la sustituye.
        </li>
        <li>Una barra fija en el móvil para pedir cita o llamar desde cualquier punto.</li>
      </ul>

      <h2>Verificado y pendiente</h2>
      <div className="notes__table">
        <table>
          <thead>
            <tr>
              <th scope="col">Dato</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Dirección y teléfono</td>
              <td>Coinciden en varias fuentes.</td>
            </tr>
            <tr>
              <td>Horario L–V 9:00–20:00</td>
              <td>Publicado en directorios. Confirmar con el centro.</td>
            </tr>
            <tr>
              <td>Servicios</td>
              <td>Solo los que aparecen en su agenda online y directorios.</td>
            </tr>
            <tr>
              <td>Precios</td>
              <td>No se muestran: no hemos podido comprobar que estén al día.</td>
            </tr>
            <tr>
              <td>Equipo y años de experiencia</td>
              <td>Sin fuente oficial. No se mencionan.</td>
            </tr>
            <tr>
              <td>WhatsApp</td>
              <td>Desactivado hasta que el centro confirme que lo usa.</td>
            </tr>
            <tr>
              <td>Reseñas literales</td>
              <td>Solo se resumen temas. Citar textos requiere permiso.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Qué necesitaríamos del centro</h2>
      <ul>
        <li>Seis fotos propias: cabina, fachada y un detalle de cada familia.</li>
        <li>Logotipo en vector, si existe.</li>
        <li>Confirmar horario, servicios estrella y si atienden por WhatsApp.</li>
        <li>Nombre y foto de la responsable o del equipo, si quieren aparecer.</li>
      </ul>
    </main>
  );
}
