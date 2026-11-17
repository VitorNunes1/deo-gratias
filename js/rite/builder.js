/* DEO GRATIAS — construtor do rito: a Missa rezada (Missa lecta) segundo o Missal de 1962
   Fontes das rubricas: Ritus servandus in celebratione Missæ (Missale Romanum 1962);
   J. B. O’Connell, The Celebration of Mass (4.ª ed., 1964), cap. IV–XV e XXI.

   Elementos do roteiro:
   say  {who, la, pt, voice}        fala (clara | media | secreta | submissa | consecr)
   g    {who, g, n}                 gesto (ver DG.GEST)
   go   {who, to, via}              deslocar-se a um ponto do presbitério
   act  {who, a}                    ação sobre objeto (ver DG.ACTS)
   kneel/stand {who}                postura do acólito
   bell {n}                         campainha (acólito)
   par  {els}                       elementos simultâneos
   state{fn}                        altera o estado do mundo
   wait {s} / event {name} / carry {who, item} / cam {mode} */
(function (DG) {
  'use strict';
  const O = () => DG.data.ordo;

  const SECTIONS = [
    { id: 'ingressus', name: 'Entrada', la: 'Accessus ad altare', part: 'cat' },
    { id: 'pe', name: 'Orações ao pé do altar', la: 'Preces ad pedes altaris', part: 'cat' },
    { id: 'introitus', name: 'Intróito e Kyrie', la: 'Introitus · Kyrie', part: 'cat' },
    { id: 'gloria', name: 'Glória', la: 'Gloria in excelsis', part: 'cat' },
    { id: 'oratio', name: 'Coleta', la: 'Oratio', part: 'cat' },
    { id: 'lectio', name: 'Epístola e Gradual', la: 'Epistola · Graduale', part: 'cat' },
    { id: 'evangelium', name: 'Evangelho', la: 'Evangelium', part: 'cat' },
    { id: 'credo', name: 'Credo', la: 'Symbolum Nicænum', part: 'cat' },
    { id: 'offertorium', name: 'Ofertório', la: 'Offertorium', part: 'fid' },
    { id: 'lavabo', name: 'Lavabo', la: 'Lavabo', part: 'fid' },
    { id: 'secreta', name: 'Secreta e Prefácio', la: 'Secreta · Præfatio · Sanctus', part: 'fid' },
    { id: 'canon', name: 'Cânon Romano', la: 'Canon Missæ', part: 'fid' },
    { id: 'consecratio', name: 'Consagração', la: 'Consecratio', part: 'fid' },
    { id: 'postcons', name: 'Depois da Consagração', la: 'Unde et memores · Per ipsum', part: 'fid' },
    { id: 'pater', name: 'Pater noster e fração', la: 'Pater noster · Fractio', part: 'fid' },
    { id: 'agnus', name: 'Agnus Dei', la: 'Agnus Dei · Orationes ante Communionem', part: 'fid' },
    { id: 'communio', name: 'Comunhão', la: 'Communio', part: 'fid' },
    { id: 'ablutio', name: 'Abluções', la: 'Ablutiones', part: 'fid' },
    { id: 'postcommunio', name: 'Comunhão e Pós-Comunhão', la: 'Communio · Postcommunio', part: 'fid' },
    { id: 'conclusio', name: 'Despedida e bênção', la: 'Ite, missa est · Benedictio', part: 'fid' },
    { id: 'ultimum', name: 'Último Evangelho', la: 'Initium S. Evangelii secundum Joannem', part: 'fid' },
    { id: 'leonine', name: 'Orações depois da Missa', la: 'Preces Leoninæ', part: 'post' },
    { id: 'recessus', name: 'Retorno à sacristia', la: 'Recessus', part: 'post' },
  ];

  // ---------- auxiliares ----------
  const say = (who, key, voice, x) => Object.assign({ t: 'say', who, key, voice: voice || 'clara' }, x || {});
  const sayT = (who, la, pt, voice, x) => Object.assign({ t: 'say', who, la, pt, voice: voice || 'clara' }, x || {});
  const g = (who, id, x) => Object.assign({ t: 'g', who, g: id }, x || {});
  const go = (who, to, x) => Object.assign({ t: 'go', who, to }, x || {});
  const act = (who, a, x) => Object.assign({ t: 'act', who, a }, x || {});
  const kneel = (who, x) => Object.assign({ t: 'kneel', who }, x || {});
  const stand = (who, x) => Object.assign({ t: 'stand', who }, x || {});
  const bell = (n, x) => Object.assign({ t: 'bell', who: 'M', n }, x || {});
  // cada argumento é um elemento ou uma SEQUÊNCIA (array) executada em ordem
  const par = (...els) => ({ t: 'par', els: els.filter(Boolean).map(e => (Array.isArray(e) ? e.flat().filter(Boolean) : e)) });
  const state = (fn, x) => Object.assign({ t: 'state', fn }, x || {});
  const wait = (s) => ({ t: 'wait', s });
  const ev = (name, x) => Object.assign({ t: 'event', name }, x || {});
  const carry = (who, item) => ({ t: 'carry', who, item });
  const base = (who, b) => ({ t: 'base', who, b });
  const cam = (mode) => ({ t: 'cam', mode });

  // nome de Jesus (inclinação de cabeça)
  const HOLY = /(Jesu[ms]?\b|Jesus\b)/;

  // divide um texto latino em segmentos, inserindo inclinações ao nome de Jesus
  // e genuflexões nos marcadores “(hic genuflectitur)”
  function readText(who, la, pt, voice, opts) {
    opts = opts || {};
    const els = [];
    let rest = la;
    const genRe = /\(\s*(?:hic genuflectitur|genuflectit(?: dicens)?:?|Hic genuflectitur)\s*\)/i;
    // genuflexões
    const parts = rest.split(genRe);
    parts.forEach((p, i) => {
      const txt = p.trim();
      if (txt) {
        if (opts.nameBow && who === 'P' && HOLY.test(txt)) {
          // separa no primeiro nome de Jesus
          const m = txt.match(HOLY); const idx = txt.indexOf(m[0]);
          const before = txt.slice(0, idx).trim(), after = txt.slice(idx).trim();
          if (before) els.push(sayT(who, before, i === 0 ? pt : '', voice, { cont: true }));
          els.push(par(sayT(who, after, i === 0 && !before ? pt : '', voice, { cont: true }), g('P', 'inclinCapitis', { mode: 'window', win: 4.5, minor: true, why: 'nome de Jesus' })));
        } else els.push(sayT(who, txt, i === 0 ? pt : '', voice, { cont: i > 0 }));
      }
      if (i < parts.length - 1) {
        els.push(par(g('P', 'genuflectere', { why: 'genuflexão prescrita no texto' }), opts.allGenu ? g('M', 'genuflectere', { mode: 'window', win: 5 }) : null));
      }
    });
    return els;
  }

  // blocos de um próprio -> textos (latim e português alinhados)
  function properTexts(cel, part) {
    const p = cel.parts[part];
    if (!p) return [];
    const keep = b => b.k === 'text' || b.k === 'V' || b.k === 'R' || b.k === 'concl' || b.k === 'gloriapatri';
    const la = p.la.filter(keep), pt = p.pt.filter(keep);
    const gp = O().gloriaPatriFull;
    const out = [];
    la.forEach((b, i) => {
      if (b.k === 'gloriapatri') {
        if (cel.gloriaPatri === false) return;
        out.push({ la: gp.la, pt: gp.pt, gloriaPatri: true });
        return;
      }
      const pb = pt.length === la.length ? pt[i] : null;
      let ltxt = b.t.replace(/\+\+/g, '✠').replace(/\s\+\s/g, ' ✠ ');
      if (b.k === 'V') ltxt = '℣. ' + ltxt; if (b.k === 'R') ltxt = '℟. ' + ltxt;
      out.push({ la: ltxt, pt: pb ? pb.t.replace(/\+\+/g, '✠') : (i === 0 ? pt.filter(x => x.k !== 'gloriapatri').map(x => x.t).join(' ') : ''), concl: b.k === 'concl' });
    });
    return out;
  }
  function refOf(cel, part) { const p = cel.parts[part]; if (!p) return ''; const r = p.la.find(b => b.k === 'ref'); return r ? r.t : ''; }

  // oração (coleta, secreta, pós-comunhão) com conclusão
  function oration(cel, part, voice, opts) {
    opts = opts || {};
    const tx = properTexts(cel, part);
    const els = [];
    tx.forEach(t => {
      if (t.concl) {
        // junta as mãos na conclusão; inclina a cabeça ao nome de Jesus
        if (opts.handsP) els.push(g('P', 'jungere', { why: 'na conclusão “Per Dominum”' }));
        els.push(...readText('P', t.la, t.pt, voice, { nameBow: true }));
      } else els.push(...readText('P', t.la, t.pt, voice, { nameBow: true }));
    });
    return els;
  }

  // leitura (Epístola, Gradual, Evangelho...)
  function reading(cel, part, opts) {
    opts = opts || {};
    const tx = properTexts(cel, part);
    const els = [];
    tx.forEach((t, i) => {
      if (opts.skipFirst && i === 0) return;
      if (t.gloriaPatri) { els.push(par(sayT('P', t.la, t.pt, opts.voice || 'clara'), g('P', 'inclinCapitis', { mode: 'window', win: 4, why: 'ao Glória ao Pai' }))); return; }
      els.push(...readText('P', t.la, t.pt, opts.voice || 'clara', { nameBow: opts.nameBow !== false, allGenu: opts.allGenu }));
    });
    return els;
  }

  function T(key) { return O()[key] || { la: key, pt: '' }; }

  // =================================================================
  function build(cel, role, form, opts) {
    opts = opts || {};
    const customs = DG.settings.customs || {};
    const req = !!cel.requiem;
    const steps = [];
    const S = (id, sec, title, x, els) => { steps.push(Object.assign({ id, sec, title, els: els.flat().filter(Boolean) }, x)); };
    const Pm = role === 'sacerdos';
    // ---- Missa cantada (Missa cantata sine ministris) ----
    const cant = form === 'cantata';
    const CH = DG.data.chants || { propria: {}, kyriale: {}, tones: {}, credo: {} };
    const pr = CH.propria[cel.id] || {};
    const ky = CH.kyriale[pr.kyriale || 'XI'] || {};
    const chant = (id, x) => (cant && (id || (x && x.ids)) ? Object.assign({ t: 'chant', id }, x || {}) : null);
    const chantWait = () => (cant ? { t: 'chantWait' } : null);
    const Q = (el) => { if (el && typeof el === 'object' && !Array.isArray(el)) el.quietInCantata = true; return el; };
    const quietAll = (arr) => { const walk = (a) => a.forEach(e => { if (!e) return; if (Array.isArray(e)) walk(e); else if (e.t === 'par') walk(e.els); else if (e.t === 'say') e.quietInCantata = true; }); walk(arr); return arr; };
    const cantAll = (arr) => { const walk = (a) => a.forEach(e => { if (!e) return; if (Array.isArray(e)) walk(e); else if (e.t === 'par') walk(e.els); else if (e.t === 'say') e.cantable = true; }); walk(arr); return arr; };

    // ================= ENTRADA =================
    S('inclinatioSacristia', 'ingressus', 'Inclinação diante do crucifixo da sacristia', {
      rub: { P: 'Revestido, o celebrante toma o cálice com a mão esquerda, pondo a direita sobre a bolsa, e faz inclinação de cabeça ao crucifixo da sacristia.', M: 'O acólito, com o Missal nas mãos, de pé atrás do sacerdote e um pouco à sua esquerda, faz com ele uma inclinação média ao crucifixo.' },
      ref: 'Ritus servandus II, 1; O’Connell p. 218 e 356', scene: 'sacristy' },
      [par(go('P', 'crucifix'), go('M', 'crucifixM')), par(g('P', 'inclinCapitis'), g('M', 'inclinMedia'))]);
    S('processio', 'ingressus', 'Ida ao altar', {
      rub: { P: 'O sacerdote segue o acólito até o altar, de olhos baixos, passo grave e corpo ereto.', M: 'O acólito precede o sacerdote até o altar. Se for costume, toca a campainha da sacristia à entrada da igreja e oferece água benta ao sacerdote.' },
      ref: 'Ritus servandus II, 1; O’Connell p. 219, 356', scene: 'sacristy' },
      [customs.holyWaterSacristy ? g('P', 'signum', { opt: true, why: 'água benta (costume)' }) : null,
        customs.sacristyBell ? ev('sacristyBell') : null,
        ev('procession')]);
    S('adventus', 'ingressus', 'Chegada ao pé do altar', {
      rub: { P: 'Diante do degrau mais baixo, o celebrante entrega o barrete ao acólito e, estando o Santíssimo no sacrário, faz genuflexão no chão (in plano).', M: 'O acólito recebe o barrete (beijando-o) e genuflecte com o sacerdote.' },
      ref: 'Ritus servandus II, 2; O’Connell p. 221, 356', scene: 'church' },
      [chant(pr.in, { bg: true, introit: true, label: 'Intróito (schola)' }), par(go('P', 'P_foot'), go('M', 'M_floorEp')),
        par(act('P', 'accipereBirettum', { npcOnly: true }), act('M', 'tollereBirettum')),
        req ? null : g('M', 'beijar', { opt: true, mode: 'window', win: 4, why: 'beija o barrete (solita oscula)' }),
        par(g('P', 'genuflectere'), g('M', 'genuflectere', { mode: 'window', win: 5 }))]);
    S('calixAltari', 'ingressus', 'O cálice sobre o altar', {
      rub: { P: 'Sobe ao meio do altar, põe o cálice do lado do Evangelho, tira o corporal da bolsa e o estende no meio; põe a bolsa do lado do Evangelho e coloca o cálice velado sobre o corporal.', M: 'O acólito leva o barrete à sedília; depois sobe pelo lado da Epístola e põe o Missal, fechado, sobre a estante, com a abertura voltada para o meio do altar.' },
      ref: 'Ritus servandus II, 2; O’Connell p. 221–222, 357' },
      [par(
        [go('P', 'P_mid'), act('P', 'ponereCalicem'), state(sc => { sc.state.chalice = 'corporal'; })],
        [go('M', 'M_sedilia'), act('M', 'deponereBirettum'), state(sc => { sc.state.biretta = true; }), go('M', 'M_missalEp'), act('M', 'deponereMissale'), state(sc => { sc.state.missal = { at: 'epistle', open: false }; })]
      )]);
    S('aperitMissale', 'ingressus', 'O Missal aberto no Intróito', {
      rub: { P: 'Vai ao lado da Epístola e abre o Missal no Intróito da Missa — é ele, e não o acólito, quem o abre na Missa rezada. Volta ao meio, inclina a cabeça à cruz e desce obliquamente até o pé do altar.', M: 'O acólito desce pelo lado e vai ao lado esquerdo do pé do altar, genuflectindo ao passar pelo meio.' },
      ref: 'Ritus servandus II, 4; O’Connell p. 224, 357' },
      [par(
        [go('P', 'P_ep'), act('P', 'aperireMissale'), state(sc => { sc.state.missal.open = true; }), go('P', 'P_mid'), g('P', 'inclinCapitis'), go('P', 'P_foot')],
        [go('M', 'M_midFloor'), g('M', 'genuflectere', { why: 'ao passar pelo meio' }), go('M', 'M_foot')]
      )]);

    // ================= PÉ DO ALTAR =================
    S('genuflexioInitium', 'pe', 'Reverência ao altar', {
      rub: { P: 'Ao pé do altar, de mãos juntas, faz genuflexão sobre o degrau (o Santíssimo está no sacrário).', M: 'O acólito ajoelha-se no chão, à esquerda do sacerdote e um pouco atrás dele.' },
      ref: 'Ritus servandus III, 1; O’Connell p. 227, 357' },
      [par(g('P', 'genuflectere'), kneel('M', { at: 'M_foot' }))]);
    S('inNomine', 'pe', 'In nómine Patris', {
      rub: { P: 'Ereto, faz o sinal da cruz da fronte ao peito, dizendo em voz alta: In nómine Patris…', M: 'O acólito benze-se com o sacerdote.' },
      ref: 'Ritus servandus III, 1', edu: 'pe' },
      [par(g('P', 'signum'), g('M', 'signum', { mode: 'window', win: 5 })), say('P', 'inNomine')]);
    const pe = [];
    pe.push(say('P', 'introibo'), say('M', 'adDeum'));
    if (cel.ps42) {
      pe.push(say('P', 'ps42_1'), say('M', 'ps42_2'), say('P', 'ps42_3'), say('M', 'ps42_4'), say('P', 'ps42_5'), say('M', 'ps42_6'));
      pe.push(par(say('P', 'gloriaPatri'), g('P', 'inclinCapitis', { mode: 'window', win: 4 }), g('M', 'inclinCapitis', { mode: 'window', win: 5, minor: true })));
      pe.push(say('M', 'sicutErat'), say('P', 'introibo'), say('M', 'adDeum'));
    }
    S('judica', 'pe', cel.ps42 ? 'Antífona Introibo e Salmo 42' : 'Antífona Introibo (sem o Salmo 42)', {
      rub: { P: cel.ps42 ? 'De mãos juntas, diz a antífona Introibo e o Salmo 42 alternadamente com o acólito; ao Glória ao Pai inclina a cabeça para a cruz.' : 'Em ' + (req ? 'Missas de defuntos' : 'Missas do Tempo da Paixão') + ' omite-se o Salmo 42: diz-se só a antífona Introibo e segue-se o Adjutorium.', M: 'O acólito responde com clareza, sem interromper o sacerdote nem fazê-lo esperar.' },
      ref: 'Ritus servandus III, 6; O’Connell p. 227–228', edu: 'pe' }, pe);
    S('adjutorium', 'pe', 'Adjutórium nostrum', { rub: { P: 'Benze-se, dizendo: Adjutórium nostrum in nómine Dómini.', M: 'O acólito benze-se e responde: Qui fecit cælum et terram.' }, ref: 'Ritus servandus III, 7' },
      [par(g('P', 'signum'), g('M', 'signum', { mode: 'window', win: 5 })), say('P', 'adjutorium'), say('M', 'quiFecit')]);
    S('confiteorP', 'pe', 'Confíteor do sacerdote', {
      rub: { P: 'Profundamente inclinado, de mãos juntas, diz o Confíteor. Ao “mea culpa” bate três vezes no peito com a mão direita, pondo a esquerda sob o peito. Permanece inclinado até responder “Amen” ao Misereátur.', M: 'Enquanto o sacerdote diz o Confíteor, o acólito não se inclina nem bate no peito.' },
      ref: 'Ritus servandus III, 7; O’Connell p. 228–229', edu: 'pe' },
      [g('P', 'inclinProfunda', { hold: true }), say('P', 'confiteorP'), g('P', 'percutere', { n: 3, why: 'ao “mea culpa”' }), say('P', 'meaCulpa'), say('P', 'confiteorP2'),
        par(g('M', 'inclinMedia', { mode: 'window', win: 5, why: 'voltado ao sacerdote' })), say('M', 'misereaturTui'), say('P', 'amen', 'clara'), base('P', { bow: 0 })]);
    S('confiteorM', 'pe', 'Confíteor do acólito', {
      rub: { P: 'Ereto e de mãos juntas, o sacerdote escuta o Confíteor do acólito.', M: 'Inclinado moderadamente para o altar, o acólito diz o Confíteor (com “tibi, pater” e “te, pater”), batendo três vezes no peito ao “mea culpa”; permanece inclinado durante o Misereátur.' },
      ref: 'Ritus servandus III, 9; O’Connell p. 357' },
      [g('M', 'inclinMedia', { hold: true }), say('M', 'confiteorM'), g('M', 'percutere', { n: 3, why: 'ao “mea culpa”' }), say('M', 'meaCulpa'), say('M', 'confiteorM2'),
        say('P', 'misereaturVestri'), say('M', 'amen'), base('M', { bow: 0 })]);
    S('indulgentiam', 'pe', 'Indulgéntiam', { rub: { P: 'Benze-se, dizendo: Indulgéntiam, absolutiónem et remissiónem…', M: 'Ereto, o acólito benze-se com o sacerdote e responde “Amen”.' }, ref: 'Ritus servandus III, 10' },
      [par(g('P', 'signum'), g('M', 'signum', { mode: 'window', win: 5 })), say('P', 'indulgentiam'), say('M', 'amen')]);
    S('deusTuConversus', 'pe', 'Versículos: Deus, tu convérsus', {
      rub: { P: 'Moderadamente inclinado, de mãos juntas, diz os versículos. Por exceção, não estende as mãos ao “Dominus vobiscum”; ao “Oremus” estende-as e as junta.', M: 'O acólito permanece inclinado e responde até o “Oremus” inclusive.' },
      ref: 'Ritus servandus III, 10; O’Connell p. 229' },
      [par(g('P', 'inclinMedia', { hold: true }), g('M', 'inclinCapitis', { hold: true, mode: 'window', win: 5, minor: true })),
        say('P', 'deusTuConversus'), say('M', 'etPlebsTua'), say('P', 'ostendeNobis'), say('M', 'etSalutare'), say('P', 'domineExaudi'), say('M', 'etClamor'), say('P', 'dominusVobiscum'), say('M', 'etCumSpiritu'),
        base('P', { bow: 0 }), base('M', { bow: 0 }), par(g('P', 'extJung', { gesture: 'extendere', why: 'ao “Oremus”' }), say('P', 'oremus'))]);
    S('aufer', 'pe', 'Subida ao altar: Aufer a nobis', {
      rub: { P: 'Ereto, de mãos juntas, sobe ao altar dizendo em silêncio a oração Aufer a nobis.', M: 'Quando o sacerdote sobe, o acólito levanta-se e vai ajoelhar-se no degrau mais baixo, ainda do lado do Evangelho (o lado oposto ao Missal).' },
      ref: 'Ritus servandus IV, 1; O’Connell p. 230, 357' },
      [par([go('P', 'P_mid'), say('P', 'aufer', 'secreta')], [go('M', 'M_stepEv'), kneel('M', { at: 'M_stepEv' })])]);
    S('oramusTe', 'pe', 'Orámus te e beijo do altar', {
      rub: { P: 'Moderadamente inclinado, com as mãos juntas pousadas sobre o altar, diz Orámus te; às palavras “quorum relíquiæ hic sunt” beija o altar no meio, com as mãos estendidas sobre ele.', M: 'O acólito permanece de joelhos.' },
      ref: 'Ritus servandus IV, 1; O’Connell p. 230–231', edu: 'altar' },
      [g('P', 'inclinMedia', { hold: true }), say('P', 'oramusTe1', 'secreta'), g('P', 'osculari', { why: 'às palavras “quorum relíquiæ hic sunt”' }), say('P', 'oramusTe2', 'secreta'), base('P', { bow: 0 })]);

    // ================= INTRÓITO / KYRIE =================
    const intr = properTexts(cel, 'Introitus');
    S('introitus', 'introitus', 'Intróito', {
      rub: { P: req ? 'No lado da Epístola, em vez de benzer-se, traça o sinal da cruz sobre o livro (pelos defuntos) e lê o Intróito; omite-se o Glória ao Pai.' : 'No lado da Epístola, benze-se e lê em voz alta o Intróito; ao Glória ao Pai inclina a cabeça para a cruz; repete a antífona sem se benzer.', M: req ? 'Nas Missas de defuntos o acólito não se benze ao Intróito.' : 'O acólito benze-se quando o sacerdote começa o Intróito.' },
      ref: 'Ritus servandus IV, 1–2; O’Connell p. 231; ' + refOf(cel, 'Introitus'), edu: 'introitus' },
      [go('P', 'P_ep'), req ? g('P', 'benedicere', { why: 'sobre o livro, pelos defuntos' }) : par(g('P', 'signum'), g('M', 'signum', { mode: 'window', win: 5 })),
        ...quietAll(reading(cel, 'Introitus')), chantWait()]);
    void intr;
    S('kyrie', 'introitus', 'Kyrie, eléison', {
      rub: { P: 'Volta ao meio do altar e ali, de mãos juntas, diz o Kyrie alternadamente com o acólito: três vezes Kyrie, três Christe, três Kyrie.' + (cant ? ' Na Missa cantada, di-lo em voz baixa e espera que o coro o cante.' : ''), M: 'O acólito responde alternadamente — não diz junto com o sacerdote.' },
      ref: 'Ritus servandus IV, 2; O’Connell p. 231', edu: 'kyrie' },
      [go('P', 'P_mid'), ...quietAll([say('P', 'kyrie'), say('M', 'kyrie'), say('P', 'kyrie'), say('M', 'christe'), say('P', 'christe'), say('M', 'christe'), say('P', 'kyrie'), say('M', 'kyrie'), say('P', 'kyrie')]), chant(ky.kyrie, { label: 'Kyrie (schola)' })]);

    if (cel.gloria && cant && ky.gloria) {
      const rest = O().gloria.slice(2).map(s => {
        const sp = Q(sayT('P', s.la, s.pt, 'clara', { cont: true }));
        if (!s.g) return sp;
        if (s.g === 'signum') return [par(g('P', 'signum'), g('M', 'signum', { mode: 'window', win: 6 })), sp];
        return [par(sp, g('P', s.g, { mode: 'window', win: 4, why: 'inclinação prescrita no Glória' }))];
      }).flat();
      S('gloria', 'gloria', 'Glória in excélsis Deo (cantado)', {
        rub: { P: 'No meio do altar, estendendo, elevando e juntando as mãos, o celebrante entoa “Glória in excélsis Deo”, inclinando a cabeça ao “Deo”; prossegue em voz baixa com as inclinações de costume, enquanto o coro canta o hino.', M: 'O acólito benze-se no fim, com o sacerdote.' },
        ref: 'Ritus servandus IV, 3; O’Connell, Missa cantata', edu: 'gloria' },
        [g('P', 'extendere', { why: 'estende, eleva e junta as mãos' }), g('P', 'jungere', { npcOnly: true }), par(chant(ky.gloria, { part: 'intonation', solo: true, label: 'Entoação do Glória' }), g('P', 'inclinCapitis', { mode: 'window', win: 6, why: 'ao “Deo”' })), ...rest, chant(ky.gloria, { part: 'rest', label: 'Glória (schola)' })]);
    } else if (cel.gloria) {
      const gl = O().gloria.map(s => {
        const sp = sayT('P', s.la, s.pt, 'clara', { cont: true });
        if (!s.g) return sp;
        if (s.g === 'signum') return [par(g('P', 'signum'), g('M', 'signum', { mode: 'window', win: 6 })), sp];
        if (s.g === 'extJungBow') return [g('P', 'extendere', { why: 'estende, eleva e junta as mãos' }), sp];
        return [par(sp, g('P', s.g, { mode: 'window', win: 4, why: 'inclinação prescrita no Glória' }))];
      }).flat();
      S('gloria', 'gloria', 'Glória in excélsis Deo', {
        rub: { P: 'No meio do altar estende, eleva até os ombros e junta as mãos, dizendo Glória in excélsis; ao “Deo” inclina a cabeça para a cruz. Inclina-a também a “Adorámus te”, “Grátias ágimus tibi”, “Jesu Christe” e “Súscipe deprecatiónem”; ao “Cum Sancto Spíritu” benze-se.', M: 'O acólito não recita o Glória; benze-se no fim, com o sacerdote.' },
        ref: 'Ritus servandus IV, 3; O’Connell p. 232', edu: 'gloria' }, [g('P', 'jungere', { npcOnly: true }), ...gl]);
    }

    // ================= COLETA =================
    S('dominusVobiscum1', 'oratio', 'Dóminus vobíscum', {
      rub: { P: 'Beija o altar no meio e, voltando-se para o povo pela sua direita, estende e junta as mãos, dizendo: Dóminus vobíscum; volta-se ao altar pelo mesmo lado.', M: 'O acólito responde: Et cum spíritu tuo.' },
      ref: 'Ritus servandus V, 1; O’Connell p. 236' },
      [g('P', 'osculari'), g('P', 'vertere'), par(g('P', 'extJung', { gesture: 'extendere' }), say('P', 'dominusVobiscum')), say('M', 'etCumSpiritu'), g('P', 'vertere', { back: true })]);
    S('collecta', 'oratio', 'Coleta (Oratio)', {
      rub: { P: 'No lado da Epístola, estende e junta as mãos e inclina a cabeça para a cruz ao dizer “Orémus”; depois, de mãos estendidas, lê a Coleta. Junta as mãos à conclusão “Per Dóminum” e inclina a cabeça ao nome de Jesus.', M: 'Ao fim da conclusão, o acólito responde “Amen”.' },
      ref: 'Ritus servandus V, 1–2; O’Connell p. 237', edu: 'oratio' },
      [go('P', 'P_ep'), par(g('P', 'inclinCapitis', { why: 'ao “Oremus”, para a cruz' }), say('P', 'oremus')), g('P', 'extendere'), ...cantAll(oration(cel, 'Oratio', 'clara', { handsP: true })), say('M', 'amen')]);

    // ================= EPÍSTOLA E GRADUAL =================
    const lecTx = properTexts(cel, 'Lectio');
    S('epistola', 'lectio', 'Epístola', {
      rub: { P: 'Com as mãos pousadas sobre o livro ou sobre o altar, lê a Epístola em voz alta.', M: 'Ao fim da Epístola, o acólito responde: Deo grátias.' },
      ref: 'Ritus servandus VI, 1; ' + refOf(cel, 'Lectio'), edu: 'lectio' },
      [base('P', { arms: 'onAltar' }), ...cantAll(reading(cel, 'Lectio')), say('M', 'deoGratias'), base('P', { arms: 'joined' })]);
    const gradEls = [...reading(cel, 'Graduale', { allGenu: true })];
    if (cel.parts.Tractus) gradEls.push(...reading(cel, 'Tractus'));
    if (cel.parts.Sequentia) gradEls.push(...reading(cel, 'Sequentia'));
    if (cant) { quietAll(gradEls); gradEls.unshift(chant(null, { ids: [pr.gr, pr.al, pr.al2, pr.tr, pr.seq].filter(Boolean), bg: true, proper: true, label: 'Gradual e Aleluia (schola)' })); }
    S('graduale', 'lectio', cel.parts.Sequentia ? 'Gradual, Aleluia e Sequência' : (/Tractus/.test(JSON.stringify(cel.parts.Graduale || '')) || cel.parts.Tractus) ? 'Gradual e Trato' : 'Gradual e Aleluia', {
      rub: { P: 'Continua lendo o Gradual e o Aleluia (ou o Trato' + (cel.parts.Sequentia ? '; e a Sequência' : '') + ').', M: 'Depois da Epístola, ou perto do fim do Trato ou da Sequência, o acólito levanta-se, genuflecte ao passar pelo meio e vai ao canto da Epístola, onde espera no chão (in plano) para transportar o Missal.' },
      ref: 'Ritus servandus VI, 1; O’Connell p. 357; ' + refOf(cel, 'Graduale'), edu: 'graduale' },
      [par(gradEls, [stand('M'), go('M', 'M_midFloor'), g('M', 'genuflectere', { why: 'ao passar pelo meio' }), go('M', 'M_floorEp')])]);

    // ================= EVANGELHO =================
    S('mundaCor', 'evangelium', 'Munda cor meum e transferência do Missal', {
      rub: { P: 'No meio do altar, elevando os olhos e logo baixando-os, profundamente inclinado e de mãos juntas, diz em silêncio Munda cor meum' + (req ? ' (na Missa de defuntos omite-se o “Jube, Dómine, benedícere”)' : ' e Jube, Dómine, benedícere') + '.', M: 'O acólito sobe, toma o Missal com a estante, desce obliquamente pelos degraus da frente, genuflecte no chão no meio, sobe obliquamente e o põe no lado do Evangelho, voltado em ângulo para o meio do altar. Depois desce e fica de pé, voltado para o sacerdote.' },
      ref: 'Ritus servandus VI, 1–2; O’Connell p. 357–358', edu: 'evangelium' },
      [par(
        [go('P', 'P_mid'), g('P', 'elevareOculos', { opt: true }), g('P', 'inclinProfunda', { hold: true }), say('P', 'mundaCor', 'secreta'), req ? null : say('P', 'jubeDomine', 'secreta'), base('P', { bow: 0 })],
        [go('M', 'M_missalEp'), act('M', 'transferreMissale'), state(sc => { sc.state.missal = { at: 'carried', open: true }; }), carry('M', 'missalStand'),
          go('M', 'M_midFloor'), g('M', 'genuflectere', { why: 'no meio, carregando o Missal' }), go('M', 'M_missalEv'), act('M', 'ponereMissaleEv'), carry('M', null),
          state(sc => { sc.state.missal = { at: 'gospel', open: true }; }), go('M', 'M_evStand'), stand('M')]
      )]);
    const evTx = properTexts(cel, 'Evangelium');
    const incipit = evTx[0] || { la: 'Sequéntia ✠ sancti Evangélii', pt: '' };
    S('evangeliumInitium', 'evangelium', 'Anúncio do Evangelho', {
      rub: { P: 'No lado do Evangelho, voltado para o livro e de mãos juntas, diz: Dóminus vobíscum. Ao anunciar “Sequéntia sancti Evangélii”, assinala com o polegar o início do texto no livro e depois a si mesmo, na fronte, na boca e no peito.', M: 'O acólito responde, faz os três pequenos sinais da cruz com o sacerdote e responde: Glória tibi, Dómine. Se o nome de Jesus soa nas primeiras palavras, inclina a cabeça; depois passa ao lado da Epístola, genuflectindo no meio, e permanece de pé, voltado para o livro.' },
      ref: 'Ritus servandus VI, 2; O’Connell p. 358' },
      [chantWait(), go('P', 'P_ev'), say('P', 'dominusVobiscum'), say('M', 'etCumSpiritu'),
        par(g('P', 'signumParvum', { gesture: 'signumParvum', why: 'assinala o livro e a si mesmo' }), g('M', 'signumParvum', { mode: 'window', win: 6 })),
        sayT('P', incipit.la, incipit.pt, 'clara', { cantable: true }), say('M', 'gloriaTibi'),
        go('M', 'M_midFloor'), g('M', 'genuflectere', { why: 'ao passar pelo meio' }), go('M', 'M_epStand'), stand('M')]);
    S('evangelium', 'evangelium', 'Evangelho', {
      rub: { P: 'Lê o Evangelho de mãos juntas, inclinando a cabeça para o livro ao nome de Jesus e genuflectindo quando o texto o prescreve.', M: 'O acólito permanece de pé, voltado para o livro; genuflecte com o sacerdote se o Evangelho o pedir.' },
      ref: 'Ritus servandus VI, 2; ' + refOf(cel, 'Evangelium'), edu: 'evangelium' },
      [ev('faithfulStand'), ...cantAll(reading(cel, 'Evangelium', { skipFirst: true, allGenu: true })), say('M', 'lausTibi'),
        req ? null : par(act('P', 'osculariLibrum'), say('P', 'perEvangelica', 'secreta')),
        cel.id === 'asc' ? ev('pascalOut') : null,
        cel.credo ? null : kneel('M', { at: 'M_stepEp' })]);

    // ================= CREDO =================
    if (cel.credo) {
      const cr = O().credo.map(s => {
        const sp = sayT('P', s.la, s.pt, 'clara', { cont: true });
        if (!s.g) return sp;
        if (s.g === 'signum') return [par(g('P', 'signum'), g('M', 'signum', { mode: 'window', win: 6 })), sp];
        if (s.g === 'extJung') return [g('P', 'extendere', { why: 'estende, eleva e junta as mãos' }), g('P', 'jungere', { npcOnly: true }), sp];
        if (s.g === 'genuflectere') return [par(g('P', 'genuflectere', { why: 'ao “Et incarnatus est”' }), g('M', 'genuflectere', { mode: 'window', win: 6 }), ev('faithfulGenu')), sp];
        return [par(sp, g('P', s.g, { mode: 'window', win: 4, why: 'inclinação prescrita no Credo' }))];
      }).flat();
      const credoId = CH.credo && CH.credo[pr.credo || 'III'];
      if (cant && credoId) {
        // entoação pelo celebrante; o resto em voz baixa; depois o coro
        const crQ = cr.slice(cr.findIndex(e => e && e.t === 'say') + 2); // depois de “Credo in unum / Deum” (entoados)
        quietAll(crQ);
        S('credo', 'credo', 'Credo (cantado)', {
          rub: { P: 'No meio do altar, estendendo, elevando e juntando as mãos, entoa “Credo in unum Deum”, inclinando a cabeça ao “Deum”; prossegue em voz baixa com as reverências prescritas; o coro canta o Símbolo.', M: 'O acólito fica de pé; genuflecte ao “Et incarnatus est” e benze-se no fim.' },
          ref: 'Ritus servandus VI, 3; O’Connell, Missa cantata', edu: 'credo' },
          [go('P', 'P_mid'), g('P', 'extendere', { why: 'estende, eleva e junta as mãos' }), g('P', 'jungere', { npcOnly: true }), par(chant(credoId, { part: 'intonation', solo: true, label: 'Entoação do Credo' }), g('P', 'inclinCapitis', { mode: 'window', win: 6, why: 'ao “Deum”' })),
            ...crQ.filter(e => !(e && e.t === 'g' && e.g === 'extendere')), chant(credoId, { part: 'rest', label: 'Credo (schola)' }), kneel('M', { at: 'M_stepEp' })]);
      } else
      S('credo', 'credo', 'Credo', {
        rub: { P: 'No meio do altar estende, eleva e junta as mãos, dizendo Credo in unum Deum; inclina a cabeça a “Deum”, a “Jesum Christum” e a “simul adorátur”; genuflecte a “Et incarnátus est… et homo factus est”; benze-se a “Et vitam ventúri sǽculi”.', M: 'O acólito fica de pé durante o Credo; genuflecte com o sacerdote ao “Et incarnatus est” e benze-se no fim.' },
        ref: 'Ritus servandus VI, 3; O’Connell p. 358', edu: 'credo' },
        [go('P', 'P_mid'), ...cr, kneel('M', { at: 'M_stepEp' })]);
    }

    // ================= OFERTÓRIO =================
    S('dominusVobiscum2', 'offertorium', 'Dóminus vobíscum e Orémus', {
      rub: { P: 'Beija o altar, volta-se ao povo e diz Dóminus vobíscum; volta-se ao altar, estende e junta as mãos, inclina a cabeça e diz “Orémus”; depois lê a antífona do Ofertório, de mãos juntas.', M: 'Respondida a saudação e inclinada a cabeça ao “Orémus”, o acólito levanta-se e vai diretamente à credência.' },
      ref: 'Ritus servandus VII, 1; O’Connell p. 358', edu: 'offertorium' },
      [ev('faithfulSit'), go('P', 'P_mid'), g('P', 'osculari'), g('P', 'vertere'), par(g('P', 'extJung', { gesture: 'extendere' }), say('P', 'dominusVobiscum')), say('M', 'etCumSpiritu'), g('P', 'vertere', { back: true }),
        par(g('P', 'inclinCapitis', { why: 'ao “Oremus”' }), say('P', 'oremus')), chant(pr.of, { bg: true, proper: true, label: 'Ofertório (schola)' }),
        par(quietAll(reading(cel, 'Offertorium')), [stand('M'), go('M', 'M_credence'), act('M', 'tollereUrceolos'), state(sc => { sc.state.credence.cruets = false; sc.state.credence.towel = false; }), carry('M', 'cruets'), go('M', 'M_cruets')])]);
    S('suscipeSanctePater', 'offertorium', 'Oferta da hóstia: Súscipe, sancte Pater', {
      rub: { P: 'Descobre o cálice e dobra o véu; toma a patena com a hóstia e, elevando-a à altura do peito, com os olhos erguidos ao crucifixo e logo baixados, diz em silêncio Súscipe, sancte Pater. Traça a cruz com a patena e depõe a hóstia sobre o corporal.', M: 'O acólito espera no degrau superior, no canto da Epístola, com as galhetas.' },
      ref: 'Ritus servandus VII, 2–3; O’Connell p. 236ss (Offering the Host)' },
      [act('P', 'discooperireCalicem'), state(sc => { sc.state.chalice = 'open'; }), act('P', 'offerreHostiam'), say('P', 'suscipeSanctePater', 'secreta'), act('P', 'crucemPatena')]);
    S('urceoli', 'offertorium', 'Vinho e água no cálice', {
      rub: { P: 'Vai ao canto da Epístola com o cálice; recebe do acólito a galheta do vinho e o deita no cálice; ' + (req ? 'na Missa de defuntos não abençoa a água, mas diz a oração Deus, qui humánæ' : 'abençoa a água com o sinal da cruz, dizendo Deus, qui humánæ substántiæ') + ', e deita algumas gotas no cálice.', M: req ? 'O acólito apresenta primeiro a galheta do vinho, depois a da água, sem as beijar (Missa de defuntos).' : 'O acólito beija a galheta do vinho e a apresenta com uma inclinação de cabeça; depois beija e apresenta a da água; recebe-as de volta, beijando-as, e volta à credência.' },
      ref: 'Ritus servandus VII, 4; O’Connell p. 358–359', edu: 'offertorium' },
      [go('P', 'P_epCorner'),
        req ? null : g('M', 'beijar', { why: 'beija a galheta do vinho' }), act('M', 'praebereVinum'), act('P', 'infundereVinum'),
        req ? null : g('M', 'beijar', { why: 'beija a galheta da água' }),
        req ? say('P', 'deusQuiHumanae1', 'secreta') : par(g('P', 'benedicere', { why: 'abençoa a água' }), say('P', 'deusQuiHumanae1', 'secreta')),
        act('M', 'praebereAquam'), act('P', 'infundereAquam'), say('P', 'deusQuiHumanae2', 'secreta'),
        par(go('P', 'P_mid'), [go('M', 'M_credence'), act('M', 'reddereUrceolos'), state(sc => { sc.state.credence.cruets = true; }), carry('M', null)])]);
    S('offerimus', 'offertorium', 'Oferta do cálice: Offérimus tibi', {
      rub: { P: 'No meio do altar, oferece o cálice elevado, com os olhos para o crucifixo, dizendo Offérimus tibi; traça com ele a cruz, põe-no sobre o corporal e cobre-o com a pala. Inclinado moderadamente, de mãos juntas sobre o altar, diz In spíritu humilitátis. Erguendo-se, eleva os olhos, estende, eleva e junta as mãos (Veni, sanctificátor) e abençoa as oblatas.', M: 'O acólito prepara a bacia, a galheta da água e o manustérgio.' },
      ref: 'Ritus servandus VII, 5; O’Connell p. 236–238' },
      [act('P', 'offerreCalicem'), say('P', 'offerimus', 'secreta'), act('P', 'cooperirePalla'),
        g('P', 'inclinMedia', { hold: true }), say('P', 'inSpiritu', 'secreta'), base('P', { bow: 0 }),
        g('P', 'elevareOculos'), g('P', 'extendere', { why: 'estende, eleva e junta as mãos' }), say('P', 'veniSanctificator1', 'secreta'), g('P', 'benedicere', { why: 'abençoa as oblatas' }), say('P', 'veniSanctificator2', 'secreta'),
        act('M', 'tollereLavabo'), state(sc => { sc.state.credence.lavabo = false; sc.state.credence.towel = false; }), carry('M', 'lavabo'), go('M', 'M_cruets')]);

    // ================= LAVABO =================
    S('lavabo', 'lavabo', 'Lavabo', {
      rub: { P: 'No canto da Epístola, lava as pontas dos polegares e dos indicadores, dizendo o Salmo 25: Lavábo inter innocéntes' + (cel.gloriaPatri === false ? ' (sem o Glória ao Pai)' : '; ao Glória ao Pai inclina a cabeça para a cruz') + '.', M: 'O acólito inclina a cabeça, derrama lentamente a água sobre os dedos do sacerdote até um sinal para parar, oferece o manustérgio, inclina-se de novo; volta à credência e, tomando a campainha, ajoelha-se no degrau mais baixo do lado da Epístola.' },
      ref: 'Ritus servandus VII, 6; O’Connell p. 359', edu: 'lavabo' },
      [go('P', 'P_epCorner'), g('M', 'inclinCapitis', { opt: true, mode: 'window', win: 4 }), act('M', 'infundereLavabo'), act('P', 'lavare'),
        par(say('P', 'lavabo', 'secreta'), act('M', 'praebereManutergium')),
        cel.gloriaPatri === false ? null : par(say('P', 'gloriaPatriFull', 'secreta'), g('P', 'inclinCapitis', { mode: 'window', win: 4 })),
        par(go('P', 'P_mid'), [go('M', 'M_credence'), carry('M', null), state(sc => { sc.state.credence.lavabo = true; sc.state.credence.towel = true; }), act('M', 'tollereCampanulam'), state(sc => { sc.state.credence.bell = false; }), carry('M', 'bell'), go('M', 'M_stepEp'), kneel('M', { at: 'M_stepEp' })])]);

    // ================= SECRETA E PREFÁCIO =================
    S('suscipeSanctaTrinitas', 'secreta', 'Súscipe, sancta Trínitas', { rub: { P: 'No meio, moderadamente inclinado, com as mãos juntas sobre o altar, diz em silêncio Súscipe, sancta Trínitas.', M: 'O acólito permanece de joelhos.' }, ref: 'Ritus servandus VII, 7' },
      [g('P', 'inclinMedia', { hold: true }), say('P', 'suscipeSanctaTrinitas', 'secreta'), base('P', { bow: 0 })]);
    S('orateFratres', 'secreta', 'Oráte, fratres', {
      rub: { P: 'Beija o altar e, voltado para o povo, estende e junta as mãos, dizendo com voz um pouco elevada: Oráte, fratres; e, completando o círculo, volta-se ao altar dizendo em silêncio o restante.', M: 'Só quando o sacerdote se voltou de todo para o altar, o acólito responde, sem se inclinar: Suscípiat Dóminus…' },
      ref: 'Ritus servandus VII, 7; O’Connell p. 359–360', edu: 'secreta' },
      [g('P', 'osculari'), g('P', 'vertere'), par(g('P', 'extJung', { gesture: 'extendere' }), say('P', 'orateFratres', 'media')), g('P', 'vertere', { back: true, circle: true }), say('M', 'suscipiat'), say('P', 'amen', 'submissa')]);
    S('secreta', 'secreta', 'Secreta', { rub: { P: 'De mãos estendidas, sem dizer “Orémus”, lê em silêncio a Secreta; à conclusão junta as mãos e inclina a cabeça ao nome de Jesus.', M: 'O acólito permanece de joelhos, em silêncio.' }, ref: 'Ritus servandus VII, 7; ' + refOf(cel, 'Secreta') },
      [g('P', 'extendere'), ...oration(cel, 'Secreta', 'secreta', { handsP: true })]);
    const pref = DG.cel.preface(cel);
    S('praefatio', 'secreta', pref.name, {
      rub: { P: 'Com as mãos pousadas sobre o altar diz em voz alta “Per ómnia sǽcula sæculórum” e, sem se voltar, “Dóminus vobíscum”; eleva as mãos ao “Sursum corda”, junta-as e inclina a cabeça ao “Grátias agámus”; com as mãos estendidas diz o Prefácio.', M: 'O acólito responde aos versículos do Prefácio, inclinando a cabeça ao “Grátias agámus”.' },
      ref: 'Ritus servandus VII, 7–8; O’Connell p. 360', edu: 'praefatio' },
      cant ? [chantWait(), base('P', { arms: 'onAltar' }), par(chant(CH.tones.praefSollemnis, { solo: true, label: 'Diálogo do Prefácio (tom solene)' }), g('P', 'extendere', { mode: 'window', win: 14, why: 'eleva as mãos ao “Sursum corda”' })),
        g('P', 'jungere', { npcOnly: true }), g('P', 'extendere'), sayT('P', pref.la, pref.pt, 'clara', { cantable: true })]
      : [base('P', { arms: 'onAltar' }), say('P', 'perOmnia'), say('M', 'amen'), say('P', 'dominusVobiscum'), say('M', 'etCumSpiritu'),
        g('P', 'extendere', { why: 'eleva as mãos ao “Sursum corda”' }), say('P', 'sursumCorda'), say('M', 'habemus'),
        par(g('P', 'jungere'), g('P', 'inclinCapitis', { mode: 'window', win: 4 })), say('P', 'gratiasAgamus'), par(say('M', 'dignum'), g('M', 'inclinCapitis', { mode: 'window', win: 4, minor: true })),
        g('P', 'extendere'), sayT('P', pref.la, pref.pt, 'clara')]);
    S('sanctus', 'secreta', 'Sanctus', {
      rub: { P: 'Junta as mãos e, inclinado, diz o Sanctus em voz média; ao “Benedíctus qui venit” ergue-se e benze-se.' + (cant ? ' Na Missa cantada o coro canta o Sanctus e o Benedictus sem interrupção, enquanto o celebrante prossegue o Cânon; deve terminar antes da Consagração.' : ''), M: 'Ao Sanctus o acólito, ligeiramente inclinado, toca a campainha três vezes, separadamente (costume); benze-se ao Benedíctus.' },
      ref: 'Ritus servandus VII, 8; O’Connell p. 360' + (cant ? '; Instrução De musica sacra (1958), n. 27' : ''), edu: 'sanctus' },
      [ev('faithfulKneel'), g('P', 'jungere'), g('P', 'inclinMedia', { hold: true }), par(Q(say('P', 'sanctus1', 'media')), bell(3, { mode: 'window', win: 9, why: 'ao Sanctus' }), chant(ky.sanctus, { bg: true, label: 'Sanctus (schola)' })), base('P', { bow: 0 }),
        par(g('P', 'signum'), g('M', 'signum', { mode: 'window', win: 5 })), Q(say('P', 'benedictus', 'media'))]);

    // ================= CÂNON =================
    S('teIgitur', 'canon', 'Te ígitur', {
      rub: { P: 'Estende, eleva e junta as mãos; erguendo os olhos ao céu e logo baixando-os, profundamente inclinado e com as mãos sobre o altar, diz em silêncio Te ígitur; beija o altar; junta as mãos e traça três cruzes sobre a hóstia e o cálice (“hæc ✠ dona, hæc ✠ múnera, hæc ✠ sancta sacrifícia”); depois, de mãos estendidas, prossegue.', M: 'O acólito permanece de joelhos, em silêncio.' },
      ref: 'Ritus servandus VIII, 1; O’Connell p. 247ss', edu: 'canon' },
      [cam('canon'), ev('quiet'), g('P', 'elevareOculos'), g('P', 'inclinProfunda', { hold: true }), say('P', 'teIgitur1', 'secreta'), g('P', 'osculari'), base('P', { bow: 0 }), g('P', 'jungere'), say('P', 'teIgitur2', 'secreta'),
        g('P', 'benedicere', { n: 3, why: 'três cruzes sobre as oblatas' }), say('P', 'teIgitur3', 'secreta'), g('P', 'extendere'), say('P', 'teIgitur4', 'secreta')]);
    S('mementoVivorum', 'canon', 'Memento dos vivos', { rub: { P: 'Diz Meménto, Dómine; junta as mãos e reza um pouco por aqueles por quem tem intenção de rezar; depois, de mãos estendidas, prossegue.', M: 'O acólito permanece de joelhos.' }, ref: 'Ritus servandus VIII, 2' },
      [say('P', 'memento1', 'secreta'), g('P', 'jungere'), wait(4), g('P', 'extendere'), say('P', 'memento2', 'secreta')]);
    const comm = DG.cel.communicantes(cel);
    S('communicantes', 'canon', 'Communicántes' + (comm.key !== 'common' ? ' (próprio)' : ''), { rub: { P: 'De mãos estendidas, diz o Communicántes' + (comm.key !== 'common' ? ' próprio do dia' : '') + '; junta as mãos ao “Per eúndem Christum”.', M: 'O acólito permanece de joelhos.' }, ref: 'Ritus servandus VIII, 3; Missal de 1962 (São José inserido em 1962)' },
      [sayT('P', comm.la, comm.pt, 'secreta'), say('P', 'communicantesFinis', 'secreta'), g('P', 'jungere', { why: 'ao “Per eundem Christum”' })]);
    const hanc = [say('P', 'hancIgitur1', 'secreta')];
    if (cel.hanc === 'Pasc') hanc.push(say('P', 'hancIgiturPasc', 'secreta'));
    hanc.push(say('P', 'hancIgitur2', 'secreta'));
    S('hancIgitur', 'canon', 'Hanc ígitur' + (cel.hanc ? ' (próprio)' : ''), {
      rub: { P: 'Estende as mãos sobre a hóstia e o cálice, palmas para baixo, e diz Hanc ígitur; junta as mãos ao “Per Christum”.', M: (customs.bellHancIgitur ? 'Quando o sacerdote estende as mãos sobre as oblatas, o acólito toca a campainha uma vez (sinal da proximidade da Consagração, onde for costume). ' : '') + 'Depois levanta-se com a campainha e, sem genuflectir, sobe e ajoelha-se no supedâneo, um pouco à direita do sacerdote.' },
      ref: 'Ritus servandus VIII, 4; O’Connell p. 359–360 (n. 20–21)', edu: 'canon' },
      [g('P', 'manusSuper'), par(hanc, customs.bellHancIgitur ? bell(1, { mode: 'window', win: 7, why: 'sinal ao Hanc igitur (costume)', custom: true }) : null), g('P', 'jungere', { why: 'ao “Per Christum”' }),
        go('M', 'M_consecr'), kneel('M', { at: 'M_consecr' })]);
    S('quamOblationem', 'canon', 'Quam oblatiónem', { rub: { P: 'Traça três cruzes sobre as oblatas (bene✠díctam, adscríp✠tam, ra✠tam); depois uma sobre a hóstia (Cor✠pus) e uma sobre o cálice (San✠guis); junta as mãos.', M: 'O acólito permanece de joelhos ao lado do sacerdote.' }, ref: 'Ritus servandus VIII, 4' },
      [say('P', 'quamOblationem1', 'secreta'), g('P', 'benedicere', { n: 3 }), say('P', 'quamOblationem2', 'secreta'), g('P', 'benedicere', { n: 2, why: 'sobre a hóstia e sobre o cálice' }), say('P', 'quamOblationem3', 'secreta'), g('P', 'jungere')]);
    S('quiPridie', 'consecratio', 'Qui prídie', { rub: { P: 'Toma a hóstia entre os polegares e indicadores; eleva os olhos ao céu; inclina a cabeça a “tibi grátias agens”; traça uma cruz sobre a hóstia a “bene✠díxit”.', M: 'Quando o sacerdote se inclina para dizer as palavras da Consagração, o acólito inclina-se moderadamente.' }, ref: 'Ritus servandus VIII, 5', edu: 'consecratio' },
      [chantWait(), say('P', 'quiPridie1', 'secreta'), act('P', 'accipereHostiam'), say('P', 'quiPridie2', 'secreta'), g('P', 'elevareOculos'), say('P', 'quiPridie3', 'secreta'), g('P', 'inclinCapitis'), say('P', 'quiPridie4', 'secreta'), g('P', 'benedicere'), say('P', 'quiPridie5', 'secreta')]);
    S('consecratioHostiae', 'consecratio', 'Consagração da Hóstia', {
      rub: { P: 'Apoiado sobre o altar, profere as palavras da Consagração em silêncio, distinta e atentamente. Logo genuflecte e adora; ergue-se e eleva a Hóstia para que o povo a adore; depõe-na sobre o corporal e genuflecte de novo.', M: 'Quando o sacerdote genuflecte, o acólito toca a campainha; ergue um pouco a orla da casula com a mão esquerda durante a elevação e toca de novo, olhando para a Hóstia (“Meu Senhor e meu Deus”); à segunda genuflexão, toca a terceira vez.' },
      ref: 'Ritus servandus VIII, 5–6; O’Connell p. 359–360 (n. 21)', edu: 'consecratio' },
      [cam('consecr'), par(sayT('P', T('hocEst').la, T('hocEst').pt, 'consecr'), g('M', 'inclinMedia', { mode: 'window', win: 6, minor: true })),
        par(g('P', 'genuflectere'), bell(1, { mode: 'window', win: 5, why: 'à primeira genuflexão' })),
        par(act('P', 'elevareHostiam'), g('M', 'erguer', { mode: 'window', win: 6, why: 'ergue a orla da casula' }), bell(1, { mode: 'window', win: 6, why: 'à elevação da Hóstia' }), ev('faithfulAdore')),
        act('P', 'deponereHostiam'),
        par(g('P', 'genuflectere'), bell(1, { mode: 'window', win: 5, why: 'à segunda genuflexão' }))]);
    S('consecratioCalicis', 'consecratio', 'Consagração do Cálice', {
      rub: { P: 'Descobre o cálice; toma-o com ambas as mãos; inclina a cabeça; abençoa-o; profere sobre ele as palavras da Consagração, segurando-o um pouco elevado; depõe-no dizendo “Hæc quotiescúmque”; genuflecte, eleva o Cálice, depõe-no, cobre-o com a pala e genuflecte de novo.', M: 'O acólito faz como na elevação da Hóstia: campainha à genuflexão, à elevação (erguendo a casula) e à segunda genuflexão.' },
      ref: 'Ritus servandus VIII, 7; O’Connell p. 263ss', edu: 'consecratio' },
      [act('P', 'discooperirePalla'), say('P', 'simili1', 'secreta'), act('P', 'accipereCalicem'), say('P', 'simili2', 'secreta'), g('P', 'inclinCapitis'), say('P', 'simili3', 'secreta'), g('P', 'benedicere'), say('P', 'simili4', 'secreta'),
        sayT('P', T('hicEst').la, T('hicEst').pt, 'consecr'), say('P', 'haecQuotiescumque', 'secreta'),
        par(g('P', 'genuflectere'), bell(1, { mode: 'window', win: 5, why: 'à genuflexão' })),
        par(act('P', 'elevareCalicem'), g('M', 'erguer', { mode: 'window', win: 6, why: 'ergue a orla da casula' }), bell(1, { mode: 'window', win: 6, why: 'à elevação do Cálice' }), ev('faithfulAdore')),
        act('P', 'deponereCalicem'),
        par(g('P', 'genuflectere'), bell(1, { mode: 'window', win: 5, why: 'à segunda genuflexão' })),
        cam('canon'), stand('M'), go('M', 'M_stepEp'), kneel('M', { at: 'M_stepEp' })]);

    S('undeEtMemores', 'postcons', 'Unde et mémores · Supra quæ', {
      rub: { P: 'De mãos estendidas diz Unde et mémores; junta as mãos e traça cinco cruzes (três sobre a Hóstia e o Cálice juntos, uma sobre a Hóstia, uma sobre o Cálice); de mãos estendidas, diz Supra quæ. Desde a Consagração, não separa mais os polegares dos indicadores, salvo para tocar a Hóstia.', M: 'O acólito permanece de joelhos no degrau, do lado da Epístola.' },
      ref: 'Ritus servandus VIII, 8–9' },
      [g('P', 'extendere'), say('P', 'undeEtMemores1', 'secreta'), g('P', 'jungere'), g('P', 'benedicere', { n: 5 }), say('P', 'undeEtMemores2', 'secreta'), g('P', 'extendere'), say('P', 'supraQuae', 'secreta')]);
    S('supplices', 'postcons', 'Súpplices te rogámus', { rub: { P: 'Profundamente inclinado, com as mãos juntas pousadas sobre o altar, diz Súpplices; beija o altar; ergue-se e traça uma cruz sobre a Hóstia e outra sobre o Cálice; benze-se a “omni benedictióne”.', M: 'O acólito permanece de joelhos.' }, ref: 'Ritus servandus VIII, 9' },
      [g('P', 'inclinProfunda', { hold: true }), say('P', 'supplices1', 'secreta'), g('P', 'osculari'), base('P', { bow: 0 }), g('P', 'benedicere', { n: 2 }), say('P', 'supplices2', 'secreta'), g('P', 'signum'), say('P', 'supplices3', 'secreta')]);
    S('mementoDefunctorum', 'postcons', 'Memento dos defuntos e Nobis quoque', {
      rub: { P: 'De mãos estendidas, diz o Memento dos defuntos; junta as mãos e reza um pouco pelos defuntos; ao “Per eúndem” inclina a cabeça. Bate no peito dizendo em voz um pouco elevada “Nobis quoque peccatóribus” e prossegue em silêncio, de mãos estendidas.', M: 'O acólito não bate no peito ao “Nobis quoque peccatóribus”.' },
      ref: 'Ritus servandus VIII, 9–10; O’Connell p. 360 (n. 24)' },
      [g('P', 'extendere'), say('P', 'mementoEtiam1', 'secreta'), g('P', 'jungere'), wait(4), g('P', 'extendere'), par(say('P', 'mementoEtiam2', 'secreta'), g('P', 'inclinCapitis', { mode: 'window', win: 5, why: 'ao “Per eundem Christum”' })),
        par(g('P', 'percutere'), say('P', 'nobisQuoque1', 'media')), g('P', 'extendere'), say('P', 'nobisQuoque2', 'secreta')]);
    S('perIpsum', 'postcons', 'Per quem · Per ipsum (pequena elevação)', {
      rub: { P: 'Traça três cruzes sobre a Hóstia e o Cálice (“sanctí✠ficas, viví✠ficas, bene✠dícis”); descobre o cálice, genuflecte, toma a Hóstia e traça com ela três cruzes de borda a borda do cálice e duas entre o cálice e o peito; eleva um pouco o Cálice com a Hóstia (“omnis honor et glória”); depõe-nos, cobre o cálice, genuflecte e diz em voz alta: Per ómnia sǽcula sæculórum.', M: 'O acólito responde: Amen.' },
      ref: 'Ritus servandus IX, 1–2; O’Connell p. 271ss' },
      [say('P', 'perQuem', 'secreta'), g('P', 'benedicere', { n: 3, npcHint: true }), act('P', 'discooperirePalla'), g('P', 'genuflectere'), act('P', 'signareCumHostia'), say('P', 'perIpsum1', 'secreta'), act('P', 'elevatioMinor'), say('P', 'perIpsum2', 'secreta'), act('P', 'cooperirePalla'), g('P', 'genuflectere'),
        say('P', 'perOmnia'), say('M', 'amen')]);

    // ================= PATER NOSTER =================
    S('paterNoster', 'pater', 'Pater noster', {
      rub: { P: 'De mãos juntas, inclinando a cabeça ao Sacramento, diz “Orémus. Præcéptis salutáribus…”; estende as mãos e diz o Pater noster em voz alta, de olhos fixos no Sacramento.', M: 'O acólito responde: Sed líbera nos a malo.' },
      ref: 'Ritus servandus X, 1; O’Connell p. 360 (n. 23)', edu: 'pater' },
      cant ? [cam('normal'), par(g('P', 'inclinCapitis', { why: 'ao “Oremus”' }), chant(CH.tones.praeceptis, { solo: true, label: 'Præcéptis salutáribus (tom solene)' })), g('P', 'extendere'), chant(CH.tones.paterNoster, { solo: true, label: 'Pater noster (tom solene)' }), say('P', 'amen', 'secreta')]
      : [cam('normal'), par(g('P', 'inclinCapitis', { why: 'ao “Oremus”' }), say('P', 'praeceptis')), g('P', 'extendere'), say('P', 'paterNoster'), say('M', 'sedLibera'), say('P', 'amen', 'secreta')]);
    S('liberaNos', 'pater', 'Líbera nos e fração da Hóstia', {
      rub: { P: 'Toma a patena entre o indicador e o médio e diz em silêncio Líbera nos; benze-se com a patena (“da propítius pacem”), beija-a e a põe sob a Hóstia. Descobre o cálice, genuflecte e parte a Hóstia ao meio sobre o cálice; da metade esquerda separa uma partícula. Diz em voz alta “Per ómnia sǽcula sæculórum”; traça três cruzes com a partícula sobre o cálice, dizendo “Pax ✠ Dómini sit ✠ semper ✠ vobíscum”; deixa cair a partícula no cálice (Hæc commíxtio), cobre-o e genuflecte.', M: 'O acólito responde “Amen” e “Et cum spíritu tuo”.' },
      ref: 'Ritus servandus X, 1–3; O’Connell p. 277ss', edu: 'pater' },
      [act('P', 'tollerePatenam'), say('P', 'liberaNos1', 'secreta'), g('P', 'signum', { why: 'benze-se com a patena' }), say('P', 'liberaNos2', 'secreta'), act('P', 'osculariPatenam'), say('P', 'liberaNos3', 'secreta'),
        act('P', 'discooperirePalla'), g('P', 'genuflectere'), act('P', 'frangere'), say('P', 'perEundem1', 'secreta'), say('P', 'perEundem2', 'secreta'),
        say('P', 'perOmnia'), say('M', 'amen'), act('P', 'signareParticula'), say('P', 'paxDomini'), say('M', 'etCumSpiritu'),
        act('P', 'commiscere'), say('P', 'haecCommixtio', 'secreta'), act('P', 'cooperirePalla'), g('P', 'genuflectere')]);

    // ================= AGNUS DEI =================
    const agnus = req
      ? [say('P', 'agnusDef1', 'clara'), say('P', 'agnusDef1', 'clara'), say('P', 'agnusDef3', 'clara')]
      : [par(say('P', 'agnus1'), g('P', 'percutere'), g('M', 'percutere', { mode: 'window', win: 5 })), par(say('P', 'agnus1'), g('P', 'percutere'), g('M', 'percutere', { mode: 'window', win: 5 })), par(say('P', 'agnus3'), g('P', 'percutere'), g('M', 'percutere', { mode: 'window', win: 5 }))];
    S('agnusDei', 'agnus', 'Agnus Dei', {
      rub: { P: 'Inclinado para o Sacramento, de mãos juntas, diz em voz inteligível o Agnus Dei' + (req ? ' com “dona eis réquiem” e, na terceira vez, “sempitérnam”, sem bater no peito (Missa de defuntos).' : ', batendo três vezes no peito.'), M: req ? 'Na Missa de defuntos o acólito não bate no peito.' : 'O acólito inclina a cabeça e bate no peito com o sacerdote.' },
      ref: 'Ritus servandus X, 3; O’Connell p. 360 (n. 24)', edu: 'agnus' },
      [g('P', 'inclinMedia', { hold: true }), chant(ky.agnus, { bg: true, label: 'Agnus Dei (schola)' }), ...quietAll(cant ? agnus : []), ...(cant ? [] : agnus), base('P', { bow: 0 })]);
    S('orationesAnteCommunionem', 'agnus', 'Orações antes da Comunhão', {
      rub: { P: 'Inclinado, com as mãos juntas sobre o altar, diz em silêncio as orações ' + (req ? 'Dómine Jesu Christe, Fili Dei vivi e Percéptio (na Missa de defuntos omite-se a primeira, sobre a paz).' : 'Dómine Jesu Christe, qui dixísti; Dómine Jesu Christe, Fili Dei vivi; e Percéptio.'), M: 'Havendo comungantes, o acólito toca a campainha uma vez depois do Agnus Dei, toma a patena de comunhão e, como vai comungar, sobe e ajoelha-se na borda do supedâneo.' },
      ref: 'Ritus servandus X, 3; O’Connell p. 360 (n. 25–26)' },
      [g('P', 'inclinMedia', { hold: true }), par([req ? null : say('P', 'quiDixisti', 'secreta'), say('P', 'filiDeiVivi', 'secreta'), say('P', 'perceptio', 'secreta')],
        [bell(1, { mode: 'window', win: 12, why: 'sinal para os comungantes' }), stand('M'), go('M', 'M_credence'), carry('M', null), act('M', 'tollerePatenamComm'), state(sc => { sc.state.credence.paten = false; sc.state.credence.bell = true; }), carry('M', 'paten'), go('M', 'M_communion'), kneel('M', { at: 'M_communion' })]),
        base('P', { bow: 0 })]);

    // ================= COMUNHÃO =================
    S('communioSacerdotis', 'communio', 'Comunhão do sacerdote', {
      rub: { P: 'Genuflecte; toma a Hóstia dizendo Panem cæléstem accípiam; ligeiramente inclinado, bate três vezes no peito dizendo em voz um pouco elevada “Dómine, non sum dignus” e prossegue em silêncio. Benze-se com a Hóstia (Corpus Dómini…) e comunga; recolhe-se um momento.', M: 'O acólito permanece inclinado durante a comunhão do sacerdote.' + (customs.bellDomineNonSum ? ' Por costume local, toca a campainha a cada “Dómine, non sum dignus”.' : ' (Pelo Missal de 1962, já não se toca a campainha nestas palavras.)') },
      ref: 'Ritus servandus X, 4–5; O’Connell p. 360 (n. 24)', edu: 'communio' },
      [g('P', 'genuflectere'), act('P', 'accipereHostiam'), say('P', 'panemCaelestem', 'secreta'), g('P', 'inclinMedia', { hold: true }),
        ...[1, 2, 3].map(() => par(g('P', 'percutere'), say('P', 'domineNonSum', 'media'), customs.bellDomineNonSum ? bell(1, { mode: 'window', win: 5, custom: true, opt: true }) : null)),
        base('P', { bow: 0 }), par(g('P', 'signum', { why: 'com a Hóstia' }), say('P', 'corpusDominiMeam', 'secreta')), act('P', 'sumereHostiam'), wait(3)]);
    S('communioSanguinis', 'communio', 'Comunhão do Preciosíssimo Sangue', {
      rub: { P: 'Descobre o cálice, genuflecte, recolhe os fragmentos com a patena dizendo Quid retríbuam; benze-se com o cálice (Sanguis Dómini…) e toma todo o Sangue com a partícula.', M: 'O acólito permanece inclinado.' }, ref: 'Ritus servandus X, 5' },
      [act('P', 'discooperirePalla'), g('P', 'genuflectere'), act('P', 'colligere'), say('P', 'quidRetribuam', 'secreta'), par(g('P', 'signum', { why: 'com o cálice' }), say('P', 'sanguisDomini', 'secreta')), act('P', 'sumereSanguinem')]);
    const commF = [];
    if (customs.confiteorCommunion) {
      commF.push(g('M', 'inclinMedia', { hold: true, custom: true }), say('M', 'confiteorComm', 'clara', { custom: true }), base('M', { bow: 0 }));
      commF.push(g('P', 'vertere'), say('P', 'misereaturVestriComm'), say('M', 'amen'), par(g('P', 'benedicere'), say('P', 'indulgentiamComm')), say('M', 'amen'), g('P', 'vertere', { back: true }));
    }
    S('communioFidelium', 'communio', 'Comunhão dos fiéis', {
      rub: { P: 'Havendo comungantes, abre o sacrário, genuflecte e tira a âmbula; ' + (customs.confiteorCommunion ? '(por costume, o acólito diz o Confíteor e o sacerdote o Misereátur e o Indulgéntiam;) ' : '(pelo Missal de 1962 omite-se o Confíteor antes da Comunhão;) ') + 'voltado para o povo, mostra uma partícula dizendo Ecce Agnus Dei e três vezes Dómine, non sum dignus; dá a Comunhão primeiro ao acólito, depois aos fiéis na balaustrada, traçando com a Hóstia uma cruz sobre a âmbula e dizendo a cada um: Corpus Dómini nostri Jesu Christi custódiat ánimam tuam in vitam ætérnam. Amen.', M: 'O acólito, ajoelhado no supedâneo, bate no peito a cada “Dómine, non sum dignus” e comunga; depois desce e, à direita do sacerdote, segura a patena sob o queixo de cada comungante.' },
      ref: 'Ritus servandus X, 6; O’Connell p. 360–361 (n. 26–28)', edu: 'communio' },
      [chantWait(), chant(pr.co, { bg: true, proper: true, label: 'Comunhão (schola)' }), act('P', 'aperireTabernaculum'), state(sc => { sc.state.tabernacleOpen = true; }), g('P', 'genuflectere'), ...commF,
        g('P', 'vertere'), par(act('P', 'ostendere', { npcOnly: true }), say('P', 'ecceAgnus')),
        ...[1, 2, 3].map(() => par(say('P', 'domineNonSum', 'clara'), g('M', 'percutere', { mode: 'window', win: 5 }))),
        act('P', 'distribuere'), ev('communion'),
        go('P', 'P_mid'), act('P', 'claudereTabernaculum'), g('P', 'genuflectere'), state(sc => { sc.state.tabernacleOpen = false; sc.state.gateOpen = false; sc.gateBlock && sc.gateBlock(); })]);

    // ================= ABLUÇÕES =================
    S('ablutio', 'ablutio', 'Abluções', {
      rub: { P: 'Diz em silêncio Quod ore súmpsimus enquanto estende o cálice ao acólito, que deita um pouco de vinho para a purificação; toma-a. No canto da Epístola, sobre o cálice, recebe vinho e água sobre os polegares e indicadores (Corpus tuum, Dómine), enxuga-os e toma a ablução.', M: 'Fechado o sacrário, o acólito toma as galhetas, vai ao altar e deita vinho no cálice até o sinal do sacerdote; depois, no canto da Epístola, deita um pouco de vinho e depois água sobre os dedos do sacerdote. Não beija as galhetas nas abluções.' },
      ref: 'Ritus servandus X, 5; O’Connell p. 361 (n. 30–32)', edu: 'ablutio' },
      [par(go('M', 'M_credence'), go('P', 'P_mid')), carry('M', null), act('M', 'tollereUrceolos'), state(sc => { sc.state.credence.cruets = false; sc.state.credence.paten = true; }), carry('M', 'cruets'), go('M', 'M_cruets'),
        act('P', 'porrigereCalicem'), say('P', 'quodOre', 'secreta'), act('M', 'infundereAblutio'),
        go('P', 'P_epCorner'), act('M', 'infundereDigitis'), act('P', 'ablutio'), say('P', 'corpusTuum', 'secreta')]);
    S('translatioMissalis', 'ablutio', 'Missal ao lado da Epístola; cálice composto', {
      rub: { P: 'Enxuga os dedos, toma a ablução, purifica o cálice e, no meio do altar, compõe-no: purificatório, patena, pala, véu e bolsa com o corporal dobrado.', M: 'O acólito leva as galhetas à credência; passa ao lado do Evangelho (genuflectindo no meio), toma o Missal, desce obliquamente, genuflecte no meio, sobe e o põe no lado da Epístola, paralelo à borda do altar; depois ajoelha-se no degrau mais baixo do lado do Evangelho.' },
      ref: 'Ritus servandus X, 5; XI, 1; O’Connell p. 361–362 (n. 33)' },
      [par(
        [go('P', 'P_mid'), act('P', 'componereCalicem'), state(sc => { sc.state.chalice = 'veiled'; })],
        [go('M', 'M_credence'), act('M', 'reddereUrceolos'), state(sc => { sc.state.credence.cruets = true; }), carry('M', null),
          go('M', 'M_midFloor'), g('M', 'genuflectere', { why: 'ao passar pelo meio' }), go('M', 'M_missalEv'), act('M', 'transferreMissale'), state(sc => { sc.state.missal = { at: 'carried', open: true }; }), carry('M', 'missalStand'),
          go('M', 'M_midFloor'), g('M', 'genuflectere', { why: 'no meio, carregando o Missal' }), go('M', 'M_missalEp'), act('M', 'ponereMissaleEp'), carry('M', null), state(sc => { sc.state.missal = { at: 'epistle', open: true }; }),
          go('M', 'M_midFloor'), g('M', 'genuflectere', { why: 'ao passar pelo meio' }), go('M', 'M_stepEv'), kneel('M', { at: 'M_stepEv' })]
      )]);

    // ================= PÓS-COMUNHÃO =================
    const postEls = [chantWait(), go('P', 'P_ep'), ...quietAll(reading(cel, 'Communio')), go('P', 'P_mid'), g('P', 'osculari'), g('P', 'vertere'), par(g('P', 'extJung', { gesture: 'extendere' }), say('P', 'dominusVobiscum')), say('M', 'etCumSpiritu'), g('P', 'vertere', { back: true }),
      go('P', 'P_ep'), par(g('P', 'inclinCapitis', { why: 'ao “Oremus”' }), say('P', 'oremus')), g('P', 'extendere'), ...cantAll(oration(cel, 'Postcommunio', 'clara', { handsP: true })), say('M', 'amen')];
    if (cel.superPopulum && cel.parts['Super populum']) {
      const sp = properTexts(cel, 'Super populum').filter(t => !/^Orémus/.test(t.la));
      postEls.push(par(g('P', 'inclinCapitis', { why: 'ao “Oremus”' }), say('P', 'oremus')));
      if (sp.length) { postEls.push(par(sayT('P', sp[0].la, sp[0].pt, 'clara'), g('P', 'inclinCapitis', { mode: 'window', win: 4, why: '“Humiliáte cápita vestra Deo”' }))); }
      postEls.push(g('P', 'extendere'));
      sp.slice(1).forEach(t => postEls.push(...readText('P', t.la, t.pt, 'clara', { nameBow: true })));
      postEls.push(say('M', 'amen'));
    }
    S('postcommunio', 'postcommunio', 'Antífona da Comunhão e Pós-Comunhão', {
      rub: { P: 'No lado da Epístola, lê de mãos juntas a antífona da Comunhão; no meio, beija o altar e saúda o povo; volta ao livro e diz a Pós-Comunhão como a Coleta.' + (cel.superPopulum ? ' Em seguida, a “Oração sobre o povo”, precedida de “Humiliáte cápita vestra Deo”.' : ''), M: 'O acólito responde à saudação e “Amen” às orações.' },
      ref: 'Ritus servandus XI, 1–2; ' + refOf(cel, 'Communio'), edu: 'postcommunio' },
      postEls);

    // ================= CONCLUSÃO =================
    let ite = cel.ite === 'iteAlleluia' ? [say('P', 'iteMissaEstAll'), say('M', 'deoGratiasAll')] : cel.ite === 'benedicamus' ? [say('P', 'benedicamus'), say('M', 'deoGratias')] : [say('P', 'iteMissaEst'), say('M', 'deoGratias')];
    if (cant && (ky.ite || ky.iteAll)) ite = [chant(cel.ite === 'iteAlleluia' && ky.iteAll ? ky.iteAll : ky.ite, { solo: true, label: 'Ite, missa est — Deo grátias' })];
    const reqEnd = cant && req && ky.ite ? [chant(ky.ite, { solo: true, label: 'Requiéscant in pace — Amen' })] : [say('P', 'requiescant'), say('M', 'amen')];
    S('iteMissaEst', 'conclusio', req ? 'Requiéscant in pace' : (cel.ite === 'iteAlleluia' ? 'Ite, missa est, allelúja' : 'Ite, missa est'), {
      rub: { P: req ? 'Fecha o Missal; no meio, beija o altar, volta-se e diz Dóminus vobíscum; volta-se ao altar e, voltado para ele, diz Requiéscant in pace.' : 'Fecha o Missal; no meio, beija o altar e, voltado ao povo, diz Dóminus vobíscum e ' + (cel.ite === 'iteAlleluia' ? '“Ite, missa est, allelúja, allelúja” (oitava da Páscoa)' : '“Ite, missa est”') + '.', M: req ? 'O acólito responde: Amen.' : 'O acólito responde: ' + (cel.ite === 'iteAlleluia' ? 'Deo grátias, allelúja, allelúja.' : 'Deo grátias.') },
      ref: 'Ritus servandus XI, 1; Codex Rubricarum n. 507', edu: 'conclusio' },
      [act('P', 'claudereMissale'), state(sc => { sc.state.missal.open = false; }), go('P', 'P_mid'), g('P', 'osculari'), g('P', 'vertere'), par(g('P', 'extJung', { gesture: 'extendere' }), say('P', 'dominusVobiscum')), say('M', 'etCumSpiritu'),
        ...(req ? [g('P', 'vertere', { back: true }), ...reqEnd] : [...ite, g('P', 'vertere', { back: true })])]);
    S('placeat', 'conclusio', 'Pláceat tibi', { rub: { P: 'Inclinado diante do meio do altar, com as mãos juntas sobre ele, diz em silêncio Pláceat tibi, sancta Trínitas.', M: 'O acólito permanece de joelhos.' }, ref: 'Ritus servandus XII, 1' },
      [g('P', 'inclinMedia', { hold: true }), say('P', 'placeat', 'secreta'), base('P', { bow: 0 }), req ? g('P', 'osculari', { why: 'beija o altar antes do Último Evangelho' }) : null]);
    if (!req) {
      S('benedictio', 'conclusio', 'Bênção final', {
        rub: { P: 'Beija o altar; erguendo os olhos, estende, eleva e junta as mãos e, inclinando a cabeça à cruz, diz Benedícat vos omnípotens Deus; volta-se para o povo e o abençoa uma só vez: Pater, et Fílius, ✠ et Spíritus Sanctus. Completa o círculo e vai ao lado do Evangelho.', M: 'O acólito, de joelhos, inclina a cabeça, benze-se e responde “Amen”.' },
        ref: 'Ritus servandus XII, 1; O’Connell p. 362 (n. 35)', edu: 'conclusio' },
        [ev('faithfulKneel'), g('P', 'osculari'), g('P', 'elevareOculos'), g('P', 'extendere', { why: 'estende, eleva e junta as mãos' }), par(g('P', 'inclinCapitis'), say('P', 'benedicat1')), g('P', 'vertere'),
          par(g('P', 'benedicere', { why: 'abençoa o povo uma só vez' }), say('P', 'benedicat2'), g('M', 'signum', { mode: 'window', win: 6 }), ev('faithfulSign')), say('M', 'amen', 'clara', { chorus: false }), g('P', 'vertere', { back: true, circle: true })]);
    }
    // ================= ÚLTIMO EVANGELHO =================
    if (cel.ultimaEv !== false) {
      S('ultimumEvangelium', 'ultimum', 'Último Evangelho (Jo 1, 1-14)', {
        rub: { P: 'No lado do Evangelho, de mãos juntas, diz Dóminus vobíscum; assinala o altar (ou a sacra) e a si mesmo na fronte, na boca e no peito, e lê o início do Evangelho segundo São João; genuflecte a “Et Verbum caro factum est”.', M: 'O acólito levanta-se, responde, faz os pequenos sinais da cruz; passa ao lado da Epístola, genuflectindo no meio, e fica de pé voltado para o sacerdote; genuflecte a “Et Verbum caro factum est” e responde no fim “Deo grátias”.' },
        ref: 'Ritus servandus XII, 1; O’Connell p. 362 (n. 35)', edu: 'ultimum' },
        [ev('faithfulStand'), stand('M'), go('P', 'P_ev'), say('P', 'dominusVobiscum'), say('M', 'etCumSpiritu'), par(g('P', 'signumParvum', { why: 'assinala a sacra e a si mesmo' }), g('M', 'signumParvum', { mode: 'window', win: 6 })),
          say('P', 'initiumJoannem'), say('M', 'gloriaTibi'), go('M', 'M_midFloor'), g('M', 'genuflectere', { why: 'ao passar pelo meio' }), go('M', 'M_epStand'),
          say('P', 'inPrincipio1'), par(g('P', 'genuflectere', { why: 'ao “Et Verbum caro factum est”' }), g('M', 'genuflectere', { mode: 'window', win: 6 }), ev('faithfulGenu')), say('P', 'inPrincipio2'), say('P', 'inPrincipio3'), say('M', 'deoGratias')]);
    }
    // ================= ORAÇÕES LEONINAS =================
    if (form !== 'cantata') {
      const L = [];
      for (let i = 0; i < 3; i++) L.push(say('P', 'aveMaria1'), say('M', 'aveMaria2'));
      L.push(say('PM', 'salveRegina'), say('P', 'oraProNobis'), say('M', 'utDigni'), say('P', 'deusRefugium'), say('M', 'amen'), say('PM', 'sancteMichael'));
      for (let i = 0; i < 3; i++) L.push(say('P', 'corJesu'), say('M', 'miserereNobis'));
      S('leonine', 'leonine', 'Orações leoninas', {
        rub: { P: 'Terminado o Último Evangelho, o celebrante vai ao meio, inclina-se à cruz, desce ao pé do altar e, de joelhos no degrau mais baixo, reza com o povo as orações prescritas por Leão XIII: três Ave-Marias, a Salve Rainha, o versículo, a oração Deus, refúgium nostrum, a invocação a São Miguel e, por costume, três vezes “Cor Jesu sacratíssimum”.', M: 'O acólito ajoelha-se ao lado do sacerdote, de preferência no chão, responde em voz clara e reza com ele a Salve Rainha.' },
        ref: 'S. C. R., 1884/1886/1934; O’Connell p. 362 (n. 38)', edu: 'leonine' },
        [go('P', 'P_mid'), g('P', 'inclinCapitis'), par(go('P', 'P_foot'), [stand('M'), go('M', 'M_foot')]), par(g('P', 'genuflectere'), g('M', 'genuflectere', { mode: 'window', win: 6 })), base('P', { pose: 'kneel' }), kneel('M', { at: 'M_foot' }), ...L, base('P', { pose: 'stand' })]);
    }
    // ================= RETORNO =================
    S('recessus', 'recessus', 'Retorno à sacristia', {
      rub: { P: 'Sobe, toma o cálice velado, desce ao pé do altar, faz genuflexão no chão, recebe o barrete e, coberto, segue o acólito até a sacristia; ali faz inclinação ao crucifixo.', M: 'O acólito devolve o cartão à credência, toma o barrete, genuflecte com o sacerdote ao pé do altar, entrega-lhe o barrete (beijando-o) e o precede até a sacristia.' },
      ref: 'Ritus servandus XII, 6; O’Connell p. 363 (n. 39–40)', edu: 'recessus' },
      [stand('M'), par([go('P', 'P_mid'), act('P', 'tollereCalicem'), state(sc => { sc.state.chalice = 'none'; }), go('P', 'P_foot')], [go('M', 'M_sedilia'), act('M', 'tollereBirettum'), state(sc => { sc.state.biretta = false; }), carry('M', 'biretta'), go('M', 'M_floorEp')]),
        par(g('P', 'genuflectere'), g('M', 'genuflectere', { mode: 'window', win: 6 })), act('M', 'praebereBirettum'), carry('M', null), ev('recessus')]);

    // Missa cantada: o celebrante canta as saudações, as orações e as leituras (tom ferial,
    // recto tono); o coro responde; o que o coro canta, o celebrante diz em voz baixa.
    if (cant) {
      const SUNG = new Set(['dominusVobiscum', 'oremus', 'perOmnia', 'paxDomini']);
      const CHORUS = new Set(['etCumSpiritu', 'amen', 'gloriaTibi']);
      const map = (arr, s) => arr.map(e => {
        if (!e) return e;
        if (Array.isArray(e)) return map(e, s);
        if (e.t === 'par') return Object.assign({}, e, { els: map(e.els, s) });
        if (e.t !== 'say') return e;
        if (s.sec === 'pe') return e.voice === 'clara' ? Object.assign({}, e, { voice: 'submissa' }) : e;
        if (s.sec === 'ultimum' || s.sec === 'leonine' || s.sec === 'recessus' || s.sec === 'ingressus') return e;
        if (e.quietInCantata) return Object.assign({}, e, { voice: 'submissa' });
        if (e.who === 'P' && e.voice === 'clara' && (SUNG.has(e.key) || e.cantable)) return Object.assign({}, e, { voice: 'cantus' });
        if (e.who === 'M' && CHORUS.has(e.key) && e.chorus !== false) return Object.assign({}, e, { who: 'C', voice: 'cantusChorus' });
        return e;
      });
      steps.forEach(s => { s.els = map(s.els, s); });
    }
    return { steps, sections: SECTIONS, cel, role, form };
  }

  DG.rite = { build, SECTIONS, properTexts };
})(window.DG = window.DG || {});
