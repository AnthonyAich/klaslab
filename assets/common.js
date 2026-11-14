/* Klaslab · gedeelde hulpfuncties */
(function () {
  const SUPD = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻','+':'⁺' };
  const SUBD = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉' };
  const supNum = n => String(n).split('').map(c => SUPD[c] || c).join('');

  /* Getallen ------------------------------------------------------- */
  function parseNum(s) {
    if (s == null) return NaN;
    s = String(s).trim().replace(/\s+/g, '').replace(/−/g, '-').replace(/,/g, '.');
    if (!s) return NaN;
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+$/, m => '^' + m.split('').map(c => Object.keys(SUPD).find(k => SUPD[k] === c)).join(''));
    s = s.replace(/[·×xX*]10\^?\(?(-?\d+)\)?$/, 'e$1');
    s = s.replace(/^10\^\(?(-?\d+)\)?$/, '1e$1');
    return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s) ? Number(s) : NaN;
  }
  function fmt(x, sig = 3) {
    if (!isFinite(x)) return '?';
    if (x === 0) return '0';
    let e = Math.floor(Math.log10(Math.abs(x)));
    if (e >= -3 && e < sig) return x.toPrecision(sig).replace('.', ',');
    let m = (x / Math.pow(10, e)).toPrecision(sig);
    if (Math.abs(parseFloat(m)) >= 10) { e++; m = (x / Math.pow(10, e)).toPrecision(sig); }
    return `${m.replace('.', ',')} · 10${supNum(e)}`;
  }
  /* Platte tekst voor in invoervelden: 1,8·10^-5 */
  const fmtIn = (x, sig = 2) => {
    const e = Math.floor(Math.log10(Math.abs(x)));
    if (e >= -3 && e < 1) return x.toPrecision(sig).replace('.', ',');
    return x.toExponential(sig - 1).replace('.', ',').replace('e', '·10^').replace('^+', '^');
  };
  const fix = (x, d) => (Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d).replace('.', ',');
  const frac = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

  /* Beduidende cijfers in een ingegeven getal ("0,00100" → 3, "1,74·10^-5" → 3) */
  function sigFigs(str) {
    if (!str) return null;
    let s = String(str).trim().replace(/\s+/g, '').replace(/,/g, '.');
    s = s.split(/[eE·×xX*]/)[0];
    s = s.replace(/^[-+]/, '');
    if (!/^\d*\.?\d*$/.test(s) || !/\d/.test(s)) return null;
    if (s.includes('.')) { const d = s.replace('.', '').replace(/^0+/, ''); return d.length || 1; }
    const d = s.replace(/^0+/, '').replace(/0+$/, ''); return d.length || 1;
  }
  const decimalsOf = str => { const m = String(str).trim().replace(',', '.').match(/\.(\d+)/); return m ? m[1].length : 0; };

  /* Formules ------------------------------------------------------- */
  function chem(s) {
    if (!s) return '';
    s = String(s).trim();
    let charge = '';
    let m = s.match(/\^(.+)$/);
    if (m) { charge = m[1]; s = s.slice(0, m.index); }
    else if ((m = s.match(/[+-]$/))) { charge = m[0]; s = s.slice(0, -1); }
    s = s.replace(/([A-Za-z\)\]])(\d+)/g, '$1<sub>$2</sub>');
    return s + (charge ? `<sup>${charge.replace('-', '−')}</sup>` : '');
  }
  function chemPlain(s) {
    if (!s) return '';
    s = String(s).trim();
    let charge = '';
    let m = s.match(/\^(.+)$/);
    if (m) { charge = m[1]; s = s.slice(0, m.index); }
    else if ((m = s.match(/[+-]$/))) { charge = m[0]; s = s.slice(0, -1); }
    s = s.replace(/([A-Za-z\)\]])(\d+)/g, (a, b, d) => b + d.split('').map(x => SUBD[x]).join(''));
    return s + charge.split('').map(c => SUPD[c] || c).join('');
  }
  const stripTags = h => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent; };

  /* Toeval met zaad (voor deelbare oefeningen) --------------------- */
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const newSeed = () => Math.floor(Math.random() * 1e9) + 1;
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  function shuffle(r, arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* Status in de link ---------------------------------------------- */
  const readHash = () => Object.fromEntries(new URLSearchParams(location.hash.slice(1)));
  const linkFor = obj => location.href.split('#')[0] + '#' + new URLSearchParams(obj).toString();

  /* Modaal venster met link en QR ---------------------------------- */
  function shareModal(url, title = 'Delen', text = '') {
    let qrSvg = '';
    try {
      const q = qrcode(0, 'M'); q.addData(url); q.make();
      qrSvg = q.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
    } catch (e) { qrSvg = '<p class="hint">QR code kon niet gemaakt worden (link te lang).</p>'; }
    const m = document.createElement('div');
    m.className = 'kl-modal no-print';
    m.innerHTML = `<div class="box"><button class="x" aria-label="Sluiten">×</button><h2>${title}</h2>
      ${text ? `<p class="hint" style="margin:0 0 10px">${text}</p>` : ''}
      <input readonly value="${url.replace(/"/g, '&quot;')}">
      <div class="btns"><button class="btn pri" data-copy>Kopieer link</button><a class="btn" href="${url}" target="_blank" rel="noopener">Openen</a></div>
      <div class="qr">${qrSvg}</div>
      <p class="hint" style="text-align:center">Projecteer deze QR code zodat leerlingen hem kunnen scannen.</p></div>`;
    document.body.appendChild(m);
    const close = () => m.remove();
    m.addEventListener('click', e => { if (e.target === m) close(); });
    m.querySelector('.x').onclick = close;
    m.querySelector('[data-copy]').onclick = async (e) => {
      try { await navigator.clipboard.writeText(url); e.target.textContent = 'Gekopieerd ✓'; }
      catch { m.querySelector('input').select(); document.execCommand('copy'); e.target.textContent = 'Gekopieerd ✓'; }
    };
  }

  /* Afdrukken van een eigen document (werkblad, sleutel) ----------- */
  function printDoc(title, bodyHtml) {
    const css = [...document.querySelectorAll('link[rel=stylesheet]')].map(l => `<link rel="stylesheet" href="${l.href}">`).join('')
      + [...document.querySelectorAll('style')].map(s => s.outerHTML).join('');
    const w = window.open('', '_blank');
    if (!w) { alert('Je browser blokkeert het nieuwe venster. Sta pop ups toe voor deze site.'); return; }
    w.document.write(`<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><title>${title}</title>${css}
      <style>body{background:#fff}main{max-width:820px}.ws-q{break-inside:avoid;margin-bottom:22px}.ws-lines{border-bottom:1px solid #bbb;height:30px}
      .ws-head{display:flex;justify-content:space-between;border-bottom:2px solid #1b2130;padding-bottom:8px;margin-bottom:18px}
      @media print{.ws-noprint{display:none}}</style></head>
      <body><main><div class="ws-noprint btns" style="margin:0 0 16px"><button class="btn pri" onclick="print()">Afdrukken of opslaan als PDF</button></div>${bodyHtml}</main></body></html>`);
    w.document.close();
  }
  function worksheetHead(title, sub = '') {
    const P = window.KLP ? KLP.get() : {}, esc = window.KLP ? KLP.esc : (s => s);
    const who = [P.school, P.name].filter(Boolean).map(esc).join(' · ');
    return `<div class="ws-head"><div>${who ? `<div class="hint" style="margin:0 0 2px;font-weight:600">${who}</div>` : ''}<h1 style="margin:0">${title}</h1>${sub ? `<div class="hint" style="margin:2px 0 0">${sub}</div>` : ''}</div>
      <div style="text-align:right;font-size:.9rem">Naam: ________________________<br>Klas: ______ Datum: __________</div></div>`;
  }

  /* Projectiemodus: groter, stap voor stap ------------------------- */
  let projIdx = 0, projBar = null;
  function projSteps() { return [...document.querySelectorAll('.sol .step')].filter(el => el.closest('.hidden') === null); }
  function projApply() {
    const st = projSteps();
    st.forEach((el, i) => el.classList.toggle('proj-hide', i >= projIdx));
    if (projBar) projBar.querySelector('[data-c]').textContent = `stap ${Math.min(projIdx, st.length)} / ${st.length}`;
  }
  function projToggle(on) {
    on = on ?? !document.body.classList.contains('proj');
    document.body.classList.toggle('proj', on);
    if (on) {
      projIdx = 0;
      projBar = document.createElement('div');
      projBar.className = 'kl-projbar no-print';
      projBar.innerHTML = `<button data-p>◀</button><span data-c></span><button class="pri" data-n>Volgende stap ▶</button><button data-a>Alles</button><button data-x>Sluiten</button>`;
      document.body.appendChild(projBar);
      projBar.querySelector('[data-p]').onclick = () => { projIdx = Math.max(0, projIdx - 1); projApply(); };
      projBar.querySelector('[data-n]').onclick = () => { projIdx = Math.min(projSteps().length, projIdx + 1); projApply(); };
      projBar.querySelector('[data-a]').onclick = () => { projIdx = projSteps().length; projApply(); };
      projBar.querySelector('[data-x]').onclick = () => projToggle(false);
      projApply();
    } else {
      document.querySelectorAll('.proj-hide').forEach(el => el.classList.remove('proj-hide'));
      if (projBar) projBar.remove(); projBar = null;
    }
  }
  document.addEventListener('keydown', e => {
    if (!document.body.classList.contains('proj') || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); projIdx = Math.min(projSteps().length, projIdx + 1); projApply(); }
    if (e.key === 'ArrowLeft') { projIdx = Math.max(0, projIdx - 1); projApply(); }
    if (e.key === 'Escape') projToggle(false);
  });
  /* Nieuwe inhoud in projectie: opnieuw verbergen */
  const projObserver = new MutationObserver(() => { if (document.body.classList.contains('proj')) { projIdx = 0; projApply(); } });

  /* Werkbalk bovenaan elke tool ------------------------------------ */
  function toolbar({ share, print = () => window.print(), proj = true } = {}) {
    const top = document.getElementById('kl-top');
    if (!top) return;
    top.className = 'kl-top no-print';
    top.innerHTML = `<a class="kl-back" href="../index.html">← Alle tools</a><div class="kl-bar">
      ${share ? '<button data-s>🔗 Delen</button>' : ''}<button data-pr>🖨 Afdrukken</button>${proj ? '<button data-pj>📽 Projectie</button>' : ''}</div>`;
    if (share) top.querySelector('[data-s]').onclick = () => { const s = share(); shareModal(s.url || linkFor(s), s.title || 'Deze pagina delen', s.text || 'Wie de link opent, ziet dezelfde gegevens en uitwerking.'); };
    top.querySelector('[data-pr]').onclick = print;
    if (proj) top.querySelector('[data-pj]').onclick = () => projToggle();
    projObserver.observe(document.querySelector('main'), { childList: true, subtree: true });
  }

  /* Eenvoudige SVG grafiek ---------------------------------------- */
  function chart({ w = 640, h = 360, x0, x1, y0, y1, xlab = '', ylab = '', xticks = [], yticks = [], series = [], marks = [], xfmt = v => v, yfmt = v => v, hlines = [], vlines = [] }) {
    const L = 52, R = 14, T = 14, B = 44, W = w - L - R, H = h - T - B;
    const X = v => L + (v - x0) / (x1 - x0) * W, Y = v => T + (1 - (v - y0) / (y1 - y0)) * H;
    let s = `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;font-family:inherit;font-size:12px">`;
    s += `<rect x="${L}" y="${T}" width="${W}" height="${H}" fill="#fafbfc" stroke="#e2e5ea"/>`;
    yticks.forEach(v => s += `<line x1="${L}" x2="${L + W}" y1="${Y(v)}" y2="${Y(v)}" stroke="#eceef2"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end" fill="#667085">${yfmt(v)}</text>`);
    xticks.forEach(v => s += `<line y1="${T}" y2="${T + H}" x1="${X(v)}" x2="${X(v)}" stroke="#eceef2"/><text y="${T + H + 16}" x="${X(v)}" text-anchor="middle" fill="#667085">${xfmt(v)}</text>`);
    hlines.forEach(l => s += `<line x1="${L}" x2="${L + W}" y1="${Y(l.y)}" y2="${Y(l.y)}" stroke="${l.color || '#999'}" stroke-dasharray="5 4"/>${l.label ? `<text x="${L + W - 4}" y="${Y(l.y) - 5}" text-anchor="end" fill="${l.color || '#999'}">${l.label}</text>` : ''}`);
    vlines.forEach(l => s += `<line y1="${T}" y2="${T + H}" x1="${X(l.x)}" x2="${X(l.x)}" stroke="${l.color || '#999'}" stroke-dasharray="5 4"/>${l.label ? `<text x="${X(l.x) + 4}" y="${T + 13}" fill="${l.color || '#999'}">${l.label}</text>` : ''}`);
    (arguments[0].bands || []).forEach(b => s += `<rect x="${L}" width="${W}" y="${Y(b.y1)}" height="${Math.max(0, Y(b.y0) - Y(b.y1))}" fill="${b.color}" opacity=".18"/>`);
    series.forEach(se => {
      const pts = se.pts.filter(p => isFinite(p[1])).map(p => `${X(p[0]).toFixed(1)},${Y(Math.max(y0, Math.min(y1, p[1]))).toFixed(1)}`).join(' ');
      s += `<polyline points="${pts}" fill="none" stroke="${se.color}" stroke-width="${se.width || 2.5}" ${se.dash ? 'stroke-dasharray="6 4"' : ''}/>`;
    });
    marks.forEach(m => s += `<circle cx="${X(m.x)}" cy="${Y(m.y)}" r="5" fill="${m.color || '#111'}"/>${m.label ? `<text x="${X(m.x) + (m.left ? -8 : 8)}" text-anchor="${m.left ? 'end' : 'start'}" y="${Y(m.y) + (m.dy || -8)}" fill="${m.color || '#111'}" font-weight="700">${m.label}</text>` : ''}`);
    s += `<text x="${L + W / 2}" y="${h - 6}" text-anchor="middle" fill="#1b2130">${xlab}</text>`;
    s += `<text transform="translate(14 ${T + H / 2}) rotate(-90)" text-anchor="middle" fill="#1b2130">${ylab}</text>`;
    const leg = series.filter(x => x.name);
    if (leg.length) s += leg.map((se, i) => `<g transform="translate(${L + 10} ${T + 14 + i * 17})"><line x1="0" x2="18" y1="-4" y2="-4" stroke="${se.color}" stroke-width="3" ${se.dash ? 'stroke-dasharray="6 4"' : ''}/><text x="24" y="0" fill="#1b2130">${se.name}</text></g>`).join('');
    return s + '</svg>';
  }

  /* Bisectie (voor evenwichten met water erbij) */
  function bisect(f, lo, hi, it = 200) {
    let flo = f(lo);
    for (let i = 0; i < it; i++) {
      const mid = (lo + hi) / 2, fm = f(mid);
      if ((fm > 0) === (flo > 0)) { lo = mid; flo = fm; } else hi = mid;
    }
    return (lo + hi) / 2;
  }

  /* Tabbladen */
  function tabs(onChange) {
    const btns = [...document.querySelectorAll('.tabs [data-tab]')];
    const show = id => {
      btns.forEach(b => b.classList.toggle('on', b.dataset.tab === id));
      btns.forEach(b => document.getElementById(b.dataset.tab).classList.toggle('hidden', b.dataset.tab !== id));
      onChange && onChange(id);
    };
    btns.forEach(b => b.addEventListener('click', () => show(b.dataset.tab)));
    return show;
  }

  window.KL = { SUPD, supNum, parseNum, fmt, fmtIn, fix, frac, sigFigs, decimalsOf, chem, chemPlain, stripTags,
    rng, newSeed, pick, shuffle, readHash, linkFor, shareModal, printDoc, worksheetHead, projToggle, toolbar, chart, bisect, tabs,
    H3O: 'H<sub>3</sub>O<sup>+</sup>', OH: 'OH<sup>−</sup>', H2O: 'H<sub>2</sub>O', EQ: ' ⇌ ', KW: 1e-14 };
})();
