import { faqs } from "@/content/site";

export default function Faq() {
  return (
    <section className="faq" id="preguntas" aria-labelledby="preguntas-t">
      <div className="wrap faq__grid">
        <div className="faq__head">
          <p className="label">Preguntas</p>
          <h2 id="preguntas-t" className="h2">
            Lo que suele preguntarse <em>antes de llamar</em>.
          </h2>
        </div>
        <div className="faq__list">
          {faqs.map((item) => (
            <details key={item.q} className="faq__item">
              <summary>
                <span>{item.q}</span>
                <span className="faq__sign" aria-hidden="true" />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
