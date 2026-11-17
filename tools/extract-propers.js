/*
 * Deo Gratias — gera js/data/propers.js a partir do Divinum Officium.
 *
 * Uso:
 *   git clone --depth 1 --filter=blob:none --sparse https://github.com/DivinumOfficium/divinum-officium.git do
 *   cd do && git sparse-checkout set web/www/missa/Latin web/www/missa/Portugues \
 *        web/www/horas/Latin/Commune web/www/horas/Portugues/Commune
 *   node tools/extract-propers.js <caminho>/do/web/www
 *
 * As regras de 1962 (Glória, Credo, Prefácio, Communicantes, Último Evangelho,
 * cor litúrgica, classe) são definidas abaixo, celebração por celebração,
 * conforme o Codex Rubricarum (1960) e o Missal de 1962 — não são deduzidas
 * automaticamente do DO, que contém várias versões das rubricas.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { DOReader, toBlocks } = require('./do-parser');
const { toBR } = require('./pt-br');

const ROOT = process.argv[2];
if (!ROOT) { console.error('Informe o caminho para .../web/www'); process.exit(1); }
const OUT = path.join(__dirname, '..', 'js', 'data', 'propers.js');
const R = new DOReader(ROOT);

// Campos: id, file, la (título latino), pt (título), color, classis, tempus,
// date (regra de data para o calendário), gloria, credo, praef, comm, hanc,
// ultimaEv, ite, ps42, gloriaPatri, requiem, sequentia, gradualeSec, notes
const CELEBRATIONS = [
  { id: 'adv1', file: 'Tempora/Adv1-0', la: 'Dominica I Adventus', pt: 'I Domingo do Advento',
    color: 'violaceus', classis: 1, tempus: 'adventus', date: 'adv1', gloria: false, credo: true, praef: 'Trinitate',
    notes: ['No Advento não se diz o Glória.', 'Domingo sem prefácio próprio: em 1962 diz-se o Prefácio da Santíssima Trindade.'] },
  { id: 'adv3', file: 'Tempora/Adv3-0', la: 'Dominica III Adventus (Gaudete)', pt: 'III Domingo do Advento — Gaudete',
    color: 'rosaceus', classis: 1, tempus: 'adventus', date: 'adv3', gloria: false, credo: true, praef: 'Trinitate',
    notes: ['Domingo Gaudete: podem usar-se paramentos de cor rosácea, sinal de alegria no meio da penitência.'] },
  { id: 'immac', file: 'Sancti/12-08', la: 'In Conceptione Immaculata B. Mariæ Virginis', pt: 'Imaculada Conceição da Bem-aventurada Virgem Maria',
    color: 'albus', classis: 1, tempus: 'adventus', date: '12-08', gloria: true, credo: true, praef: 'Maria', praefIns: { la: 'Conceptióne immaculáta', pt: 'Imaculada Conceição' },
    gradualeSec: 'Graduale',
    notes: ['Festa de I classe: Glória e Credo.', 'Prefácio de Nossa Senhora com a inserção “Et te in Conceptione immaculata”.'] },
  { id: 'nat1', file: 'Sancti/12-25m1', la: 'In Nativitate Domini — Ad Missam in nocte', pt: 'Natal do Senhor — Missa da Noite',
    color: 'albus', classis: 1, tempus: 'nativitatis', date: '12-25', gloria: true, credo: true, praef: 'Nat', comm: 'Nat',
    notes: ['No Credo, às palavras “Et incarnatus est”, na Missa do Natal o celebrante ajoelha-se (genuflexão prolongada).', 'Communicantes próprio do Natal.'] },
  { id: 'nat3', file: 'Sancti/12-25m3', la: 'In Nativitate Domini — Ad tertiam Missam in die', pt: 'Natal do Senhor — Missa do Dia',
    color: 'albus', classis: 1, tempus: 'nativitatis', date: '12-25', gloria: true, credo: true, praef: 'Nat', comm: 'Nat', ultimaEv: false,
    notes: ['O Evangelho desta Missa é o prólogo de São João; por isso, segundo as rubricas de 1960 (n. 509), omite-se o Último Evangelho.', 'Ao “Et Verbum caro factum est” do Evangelho, todos genuflectem.'] },
  { id: 'epi', file: 'Sancti/01-06', la: 'In Epiphania Domini', pt: 'Epifania do Senhor',
    color: 'albus', classis: 1, tempus: 'epiphaniae', date: '01-06', gloria: true, credo: true, praef: 'Epi', comm: 'Epi',
    genuflectGospel: 'procidéntes adoravérunt eum',
    notes: ['No Evangelho, às palavras “et procidentes adoraverunt eum”, o celebrante e todos genuflectem.', 'Communicantes próprio da Epifania.'] },
  { id: 'septua', file: 'Tempora/Quadp1-0', la: 'Dominica in Septuagesima', pt: 'Domingo da Septuagésima',
    color: 'violaceus', classis: 2, tempus: 'septuagesimae', date: 'septua', gloria: false, credo: true, praef: 'Trinitate',
    notes: ['A partir da Septuagésima cessa o Aleluia; após o Gradual diz-se o Trato.', 'Não se diz o Glória.'] },
  { id: 'quad1', file: 'Tempora/Quad1-0', la: 'Dominica I in Quadragesima', pt: 'I Domingo da Quaresma',
    color: 'violaceus', classis: 1, tempus: 'quadragesimae', date: 'quad1', gloria: false, credo: true, praef: 'Quad',
    notes: ['Prefácio da Quaresma.', 'O Trato “Qui habitat” (Salmo 90) é dos mais longos do Missal.'] },
  { id: 'laetare', file: 'Tempora/Quad4-0', la: 'Dominica IV in Quadragesima (Lætare)', pt: 'IV Domingo da Quaresma — Lætare',
    color: 'rosaceus', classis: 1, tempus: 'quadragesimae', date: 'quad4', gloria: false, credo: true, praef: 'Quad',
    notes: ['Domingo Lætare: permite-se a cor rosácea.'] },
  { id: 'joseph', file: 'Sancti/03-19', la: 'S. Joseph Sponsi B.M.V. Confessoris', pt: 'São José, Esposo da Bem-aventurada Virgem Maria',
    color: 'albus', classis: 1, tempus: 'quadragesimae', date: '03-19', gloria: true, credo: true, praef: 'Joseph', praefIns: { la: 'Festivitáte', pt: 'Festividade' },
    notes: ['Festa de I classe, mesmo na Quaresma: Glória e Credo, Prefácio de São José.'] },
  { id: 'passio', file: 'Tempora/Quad5-0', la: 'Dominica I Passionis', pt: 'I Domingo da Paixão',
    color: 'violaceus', classis: 1, tempus: 'passionis', date: 'quad5', gloria: false, credo: true, praef: 'Quad5', ps42: false, gloriaPatri: false,
    notes: ['No Tempo da Paixão omite-se o Salmo 42 (Judica me) ao pé do altar.', 'Omite-se o “Gloria Patri” no Intróito e no Lavabo.', 'Prefácio da Santa Cruz.', 'As cruzes e imagens estão veladas de roxo.'] },
  { id: 'hebd2', file: 'Tempora/Quad6-1', la: 'Feria II Hebdomadæ Sanctæ', pt: 'Segunda-feira Santa',
    color: 'violaceus', classis: 1, tempus: 'passionis', date: 'hebd2', gloria: false, credo: false, praef: 'Quad5', ps42: false, gloriaPatri: false, superPopulum: true,
    notes: ['Féria de I classe da Semana Santa.', 'Após a Postcomunhão diz-se a “Oração sobre o povo”, precedida de “Humiliáte cápita vestra Deo”.', 'Sem Credo; omite-se o Salmo 42 e o “Gloria Patri”.'] },
  { id: 'pascha', file: 'Tempora/Pasc0-0', la: 'Dominica Resurrectionis', pt: 'Domingo da Ressurreição — Páscoa',
    color: 'albus', classis: 1, tempus: 'paschale', date: 'pascha', gloria: true, credo: true, praef: 'Pasch', praefDie: true, comm: 'Pasc', hanc: 'Pasc', ite: 'iteAlleluia', sequentia: true,
    notes: ['Sequência “Victimæ paschali laudes”.', 'Communicantes e Hanc igitur próprios da Páscoa.', 'Na oitava da Páscoa acrescenta-se “allelúja, allelúja” ao “Ite, missa est” e ao “Deo grátias”.'] },
  { id: 'asc', file: 'Tempora/Pasc5-4', la: 'In Ascensione Domini', pt: 'Ascensão do Senhor',
    color: 'albus', classis: 1, tempus: 'paschale', date: 'asc', gloria: true, credo: true, praef: 'Asc', comm: 'Asc',
    notes: ['Após o Evangelho apaga-se o círio pascal.', 'Communicantes próprio da Ascensão.'] },
  { id: 'pent', file: 'Tempora/Pasc7-0', la: 'Dominica Pentecostes', pt: 'Domingo de Pentecostes',
    color: 'ruber', classis: 1, tempus: 'paschale', date: 'pent', gloria: true, credo: true, praef: 'Spiritu', comm: 'Pent', hanc: 'Pasc', sequentia: true,
    kneelAlleluia: 'Veni, Sancte Spíritus',
    notes: ['Ao versículo do Aleluia “Veni, Sancte Spiritus” o celebrante genuflecte.', 'Sequência “Veni, Sancte Spiritus”.', 'Communicantes e Hanc igitur próprios de Pentecostes.'] },
  { id: 'trin', file: 'Tempora/Pent01-0', la: 'Dominica Sanctissimæ Trinitatis', pt: 'Santíssima Trindade',
    color: 'albus', classis: 1, tempus: 'postpent', date: 'trin', gloria: true, credo: true, praef: 'Trinitate',
    notes: ['Festa de I classe; Prefácio da Santíssima Trindade.'] },
  { id: 'corpus', file: 'Tempora/Pent01-4', la: 'Festum Sanctissimi Corporis Christi', pt: 'Corpus Christi — Santíssimo Corpo de Cristo',
    color: 'albus', classis: 1, tempus: 'postpent', date: 'corpus', gloria: true, credo: true, praef: 'Communis', sequentia: true,
    notes: ['Sequência “Lauda Sion”, de Santo Tomás de Aquino.', 'Pelas rubricas de 1960 o Prefácio do Natal deixou de ser próprio desta festa: diz-se o Prefácio comum (O’Connell, The Celebration of Mass, 1964, p. 118-119).'] },
  { id: 'cor', file: 'Tempora/Pent02-5', la: 'Sacratissimi Cordis D.N. Jesu Christi', pt: 'Sacratíssimo Coração de Jesus',
    color: 'albus', classis: 1, tempus: 'postpent', date: 'cor', gloria: true, credo: true, praef: 'Cord',
    notes: ['Prefácio do Sagrado Coração.'] },
  { id: 'pent4', file: 'Tempora/Pent04-0', la: 'Dominica IV post Pentecosten', pt: 'IV Domingo depois de Pentecostes',
    color: 'viridis', classis: 2, tempus: 'postpent', date: 'pent4', gloria: true, credo: true, praef: 'Trinitate',
    notes: ['Domingo de II classe do Tempo depois de Pentecostes: cor verde, Prefácio da Santíssima Trindade.'] },
  { id: 'petrus', file: 'Sancti/06-29', la: 'Ss. Apostolorum Petri et Pauli', pt: 'São Pedro e São Paulo, Apóstolos',
    color: 'ruber', classis: 1, tempus: 'postpent', date: '06-29', gloria: true, credo: true, praef: 'Apostolis',
    notes: ['Festa de I classe; cor vermelha dos mártires; Prefácio dos Apóstolos.'] },
  { id: 'assumpt', file: 'Sancti/08-15', la: 'In Assumptione B. Mariæ Virginis', pt: 'Assunção da Bem-aventurada Virgem Maria',
    color: 'albus', classis: 1, tempus: 'postpent', date: '08-15', gloria: true, credo: true, praef: 'Maria', praefIns: { la: 'Assumptióne', pt: 'Assunção' },
    notes: ['Missa “Signum magnum”, promulgada por Pio XII em 1950 com o dogma da Assunção.'] },
  { id: 'rex', file: 'Sancti/10-DU', la: 'D.N. Jesu Christi Regis', pt: 'Nosso Senhor Jesus Cristo Rei',
    color: 'albus', classis: 1, tempus: 'postpent', date: 'rex', gloria: true, credo: true, praef: 'Regis',
    notes: ['Último domingo de outubro. Prefácio de Cristo Rei.'] },
  { id: 'omnes', file: 'Sancti/11-01', la: 'Omnium Sanctorum', pt: 'Todos os Santos',
    color: 'albus', classis: 1, tempus: 'postpent', date: '11-01', gloria: true, credo: true, praef: 'Communis',
    notes: ['No Missal de 1962 a festa de Todos os Santos usa o Prefácio comum.'] },
  { id: 'defuncti', file: 'Sancti/11-02m1', la: 'In Commemoratione Omnium Fidelium Defunctorum — Ad primam Missam', pt: 'Comemoração de Todos os Fiéis Defuntos — Primeira Missa',
    color: 'niger', classis: 1, tempus: 'postpent', date: '11-02', gloria: false, credo: false, praef: 'Defunctorum', ps42: false, gloriaPatri: false,
    requiem: true, ite: 'requiescant', sequentia: true,
    notes: ['Missa de Réquiem: omitem-se o Salmo 42 e o “Gloria Patri”.', 'No Intróito o celebrante não se benze: traça o sinal da cruz sobre o livro, pelos defuntos.', 'Não se abençoa a água no Ofertório; o acólito não beija as galhetas.', 'Agnus Dei com “dona eis réquiem”; não se bate no peito.', 'Omite-se a primeira oração antes da Comunhão (Domine Jesu Christe, qui dixisti).', '“Requiéscant in pace” em lugar do “Ite, missa est”; não se dá a bênção.', 'Sequência “Dies iræ”.'] },
  { id: 'greg', file: 'Sancti/11-17', la: 'S. Gregorii Thaumaturgi Episcopi et Confessoris', pt: 'São Gregório Taumaturgo, Bispo e Confessor',
    color: 'albus', classis: 3, tempus: 'postpent', date: '11-17', gloria: true, credo: false, praef: 'Communis',
    notes: ['Festa de III classe: Glória, sem Credo, Prefácio comum.', 'Missa “Statuit” do Comum de um Confessor Pontífice, com Evangelho próprio.'] },
  { id: 'caecilia', file: 'Sancti/11-22', la: 'S. Cæciliæ Virginis et Martyris', pt: 'Santa Cecília, Virgem e Mártir',
    color: 'ruber', classis: 3, tempus: 'postpent', date: '11-22', gloria: true, credo: false, praef: 'Communis',
    notes: ['Festa de III classe; cor vermelha das virgens mártires; padroeira da música sacra.'] },
  { id: 'pent24', file: 'Tempora/Pent24-0', la: 'Dominica XXIV et ultima post Pentecosten', pt: 'XXIV e Último Domingo depois de Pentecostes',
    color: 'viridis', classis: 2, tempus: 'postpent', date: 'pent24', gloria: true, credo: true, praef: 'Trinitate',
    notes: ['Último domingo do ano litúrgico: o Evangelho anuncia a vinda do Filho do homem (Mt 24).'] },
];

const PARTS = ['Introitus', 'Oratio', 'Lectio', 'Graduale', 'Tractus', 'Sequentia', 'Evangelium', 'Offertorium', 'Secreta', 'Communio', 'Postcommunio', 'Super populum'];

function getPart(lang, file, part, cel) {
  let name = part;
  if (part === 'Graduale' && cel.gradualeSec) name = cel.gradualeSec;
  let lines = R.section(lang, file, name);
  // Missas do Comum: o DO usa "vide C4" na regra
  if (!lines) {
    const rule = (R.section('Latin', file, 'Rule') || []).join('\n') + '\n' + (R.section('Latin', file, 'Rank') || []).join('\n');
    const m = rule.match(/(?:vide|ex)\s+(C\d+[a-z]?(?:-\d)?)/);
    if (m) {
      lines = R.section(lang, 'Commune/' + m[1], name);
      if (lines && /\bN\.\s/.test(lines.join(' '))) {
        const nm = R.section(lang, file, 'Name');
        if (nm && nm[0]) lines = lines.map(l => l.replace(/\bN\.(?=\s)/g, nm[0].trim()));
      }
    }
  }
  // Se a tradução não tem a seção, segue o caminho de referências do latim
  if (!lines && lang !== 'Latin') {
    const chain = [file];
    const rule = (R.section('Latin', file, 'Rule') || []).join('\n') + '\n' + (R.section('Latin', file, 'Rank') || []).join('\n');
    const m = rule.match(/(?:vide|ex)\s+(C\d+[a-z]?(?:-\d)?)/);
    if (m) chain.push('Commune/' + m[1]);
    for (const f of chain) {
      const raw = R.rawSection('Latin', f, name);
      if (!raw) continue;
      const refs = raw.lines.map(l => l.trim()).filter(Boolean);
      if (refs.length === 1 && refs[0].startsWith('@')) {
        const mm = refs[0].match(/^@([^:\s]*)(?::([^:]+))?/);
        lines = R.section(lang, mm[1] || raw.file, mm[2] || name);
        if (lines) break;
      }
    }
  }
  if (!lines) return null;
  const paschal = cel.tempus === 'paschale';
  lines = lines.map(l => paschal ? l.replace(/\((Allelúja|Alléluia|Alleluia|Aleluia)([^)]*)\)/gi, '$1$2') : l.replace(/\s*\((Allelúja|Alléluia|Alleluia|Aleluia)[^)]*\)/gi, ''));
  const prayers = R.loadPrayers(lang);
  return toBlocks(lines, prayers);
}

function brBlocks(blocks) {
  return blocks.map(b => (b.t ? Object.assign({}, b, { t: toBR(b.t) }) : b));
}

const out = { _fonte: 'Divinum Officium (Latin / Portugues), rubricas de 1960; português adaptado à norma brasileira.', celebrations: [] };
const problems = [];
for (const cel of CELEBRATIONS) {
  const entry = Object.assign({}, cel);
  delete entry.file;
  entry.source = cel.file;
  entry.parts = {};
  for (const p of PARTS) {
    const la = getPart('Latin', cel.file, p, cel);
    if (!la) continue;
    if (p === 'Sequentia' && !cel.sequentia) continue;
    if (p === 'Super populum' && !cel.superPopulum) continue;
    if (p === 'Tractus' && !cel.tractus) continue;
    let pt = getPart('Portugues', cel.file, p, cel);
    if (!pt) problems.push(cel.id + ': sem português para ' + p);
    pt = pt ? brBlocks(pt) : [];
    entry.parts[p] = { la, pt };
    const txt = JSON.stringify(la) + JSON.stringify(pt);
    if (/NÃO RESOLVIDA/.test(txt)) problems.push(cel.id + ': referência não resolvida em ' + p);
  }
  out.celebrations.push(entry);
}

// Prefácios, Communicantes e Hanc igitur (latim do DO; o português dos prefácios é revisado em ordo.js)
const PREF_KEYS = ['Communis', 'Nat', 'Epi', 'Quad', 'Quad5', 'Pasch', 'Asc', 'Spiritu', 'Trinitate', 'Maria', 'Joseph', 'Apostolis', 'Regis', 'Cord', 'Defunctorum'];
out.prefaces = {};
for (const k of PREF_KEYS) {
  const la = R.section('Latin', 'Ordo/Prefationes', k);
  const pt = R.section('Portugues', 'Ordo/Prefationes', k);
  out.prefaces[k] = { la: la ? la.filter(l => !/^!/.test(l.trim())).join('\n') : null, pt: pt ? toBR(pt.filter(l => !/^!/.test(l.trim())).join('\n')) : null };
}
out.communicantes = {};
for (const k of ['C-common1962', 'C-Nat1962', 'C-Epi1962', 'C-Pasc1962', 'C-Asc1962', 'C-Pent1962', 'H-Pent']) {
  const la = R.section('Latin', 'Ordo/Prefationes', k);
  const pt = R.section('Portugues', 'Ordo/Prefationes', k);
  out.communicantes[k] = { la: la ? la.filter(l => !/^!/.test(l.trim())).join(' ') : null, pt: pt ? toBR(pt.filter(l => !/^!/.test(l.trim())).join(' ')) : null };
}

fs.writeFileSync(path.join(__dirname, 'propers.raw.json'), JSON.stringify(out, null, 1));
const js = '/* Gerado por tools/extract-propers.js — não editar à mão. Fonte: ' + out._fonte + ' */\n' +
  '(function(DG){ DG.data = DG.data || {}; DG.data.propersRaw = ' + JSON.stringify(out) + '; })(window.DG = window.DG || {});\n';
fs.writeFileSync(OUT, js);
console.log('Celebrações:', out.celebrations.length, '— arquivo:', OUT, (js.length / 1024).toFixed(0) + ' KB');
if (problems.length) console.log('PROBLEMAS:\n' + problems.join('\n'));
