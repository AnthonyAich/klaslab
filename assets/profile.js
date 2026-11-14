/* Klaslab · persoonlijk profiel, thema, synchronisatie en functie-aanvragen
 * Laad in <head>, na config.js, zodat het thema meteen toegepast wordt.
 */
(function () {
  const BASE = (document.currentScript && document.currentScript.src || '').replace(/assets\/profile\.js.*$/, '');
  const K_PROFILE = 'kl.profile', K_CODE = 'kl.code';
  const API = () => (window.KL_API || '').trim();

  const TOOLS = [
    { id: 'biologie/mutatie-checker', name: 'Mutatie checker', vak: 'bio' },
    { id: 'chemie/ph-rekenaar', name: 'pH rekenaar', vak: 'chem' },
    { id: 'chemie/buffer', name: 'Buffers', vak: 'chem' },
    { id: 'chemie/titratie', name: 'Titratiecurves', vak: 'chem' },
    { id: 'chemie/indicatoren', name: 'Indicatoren', vak: 'chem' },
    { id: 'chemie/neutralisatie', name: 'Neutralisatie', vak: 'chem' },
  ];
  const SUBJECTS = [{ id: 'bio', name: 'Biologie' }, { id: 'chem', name: 'Chemie' }];
  const ACCENTS = [
    { v: '', n: 'Standaard' }, { v: '#2457c5', n: 'Blauw' }, { v: '#6d3fc0', n: 'Paars' },
    { v: '#c01048', n: 'Framboos' }, { v: '#c2410c', n: 'Oranje' }, { v: '#2f8f4e', n: 'Groen' }, { v: '#1b2130', n: 'Inkt' },
  ];
  const DEFAULTS = { name: '', school: '', greeting: true, favorites: [], hidden: [], theme: 'auto', accent: '', updated: 0 };

  /* Opslag ------------------------------------------------------------- */
  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { } },
    del(k) { try { localStorage.removeItem(k); } catch { } },
  };
  function get() {
    let p = {};
    try { p = JSON.parse(ls.get(K_PROFILE) || '{}') || {}; } catch { }
    return Object.assign({}, DEFAULTS, p);
  }
  const getCode = () => ls.get(K_CODE) || '';
  function newCode() {
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const r = new Uint32Array(8); crypto.getRandomValues(r);
    const s = [...r].map(x => A[x % A.length]).join('');
    return s.slice(0, 4) + '-' + s.slice(4);
  }
  const validCode = c => /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c);

  /* Thema -------------------------------------------------------------- */
  const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function apply(p = get()) {
    const root = document.documentElement;
    const dark = p.theme === 'dark' || (p.theme === 'auto' && mq && mq.matches);
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (p.accent) { root.style.setProperty('--accent', p.accent); root.setAttribute('data-accent', ''); }
    else { root.style.removeProperty('--accent'); root.removeAttribute('data-accent'); }
  }
  if (mq) mq.addEventListener('change', () => apply());
  apply();

  /* Synchronisatie met de Google Sheet --------------------------------- */
  const emit = () => document.dispatchEvent(new CustomEvent('kl:profile', { detail: get() }));

  async function apiGet(params) {
    const r = await fetch(API() + '?' + new URLSearchParams(params), { redirect: 'follow' });
    return r.json();
  }
  async function apiPost(body) {
    // text/plain voorkomt een CORS preflight, die Apps Script niet ondersteunt.
    const r = await fetch(API(), { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) });
    return r.json();
  }

  let pushTimer = null, waiting = [];
  function save(patch) {
    const p = Object.assign(get(), patch, { updated: Date.now() });
    ls.set(K_PROFILE, JSON.stringify(p));
    apply(p); emit();
    clearTimeout(pushTimer);
    return new Promise(res => {
      waiting.push(res);
      pushTimer = setTimeout(async () => { const w = waiting; waiting = []; const s = await push(); w.forEach(f => f(s)); }, 600);
    });
  }
  /* Resultaat: 'local' (geen databank), 'synced' of 'error' */
  async function push() {
    if (!API()) return 'local';
    let code = getCode();
    if (!code) { code = newCode(); ls.set(K_CODE, code); }
    try { const r = await apiPost({ action: 'save', code, profile: get() }); return r.ok ? 'synced' : 'error'; }
    catch { return 'error'; }
  }
  async function pull() {
    const code = getCode();
    if (!API() || !code) return 'local';
    try {
      const r = await apiGet({ action: 'get', code });
      if (!r.ok) return 'error';
      if (!r.found) { await push(); return 'synced'; }
      if ((r.profile.updated || 0) > get().updated) { ls.set(K_PROFILE, JSON.stringify(r.profile)); apply(); emit(); }
      return 'synced';
    } catch { return 'error'; }
  }
  /* Een code van een ander toestel overnemen */
  async function useCode(code) {
    code = String(code || '').trim().toUpperCase().replace(/\s+/g, '');
    if (/^[A-Z0-9]{8}$/.test(code)) code = code.slice(0, 4) + '-' + code.slice(4);
    if (!validCode(code)) throw new Error('Een code ziet eruit als ABCD-1234.');
    if (!API()) throw new Error('De databank is nog niet gekoppeld.');
    const r = await apiGet({ action: 'get', code });
    if (!r.ok) throw new Error(r.error || 'De databank gaf een fout.');
    if (!r.found) throw new Error('Deze code bestaat niet.');
    ls.set(K_CODE, code);
    ls.set(K_PROFILE, JSON.stringify(r.profile));
    apply(); emit();
  }

  /* Hulp ---------------------------------------------------------------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /* Voornaam voor een begroeting; "Mevr. Janssens" blijft volledig */
  function callName(n) {
    n = String(n || '').trim();
    const w = n.split(/\s+/);
    return w.length > 1 && /(\.|^(mevrouw|meneer|juf|meester|dhr|mevr|mr|mw)\.?)$/i.test(w[0]) ? n : w[0];
  }
  function currentTool() {
    const path = location.pathname.replace(/\.html$/, '');
    const t = TOOLS.find(t => path.endsWith('/' + t.id));
    if (t) return t.name;
    if (/settings$/.test(path)) return 'Instellingen';
    return 'Startpagina';
  }

  /* Knop "Vraag een nieuwe functionaliteit aan" ------------------------ */
  function requestModal() {
    const p = get();
    const m = document.createElement('div');
    m.className = 'kl-modal no-print';
    m.innerHTML = `<form class="box klp-req" novalidate><button type="button" class="x" aria-label="Sluiten">×</button>
      <h2>Vraag een nieuwe functionaliteit aan</h2>
      <p class="hint" style="margin:0 0 14px">Wat zou Klaslab beter maken in jouw les? Elke aanvraag wordt gelezen.</p>
      <label for="klr-t">Wat wil je?</label>
      <input id="klr-t" name="title" maxlength="200" placeholder="bv. Oefeningen over redoxreacties" required>
      <label for="klr-d" style="margin-top:12px">Meer uitleg <span class="opt">optioneel</span></label>
      <textarea id="klr-d" name="description" rows="4" maxlength="4000" placeholder="Voor welke klas, hoe zou je het gebruiken…"></textarea>
      <label for="klr-tool" style="margin-top:12px">Over welke tool?</label>
      <select id="klr-tool" name="tool">${['Nieuwe tool', 'Startpagina', ...TOOLS.map(t => t.name)].map(n => `<option${n === currentTool() ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select>
      <div class="grid" style="margin-top:12px;grid-template-columns:1fr 1fr">
        <div><label for="klr-n">Je naam <span class="opt">optioneel</span></label><input id="klr-n" name="name" maxlength="100" value="${esc(p.name)}"></div>
        <div><label for="klr-e">E-mail <span class="opt">optioneel</span></label><input id="klr-e" name="email" type="email" maxlength="200" placeholder="voor een antwoord"></div>
      </div>
      <div class="msg err hidden" data-err></div>
      <div class="btns"><button class="btn pri" type="submit">Versturen</button><button class="btn" type="button" data-cancel>Annuleren</button></div>
    </form>`;
    document.body.appendChild(m);
    const f = m.querySelector('form');
    const close = () => { m.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    m.addEventListener('click', e => { if (e.target === m) close(); });
    m.querySelector('.x').onclick = close;
    m.querySelector('[data-cancel]').onclick = close;
    setTimeout(() => f.title.focus(), 30);
    f.onsubmit = async e => {
      e.preventDefault();
      const err = m.querySelector('[data-err]');
      const show = t => { err.textContent = t; err.classList.remove('hidden'); };
      err.classList.add('hidden');
      if (!f.title.value.trim()) { show('Vul in wat je wil.'); f.title.focus(); return; }
      if (!API()) { show('De databank is nog niet gekoppeld, dus de aanvraag kan niet verstuurd worden.'); return; }
      const btn = f.querySelector('[type=submit]');
      btn.disabled = true; btn.textContent = 'Versturen…';
      try {
        const r = await apiPost({ action: 'request', title: f.title.value.trim(), description: f.description.value.trim(),
          tool: f.tool.value, name: f.name.value.trim(), email: f.email.value.trim(), code: getCode() });
        if (!r.ok) throw new Error(r.error);
        f.innerHTML = `<button type="button" class="x" aria-label="Sluiten">×</button><h2>Bedankt${p.name ? ', ' + esc(callName(p.name)) : ''}!</h2>
          <p>Je aanvraag is goed aangekomen.</p><div class="btns"><button class="btn pri" type="button" data-cancel>Sluiten</button></div>`;
        f.querySelector('.x').onclick = close; f.querySelector('[data-cancel]').onclick = close;
      } catch {
        btn.disabled = false; btn.textContent = 'Versturen';
        show('Versturen lukte niet. Controleer je internetverbinding en probeer opnieuw.');
      }
    };
  }
  function fab() {
    if (document.querySelector('.klp-fab')) return;
    const b = document.createElement('button');
    b.className = 'klp-fab no-print';
    b.type = 'button';
    b.innerHTML = '<span aria-hidden="true">💡</span><span class="klp-fab-t">Vraag een nieuwe functionaliteit aan</span>';
    b.setAttribute('aria-label', 'Vraag een nieuwe functionaliteit aan');
    b.onclick = requestModal;
    document.body.appendChild(b);
  }

  document.addEventListener('DOMContentLoaded', () => { fab(); pull(); });

  window.KLP = { BASE, TOOLS, SUBJECTS, ACCENTS, get, save, push, pull, useCode, getCode, apply, esc, callName, hasApi: () => !!API(), openRequest: requestModal };
})();
