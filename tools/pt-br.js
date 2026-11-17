/*
 * Adapta o português (europeu e de grafia antiga) do Divinum Officium à norma
 * brasileira atual. Substituições palavra a palavra, preservando maiúsculas.
 */
'use strict';

const WORDS = {
  // grafia antiga
  'mystério': 'mistério', 'mystérios': 'mistérios', 'mysterio': 'mistério', 'cousa': 'coisa', 'cousas': 'coisas',
  'christão': 'cristão', 'christãos': 'cristãos', 'christã': 'cristã', 'christãs': 'cristãs', 'Christo': 'Cristo',
  'sancto': 'santo', 'sancta': 'santa', 'sanctos': 'santos', 'sanctas': 'santas', 'sanctificar': 'santificar',
  'psalmo': 'salmo', 'psalmos': 'salmos', 'thesouro': 'tesouro', 'thesouros': 'tesouros', 'throno': 'trono', 'thronos': 'tronos',
  'egreja': 'igreja', 'egrejas': 'igrejas', 'phariseus': 'fariseus', 'phariseu': 'fariseu', 'propheta': 'profeta', 'prophetas': 'profetas',
  'prophecia': 'profecia', 'prophecias': 'profecias', 'philosophia': 'filosofia', 'triumpho': 'triunfo', 'triumphar': 'triunfar',
  'assumpção': 'assunção', 'Assumpção': 'Assunção', 'baptismo': 'batismo', 'baptizar': 'batizar', 'baptizados': 'batizados', 'baptizado': 'batizado',
  'baptizai': 'batizai', 'baptizou': 'batizou', 'baptizava': 'batizava', 'baptizando': 'batizando',
  'Baptista': 'Batista', 'baptista': 'batista', 'Baptismo': 'Batismo',
  'fructo': 'fruto', 'fructos': 'frutos', 'fructifica': 'frutifica', 'fructificar': 'frutificar',
  'facto': 'fato', 'factos': 'fatos', 'acto': 'ato', 'actos': 'atos', 'acção': 'ação', 'acções': 'ações',
  'protecção': 'proteção', 'direcção': 'direção', 'correcção': 'correção', 'perfeição': 'perfeição', 'redempção': 'redenção',
  'resurreição': 'ressurreição', 'resurreição': 'ressurreição', 'eleição': 'eleição', 'affecto': 'afeto', 'affectos': 'afetos',
  'afecto': 'afeto', 'afectos': 'afetos', 'efectivamente': 'efetivamente', 'efeito': 'efeito', 'efectuar': 'efetuar',
  'abjecção': 'abjeção', 'objecto': 'objeto', 'objectos': 'objetos', 'sujeito': 'sujeito', 'adopção': 'adoção', 'adoptivos': 'adotivos',
  'exacto': 'exato', 'exactamente': 'exatamente', 'colecta': 'coleta', 'Colecta': 'Coleta', 'selecta': 'seleta', 'aspecto': 'aspecto',
  'contracto': 'contrato', 'director': 'diretor', 'directores': 'diretores', 'Directores': 'Diretores', 'recto': 'reto', 'rectos': 'retos', 'rectidão': 'retidão',
  'baptistério': 'batistério', 'óptimo': 'ótimo', 'óptima': 'ótima', 'óptimos': 'ótimos', 'baptismal': 'batismal',
  'excepto': 'exceto', 'excepção': 'exceção', 'receber': 'receber', 'recepção': 'recepção', 'aceitar': 'aceitar', 'aceite': 'aceito',
  'contrito': 'contrito', 'actual': 'atual', 'actualmente': 'atualmente', 'actuais': 'atuais', 'tracto': 'trato', 'Tracto': 'Trato',
  'fracção': 'fração', 'fraccionou': 'fracionou', 'secção': 'seção', 'colectas': 'coletas', 'dilecto': 'dileto', 'dilecta': 'dileta',
  'dilectos': 'diletos', 'electo': 'eleito', 'electos': 'eleitos', 'selectos': 'seletos', 'diecto': 'dileto', 'perfeito': 'perfeito',
  'Excepto': 'Exceto', 'proteccão': 'proteção', 'sumptuoso': 'suntuoso', 'assumpto': 'assunto', 'prompto': 'pronto', 'promptos': 'prontos',
  'prompta': 'pronta', 'promptamente': 'prontamente', 'escripto': 'escrito', 'escriptura': 'escritura', 'Escriptura': 'Escritura', 'escripturas': 'escrituras',
  'Escripturas': 'Escrituras', 'sciência': 'ciência', 'sciencia': 'ciência', 'scientes': 'cientes', 'nasceu': 'nasceu', 'succeder': 'suceder',
  'succedeu': 'sucedeu', 'occasião': 'ocasião', 'occulto': 'oculto', 'occultos': 'ocultos', 'offerta': 'oferta', 'offertas': 'ofertas',
  'offerecer': 'oferecer', 'offerecemos': 'oferecemos', 'offerendas': 'oferendas', 'offerenda': 'oferenda', 'commum': 'comum',
  'communhão': 'comunhão', 'immaculada': 'imaculada', 'Immaculada': 'Imaculada', 'immaculado': 'imaculado', 'immortal': 'imortal',
  'immortalidade': 'imortalidade', 'innocente': 'inocente', 'innocentes': 'inocentes', 'annos': 'anos', 'anno': 'ano', 'annuncio': 'anúncio',
  'annunciar': 'anunciar', 'annunciou': 'anunciou', 'summo': 'sumo', 'summa': 'suma', 'Summo': 'Sumo', 'flamma': 'chama',
  'gloriosissimo': 'gloriosíssimo', 'commemoração': 'comemoração', 'Commemoração': 'Comemoração', 'commemorar': 'comemorar',
  'collecta': 'coleta', 'Collecta': 'Coleta', 'apparecer': 'aparecer', 'appareceu': 'apareceu', 'apparição': 'aparição',
  'Ep.ª': 'Epístola', 'Ap.º': 'Apóstolo',
  // norma europeia -> brasileira
  'omnipotente': 'onipotente', 'Omnipotente': 'Onipotente', 'omnipotentes': 'onipotentes', 'omnipotência': 'onipotência',
  'omnipresente': 'onipresente', 'omnisciente': 'onisciente',
  'Unigénito': 'Unigênito', 'unigénito': 'unigênito', 'género': 'gênero', 'géneros': 'gêneros', 'génio': 'gênio', 'Génesis': 'Gênesis',
  'ténue': 'tênue', 'prémio': 'prêmio', 'prémios': 'prêmios', 'trémulas': 'trêmulas', 'trémulo': 'trêmulo', 'trémula': 'trêmula',
  'António': 'Antônio', 'Antónia': 'Antônia', 'demónio': 'demônio', 'demónios': 'demônios', 'Demónio': 'Demônio', 'matrimónio': 'matrimônio',
  'património': 'patrimônio', 'testemunho': 'testemunho', 'harmónia': 'harmonia', 'cerimónia': 'cerimônia', 'cerimónias': 'cerimônias',
  'sémen': 'sêmen', 'Vénus': 'Vênus', 'ónus': 'ônus', 'génesis': 'gênesis', 'fenómeno': 'fenômeno', 'económico': 'econômico',
  'Jerónimo': 'Jerônimo', 'Ambrósio': 'Ambrósio', 'Estêvão': 'Estêvão', 'Estévão': 'Estêvão',
  'oxigénio': 'oxigênio', 'homogéneo': 'homogêneo', 'polícia': 'polícia', 'colónia': 'colônia', 'Babilónia': 'Babilônia', 'Macedónia': 'Macedônia',
  'Salomão': 'Salomão', 'Sião': 'Sião', 'Jerusalém': 'Jerusalém', 'Belém': 'Belém', 'Moisés': 'Moisés',
  'há-de': 'há de', 'hão-de': 'hão de', 'hei-de': 'hei de', 'hás-de': 'hás de',
  'connosco': 'conosco', 'Connosco': 'Conosco', 'registo': 'registro', 'contacto': 'contato', 'facto,': 'fato,',
  'carácter': 'caráter', 'quotidiano': 'cotidiano', 'quotidiana': 'cotidiana', 'Quotidiano': 'Cotidiano',
  'assembleias': 'assembleias', 'ideia': 'ideia', 'heróico': 'heroico', 'jóia': 'joia', 'jóias': 'joias',
  'Egipto': 'Egito', 'atónitas': 'atônitas', 'atónito': 'atônito', 'baptizando': 'batizando', 'baptizas': 'batizas',
  'baptizava': 'batizava', 'baptizo': 'batizo', 'ceptro': 'cetro', 'estupefactas': 'estupefatas', 'genuflecte': 'genuflete',
  'genuflectir': 'genufletir', 'genuflecta': 'genufleta', 'octava': 'oitava', 'primogénito': 'primogênito', 'projectará': 'projetará',
  'projectos': 'projetos', 'projecto': 'projeto', 'protector': 'protetor', 'protectora': 'protetora', 'abysmo': 'abismo', 'abysmos': 'abismos',
  'Alleluia': 'Aleluia', 'alleluia': 'aleluia', 'Alléluia': 'Aleluia', 'alléluia': 'aleluia', 'Allelúja': 'Aleluia',
};

