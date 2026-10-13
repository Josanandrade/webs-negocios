import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Propuesta para MG&I — Documento privado",
  robots: { index: false, follow: false },
};

const presence = [
  ["Web propia", "No localizada", "no"],
  ["Instagram oficial", "No localizado / sin verificar", "no"],
  ["Facebook / TikTok", "No localizados", "no"],
  ["Ficha de Google", "Sin verificar desde nuestra búsqueda", "warn"],
  ["Fresha", "Ficha generada con datos públicos; la plataforma indica que el negocio no está afiliado", "warn"],
  ["Teléfono", "656 86 31 07 (publicado en fichas de terceros)", "warn"],
  ["WhatsApp / reserva online", "Sin confirmar", "no"],
] as const;

const services = [
  ["Cejas con hilo", "Aparece en todas las referencias localizadas", "ok"],
  ["Depilación facial con hilo", "Aparece en las referencias localizadas", "ok"],
  ["Tratamientos faciales / extracciones", "Aparece en directorio, pendiente de confirmar", "warn"],
  ["Dermaplaning", "Aparece en directorio, pendiente de confirmar", "warn"],
  ["Maquillaje", "Aparece en directorio, pendiente de confirmar", "warn"],
] as const;

const tagLabel = { ok: "Coherente", warn: "Por confirmar", no: "No encontrado" } as const;

export default function Propuesta() {
  return (
    <main className="doc">
      <header>
        <Link href="/" aria-label="Volver a la demo">
          <Wordmark />
        </Link>
        <h1>
          Tu marca no debería vivir únicamente en <span className="it">fichas de terceros.</span>
        </h1>
        <p>
          Documento privado de AvanttAI para Boutique de belleza MG&amp;I (Sevilla). La demo no ha
          sido solicitada por el negocio y no es su web oficial.
        </p>
      </header>

      <h2>Lo que hemos encontrado</h2>
      <p>
        Hoy, quien busca MG&amp;I encuentra sobre todo directorios de reservas que reutilizan datos
        públicos. No hemos localizado una web propia ni redes sociales que podamos confirmar como
        oficiales. Eso significa que el negocio no controla cómo se le presenta: textos, fotos,
        servicios o incluso reseñas que pueden no ser suyas.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Canal</th>
              <th scope="col">Estado</th>
              <th scope="col">
                <span className="sr-only">Verificación</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {presence.map(([c, s, t]) => (
              <tr key={c}>
                <td>{c}</td>
                <td>{s}</td>
                <td>
                  <span className={`tag tag--${t}`}>{tagLabel[t]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Qué tipo de centro es</h2>
      <p>
        Por lo que se repite en todas las referencias, MG&amp;I es una boutique de belleza
        especializada en <strong>trabajo con hilo</strong> (cejas y vello facial) con un
        complemento de <strong>cuidado facial</strong> y <strong>maquillaje</strong>. No es una
        clínica ni un centro de medicina estética, así que la web evita cualquier lenguaje médico.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Servicio</th>
              <th scope="col">Fuente</th>
              <th scope="col">
                <span className="sr-only">Verificación</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {services.map(([c, s, t]) => (
              <tr key={c}>
                <td>{c}</td>
                <td>{s}</td>
                <td>
                  <span className={`tag tag--${t}`}>{tagLabel[t]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>La propuesta</h2>
      <p className="quote">Un espacio propio donde MG&amp;I decide cómo se ve, qué ofrece y cómo se reserva.</p>
      <ul className="bullets">
        <li>
          <strong>Identidad editorial, no de plantilla.</strong> Papel, tinta y terracota sevillana.
          El “&amp;” del nombre como sello y una única línea fina —el hilo— como recurso gráfico
          que nace del servicio estrella.
        </li>
        <li>
          <strong>El hilo como protagonista.</strong> Las cejas con hilo abren la web; el resto de
          tratamientos se ordenan en una carta corta y clara.
        </li>
        <li>
          <strong>Pensada para quien llega desde el móvil.</strong> Barra fija con “Llamar” y
          “Reservar”, textos cortos, galerías deslizables y botones cómodos.
        </li>
        <li>
          <strong>Reserva honesta.</strong> Un asistente que ayuda a elegir y termina en el canal
          real del centro (hoy, el teléfono). Se puede conectar a WhatsApp o a una agenda online en
          cuanto el centro lo confirme.
        </li>
        <li>
          <strong>Preparada para vuestras fotos.</strong> Cada hueco tiene nombre y proporción. Basta
          con subir los archivos para sustituir las composiciones provisionales.
        </li>
        <li>
          <strong>Lista para aparecer en Google</strong> cuando se publique como web oficial (hoy
          está bloqueada a buscadores por ser una demo privada).
        </li>
      </ul>

      <h2>Qué necesitaríamos de MG&amp;I</h2>
      <ul className="bullets">
        <li>7 fotografías: fachada o interior, tratamiento facial, profesional, dos detalles, cabina y un resultado con consentimiento.</li>
        <li>Confirmar la carta de servicios vigente, precios orientativos y duraciones.</li>
        <li>Horario, canal de reserva preferido (teléfono, WhatsApp u otro) y perfiles oficiales.</li>
        <li>Nombre de la profesional o del equipo, si quieren mostrarlo, y su trayectoria.</li>
        <li>Logo original, si existe, para respetarlo o evolucionarlo.</li>
      </ul>

      <p style={{ marginTop: "3rem" }}>
        <Link className="btn btn--solid" href="/">
          Ver la demo
        </Link>
      </p>
    </main>
  );
}
