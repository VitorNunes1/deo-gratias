/*
 * Deo Gratias — leitor dos arquivos do projeto Divinum Officium (DO).
 * https://github.com/DivinumOfficium/divinum-officium
 *
 * Resolve: seções condicionais ("(rubrica 196)", "(ad missam)"), herança de
 * arquivo ("@Tempora/Pent23-0" na primeira linha), referências de seção
 * ("@Commune/C4:Introitus"), linhas "(sed rubrica 1960)", conclusões ($Per Dominum)
 * e o Glória ao Pai (&Gloria). Seleciona sempre a variante das rubricas de 1960/1962.
 */
'use strict';
const fs = require('fs');
const path = require('path');

class DOReader {
  constructor(root) {
    this.root = root; // .../web/www
    this.cache = new Map();
    this.prayers = {};
  }

  // ---------- condições ----------
  condTrue(cond) {
    if (!cond) return true;
    const c = cond.toLowerCase();
    if (/nisi/.test(c)) return !/196/.test(c);
    if (/ad missam/.test(c)) return true;
    // O Comum dos Sumos Pontífices (1942) está em vigor no Missal de 1962
    if (/summorum pontificum/.test(c)) return true;
    // "rubrica 196" cobre 1960 e "196" (código do DO para as rubricas de 1960)
    if (/rubrica\s*196/.test(c)) return true;
    if (/rubrica\s*1955/.test(c) && !/rubrica\s*196/.test(c)) return false;
    if (/rubrica\s*(1570|1617|1888|1906|1930|1939|1954)/.test(c)) return false;
    if (/innovata|monastica|ordo praedicatorum|cisterciensis|tridentina/.test(c)) return false;
    return false;
  }

  filePath(lang, rel) {
    const cands = [
      path.join(this.root, 'missa', lang, rel + '.txt'),
      path.join(this.root, 'horas', lang, rel + '.txt'),
    ];
    for (const c of cands) if (fs.existsSync(c)) return c;
    return null;
  }

  // Lê arquivo -> { inherit: [paths], sections: Map(name -> [{cond, lines}]) }
  load(lang, rel) {
    const key = lang + '|' + rel;
    if (this.cache.has(key)) return this.cache.get(key);
    const fp = this.filePath(lang, rel);
    if (!fp) { this.cache.set(key, null); return null; }
    const raw = fs.readFileSync(fp, 'utf8').replace(/\r/g, '');
    const lines = raw.split('\n');
    const out = { rel, lang, inherit: [], sections: new Map() };
    let cur = null;
    for (const line of lines) {
      const m = line.match(/^\[([^\]]+)\]\s*(\(.*\))?\s*$/);
      if (m) {
        cur = { cond: m[2] || null, lines: [] };
        const name = m[1].trim();
        if (!out.sections.has(name)) out.sections.set(name, []);
        out.sections.get(name).push(cur);
        continue;
      }
      if (!cur) {
        const im = line.match(/^@([^\s:]+)\s*$/);
        if (im) out.inherit.push(im[1]);
        continue;
      }
      cur.lines.push(line);
    }
    this.cache.set(key, out);
    return out;
  }

  // Escolhe a variante adequada de uma seção
  pickVariant(variants) {
    let chosen = null;
    for (const v of variants) {
      if (!v.cond) { if (!chosen) chosen = v; }
      else if (this.condTrue(v.cond)) chosen = v;
    }
    return chosen;
  }

  rawSection(lang, rel, name, depth = 0) {
    if (depth > 8) return null;
    const f = this.load(lang, rel);
    if (!f) return null;
    if (f.sections.has(name)) {
      const v = this.pickVariant(f.sections.get(name));
      if (v) return { file: rel, lines: v.lines.slice() };
    }
    for (const inh of f.inherit) {
      const r = this.rawSection(lang, inh, name, depth + 1);
      if (r) return r;
    }
    return null;
  }

  // Aplica "(sed rubrica X)" linha a linha
  applySed(lines) {
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].trim();
      const m = l.match(/^\((sed|deinde|atque)\s+(.+)\)$/i);
      if (m && /rubrica|communi|ad missam/i.test(m[2])) {
        const ok = this.condTrue(m[2]);
        if (m[1].toLowerCase() === 'sed') {
          if (ok) { out.pop(); } else { i++; }
        } else if (!ok) { i++; }
        continue;
      }
      out.push(lines[i]);
    }
    return out;
  }

  // Resolve referências @... dentro de uma seção
  section(lang, rel, name, depth = 0) {
    const r = this.rawSection(lang, rel, name);
    if (!r) {
      // Tradução sem a seção: segue a referência que o latim usa nesse ponto
      if (lang !== 'Latin' && depth < 6) {
        const lat = this.rawSection('Latin', rel, name);
        if (lat) {
          const refs = lat.lines.map(l => l.trim()).filter(Boolean);
          if (refs.length === 1 && refs[0].startsWith('@')) {
            const mm = refs[0].match(/^@([^:\s]*)(?::([^:]+))?/);
            return this.section(lang, mm[1] || lat.file, mm[2] || name, depth + 1);
          }
        }
      }
      return null;
    }
    let lines = this.applySed(r.lines);
    const res = [];
    for (const line of lines) {
      const m = line.trim().match(/^@([^:\s]*)(?::([^:]+))?(?::(s\/.*))?$/);
      if (m && depth < 6) {
        const target = m[1] || r.file;
        let secName = m[2] || name;
        // "@Commune/C6-1" -> arquivo C6-1, mesma seção
        let sub = this.section(lang, target, secName, depth + 1);
        if (!sub && /-\d+$/.test(target)) sub = this.section(lang, target, secName, depth + 1);
        if (sub) {
          if (m[3]) sub = this.applySubst(sub, m[3]);
          res.push(...sub);
        } else {
          res.push('[[REF NÃO RESOLVIDA ' + line.trim() + ']]');
        }
        continue;
      }
      res.push(line);
    }
    return res;
  }

  applySubst(lines, expr) {
    // expr: s/old/new/flags (pode haver várias separadas por ':')
    let txt = lines.join('\n');
    const parts = expr.split(/:(?=s\/)/);
    for (const p of parts) {
      const m = p.match(/^s\/(.*?)\/(.*?)\/([gism]*)$/);
      if (!m) continue;
      try { txt = txt.replace(new RegExp(m[1], m[3].includes('g') ? 'g' : ''), m[2]); } catch (e) {}
    }
    return txt.split('\n');
  }

  loadPrayers(lang) {
    if (this.prayers[lang]) return this.prayers[lang];
    const f = this.load(lang, 'Ordo/Prayers');
    const map = {};
    if (f) for (const [k, vs] of f.sections) map[k] = this.pickVariant(vs).lines;
    this.prayers[lang] = map;
    return map;
  }
}

