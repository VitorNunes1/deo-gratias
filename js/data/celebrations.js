/* DEO GRATIAS — celebrações: próprios + rubricas de 1962 */
(function (DG) {
  'use strict';
  const raw = DG.data.propersRaw || { celebrations: [], prefaces: {} };
  const O = DG.data.ordo;

  const SEASONS = {
    adventus: { name: 'Advento', color: 'violaceus' },
    nativitatis: { name: 'Tempo do Natal', color: 'albus' },
    epiphaniae: { name: 'Tempo da Epifania', color: 'viridis' },
    septuagesimae: { name: 'Septuagésima', color: 'violaceus' },
    quadragesimae: { name: 'Quaresma', color: 'violaceus' },
    passionis: { name: 'Tempo da Paixão', color: 'violaceus' },
    paschale: { name: 'Tempo Pascal', color: 'albus' },
    postpent: { name: 'Tempo depois de Pentecostes', color: 'viridis' },
  };
  const CLASS_NAMES = { 1: 'I classe', 2: 'II classe', 3: 'III classe', 4: 'IV classe' };

  function cleanLatinPreface(s) {
    return String(s || '').replace(/^v\.\s*/gm, '').replace(/~\s*\n/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  }

  const list = raw.celebrations.map(c => {
    const cel = Object.assign({
      gloria: false, credo: false, praef: 'Communis', comm: 'common', hanc: null, ultimaEv: true, ite: 'ite',
      ps42: true, gloriaPatri: true, requiem: false, sequentia: false, superPopulum: false, notes: [],
    }, c);
    cel.title = cel.pt;
    cel.seasonName = (SEASONS[cel.tempus] || {}).name || '';
    cel.className = CLASS_NAMES[cel.classis] || '';
    cel.colorName = (DG.LIT[cel.color] || {}).name || '';
    // cores do altar: o conopeu do sacrário e o frontal nunca são pretos quando o Santíssimo está reservado
    cel.tabernacleColor = cel.color === 'niger' ? 'violaceus' : cel.color;
    cel.frontalColor = cel.color === 'niger' ? 'violaceus' : cel.color;
    cel.leonine = true; // após a Missa rezada (podem omitir-se em certos casos; ver Manual)
    return cel;
  });

  // ---- acesso a textos ----
  function blocksText(blocks, lang) {
    if (!blocks) return '';
    return blocks.filter(b => b.k === 'text' || b.k === 'V' || b.k === 'R' || b.k === 'concl').map(b => b.t).join(' ');
  }

  const C = DG.cel = {
    list, SEASONS, CLASS_NAMES,
    get: id => list.find(c => c.id === id) || null,
    blocksText,
    part(cel, name) { return cel.parts[name] || null; },
    // texto do prefácio
    preface(cel) {
      const key = cel.praef || 'Communis';
      let la = cleanLatinPreface((raw.prefaces[key] || {}).la);
      let pt = (O.prefacesPt[key] || '');
      if (key === 'Pasch') {
        // remove as variantes condicionais do DO e escolhe a correta
        la = 'Vere dignum et justum est, æquum et salutáre: Te quidem, Dómine, omni témpore, sed in ' + (cel.praefDie ? 'hac potíssimum die' : 'hoc potíssimum') +
          ' gloriósius prædicáre, cum Pascha nostrum immolátus est Christus. Ipse enim verus est Agnus, qui ábstulit peccáta mundi. Qui mortem nostram moriéndo destrúxit et vitam resurgéndo reparávit. Et ídeo cum Angelis et Archángelis, cum Thronis et Dominatiónibus cumque omni milítia cæléstis exércitus hymnum glóriæ tuæ cánimus, sine fine dicéntes:';
        pt = pt.replace('{DIE}', cel.praefDie ? 'neste dia' : 'neste tempo');
      }
      if (key === 'Spiritu') {
        // "* *" marca o lugar de "hodiérna die" (dia e oitava de Pentecostes)
        la = la.replace(/\*\s*\*/, cel.id === 'pent' ? 'hodiérna die' : '').replace(/\s+/g, ' ');
        pt = pt.replace('{HOD}', cel.id === 'pent' ? 'neste dia ' : '');
      }
      if (key === 'Maria' || key === 'Joseph') {
        const ins = cel.praefIns || { la: 'Festivitáte', pt: 'Festividade' };
        la = la.replace(/\*[^*]+\*/, ins.la);
        pt = pt.replace('{INS}', ins.pt);
      }
      la = la.replace(/\*/g, '');
      return { key, name: O.prefaceNames[key] || key, la, pt };
    },
    communicantes(cel) {
      const k = cel.comm && O.communicantes[cel.comm] ? cel.comm : 'common';
      return Object.assign({ key: k }, O.communicantes[k]);
    },
    // resumo das rubricas que distinguem esta Missa
    rubricSummary(cel, form) {
      const yes = (b) => b ? 'sim' : 'não';
      const rows = [
        ['Classe', cel.className],
        ['Cor', cel.colorName],
        ['Salmo 42 (Judica me)', yes(cel.ps42)],
        ['Glória', yes(cel.gloria)],
        ['Sequência', yes(cel.sequentia)],
        ['Credo', yes(cel.credo)],
        ['Prefácio', C.preface(cel).name],
        ['Communicantes', cel.comm && cel.comm !== 'common' ? 'próprio' : 'comum'],
        ['Hanc igitur', cel.hanc ? 'próprio' : 'comum'],
        ['Despedida', cel.ite === 'requiescant' ? 'Requiéscant in pace' : cel.ite === 'iteAlleluia' ? 'Ite, missa est, allelúja' : cel.ite === 'benedicamus' ? 'Benedicámus Dómino' : 'Ite, missa est'],
        ['Bênção final', yes(!cel.requiem)],
        ['Último Evangelho', yes(cel.ultimaEv !== false)],
        ['Orações leoninas', form === 'cantata' ? 'não (Missa cantada)' : 'sim'],
      ];
      return rows;
    },
    seasonOf: (cel) => SEASONS[cel.tempus],
    // vestes: cor efetiva
    vestColor: (cel) => cel.color,
  };
})(window.DG = window.DG || {});
