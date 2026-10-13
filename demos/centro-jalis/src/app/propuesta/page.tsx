import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Propuesta para Jalis — documento interno",
  robots: { index: false, follow: false, nocache: true },
};

const sources = [
  ["Booksy (perfil «Centro Jalis»)", "Servicios, precios, 5,0 con 141 reseñas, respuestas del centro («más de 18 años»), reseñas con nombres del equipo", "Canal de reserva activo"],
  ["Fresha (perfil «Jalis centro de belleza y bienestar»)", "Dirección C/ Zambra locales 6-7 y C/ Seguirilla local 7; servicios faciales (dermaplaning, microdermoabrasión, acné, exfoliación química), hilo, maquillaje de novia", "Ficha indexada hace ~1,5 años"],
  ["Facebook /centrojalis", "≈680 «me gusta». Lista depilación, rayos, bronceado, acupuntura, maquillaje, uñas, facial y corporal", "Actividad reciente no verificada"],
  ["Directorios (Cylex, QDQ, calle.es, Sevilla Hoy, Peluquería de chicas)", "Teléfonos 695 91 58 37 y 954 16 23 78, email centrojalis@gmail.com, horario L 16-20 / M-V 9-19, 4,9 en Google (68-71 reseñas)", "Datos heredados, algunos antiguos"],
  ["Ópphalo (directorio de centros)", "Presoterapia y depilación láser; cita C/ Zambra 15", "Ficha de hace ~4 años; numeración discrepante"],
];