// ---------- utilidades de texto ----------
function cleanText(s) {
  return s
    .replace(/~/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();
}

// Converte linhas DO em blocos estruturados
// tipos: ref (citação), rubric (rubrica), text (texto), V / R (versículo/resposta)
function toBlocks(lines, prayers) {
  const blocks = [];
  let buf = null;
  let joinNext = false;
  const flush = () => { if (buf) { buf.t = cleanText(buf.t); if (buf.t) blocks.push(buf); buf = null; } joinNext = false; };
  for (let raw of lines) {
    let line = raw.replace(/\r/g, '');
    const tl = line.trim();
    if (!tl) { flush(); continue; }
    if (tl === '_') { flush(); continue; }
    if (tl.startsWith('$')) {
      flush();
      const key = tl.slice(1).trim();
      const pr = prayers[key];
      if (pr) {
        const txt = pr.filter(l => !/^R\./.test(l.trim())).map(l => l.replace(/^r\.\s*/, '')).join(' ');
        blocks.push({ k: 'concl', t: cleanText(txt), key });
      } else blocks.push({ k: 'concl', t: key, key, missing: true });
      continue;
    }
    if (tl.startsWith('&Gloria')) {
      flush();
      blocks.push({ k: 'gloriapatri' });
      continue;
    }
    if (tl.startsWith('&')) { flush(); blocks.push({ k: 'hook', t: tl.slice(1) }); continue; }
    if (tl.startsWith('!')) {
      flush();
      const body = tl.replace(/^!+/, '').trim();
      // citações bíblicas: "Ps 24:1-3", "Joann 1:1-14", "Sl 24:1-3", "Lc 21:25-33"
      if (/^[1-4]?\s?[A-Z][A-Za-zæœ\.]{0,8}\.?\s*\d+[:,.]\s*\d+/.test(body) || /^(Ps|Sl|Ps\.)\s*\d+/.test(body)) {
        blocks.push({ k: 'ref', t: body });
      } else blocks.push({ k: 'rubric', t: body });
      continue;
    }
    let m;
    if ((m = tl.match(/^(V|R|v|r)\.\s*(.*)$/))) {
      const tag = m[1];
      if (tag === 'V' || tag === 'R') { flush(); blocks.push({ k: tag, t: cleanText(m[2]) }); continue; }
      // 'v.' = início de parágrafo
      flush(); buf = { k: 'text', t: m[2].replace(/~$/, '') }; joinNext = /~\s*$/.test(tl); continue;
    }
    if (!(buf && joinNext)) { flush(); buf = { k: 'text', t: '' }; }
    buf.t += (buf.t ? ' ' : '') + tl.replace(/~$/, '');
    joinNext = /~\s*$/.test(tl);
  }
  flush();
  return blocks;
}

module.exports = { DOReader, toBlocks, cleanText };
