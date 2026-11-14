/* Zuur base indicatoren: omslaggebied en kleuren (waarden kunnen per bron licht verschillen) */
window.INDICATORS = [
  { n: 'thymolblauw (zuur gebied)', lo: 1.2, hi: 2.8, ca: '#e63946', cb: '#f4d35e', na: 'rood', nb: 'geel' },
  { n: 'methyloranje', lo: 3.1, hi: 4.4, ca: '#e63946', cb: '#f4b942', na: 'rood', nb: 'oranjegeel' },
  { n: 'broomfenolblauw', lo: 3.0, hi: 4.6, ca: '#f4d35e', cb: '#4361ee', na: 'geel', nb: 'blauw' },
  { n: 'broomkresolgroen', lo: 3.8, hi: 5.4, ca: '#f4d35e', cb: '#3a86ff', na: 'geel', nb: 'blauw' },
  { n: 'methylrood', lo: 4.4, hi: 6.2, ca: '#e63946', cb: '#f4d35e', na: 'rood', nb: 'geel' },
  { n: 'lakmoes', lo: 5.0, hi: 8.0, ca: '#d62839', cb: '#3a56d4', na: 'rood', nb: 'blauw' },
  { n: 'broomthymolblauw', lo: 6.0, hi: 7.6, ca: '#f4d35e', cb: '#2667ff', na: 'geel', nb: 'blauw' },
  { n: 'fenolrood', lo: 6.8, hi: 8.4, ca: '#f4d35e', cb: '#e5383b', na: 'geel', nb: 'rood' },
  { n: 'thymolblauw (basisch gebied)', lo: 8.0, hi: 9.6, ca: '#f4d35e', cb: '#4361ee', na: 'geel', nb: 'blauw' },
  { n: 'fenolftaleïne', lo: 8.2, hi: 10.0, ca: '#f8f9fa', cb: '#e0399e', na: 'kleurloos', nb: 'roze' },
  { n: 'alizarinegeel', lo: 10.1, hi: 12.0, ca: '#f4d35e', cb: '#d1495b', na: 'geel', nb: 'rood' },
];
/* Kleur bij een gegeven pH (lineaire menging binnen het omslaggebied) */
window.indColor = function (I, pH) {
  const t = Math.max(0, Math.min(1, (pH - I.lo) / (I.hi - I.lo)));
  const h = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
  const a = h(I.ca), b = h(I.cb);
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
};
window.indName = function (I, pH) {
  if (pH <= I.lo) return I.na;
  if (pH >= I.hi) return I.nb;
  return `mengkleur (${I.na}/${I.nb})`;
};
