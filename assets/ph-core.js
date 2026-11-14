/* Klaslab · pH: gegevens, rekenkern, denkfouten, oefeningengenerator */
(function () {
  const { fmt, fix, frac, chem, KW, H3O, OH, H2O, EQ, pick } = KL;
  const log = Math.log10;

  /* ---------------- Stoffen ---------------- */
  const WEAK_ACIDS = [
    { name: 'azijnzuur', Z: 'CH3COOH', B: 'CH3COO-', K: 1.8e-5 },
    { name: 'mierenzuur', Z: 'HCOOH', B: 'HCOO-', K: 1.8e-4 },
    { name: 'fluorwaterstofzuur', Z: 'HF', B: 'F-', K: 6.8e-4 },
    { name: 'salpeterigzuur', Z: 'HNO2', B: 'NO2-', K: 4.5e-4 },
    { name: 'hypochlorigzuur', Z: 'HClO', B: 'ClO-', K: 3.0e-8 },
    { name: 'blauwzuur', Z: 'HCN', B: 'CN-', K: 6.2e-10 },
    { name: 'benzoëzuur', Z: 'C6H5COOH', B: 'C6H5COO-', K: 6.3e-5 },
    { name: 'melkzuur', Z: 'CH3CH(OH)COOH', B: 'CH3CH(OH)COO-', K: 1.4e-4 },
  ];
  const WEAK_BASES = [
    { name: 'ammoniak', B: 'NH3', Z: 'NH4+', K: 1.8e-5 },
    { name: 'methylamine', B: 'CH3NH2', Z: 'CH3NH3+', K: 4.4e-4 },
    { name: 'ethylamine', B: 'C2H5NH2', Z: 'C2H5NH3+', K: 5.6e-4 },
    { name: 'pyridine', B: 'C5H5N', Z: 'C5H5NH+', K: 1.7e-9 },
  ];
  const STRONG_ACIDS = [
    { name: 'zoutzuur', Z: 'HCl', B: 'Cl-' }, { name: 'broomwaterstofzuur', Z: 'HBr', B: 'Br-' },
    { name: 'joodwaterstofzuur', Z: 'HI', B: 'I-' }, { name: 'salpeterzuur', Z: 'HNO3', B: 'NO3-' },
    { name: 'perchloorzuur', Z: 'HClO4', B: 'ClO4-' },
  ];
  const STRONG_BASES = [
    { name: 'natriumhydroxide', B: 'NaOH', n: 1 }, { name: 'kaliumhydroxide', B: 'KOH', n: 1 },
    { name: 'lithiumhydroxide', B: 'LiOH', n: 1 }, { name: 'calciumhydroxide', B: 'Ca(OH)2', n: 2 },
    { name: 'bariumhydroxide', B: 'Ba(OH)2', n: 2 },
  ];

  const CATIONS = [
    { f: 'Li^+', n: 'lithium' }, { f: 'Na^+', n: 'natrium' }, { f: 'K^+', n: 'kalium' },
    { f: 'Mg^2+', n: 'magnesium' }, { f: 'Ca^2+', n: 'calcium' }, { f: 'Ba^2+', n: 'barium' },
    { f: 'NH4^+', n: 'ammonium', poly: true, K: 5.6e-10, Z: 'NH4+', B: 'NH3' },
    { f: 'Al^3+', n: 'aluminium', hyd: true, K: 1.0e-5 },
    { f: 'Fe^3+', n: 'ijzer(III)', hyd: true, K: 6.3e-3 },
    { f: 'Fe^2+', n: 'ijzer(II)', hyd: true, K: 3.2e-10 },
    { f: 'Cu^2+', n: 'koper(II)', hyd: true, K: 3.2e-8 },
    { f: 'Zn^2+', n: 'zink', hyd: true, K: 2.5e-10 },
  ];
  const ANIONS = [
    { f: 'Cl^-', n: 'chloride', sa: 'HCl' }, { f: 'Br^-', n: 'bromide', sa: 'HBr' }, { f: 'I^-', n: 'jodide', sa: 'HI' },
    { f: 'NO3^-', n: 'nitraat', poly: true, sa: 'HNO3' }, { f: 'ClO4^-', n: 'perchloraat', poly: true, sa: 'HClO4' },
    { f: 'SO4^2-', n: 'sulfaat', poly: true, weakNote: true },
    { f: 'CH3COO^-', n: 'acetaat', poly: true, Kb: 5.6e-10, Z: 'CH3COOH' },
    { f: 'HCOO^-', n: 'formiaat', poly: true, Kb: 5.6e-11, Z: 'HCOOH' },
    { f: 'F^-', n: 'fluoride', Kb: 1.5e-11, Z: 'HF' },
    { f: 'NO2^-', n: 'nitriet', poly: true, Kb: 2.2e-11, Z: 'HNO2' },
    { f: 'ClO^-', n: 'hypochloriet', poly: true, Kb: 3.3e-7, Z: 'HClO' },
    { f: 'CN^-', n: 'cyanide', poly: true, Kb: 1.6e-5, Z: 'HCN' },
    { f: 'SO3^2-', n: 'sulfiet', poly: true, Kb: 1.6e-7, Z: 'HSO3^-' },
    { f: 'CO3^2-', n: 'carbonaat', poly: true, Kb: 2.1e-4, Z: 'HCO3^-' },
    { f: 'PO4^3-', n: 'fosfaat', poly: true, Kb: 2.1e-2, Z: 'HPO4^2-' },
    { f: 'HCO3^-', n: 'waterstofcarbonaat', poly: true, amph: true, Kz: 4.7e-11, Kb: 2.2e-8 },
    { f: 'HSO4^-', n: 'waterstofsulfaat', poly: true, amph: true, Kz: 1.0e-2, Kb: null },
    { f: 'H2PO4^-', n: 'diwaterstoffosfaat', poly: true, amph: true, Kz: 6.2e-8, Kb: 1.3e-12 },
    { f: 'HPO4^2-', n: 'waterstoffosfaat', poly: true, amph: true, Kz: 4.8e-13, Kb: 1.6e-7 },
  ];

  /* ---------------- Zouten ---------------- */
  const chargeOf = f => { const m = f.match(/\^(\d*)([+-])$/); return m ? (+m[1] || 1) : 1; };
  const baseOf = f => f.replace(/\^.*$/, '');
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  function part(ion, count) {
    const b = chem(baseOf(ion.f));
    if (count === 1) return b;
    return (ion.poly ? `(${b})` : b) + `<sub>${count}</sub>`;
  }
  function hydForms(ion) {
    const z = chargeOf(ion.f), m = baseOf(ion.f);
    const zs = q => q === 0 ? '' : `<sup>${q > 1 ? q : ''}+</sup>`;
    return { ZH: `[${m}(H<sub>2</sub>O)<sub>6</sub>]${zs(z)}`, BH: `[${m}(OH)(H<sub>2</sub>O)<sub>5</sub>]${zs(z - 1)}` };
  }
  /* k: optionele aangepaste K waarden {cat, az, ab} */
  function evalSalt(ci, ai, k = {}) {
    const cat = CATIONS[ci], an = ANIONS[ai];
    const zc = chargeOf(cat.f), za = chargeOf(an.f), g = gcd(zc, za);
    const nc = za / g, na = zc / g;
    const formula = part(cat, nc) + part(an, na);
    const name = cat.n + an.n;
    const diss = `${formula} <span class="arrowh2o">→</span> ${nc > 1 ? nc + ' ' : ''}${chem(cat.f)} + ${na > 1 ? na + ' ' : ''}${chem(an.f)}`;
    const rows = [];
    let acidK = null, baseK = null, acidSrc = null, baseSrc = null;
    const Kc = k.cat ?? cat.K, Kaz = k.az ?? an.Kz, Kab = k.ab ?? an.Kb;
    if (!cat.K) rows.push([chem(cat.f), 'neutraal', 'Ion van groep Ia of IIa: reageert niet merkbaar met water, geen zuur.']);
    else {
      acidK = Kc; acidSrc = 'cat';
      if (cat.hyd) { const { ZH, BH } = hydForms(cat); rows.push([chem(cat.f), 'zuur', `Gehydrateerd metaalion: ${ZH} + ${H2O}${EQ}${BH} + ${H3O}. K<sub>z</sub> = ${fmt(Kc)}: zwak zuur.`]); }
      else rows.push([chem(cat.f), 'zuur', `${chem(cat.Z)} + ${H2O}${EQ}${chem(cat.B)} + ${H3O}. K<sub>z</sub> = ${fmt(Kc)}: zwak zuur.`]);
    }
    if (an.sa) rows.push([chem(an.f), 'neutraal', `Geconjugeerde base van het sterke zuur ${chem(an.sa)}: geen base in water.`]);
    else if (an.weakNote) rows.push([chem(an.f), 'neutraal', 'Zeer zwakke base (K<sub>b</sub> ≈ 10⁻¹²): het effect op de pH is verwaarloosbaar.']);
    else if (an.amph) {
      const zuur = Kaz > (Kab || 0);
      rows.push([chem(an.f), zuur ? 'zuur' : 'base', `Amfolyt: K<sub>z</sub> = ${fmt(Kaz)} en K<sub>b</sub> = ${Kab ? fmt(Kab) : 'verwaarloosbaar'}. Omdat K<sub>${zuur ? 'z' : 'b'}</sub> groter is, gedraagt het ion zich vooral als ${zuur ? 'zuur' : 'base'}.`]);
      if (zuur) { if (acidK == null || Kaz > acidK) { acidK = Kaz; acidSrc = 'an'; } } else { baseK = Kab; baseSrc = 'an'; }
    } else {
      baseK = Kab; baseSrc = 'an';
      rows.push([chem(an.f), 'base', `${chem(an.f)} + ${H2O}${EQ}${chem(an.Z)} + ${OH}. K<sub>b</sub> = ${fmt(Kab)}: zwakke base.`]);
    }
    let concl, kind = null;
    if (acidK == null && baseK == null) concl = ['neutraal', 'De oplossing is noch zuur noch basisch: neutraal, pH = 7.'];
    else if (baseK == null) { concl = ['zuur', 'Enkel een zuur ion reageert met water: de oplossing is zwak zuur, pH &lt; 7.']; kind = 'zz'; }
    else if (acidK == null) { concl = ['basisch', 'Enkel een basisch ion reageert met water: de oplossing is zwak basisch, pH &gt; 7.']; kind = 'zb'; }
    else {
      const r = acidK / baseK;
      if (r > 0.5 && r < 2) concl = ['neutraal', `Beide ionen reageren, met ongeveer even grote K<sub>z</sub> (${fmt(acidK)}) en K<sub>b</sub> (${fmt(baseK)}): de oplossing is ongeveer neutraal.`];
      else if (r > 1) concl = ['zuur', `Beide ionen reageren, maar K<sub>z</sub> (${fmt(acidK)}) &gt; K<sub>b</sub> (${fmt(baseK)}): de oplossing is zwak zuur.`];
      else concl = ['basisch', `Beide ionen reageren, maar K<sub>b</sub> (${fmt(baseK)}) &gt; K<sub>z</sub> (${fmt(acidK)}): de oplossing is zwak basisch.`];
    }
    const both = acidK != null && baseK != null;
    const amphActive = an.amph && ((kind === 'zz' && acidSrc === 'an') || (kind === 'zb' && baseSrc === 'an'));
    let exBase = null;
    if (kind && !both && !amphActive) {
      if (kind === 'zz') {
        exBase = cat.hyd ? { kind, K: acidK, ...hydForms(cat), Z: null, B: null, count: nc, ionHtml: hydForms(cat).ZH, Klabel: `K<sub>z</sub>(${hydForms(cat).ZH})` }
                         : { kind, K: acidK, Z: cat.Z, B: cat.B, count: nc, ionHtml: chem(cat.f), Klabel: `K<sub>z</sub>(${chem(cat.Z)})` };
      } else {
        exBase = { kind, K: baseK, Z: an.Z, B: an.f, count: na, ionHtml: chem(an.f), Klabel: `K<sub>b</sub>(${chem(an.f)})` };
      }
    }
    return { cat, an, nc, na, formula, name, diss, rows, concl, kind, both, amphActive, exBase };
  }
  function saltExercise(ci, ai, cSalt, cStr, k) {
    const s = evalSalt(ci, ai, k);
    if (!s.exBase) return null;
    const e = s.exBase;
    return {
      kind: e.kind, c: cSalt * e.count, K: e.K, Z: e.Z, B: e.B, ZH: e.ZH, BH: e.BH, n: 1,
      cStr: cStr || fmt(cSalt), KStr: KL.fmtIn(e.K),
      salt: { formula: s.formula, name: s.name, diss: s.diss, count: e.count, cSalt, ionHtml: e.ionHtml, rows: s.rows, ci, ai },
      name: s.name, Klabel: e.Klabel,
    };
  }

  /* ---------------- Rekenkern ---------------- */
  const isAcid = ex => ex.kind === 'zz' || ex.kind === 'sz';
  const isWeak = ex => ex.kind === 'zz' || ex.kind === 'zb';
  const toPH = (acid, x) => acid ? -log(x) : 14 + log(x);
  const xExact = (c, K) => (-K + Math.sqrt(K * K + 4 * K * c)) / 2;
  const xBook = (c, K) => c / K >= 1000 ? Math.sqrt(K * c) : xExact(c, K);
  function compute(ex) {
    const acid = isAcid(ex);
    let x, ok = null, xa = null, xe = null;
    if (isWeak(ex)) { ok = ex.c / ex.K >= 1000; xa = Math.sqrt(ex.K * ex.c); xe = xExact(ex.c, ex.K); x = ok ? xa : xe; }
    else x = (ex.n || 1) * ex.c;
    const pH = toPH(acid, x);
    return { x, pH, pOH: 14 - pH, ok, xa, xe, H: Math.pow(10, -pH) };
  }
  /* Aanbevolen aantal decimalen voor de pH: aantal beduidende cijfers van de gegevens */
  function expectedDecimals(ex) {
    const s = [KL.sigFigs(ex.cStr)];
    if (isWeak(ex)) s.push(KL.sigFigs(ex.KStr));
    const v = s.filter(x => x != null);
    return v.length ? Math.min(...v) : 2;
  }

  /* ---------------- Uitwerking in handboekstijl ---------------- */
  function solve(ex, { dec = 2 } = {}) {
    const acid = isAcid(ex), weak = isWeak(ex);
    const Zh = ex.ZH || (ex.Z ? chem(ex.Z) : 'Z'), Bh = ex.BH || (ex.B ? chem(ex.B) : 'B');
    const main = acid ? Zh : Bh, ion = acid ? H3O : OH;
    const sym = acid ? '[Z]<sub>0</sub>' : '[B]<sub>0</sub>';
    const Ks = acid ? 'K<sub>z</sub>' : 'K<sub>b</sub>', Kc = acid ? 'K<sub>b</sub>' : 'K<sub>z</sub>';
    const r = compute(ex), c = ex.c, K = ex.K, cs = fmt(c);
    const notes = [];
    let h = `<div class="sol"><div class="head">UITWERKING</div><div class="body">`;
    let given;
    if (ex.salt) given = `[${ex.salt.formula}] = ${ex.cStr || fmt(ex.salt.cSalt)} mol/l`;
    else given = `[${main}]<sub>0</sub> = ${ex.cStr || cs} mol/l`;
    if (weak) given += ex.conj ? `<br>K${acid ? '<sub>b</sub>' : '<sub>z</sub>'}(${acid ? Bh : Zh}) = ${fmt(ex.Kgiven)}` : `<br>${Ks}(${main}) = ${fmt(K)}`;
    const soort = weak ? (acid ? 'zwak zuur' : 'zwakke base') : (acid ? 'sterk zuur' : 'sterke base');
    h += `<div class="kv"><div class="k">GEGEVEN</div><div>${given}</div><div class="k">GEVRAAGD</div><div>pH</div>
      <div class="k">OPLOSSING</div><div>${ex.salt ? `Het zout dissocieert volledig in water. ` : ''}${main} gedraagt zich als een ${soort} in water.</div></div>`;
    if (ex.salt) {
      const s = ex.salt;
      h += `<div class="step"><h4>Dissociatie</h4><div class="eq">${s.diss.replace('<span class="arrowh2o">→</span>', `<span class="frac" style="font-size:.7em"><span style="border:0">H<sub>2</sub>O</span><span>→</span></span>`)}</div>
        <div class="eq">[${main}]<sub>0</sub> = ${s.count > 1 ? s.count + ' · ' + (ex.cStr || fmt(s.cSalt)) + ' = ' : ''}${cs} mol/l</div></div>`;
    }
    if (ex.conj) {
      h += `<div class="step"><h4>K omrekenen</h4><div class="eq">${Ks}(${main}) = ${frac('K<sub>w</sub>', `${Kc}(${acid ? Bh : Zh})`)} = ${frac('1,00 · 10⁻¹⁴', fmt(ex.Kgiven))} = ${fmt(K)}</div></div>`;
    }
    if (!weak) {
      const n = ex.n || 1;
      const arrow = `<span class="frac" style="font-size:.7em"><span style="border:0">H<sub>2</sub>O</span><span>→</span></span>`;
      let reac = '';
      if (acid) reac = `${ex.Z ? Zh : 'Z'} + ${H2O} → ${ex.B ? Bh : 'B'} + ${H3O}`;
      else if (ex.B && /OH\)?\d*$/.test(ex.B)) { const m = ex.B.replace(/\(OH\)\d*$|OH$/, ''); reac = `${Bh} ${arrow} ${chem(m)}<sup>${n > 1 ? n : ''}+</sup> + ${n > 1 ? n + ' ' : ''}${OH}`; }
      h += `<div class="step"><h4>Protolyse</h4>${reac ? `<div class="eq">${reac}</div>` : ''}
        Een ${soort} reageert volledig${acid ? ' met water' : ''}.
        <div class="eq">[${ion}] = ${n > 1 ? n + ' · ' : ''}${cs} mol/l = ${fmt(r.x)} mol/l</div></div>`;
    } else {
      const r1 = acid ? `${Zh} + ${H2O}${EQ}${Bh} + ${H3O}` : `${Bh} + ${H2O}${EQ}${Zh} + ${OH}`;
      const cols = acid ? [Zh, Bh, H3O] : [Bh, Zh, OH];
      h += `<div class="eq">${r1}</div>`;
      h += `<div class="step"><h4>Stap 1 · Concentraties in functie van x</h4><div class="scroll"><table class="ice">
        <tr><th></th>${cols.map(k => `<th>${k}</th>`).join('')}</tr>
        <tr><td class="l">[ ]<sub>0</sub> (mol/l)</td><td>${cs}</td><td>/</td><td>/</td></tr>
        <tr><td class="l">Δ[ ] (mol/l)</td><td>−x</td><td>+x</td><td>+x</td></tr>
        <tr><td class="l">[ ]<sub>e</sub> (mol/l)</td><td>${cs} − x</td><td>x</td><td>x</td></tr></table></div></div>`;
      const top = acid ? `[${Bh}]<sub>e</sub> · [${H3O}]<sub>e</sub>` : `[${Zh}]<sub>e</sub> · [${OH}]<sub>e</sub>`;
      const ratio = c / K;
      h += `<div class="step"><h4>Stap 2 · Uitdrukking van ${Ks}</h4>
        <div class="eq">${Ks} = ${frac(top, `[${main}]<sub>e</sub>`)} ⇔ ${fmt(K)} = ${frac('x²', `${cs} − x`)}</div>
        <div class="eq">${frac(sym, Ks)} = ${frac(cs, fmt(K))} = ${fmt(ratio)} ${r.ok ? '≥' : '&lt;'} 1000</div>`;
      if (r.ok) {
        h += `<p style="margin:4px 0 0">Aangezien ${frac(sym, Ks)} ≥ 1000 mag je x verwaarlozen ten opzichte van de beginconcentratie: ${cs} − x ≈ ${cs}.</p></div>`;
        h += `<div class="step"><h4>Stap 3 · x berekenen</h4>
          <div class="eq">${Ks} = ${frac('x²', cs)} ⇔ x = √(${Ks} · ${sym}) = √(${fmt(K)} · ${cs})</div>
          <div class="eq">[${ion}]<sub>e</sub> = x = ${fmt(r.x)} mol/l</div></div>`;
        const dev = Math.abs(r.xa - r.xe) / r.xe * 100;
        notes.push(`Controle: met de exacte vierkantsvergelijking is x = ${fmt(r.xe)} mol/l. De vereenvoudiging wijkt ${fix(dev, dev < 1 ? 2 : 1)}% af.`);
      } else {
        const D = K * K + 4 * K * c;
        h += `<p style="margin:4px 0 0">Aangezien ${frac(sym, Ks)} &lt; 1000 kun je geen vereenvoudiging doorvoeren. Je lost de vierkantsvergelijking op.</p></div>`;
        h += `<div class="step"><h4>Stap 3 · x berekenen</h4>
          <div class="eq">x² = ${fmt(K)} · (${cs} − x) ⇔ x² + ${fmt(K)} x − ${fmt(K * c)} = 0</div>
          <div class="eq">D = b² − 4ac = (${fmt(K)})² + 4 · ${fmt(K * c)} = ${fmt(D)}</div>
          <div class="eq">x = ${frac('−b + √D', '2a')} = ${frac(`−${fmt(K)} + √(${fmt(D)})`, '2')} = ${fmt(r.x)}</div>
          <p class="hint" style="margin:0">De tweede oplossing is negatief en heeft geen betekenis.</p>
          <div class="eq">[${ion}]<sub>e</sub> = x = ${fmt(r.x)} mol/l</div></div>`;
        notes.push(`Ter vergelijking: met de (hier niet toegelaten) vereenvoudiging zou x = ${fmt(r.xa)} mol/l zijn, een afwijking van ${fix(Math.abs(r.xa - r.xe) / r.xe * 100, 1)}%.`);
      }
      notes.push(`Protolysegraad: ${fix(r.x / c * 100, r.x / c < 0.01 ? 2 : 1)}% van ${main} heeft gereageerd met water.`);
    }
    h += `<div class="step"><h4>${weak ? 'Stap 4 · ' : ''}pH berekenen</h4>`;
    if (acid) h += `<div class="eq">pH = −log[${H3O}]<sub>e</sub> = −log(${fmt(r.x)}) = ${fix(r.pH, dec)}</div>`;
    else h += `<div class="eq">pOH = −log[${OH}]<sub>e</sub> = −log(${fmt(r.x)}) = ${fix(r.pOH, dec)}</div><div class="eq">pH = 14 − pOH = 14 − ${fix(r.pOH, dec)} = ${fix(14 - r.pOH, dec)}</div>`;
    h += `</div>`;
    if (r.x < 1e-6) notes.unshift('<b>Let op:</b> de concentratie is zo klein dat de protolyse van water zelf (10⁻⁷ mol/l) meetelt. Het stappenplan is hier niet meer nauwkeurig; de echte pH ligt dichter bij 7.');
    h += `</div></div>`;
    h += `<div class="result">
      <div class="big"><div class="lab">pH</div><div class="val">${fix(r.pH, dec)}</div></div>
      <div class="big"><div class="lab">pOH</div><div class="val">${fix(r.pOH, dec)}</div></div>
      <div class="big"><div class="lab">[${H3O}]</div><div class="val" style="font-size:1.1rem;padding-top:6px">${fmt(r.H)} mol/l</div></div></div>`;
    const pos = Math.min(100, Math.max(0, r.pH / 14 * 100));
    h += `<div class="scale"><div class="mark" style="left:${pos}%"></div></div><div class="scale-l"><span>0 · zuur</span><span>7 · neutraal</span><span>basisch · 14</span></div>`;
    h += notes.map(n => `<div class="msg info">${n}</div>`).join('');
    return h;
  }

  /* ---------------- Denkfouten ---------------- */
  function variants(ex) {
    const acid = isAcid(ex), weak = isWeak(ex), c = ex.c, K = ex.K, n = ex.n || 1;
    const r = compute(ex);
    const L = [{ id: 'ok', name: 'Juist antwoord', desc: 'Correcte uitwerking.', pH: r.pH, step: null }];
    const add = (id, name, desc, pH, step) => { if (isFinite(pH)) L.push({ id, name, desc, pH, step }); };
    const so = acid ? 'zuur' : 'base';
    if (!acid) add('poh', 'pOH gegeven als pH', 'De leerling berekent de pOH maar vergeet pH = 14 − pOH.', r.pOH, 'pH');
    if (weak) {
      add('sterk', `Behandeld als sterk${acid ? ' zuur' : 'e base'}`, `Volledige protolyse verondersteld: x = [${acid ? 'Z' : 'B'}]<sub>0</sub>.`, toPH(acid, c), 'x');
      if (!r.ok) add('verw', 'Onterecht vereenvoudigd', 'x verwaarloosd terwijl [ ]<sub>0</sub>/K &lt; 1000.', toPH(acid, r.xa), 'x');
      add('kc', 'Wortel vergeten', 'x² = K · c opgelost als x = K · c.', toPH(acid, K * c), 'x');
      if (ex.conj) add('conj', 'K niet omgerekend', `De gegeven K van het geconjugeerde deeltje rechtstreeks gebruikt.`, toPH(acid, xBook(c, ex.Kgiven)), 'K');
      else add('kzkb', 'K<sub>z</sub> en K<sub>b</sub> verwisseld', 'Met K<sub>w</sub>/K gerekend in plaats van met K.', toPH(acid, xBook(c, KW / K)), 'K');
      add('pk', acid ? 'pH = pK<sub>z</sub>' : 'pOH = pK<sub>b</sub>', 'De bufferformule toegepast terwijl er geen buffer is.', acid ? -log(K) : 14 + log(K), 'x');
      if (!acid) add('sterk_poh', 'Als sterke base én pOH gegeven', 'x = [B]<sub>0</sub> en de pOH als antwoord.', -log(c), 'x');
      if (!acid) add('verkeerdK', 'Als zuur gerekend', `De base berekend alsof het een zuur is: pH = −log x.`, -log(r.x), 'type');
    } else {
      if (n > 1) {
        add('n', `Factor ${n} vergeten`, `Per formule eenheid komen ${n} ${acid ? 'H₃O⁺' : 'OH⁻'} ionen vrij.`, toPH(acid, c), 'x');
        add('ndiv', `Gedeeld door ${n}`, `Gedeeld door ${n} in plaats van vermenigvuldigd.`, toPH(acid, c / n), 'x');
      }
    }
    if (acid) add('base', 'Als base behandeld', 'pH = 14 − (−log x) gerekend, alsof het een base is.', 14 + log(r.x), 'type');
    if (ex.salt && ex.salt.count > 1) add('count', 'Aantal ionen vergeten', `Per formule eenheid ontstaan ${ex.salt.count} actieve ionen.`, toPH(acid, weak ? xBook(c / ex.salt.count, K) : c / ex.salt.count), 'x');
    add('ln', 'ln in plaats van log', 'Natuurlijke logaritme gebruikt.', acid ? -Math.log(r.x) : 14 + Math.log(r.x), 'pH');
    add('min', 'Minteken vergeten', 'pH = log x in plaats van −log x.', acid ? log(r.x) : 14 - log(r.x), 'pH');
    return L.map(v => ({ ...v, real: v.pH >= 0 && v.pH <= 14 }));
  }
  /* Een leerlingantwoord verklaren */
  function diagnose(ex, str) {
    const p = KL.parseNum(str);
    if (!isFinite(p)) return null;
    const d = KL.decimalsOf(str);
    const tol = 0.5 * Math.pow(10, -d) + 0.011;
    const V = variants(ex);
    const hits = V.map(v => ({ ...v, diff: Math.abs(v.pH - p) })).filter(v => v.diff <= tol).sort((a, b) => a.diff - b.diff);
    return { p, d, hits, correct: hits.some(h => h.id === 'ok'), expected: expectedDecimals(ex), ok: V[0] };
  }

  /* ---------------- Meerkeuzevraag ---------------- */
  function buildMC(ex, r, dec = 2) {
    const V = variants(ex), ok = V[0];
    const round = v => Math.round(v * Math.pow(10, dec)) / Math.pow(10, dec);
    const chosen = [ok], gap = Math.max(0.15, 1.5 * Math.pow(10, -dec));
    const far = v => chosen.every(c => Math.abs(round(c.pH) - round(v.pH)) >= gap);
    for (const v of V.slice(1)) { if (chosen.length >= 4) break; if (v.real && far(v)) chosen.push(v); }
    let tries = 0;
    while (chosen.length < 4 && tries++ < 200) {
      const v = { id: 'gok', name: 'Geen bekende denkfout', desc: 'Opvulantwoord: geen typische fout leidt hiertoe.', pH: Math.min(13.9, Math.max(0.1, ok.pH + (r() < .5 ? -1 : 1) * (0.4 + r() * 2))), real: true };
      if (far(v)) chosen.push(v);
    }
    const opts = KL.shuffle(r, chosen).map(v => ({ ...v, txt: fix(v.pH, dec) }));
    return { opts, letter: 'ABCD'[opts.findIndex(o => o.id === 'ok')], all: V };
  }

  /* ---------------- Oefeningengenerator ---------------- */
  const MANT = [1.00, 2.00, 2.50, 5.00, 1.50, 4.00, 3.00, 8.00, 1.20, 6.00, 7.50];
  function genConc(r, exps) { const m = pick(r, MANT), e = pick(r, exps); const v = m * Math.pow(10, e); return { v, s: fmt(v, 3) }; }
  const SALT_COMBOS = (() => {
    const L = [];
    /* Enkel zouten die echt bestaan en goed oplossen: basische anionen met Na en K; zure kationen met Cl, Br, NO3, SO4 */
    const okCat = ['Na^+', 'K^+'], okAn = ['Cl^-', 'Br^-', 'NO3^-', 'SO4^2-'];
    CATIONS.forEach((c, ci) => ANIONS.forEach((a, ai) => {
      const s = evalSalt(ci, ai);
      if (!s.exBase) return;
      if (s.kind === 'zb' && !okCat.includes(c.f)) return;
      if (s.kind === 'zz' && !okAn.includes(a.f)) return;
      L.push([ci, ai]);
    }));
    return L;
  })();
  function questionHtml(ex) {
    const acid = isAcid(ex);
    if (ex.salt) {
      const s = ex.salt;
      return `Bereken de pH van een oplossing van ${ex.cStr} mol/l ${s.name} (${s.formula}). Gegeven: ${ex.Klabel} = ${fmt(ex.K, 2)}.`;
    }
    const f = acid ? chem(ex.Z) : chem(ex.B);
    let q = `Bereken de pH van een oplossing van ${ex.cStr} mol/l ${ex.name} (${f}).`;
    if (isWeak(ex)) {
      if (ex.conj) q += ` Gegeven: K${acid ? '<sub>b</sub>' : '<sub>z</sub>'}(${acid ? chem(ex.B) : chem(ex.Z)}) = ${fmt(ex.Kgiven, 2)}.`;
      else q += ` Gegeven: K${acid ? '<sub>z</sub>' : '<sub>b</sub>'}(${f}) = ${fmt(ex.K, 2)}.`;
    }
    return q;
  }
  /* opts: {types:[...], rule:'mix'|'ja'|'nee', conj:bool} */
  function generate(r, opts) {
    const types = opts.types && opts.types.length ? opts.types : ['zz', 'zb', 'sz', 'sb', 'zout'];
    for (let attempt = 0; attempt < 400; attempt++) {
      const t = pick(r, types);
      let ex;
      if (t === 'sz') { const s = pick(r, STRONG_ACIDS), c = genConc(r, [-1, -2, -3]); ex = { kind: 'sz', ...s, c: c.v, cStr: c.s, n: 1 }; }
      else if (t === 'sb') { const s = pick(r, STRONG_BASES), c = genConc(r, [-1, -2, -3]); ex = { kind: 'sb', ...s, c: c.v, cStr: c.s, n: s.n }; }
      else if (t === 'zz' || t === 'zb') {
        const s = pick(r, t === 'zz' ? WEAK_ACIDS : WEAK_BASES), c = genConc(r, [-1, -2, -3, -4]);
        ex = { kind: t, ...s, c: c.v, cStr: c.s, KStr: KL.fmtIn(s.K), n: 1 };
        if (opts.conj && r() < 0.5) { ex.conj = true; ex.Kgiven = KW / s.K; ex.KStr = KL.fmtIn(ex.Kgiven); }
      } else {
        const [ci, ai] = pick(r, SALT_COMBOS), c = genConc(r, [-1, -2]);
        ex = saltExercise(ci, ai, c.v, c.s);
      }
      if (!ex) continue;
      if (isWeak(ex) && opts.rule && opts.rule !== 'mix') {
        const ok = ex.c / ex.K >= 1000;
        if ((opts.rule === 'ja') !== ok) continue;
      }
      const res = compute(ex);
      if (res.x < 1e-6) continue;
      ex.q = questionHtml(ex);
      ex.type = t;
      return ex;
    }
    return null;
  }

  /* Puntenverdeling: stappen per soort oefening */
  function stepsFor(ex) {
    const s = [];
    if (ex.salt) s.push('Dissociatie en gedrag van de ionen');
    if (ex.conj) s.push('K omrekenen met K<sub>w</sub>');
    if (isWeak(ex)) s.push('Protolysereactie en tabel (stap 1)', `Uitdrukking van K en regel van 1000 (stap 2)`, 'x berekenen (stap 3)', 'pH berekenen (stap 4)');
    else s.push('Volledige protolyse', `[${isAcid(ex) ? 'H₃O⁺' : 'OH⁻'}] berekenen`, 'pH berekenen');
    return s;
  }

  /* Exacte pH met water erbij (voor grafieken) */
  function exactAcidPH(c, K) {
    if (K === Infinity) return -log((c + Math.sqrt(c * c + 4 * KW)) / 2);
    const h = KL.bisect(h => h - (K * c / (K + h)) - KW / h, 1e-14, 10);
    return -log(h);
  }

  window.PH = { WEAK_ACIDS, WEAK_BASES, STRONG_ACIDS, STRONG_BASES, CATIONS, ANIONS, SALT_COMBOS, evalSalt, saltExercise, hydForms, baseOf,
    compute, solve, variants, diagnose, buildMC, generate, questionHtml, stepsFor, expectedDecimals, isAcid, isWeak, exactAcidPH, xBook };
})();
