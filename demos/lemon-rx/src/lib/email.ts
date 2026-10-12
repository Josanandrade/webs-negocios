import "server-only";

// Emails de la propia app (no los de Supabase Auth). Se envían con la API de
// Resend usando una clave exclusiva de Lemon RX. Si falta RESEND_API_KEY o
// EMAIL_FROM, la app funciona igual y simplemente no avisa.

export type Recipient = { email: string; full_name: string };
type Email = { to: string; subject: string; html: string; text: string };

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/** Envía un email individual a cada destinatario (nadie ve el email de los demás). */
export async function sendEmails(emails: Email[]) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) throw new Error("Email sin configurar");

  // La API de Resend acepta hasta 100 emails por llamada.
  for (let i = 0; i < emails.length; i += 100) {
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(
        emails.slice(i, i + 100).map((e) => ({ from, to: [e.to], subject: e.subject, html: e.html, text: e.text })),
      ),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

const CONDENSED = "'Barlow Condensed','Arial Narrow',Helvetica,Arial,sans-serif";

/** Plantilla común: el mismo estilo negro que los emails de registro. */
function layout(title: string, paragraphs: string[], button: { label: string; url: string }) {
  const body = paragraphs
    .map((p) => `<p style="margin:0 0 12px;font-size:17px;line-height:1.6;color:#b9b9b0;">${escapeHtml(p)}</p>`)
    .join("\n          ");
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;1,800&family=Barlow:wght@400;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#0c0c0b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0c0c0b" style="background:#0c0c0b;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;font-family:Barlow,Helvetica,Arial,sans-serif;color:#f3f3ee;">
        <tr><td style="padding:0 0 32px;border-bottom:1px solid #2b2b27;">
          <span style="font-family:${CONDENSED};font-size:34px;font-weight:800;font-style:italic;letter-spacing:0.5px;line-height:1;color:#f3f3ee;">LEMON<span style="color:#e3ef3f;"> RX</span></span>
        </td></tr>
        <tr><td style="padding:32px 0 0;">
          <h1 style="margin:0 0 16px;font-family:${CONDENSED};font-size:34px;font-weight:700;line-height:1;text-transform:uppercase;color:#f3f3ee;">${escapeHtml(title)}</h1>
          ${body}
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:16px;"><tr><td bgcolor="#e3ef3f" style="border-radius:4px;">
            <a href="${escapeHtml(button.url)}" style="display:inline-block;padding:15px 26px;font-family:${CONDENSED};font-size:18px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;text-decoration:none;color:#171a00;">${escapeHtml(button.label)}</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:40px 0 0;font-size:13px;color:#8a8a81;">Lemon RX · Programación de CrossFit</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function greeting(fullName: string) {
  const name = fullName.trim().split(/\s+/)[0] ?? "";
  return name ? `Hola ${name},` : "Hola,";
}

/** Aviso de semana publicada. */
export function weekPublishedEmail(to: Recipient, range: string, url: string): Email {
  const hello = greeting(to.full_name);
  const body = `Ya tienes subida la programación de la semana del ${range}. Entra en la app para verla.`;
  return {
    to: to.email,
    subject: `Ya está la programación del ${range}`,
    html: layout("Nueva semana publicada", [hello, body], { label: "Ver la semana", url }),
    text: `${hello}\n\n${body}\n\n${url}\n\nLemon RX · Programación de CrossFit`,
  };
}

/** Aviso a un admin de que alguien nuevo se ha registrado y espera acceso. */
export function newSignupEmail(to: Recipient, user: { full_name: string; email: string }, url: string): Email {
  const hello = greeting(to.full_name);
  const who = user.full_name.trim() || user.email;
  const lines = [
    hello,
    `${who} acaba de registrarse en Lemon RX con el email ${user.email}.`,
    "Su acceso está pendiente: entra en su ficha para activarlo y marcar el pago.",
  ];
  return {
    to: to.email,
    subject: `Nuevo registro en Lemon RX: ${who}`,
    html: layout("Nuevo registro", lines, { label: "Ver su ficha", url }),
    text: `${lines.join("\n\n")}\n\n${url}\n\nLemon RX · Programación de CrossFit`,
  };
}