export default function Propuesta() {
  return (
    <main className="doc">
      <div className="wrap">
        <Link className="doc__back" href="/">
          ← Volver a la demo
        </Link>
        <h1>Jalis · Centro de belleza y bienestar. Propuesta de web</h1>
        <p>
          Documento interno de la demo (no enlazado desde buscadores). Recoge lo que hemos encontrado, lo que está
          verificado, lo que hemos descartado y lo que habría que pedir al centro.
        </p>

        <h2>1. Presencia digital encontrada</h2>
        <ul>
          <li>
            <strong>Sin web propia.</strong> No hay dominio del centro; la presencia se reparte entre plataformas.
          </li>
          <li>
            <strong>Booksy</strong> es el canal de reserva principal y el más cuidado: carta amplia con precios, bonos y
            reseñas (5,0 · 141).
          </li>
          <li>
            <strong>Fresha</strong>: perfil más antiguo, con otro nombre comercial («Jalis centro de belleza y
            bienestar»).
          </li>
          <li>
            <strong>Facebook</strong> /centrojalis con lista de servicios desactualizada. No hemos localizado Instagram
            oficial.
          </li>
          <li>
            <strong>Google</strong>: ficha con 4,9 según los directorios que la replican; no hemos podido consultarla
            directamente.
          </li>
          <li>
            Varias fichas de directorio con datos contradictorios (número de la calle, horario, teléfono fijo/móvil).
          </li>
        </ul>
        <p>
          Conclusión: un centro con <strong>trayectoria larga y reputación excelente</strong>, pero con una imagen
          digital dispersa que no transmite su nivel. De ahí la idea central: «Tu experiencia y tu recorrido merecen
          una web que los represente».
        </p>

        <h2>2. Fuentes</h2>
        <div className="doc__table-wrap">
          <table className="doc__table">
            <thead>
              <tr>
                <th>Fuente</th>
                <th>Qué aporta</th>
                <th>Fiabilidad</th>
              </tr>
            </thead>
            <tbody>
              {sources.map(([s, a, f]) => (
                <tr key={s}>
                  <td>{s}</td>
                  <td>{a}</td>
                  <td>{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>3. Usado en la demo (verificado en fuentes públicas)</h2>
        <ul>
          <li>Nombre y posicionamiento: centro de belleza y bienestar (estética, no clínica médica).</li>
          <li>Trayectoria: «más de 18 años», según respuestas del propio centro en Booksy (otra dice 20).</li>
          <li>Dirección: C/ Zambra, locales 6 y 7, con acceso por C/ Seguirilla, 41950 Castilleja de la Cuesta.</li>
          <li>Teléfonos 695 91 58 37 y 954 16 23 78; email centrojalis@gmail.com.</li>
          <li>
            Servicios y precios de Booksy/Fresha: higienes faciales, «Tratamiento estrella» (higiene + espátula
            ultrasónica + dermapen + radiofrecuencia + masaje), radiofrecuencia, dermapen, dermaplaning,
            microdermoabrasión, exfoliación química, acné, remodelación corporal en bono, tratamiento corporal Ártico,
            higiene de espalda, láser, cera, cejas, hilo, manicura/pedicura, maquillaje y maquillaje de novia.
          </li>
          <li>Reputación: 5,0 en Booksy (141) y 4,9 en Google; citas textuales mínimas de reseñas reales.</li>
        </ul>

        <h2>4. Descartado o pendiente de confirmar</h2>
        <ul>
          <li>
            <strong>Bronceado/rayos UVA y acupuntura</strong>: solo aparecen en la descripción antigua de Facebook. No
            se incluyen.
          </li>
          <li>
            <strong>Presoterapia</strong>: solo en una ficha antigua; aparece como «consultar disponibilidad».
          </li>
          <li>
            <strong>Nombres del equipo</strong> (Lorena, Macarena, María Flores salen en reseñas): no se publican sin
            consentimiento ni roles confirmados. Propietaria no identificada.
          </li>
          <li>
            <strong>Marcas de aparatología y cosmética</strong>: no verificadas («fhos» aparece en Booksy sin más
            contexto). No se nombran.
          </li>
          <li>
            <strong>Precios contradictorios</strong> entre capturas (semipermanente, radiofrecuencia 60/65 €): se usa
            el valor de la ficha principal y se marca como referencia.
          </li>
          <li>Año exacto de apertura, horario vigente y si el móvil admite WhatsApp (botón desactivado).</li>
          <li>Reseña negativa sobre la recepción: no se oculta en Booksy; la demo no hace afirmaciones absolutas.</li>
          <li>No se prometen resultados ni se usan términos médicos.</li>
        </ul>

        <h2>5. Dirección visual</h2>
        <p>
          «Casa con oficio». Verde botella casi negro, marfil y un solo acento vino; Bodoni Moda de alto contraste
          para la voz experta y Hanken Grotesk para leer. Recursos propios: sello circular «+18 años», doble regla y
          numeración «Nº» de carta. Debe sentirse consolidado y premium sin parecer una clínica ni una boutique
          juvenil.
        </p>
        <ul>
          <li>
            <strong>Frente a MG&amp;I</strong> (papel cálido, terracota, Instrument Serif, el «hilo» de línea fina):
            aquí fondo oscuro profundo, serif didona, sello y doble regla, carta interactiva por áreas y un tratamiento
            firma con protagonismo.
          </li>
          <li>
            <strong>Frente a Pura Bellezza</strong>: sin rosas, dorados ni redondeces de boutique; tono sobrio y de
            centro con trayectoria. (Su código no está en este repositorio; la diferencia se ha planteado por
            dirección, no por comparación línea a línea).
          </li>
        </ul>

        <h2>6. Qué pedir al centro</h2>
        <ul>
          <li>Validar carta, precios y horario; confirmar el año de apertura.</li>
          <li>Logotipo original (si existe) en vector.</li>
          <li>Sesión de fotos: ver README_ASSETS.md (cabina, tratamiento facial, recepción, equipo, fachada).</li>
          <li>Permiso para citar reseñas y para presentar al equipo por su nombre.</li>
          <li>Confirmar si el 695 91 58 37 atiende WhatsApp.</li>
        </ul>
      </div>
    </main>
  );
}
