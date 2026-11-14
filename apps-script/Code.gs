/**
 * Klaslab · databank (Google Apps Script + Google Sheet)
 *
 * Installatie: zie apps-script/README.md
 * Tabbladen worden automatisch aangemaakt:
 *   Profielen  : code | profiel (JSON) | naam | laatst bijgewerkt
 *   Aanvragen  : datum | titel | beschrijving | tool | naam | e-mail | code | status
 */

const TAB_PROFILES = 'Profielen';
const TAB_REQUESTS = 'Aanvragen';
const CODE_RE = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const MAX_PROFILE = 20000; // tekens

function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === 'get') return out(getProfile(p.code));
    return out({ ok: true, app: 'klaslab' });
  } catch (err) {
    return out({ ok: false, error: String(err.message || err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action === 'save') return out(saveProfile(body.code, body.profile));
    if (body.action === 'request') return out(addRequest(body));
    return out({ ok: false, error: 'onbekende actie' });
  } catch (err) {
    return out({ ok: false, error: String(err.message || err) });
  }
}

/* Profielen ---------------------------------------------------------- */
function getProfile(code) {
  code = cleanCode(code);
  const sh = tab(TAB_PROFILES, ['code', 'profiel', 'naam', 'laatst bijgewerkt']);
  const row = findRow(sh, code);
  if (!row) return { ok: true, found: false };
  const v = sh.getRange(row, 1, 1, 4).getValues()[0];
  return { ok: true, found: true, profile: JSON.parse(v[1] || '{}'), updated: v[3] };
}

function saveProfile(code, profile) {
  code = cleanCode(code);
  const json = JSON.stringify(profile || {});
  if (json.length > MAX_PROFILE) throw new Error('profiel te groot');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = tab(TAB_PROFILES, ['code', 'profiel', 'naam', 'laatst bijgewerkt']);
    const now = new Date();
    const vals = [[code, json, String((profile && profile.name) || '').slice(0, 100), now]];
    const row = findRow(sh, code);
    if (row) sh.getRange(row, 1, 1, 4).setValues(vals);
    else sh.appendRow(vals[0]);
    return { ok: true, updated: now };
  } finally {
    lock.releaseLock();
  }
}

/* Aanvragen ---------------------------------------------------------- */
function addRequest(b) {
  const title = clip(b.title, 200);
  const desc = clip(b.description, 4000);
  if (!title && !desc) throw new Error('lege aanvraag');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = tab(TAB_REQUESTS, ['datum', 'titel', 'beschrijving', 'tool', 'naam', 'e-mail', 'code', 'status']);
    sh.appendRow([new Date(), title, desc, clip(b.tool, 200), clip(b.name, 100), clip(b.email, 200),
      b.code && CODE_RE.test(b.code) ? b.code : '', 'nieuw']);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

/* Hulpfuncties ------------------------------------------------------- */
function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function cleanCode(code) {
  code = String(code || '').trim().toUpperCase();
  if (!CODE_RE.test(code)) throw new Error('ongeldige code');
  return code;
}
function clip(s, n) {
  // Een cel die met = + - @ begint, zou als formule gelezen worden.
  s = String(s == null ? '' : s).slice(0, n);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function tab(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sh;
}
function findRow(sh, code) {
  const last = sh.getLastRow();
  if (last < 2) return 0;
  const codes = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < codes.length; i++) if (codes[i][0] === code) return i + 2;
  return 0;
}
