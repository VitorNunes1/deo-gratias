/*
 * Deo Gratias — gera js/data/chants.js a partir de arquivos .gabc do GregoBase
 * (https://gregobase.selapa.net), edições Vaticanas (Graduale Romanum 1961 /
 * Liber Usualis 1961). Os arquivos são lidos apenas como texto.
 *
 * Uso: node tools/build-chants.js <pasta com ID.gabc> [--list]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2];
const LIST = process.argv.includes('--list');

// Ordinários do Kyriale (IDs do GregoBase, conforme o projeto jgabc)
const KYRIALE = {
  I:     { name: 'Missa I — Lux et origo (Tempo Pascal)', kyrie: 1143, gloria: 2980, sanctus: 300, agnus: 2977, ite: 2987, iteAll: 2988 },
  II:    { name: 'Missa II — Kyrie fons bonitatis (festas de I classe)', kyrie: 309, gloria: 862, sanctus: 1279, agnus: 555, ite: 804 },
  IV:    { name: 'Missa IV — Cunctipotens Genitor Deus (festas dos Apóstolos)', kyrie: 1061, gloria: 2978, sanctus: 2518, agnus: 264, ite: 353 },
  VIII:  { name: 'Missa VIII — De Angelis', kyrie: 1184, gloria: 961, sanctus: 1384, agnus: 2760, ite: 832 },
  IX:    { name: 'Missa IX — Cum jubilo (festas de Nossa Senhora)', kyrie: 2976, gloria: 2771, sanctus: 587, agnus: 707, ite: 2989 },
  XI:    { name: 'Missa XI — Orbis factor (domingos do ano)', kyrie: 2982, gloria: 303, sanctus: 1106, agnus: 1243, ite: 856 },
  XVII:  { name: 'Missa XVII — Domingos do Advento e da Quaresma', kyrie: 272, sanctus: 871, agnus: 1137, ite: 620 },
  DEF:   { name: 'Missa pro defunctis', kyrie: 541, sanctus: 298, agnus: 2118, ite: 823 },
};
const CREDO = { I: 344, III: 749 };
// tons do celebrante: diálogo do Prefácio (GR 1961), tom do Evangelho (GR 1961), Pater noster solene (melodia tradicional; transcrição do GR 1974)
const TONES = { praefSollemnis: 7674, praefFerialis: 7675, evangelium: 4490, praeceptis: 16070, paterNoster: 3326 };
const MISC = { asperges: 497, vidiaquam: 958, salve: 2715, salveSimplex: 2435, reginaCaeli: 1976, aveVerum: 2441, adoroTe: 3020,
  almaRedemptoris: 2238, aveRegina: 2602, tantumErgo: 2176, rorate: 2719, veniSancteHymn: 2813 };

// Próprios cantados de cada celebração: intróito, gradual, aleluia/trato, sequência, ofertório, comunhão
const PROPRIA = {
  adv1:   { in: 132, gr: 1169, al: 1115, of: 962, co: 1036, kyriale: 'XVII' },
  adv3:   { in: 1225, gr: 1007, al: 855, of: 113, co: 218, kyriale: 'XVII' },
  immac:  { in: 622, gr: 713, al: 1057, of: 210, co: 1004, kyriale: 'IX', credo: 'III' },
  nat1:   { in: 1175, gr: 518, al: 890, of: 811, co: 117, kyriale: 'II', credo: 'III' },
  nat3:   { in: 72, gr: 1163, al: 324, of: 1274, co: 1139, kyriale: 'II', credo: 'III' },
  epi:    { in: 403, gr: 205, al: 524, of: 1147, co: 918, kyriale: 'II', credo: 'III' },
  septua: { in: 1168, gr: 222, tr: 926, of: 1194, co: 640, kyriale: 'XVII', credo: 'I' },
  quad1:  { in: 327, gr: 834, tr: 889, of: 294, co: 1100, kyriale: 'XVII', credo: 'I' },
  laetare:{ in: 653, gr: 1011, tr: 1377, of: 899, co: 1353, kyriale: 'XVII', credo: 'I' },
  joseph: { in: 108, gr: 600, tr: 7670, of: 630, co: 139, kyriale: 'II', credo: 'III' },
  passio: { in: 78, gr: 760, tr: 742, of: 318, co: 726, kyriale: 'XVII', credo: 'I' },
  hebd2:  { in: 226, gr: 783, tr: 425, of: 411, co: 196, kyriale: 'XVII' },
  pascha: { in: 1043, gr: 1075, al: 761, seq: 1086, of: 725, co: 952, kyriale: 'I', credo: 'I' },
  asc:    { in: 1355, al: 17, al2: 57, of: 211, co: 263, kyriale: 'I', credo: 'III' },
  pent:   { in: 861, al: 99, al2: 181, seq: 68, of: 361, co: 1041, kyriale: 'I', credo: 'III' },
  trin:   { in: 349, gr: 965, al: 1289, of: 1303, co: 391, kyriale: 'II', credo: 'III' },
  corpus: { in: 715, gr: 1230, al: 774, seq: 308, of: 645, co: 577, kyriale: 'II', credo: 'III' },
  cor:    { in: 1320, gr: 1035, al: 907, of: 628, co: 1356, kyriale: 'II', credo: 'III' },
  pent4:  { in: 874, gr: 332, al: 727, of: 708, co: 512, kyriale: 'XI', credo: 'I' },
  petrus: { in: 478, gr: 307, al: 228, of: 1319, co: 509, kyriale: 'IV', credo: 'III' },
  assumpt:{ in: 23, gr: 1000, al: 960, of: 1083, co: 286, kyriale: 'IX', credo: 'III' },
  rex:    { in: 128, gr: 583, al: 746, of: 390, co: 1229, kyriale: 'II', credo: 'III' },
  omnes:  { in: 752, gr: 371, al: 1237, of: 835, co: 345, kyriale: 'II', credo: 'III' },
  defuncti:{ in: 766, gr: 1261, tr: 338, seq: 1198, of: 1199, co: 241, kyriale: 'DEF' },
  greg:   { in: 456, gr: 235, al: 477, of: 779, co: 1008, kyriale: 'VIII' },
  caecilia:{ in: 510, gr: 840, al: 301, of: 1107, co: 1032, kyriale: 'VIII' },
  pent24: { in: 735, gr: 395, al: 331, of: 986, co: 592, kyriale: 'XI', credo: 'I' },
};

function readGabc(id) {
  const fp = path.join(DIR, id + '.gabc');
  if (!fs.existsSync(fp)) return null;
  const raw = fs.readFileSync(fp, 'utf8').replace(/\r/g, '');
  const i = raw.indexOf('%%');
  if (i < 0) return null;
  const head = raw.slice(0, i);
  const body = raw.slice(i + 2).trim();
  const h = {};
  for (const line of head.split('\n')) {
    const m = line.match(/^([a-z-]+):(.*?);?\s*$/i);
    if (m) h[m[1].toLowerCase()] = m[2].trim();
  }
  // corpo: remove comentários (%...) e normaliza espaços
  const clean = body.split('\n').map(l => l.replace(/(^|[^\\])%.*$/, '$1')).join(' ').replace(/\s+/g, ' ').trim();
  return { id, name: h.name || '', part: h['office-part'] || '', mode: h.mode || '', book: h.book || '', gabc: clean };
}

const ids = new Set();
const addIds = o => { for (const v of Object.values(o)) if (typeof v === 'number') ids.add(v); };
Object.values(KYRIALE).forEach(addIds); addIds(CREDO); addIds(TONES); addIds(MISC); Object.values(PROPRIA).forEach(addIds);

const scores = {};
const missing = [];
for (const id of ids) {
  const g = readGabc(id);
  if (!g || !g.gabc) { missing.push(id); continue; }
  scores[id] = g;
}
if (LIST) {
  for (const id of [...ids].sort((a, b) => a - b)) {
    const s = scores[id];
    console.log(id, '|', s ? s.name + ' | ' + s.part + ' | modo ' + s.mode + ' | ' + s.gabc.length : 'AUSENTE');
  }
}
const out = { _fonte: 'GregoBase (gregobase.selapa.net) — edição Vaticana; mapeamento segundo o projeto jgabc (B. Bloomfield).', kyriale: KYRIALE, credo: CREDO, tones: TONES, misc: MISC, propria: PROPRIA, scores };
const js = '/* Gerado por tools/build-chants.js. ' + out._fonte + ' */\n(function(DG){ DG.data = DG.data || {}; DG.data.chants = ' + JSON.stringify(out) + '; })(window.DG = window.DG || {});\n';
fs.writeFileSync(path.join(__dirname, '..', 'js', 'data', 'chants.js'), js);
console.log('Partituras:', Object.keys(scores).length, 'ausentes:', missing.join(',') || 'nenhuma', '—', (js.length / 1024).toFixed(0) + ' KB');