// padrões genéricos (aplicados após as palavras)
const PATTERNS = [
  [/(\w)cção\b/g, '$1ção'], [/(\w)cções\b/g, '$1ções'],
  [/\bAcção\b/g, 'Ação'],
  [/ph/g, 'f'], [/Ph/g, 'F'],
  [/\bth(?=[aeiouáéíóú])/g, 't'], [/\bTh(?=[aeiouáéíóú])/g, 'T'],
];

function caseLike(src, rep) {
  if (src[0] === src[0].toUpperCase() && rep[0] === rep[0].toLowerCase()) return rep[0].toUpperCase() + rep.slice(1);
  return rep;
}

function toBR(text) {
  if (!text) return text;
  let t = text.replace(/Ep\.ª/g, 'Epístola').replace(/Ap\.º/g, 'Apóstolo').replace(/\bdo B\. Apóstolo/g, 'do Bem-aventurado Apóstolo');
  t = t.replace(/[A-Za-zÀ-ÿ]+(?:-[a-zà-ÿ]+)*/g, (w) => {
    if (Object.prototype.hasOwnProperty.call(WORDS, w)) return WORDS[w];
    const lw = w.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(WORDS, lw)) return caseLike(w, WORDS[lw]);
    return w;
  });
  for (const [re, rep] of PATTERNS) t = t.replace(re, rep);
  // aspas angulares de citações -> aspas curvas
  t = t.replace(/«/g, '“').replace(/»/g, '”');
  return t;
}

module.exports = { toBR };
