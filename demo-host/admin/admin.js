/* Entrada al modo edición de la web de Margot Ibáñez y cambio de usuario o contraseña.
 * La edición se hace sobre la propia web (lápices), que carga /admin/editor.js cuando hay sesión. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const say = (el, text, state = '') => { el.textContent = text; el.dataset.state = state; };
  async function api(path, opts = {}) {
    const res = await fetch('/admin/api/' + path, { credentials: 'same-origin', ...opts });
    let data = {};
    try { data = await res.json(); } catch { /* sin JSON */ }
    if (!res.ok) throw new Error(data.error || 'Algo ha fallado (' + res.status + ').');
    return data;
  }
  const sendJson = (path, method, body) => api(path, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const notice = $('[data-notice]');
  const show = (view) => {
    document.querySelectorAll('[data-view]').forEach((v) => { v.hidden = v.dataset.view !== view; });
    document.querySelectorAll('[data-when="in"]').forEach((v) => { v.hidden = view !== 'app'; });
  };
  const loggedIn = (user) => {
    $('[data-user]').textContent = user;
    $('[data-pass-form]').elements.user.value = user;
    show('app');
  };

  async function start() {
    let st;
    try { st = await api('status'); } catch { notice.hidden = false; notice.textContent = 'El panel no responde todavía. Si acabas de publicar, espera un minuto y recarga.'; show('login'); return; }
    if (!st.configured) { notice.hidden = false; notice.textContent = 'Falta conectar el almacenamiento (KV llamado MARGOT_KV) en Cloudflare Pages.'; }
    else if (!st.hasPassword) { notice.hidden = false; notice.textContent = 'Falta poner la contraseña inicial (variable ADMIN_PASSWORD) en Cloudflare Pages.'; }
    if (st.loggedIn) loggedIn(st.user); else show('login');
  }

  $('[data-login-form]').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target, msg = $('[data-login-msg]'), btn = $('button', f);
    btn.disabled = true; say(msg, 'Comprobando…');
    try {
      await sendJson('login', 'POST', { user: f.user.value, password: f.password.value });
      say(msg, 'Abriendo la web en modo edición…', 'ok');
      location.href = '/';
    } catch (err) { say(msg, err.message, 'err'); btn.disabled = false; }
  });
  $('[data-logout]').addEventListener('click', async () => { await sendJson('logout', 'POST', {}).catch(() => {}); show('login'); });

  $('[data-pass-form]').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target, msg = $('[data-pass-msg]');
    if (f.password.value !== f.password2.value) return say(msg, 'Las dos contraseñas nuevas no coinciden.', 'err');
    try {
      const r = await sendJson('password', 'POST', { current: f.current.value, user: f.user.value, password: f.password.value });
      $('[data-user]').textContent = r.user;
      f.current.value = f.password.value = f.password2.value = '';
      say(msg, 'Guardado. A partir de ahora entra con el usuario «' + r.user + '» y la contraseña nueva.', 'ok');
    } catch (err) { say(msg, err.message, 'err'); }
  });

  start();
})();
