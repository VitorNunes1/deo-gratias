/* DEO GRATIAS — calendário litúrgico tradicional (rubricas de 1960/1962)
   Cômputo pascal gregoriano, ciclo temporal e principais festas fixas. */
(function (DG) {
  'use strict';
  const DAY = 86400000;
  const d0 = (y, m, d) => new Date(y, m - 1, d, 12);
  const add = (date, n) => new Date(date.getTime() + n * DAY);
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const dow = d => d.getDay();

  function easter(y) { // algoritmo anônimo gregoriano (Meeus/Jones/Butcher)
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
    return d0(y, month, day);
  }
  function advent1(y) { // domingo entre 27 de novembro e 3 de dezembro
    const xmas = d0(y, 12, 25);
    const back = dow(xmas) === 0 ? 7 : dow(xmas);
    return add(xmas, -back - 21);
  }
  function lastSundayOct(y) { const d = d0(y, 10, 31); return add(d, -dow(d)); }

  // datas das celebrações jogáveis em um ano civil
  function datesFor(y) {
    const E = easter(y);
    const a1 = advent1(y);
    return {
      adv1: a1, adv3: add(a1, 14),
      septua: add(E, -63), quad1: add(E, -42), quad4: add(E, -21), quad5: add(E, -14), hebd2: add(E, -6),
      pascha: E, asc: add(E, 39), pent: add(E, 49), trin: add(E, 56), corpus: add(E, 60), cor: add(E, 68), pent4: add(E, 77),
      pent24: add(a1, -7), rex: lastSundayOct(y),
      '12-08': d0(y, 12, 8), '12-25': d0(y, 12, 25), '01-06': d0(y, 1, 6), '03-19': d0(y, 3, 19), '06-29': d0(y, 6, 29),
      '08-15': d0(y, 8, 15), '11-01': d0(y, 11, 1), '11-02': dow(d0(y, 11, 2)) === 0 ? d0(y, 11, 3) : d0(y, 11, 2), '11-17': d0(y, 11, 17), '11-22': d0(y, 11, 22),
    };
  }

  // festas fixas de I e II classe (calendário de 1962) — para exibição
  const FIXED = {
    '01-01': ['Oitava do Natal', 1, 'albus'], '01-06': ['Epifania do Senhor', 1, 'albus'], '01-13': ['Batismo de Nosso Senhor', 2, 'albus'],
    '02-02': ['Purificação da B. V. Maria', 2, 'albus'], '02-22': ['Cátedra de São Pedro', 2, 'albus'], '02-24': ['São Matias, Apóstolo', 2, 'ruber'],
    '03-19': ['São José, Esposo da B. V. Maria', 1, 'albus'], '03-25': ['Anunciação da B. V. Maria', 1, 'albus'],
    '05-01': ['São José Operário', 1, 'albus'], '05-31': ['Nossa Senhora Rainha', 2, 'albus'],
    '06-24': ['Natividade de São João Batista', 1, 'albus'], '06-29': ['São Pedro e São Paulo', 1, 'ruber'],
    '07-01': ['Preciosíssimo Sangue de N. S. J. Cristo', 1, 'ruber'], '07-02': ['Visitação da B. V. Maria', 2, 'albus'], '07-25': ['São Tiago, Apóstolo', 2, 'ruber'],
    '08-06': ['Transfiguração do Senhor', 2, 'albus'], '08-10': ['São Lourenço, Mártir', 2, 'ruber'], '08-15': ['Assunção da B. V. Maria', 1, 'albus'],
    '08-22': ['Imaculado Coração de Maria', 2, 'albus'], '08-24': ['São Bartolomeu, Apóstolo', 2, 'ruber'],
    '09-08': ['Natividade da B. V. Maria', 2, 'albus'], '09-14': ['Exaltação da Santa Cruz', 2, 'ruber'], '09-15': ['Sete Dores da B. V. Maria', 2, 'albus'],
    '09-21': ['São Mateus, Apóstolo', 2, 'ruber'], '09-29': ['Dedicação de São Miguel Arcanjo', 1, 'albus'],
    '10-07': ['Nossa Senhora do Rosário', 2, 'albus'], '10-11': ['Maternidade da B. V. Maria', 2, 'albus'], '10-18': ['São Lucas, Evangelista', 2, 'ruber'],
    '10-28': ['São Simão e São Judas, Apóstolos', 2, 'ruber'], '11-01': ['Todos os Santos', 1, 'albus'], '11-02': ['Fiéis Defuntos', 1, 'niger'],
    '11-09': ['Dedicação da Arquibasílica do Santíssimo Salvador', 2, 'albus'], '11-17': ['São Gregório Taumaturgo', 3, 'albus'],
    '11-22': ['Santa Cecília, Virgem e Mártir', 3, 'ruber'], '11-30': ['Santo André, Apóstolo', 2, 'ruber'],
    '12-08': ['Imaculada Conceição da B. V. Maria', 1, 'albus'], '12-21': ['São Tomé, Apóstolo', 2, 'ruber'],
    '12-25': ['Natal do Senhor', 1, 'albus'], '12-26': ['Santo Estêvão, Protomártir', 2, 'ruber'], '12-27': ['São João, Apóstolo e Evangelista', 2, 'albus'],
    '12-28': ['Santos Inocentes', 2, 'ruber'],
  };

  const pad = n => String(n).padStart(2, '0');
  const mmdd = d => pad(d.getMonth() + 1) + '-' + pad(d.getDate());

  // estação do ano litúrgico para uma data
  function seasonOf(date) {
    const y = date.getFullYear();
    const E = easter(y), a1 = advent1(y);
    const epi = d0(y, 1, 6), septua = add(E, -63), ash = add(E, -46), passio = add(E, -14), pent = add(E, 49);
    if (date >= a1 && date < d0(y, 12, 25)) return 'adventus';
    // Tempo do Natal: de 25/12 a 13/1 (inclui a Epifania e sua semana — Codex Rubricarum n. 71)
    if (date >= d0(y, 12, 25) || date < d0(y, 1, 14)) return 'nativitatis';
    void epi;
    if (date < septua) return 'epiphaniae';
    if (date < ash) return 'septuagesimae';
    if (date < passio) return 'quadragesimae';
    if (date < E) return 'passionis';
    if (date < add(pent, 7)) return 'paschale';
    return 'postpent';
  }

  function sundayName(date) {
    const y = date.getFullYear(), E = easter(y), a1 = advent1(y);
    const diffE = Math.round((date - E) / DAY);
    const diffA = Math.round((date - a1) / DAY);
    if (diffA >= 0 && diffA < 28) return ['I', 'II', 'III', 'IV'][diffA / 7] + ' Domingo do Advento';
    if (diffE === -63) return 'Domingo da Septuagésima';
    if (diffE === -56) return 'Domingo da Sexagésima';
    if (diffE === -49) return 'Domingo da Quinquagésima';
    if (diffE >= -42 && diffE <= -21) return ['I', 'II', 'III', 'IV'][(diffE + 42) / 7] + ' Domingo da Quaresma' + (diffE === -21 ? ' (Lætare)' : '');
    if (diffE === -14) return 'I Domingo da Paixão';
    if (diffE === -7) return 'II Domingo da Paixão (de Ramos)';
    if (diffE === 0) return 'Domingo da Ressurreição';
    if (diffE === 7) return 'Domingo in Albis';
    if (diffE > 7 && diffE < 49) return ['II', 'III', 'IV', 'V'][(diffE - 14) / 7] + ' Domingo depois da Páscoa';
    if (diffE === 42) return 'Domingo depois da Ascensão';
    if (diffE === 49) return 'Domingo de Pentecostes';
    if (diffE === 56) return 'Santíssima Trindade';
    if (diffE > 56 && date < a1) {
      const n = (diffE - 49) / 7;
      const last = Math.round((add(a1, -7) - E) / DAY - 49) / 7;
      if (sameDay(add(a1, -7), date)) return 'XXIV e Último Domingo depois de Pentecostes';
      // além do 23.º, os domingos tomam as Missas dos domingos restantes depois da Epifania
      if (n >= 24) { const k = last - n; return toRoman(n) + ' Domingo depois de Pentecostes (Missa do ' + toRoman(7 - k) + ' depois da Epifania)'; }
      return toRoman(n) + ' Domingo depois de Pentecostes';
    }
    // depois da Epifania
    const epi = d0(y, 1, 6);
    const firstSun = add(epi, 7 - dow(epi));
    if (sameDay(date, firstSun)) return 'Sagrada Família';
    const k = Math.round((date - firstSun) / DAY / 7) + 1;
    if (k >= 2 && k <= 6) return toRoman(k) + ' Domingo depois da Epifania';
    return 'Domingo';
  }
  function toRoman(n) { const m = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let s = ''; for (const [v, r] of m) while (n >= v) { s += r; n -= v; } return s; }

  const Cal = DG.calendar = {
    easter, advent1, datesFor, seasonOf, sundayName, FIXED, mmdd, sameDay,
    // informação de um dia (para o calendário e para “Hoje”)
    dayInfo(date) {
      const y = date.getFullYear();
      const dates = datesFor(y);
      const season = seasonOf(date);
      // precedência (Codex Rubricarum): classe mais alta vence; em igualdade, o Tempo (domingos) antes do Santoral
      const isTemp = (c) => !/^\d\d-\d\d$/.test(c.date);
      let playable = DG.cel.list.filter(c => dates[c.date] && sameDay(dates[c.date], date))
        .sort((a, b) => (a.classis - b.classis) || (isTemp(b) - isTemp(a)));
      // festa de III classe num domingo: omitida
      if (dow(date) === 0) playable = playable.filter(c => c.classis <= 2 || isTemp(c));
      if (playable.length > 1 && playable[0].classis < playable[1].classis) playable = [playable[0]];
      const fixed = FIXED[mmdd(date)];
      let name, color, classis;
      const isSunday = dow(date) === 0;
      if (playable.length) { name = playable[0].pt; color = playable[0].color; classis = playable[0].classis; }
      else if (fixed && (!isSunday || fixed[1] === 1)) { name = fixed[0]; classis = fixed[1]; color = fixed[2]; }
      else if (isSunday) { name = sundayName(date); color = DG.cel.SEASONS[season].color; classis = /Advento|Quaresma|Paixão|Páscoa|Pentecostes$|Ressurreição|Albis|Trindade/.test(name) ? 1 : 2; if (/Lætare/.test(name)) color = 'rosaceus'; if (/III Domingo do Advento/.test(name)) color = 'rosaceus'; }
      else { name = 'Féria — ' + DG.cel.SEASONS[season].name; color = season === 'paschale' || season === 'nativitatis' ? 'albus' : (season === 'epiphaniae' || season === 'postpent') ? 'viridis' : 'violaceus'; classis = (season === 'passionis' && Math.round((easter(y) - date) / DAY) <= 6) ? 1 : (season === 'quadragesimae' || season === 'passionis' || season === 'adventus') ? 3 : 4; }
      return { date, season, seasonName: DG.cel.SEASONS[season].name, name, color, classis, playable, isSunday };
    },
    today() { return Cal.dayInfo(new Date()); },
    // próxima ocorrência de uma celebração a partir de hoje
    nextDate(cel, from) {
      from = from || new Date();
      for (let y = from.getFullYear(); y <= from.getFullYear() + 1; y++) {
        const d = datesFor(y)[cel.date];
        if (d && d >= add(from, -1)) return d;
      }
      return datesFor(from.getFullYear() + 1)[cel.date];
    },
    // celebração jogável mais próxima de hoje (para sugerir no menu)
    suggested() {
      if (Cal._sug && Cal._sugDay === new Date().toDateString()) return Cal._sug;
      const now = new Date(); now.setHours(12, 0, 0, 0);
      let best = null;
      for (let i = 0; i < 400 && !best; i++) { const info = Cal.dayInfo(add(now, i)); if (info.playable.length) best = info.playable[0]; }
      Cal._sug = best; Cal._sugDay = new Date().toDateString();
      return best;
    },
  };
})(window.DG = window.DG || {});
