/* DEO GRATIAS — gestos litúrgicos (ações do jogador) */
(function (DG) {
  'use strict';
  const G = DG.gfx;
  const ICON = {
    signum: ['.....##.....', '.....##.....', '.....##.....', '.##########.', '.##########.', '.....##.....', '.....##.....', '.....##.....', '.....##.....', '.....##.....', '.....##.....', '............'],
    inclinCapitis: ['....###.....', '...#####....', '...#####....', '....###.....', '.....#......', '...#####....', '..#######...', '..#######...', '..##.#.##...', '....#.#.....', '....#.#.....', '...##.##....'],
    inclinMedia: ['............', '......###...', '.....#####..', '.....#####..', '...#######..', '..#######...', '..######....', '..#####.....', '...##.#.....', '...#..#.....', '...#..#.....', '..##.##.....'],
    inclinProfunda: ['............', '............', '............', '..######.##.', '.#########.#', '.##########.', '..######....', '...###......', '...#.#......', '...#.#......', '...#.#......', '..##.##.....'],
    genuflectere: ['....###.....', '....###.....', '.....#......', '...#####....', '...#####....', '...#####....', '...####.....', '...##.##....', '...##..###..', '...##.......', '..###.......', '............'],
    osculari: ['............', '..##....##..', '.####..####.', '.##########.', '..########..', '...######...', '....####....', '.....##.....', '............', '############', '#..........#', '############'],
    extendere: ['#....##....#', '#...####...#', '##..####..##', '.##..##..##.', '..########..', '....####....', '....####....', '....####....', '....####....', '....#..#....', '....#..#....', '...##..##...'],
    jungere: ['.....##.....', '....####....', '....####....', '.....##.....', '....#..#....', '...#.##.#...', '...#.##.#...', '....####....', '....####....', '....#..#....', '....#..#....', '...##..##...'],
    percutere: ['....###.....', '....###.....', '.....#......', '..########..', '..#..###.#..', '..#.####.#..', '..#..##..#..', '..########..', '....####....', '....#..#....', '....#..#....', '...##..##...'],
    benedicere: ['.....#......', '.....#......', '...#####....', '.....#......', '.....#......', '..##.#......', '..####......', '..#####.....', '..######....', '...#####....', '....####....', '....###.....'],
    elevareOculos: ['.....#......', '....###.....', '...#####....', '.....#......', '.....#......', '............', '..#######...', '.#..###..#..', '#..#####..#.', '.#..###..#..', '..#######...', '............'],
    vertere: ['....####....', '..##....##..', '.#........#.', '#..........#', '#..........#', '#.....#....#', '.#...###..#.', '..#.#####...', '...#######..', '......#.....', '......#.....', '......#.....'],
    signumParvum: ['..#.........', '.###........', '..#.........', '......#.....', '.....###....', '......#.....', '..........#.', '.........###', '..........#.', '............', '............', '............'],
    ajoelhar: ['....###.....', '....###.....', '.....#......', '...#####....', '...#####....', '...#####....', '...#####....', '...#####....', '.##########.', '.#........#.', '.##########.', '............'],
    tocar: ['..#.....#...', '.#..###..#..', '#..#####..#.', '...#####....', '..#######...', '..#######...', '.#########..', '.#########..', '...........', '.....#......', '....###.....', '............'],
    erguer: ['.##.........', '.###........', '..###.......', '...#####....', '...#######..', '...########.', '...########.', '...########.', '...#######..', '...######...', '...#####....', '............'],
    beijar: ['............', '..##....##..', '.####..####.', '.##########.', '..########..', '...######...', '....####....', '.....##.....', '............', '....####....', '....#..#....', '....####....'],
    manusSuper: ['.##########.', '############', '.##########.', '............', '....####....', '...#....#...', '...######...', '...######...', '....####....', '............', '..########..', '############'],
  };
  const iconCache = {};
  function icon(id, col) {
    const key = id + (col || '');
    if (iconCache[key]) return iconCache[key];
    const rows = ICON[id] || ICON.signum;
    const cv = G.canvas(12, 12);
    G.ascii(cv.x, rows, { '#': col || '#f1d887' }, 0, 0);
    iconCache[key] = cv.c; return cv.c;
  }

  // Gestos do sacerdote e do acólito
  const LIST = [
    { id: 'signum', key: 'g1', name: 'Sinal da cruz', la: 'signat se', anim: 'signum', who: 'PM', desc: 'Traça-se a cruz da fronte ao peito, do ombro esquerdo ao direito. O celebrante o faz sempre erguido.' },
    { id: 'inclinCapitis', key: 'g2', name: 'Inclinar a cabeça', la: 'caput inclinat', anim: 'inclinCapitis', who: 'PM', desc: 'Ao nome de Jesus, ao Glória ao Pai, ao “Oremus” etc. Na rubrica: “caput inclinat”.' },
    { id: 'inclinMedia', key: 'g3', name: 'Inclinação média', la: 'aliquantulum inclinatus', anim: 'inclinMedia', who: 'PM', desc: 'Inclinação moderada do corpo: “aliquantulum inclinatus” (ex.: In spiritu humilitatis, Suscipe sancta Trinitas).' },
    { id: 'inclinProfunda', key: 'g4', name: 'Inclinação profunda', la: 'profunde inclinatus', anim: 'inclinProfunda', who: 'P', desc: 'Inclinação profunda do corpo: no Confíteor, no “Munda cor”, no “Te igitur”, no “Supplices”.' },
    { id: 'genuflectere', key: 'g5', name: 'Genuflexão', la: 'genuflectit', anim: 'genuflectere', who: 'PM', desc: 'Dobra-se o joelho direito até o chão, diante do Santíssimo Sacramento.' },
    { id: 'osculari', key: 'g6', name: 'Beijar o altar', la: 'osculatur altare', anim: 'osculari', who: 'P', desc: 'O altar representa Cristo e guarda relíquias dos mártires: o celebrante o beija com as mãos pousadas sobre ele.' },
    { id: 'extendere', key: 'g7', name: 'Estender as mãos', la: 'extendit manus', anim: 'extendere', who: 'P', desc: 'Mãos estendidas à altura dos ombros, palmas voltadas uma para a outra: a antiga atitude de oração (orans).' },
    { id: 'jungere', key: 'g8', name: 'Juntar as mãos', la: 'jungit manus', anim: 'jungere', who: 'P', desc: 'Mãos juntas diante do peito, polegar direito sobre o esquerdo em forma de cruz.' },
    { id: 'percutere', key: 'g9', name: 'Bater no peito', la: 'percutit pectus', anim: 'percutere', who: 'PM', desc: 'Sinal de contrição: no “mea culpa”, no “Nobis quoque peccatoribus”, no Agnus Dei, no “Domine, non sum dignus”.' },
    { id: 'benedicere', key: 'g0', name: 'Abençoar (traçar a cruz sobre)', la: 'signat / benedicit', anim: 'benedicere', who: 'P', desc: 'Sinal da cruz traçado com a mão direita sobre as oblatas, a água ou o povo.' },
    { id: 'elevareOculos', key: 'gQ', name: 'Elevar os olhos', la: 'elevat oculos', anim: 'elevareOculos', who: 'P', desc: 'Os olhos se elevam ao crucifixo e logo se abaixam (Veni sanctificator, Te igitur, Qui pridie, bênção final).' },
    { id: 'vertere', key: 'gG', name: 'Voltar-se (povo ⇄ altar)', la: 'vertit se ad populum', anim: 'vertere', who: 'P', desc: 'Para saudar ou abençoar o povo o celebrante, no meio do altar, volta-se pela sua direita.' },
    { id: 'manusSuper', key: 'gH', name: 'Mãos sobre as oblatas', la: 'tenens manus expansas super oblata', anim: 'manusSuper', who: 'P', desc: 'No “Hanc igitur” o celebrante estende as mãos sobre a hóstia e o cálice.' },
    { id: 'signumParvum', key: 'gC', name: 'Pequenos sinais da cruz', la: 'signat se in fronte, ore et pectore', anim: 'signumParvum', who: 'PM', desc: 'Antes do Evangelho: com o polegar, na fronte, na boca e no peito.' },
    { id: 'ajoelhar', key: 'gK', name: 'Ajoelhar-se / levantar-se', la: 'genuflexus / surgit', anim: 'ajoelhar', who: 'M', desc: 'O acólito permanece de joelhos durante a Missa rezada, exceto nos Evangelhos e quando serve.' },
    { id: 'tocar', key: 'gB', name: 'Tocar a campainha', la: 'pulsat campanulam', anim: 'tocar', who: 'M', desc: 'No Sanctus e em cada elevação; por costume, também no Hanc igitur.' },
    { id: 'beijar', key: 'gX', name: 'Beijar (galheta ou barrete)', la: 'solita oscula', anim: 'beijar', who: 'M', desc: 'O acólito beija a galheta ao entregá-la e ao recebê-la (não nas Missas de defuntos).' },
    { id: 'erguer', key: 'gZ', name: 'Erguer a orla da casula', la: 'elevat fimbrias planetæ', anim: 'erguerCasula', who: 'M', desc: 'Na elevação, o acólito ergue levemente a orla da casula com a mão esquerda.' },
  ];
  const BY = {}; LIST.forEach(g => { BY[g.id] = g; });

  DG.GEST = { LIST, BY, icon, ICON,
    forRole(role) { return LIST.filter(g => g.who.includes(role === 'sacerdos' ? 'P' : 'M')); },
    name: id => (BY[id] || {}).name || id,
  };

  // ---- ações sobre objetos (barra do altar) ----
  DG.ACTS = {
    // sacerdote
    ponereCalicem: 'Colocar o cálice e estender o corporal',
    aperireMissale: 'Abrir o Missal no Intróito',
    claudereMissale: 'Fechar o Missal',
    osculariLibrum: 'Beijar o Evangelho',
    signumLibri: 'Assinalar o livro e a si mesmo',
    discooperireCalicem: 'Descobrir o cálice (tirar o véu)',
    offerreHostiam: 'Oferecer a hóstia na patena',
    crucemPatena: 'Traçar a cruz com a patena e depor a hóstia',
    infundereVinum: 'Deitar o vinho no cálice',
    infundereAquam: 'Deitar algumas gotas de água',
    offerreCalicem: 'Oferecer o cálice',
    cooperirePalla: 'Cobrir o cálice com a pala',
    discooperirePalla: 'Tirar a pala do cálice',
    lavare: 'Lavar as pontas dos dedos',
    accipereHostiam: 'Tomar a hóstia',
    elevareHostiam: 'Elevar a Hóstia',
    deponereHostiam: 'Depor a Hóstia sobre o corporal',
    accipereCalicem: 'Tomar o cálice',
    elevareCalicem: 'Elevar o Cálice',
    deponereCalicem: 'Depor o Cálice e cobri-lo',
    signareCumHostia: 'Traçar cruzes com a Hóstia sobre o cálice',
    elevatioMinor: 'Pequena elevação',
    tollerePatenam: 'Tomar a patena',
    osculariPatenam: 'Beijar a patena',
    frangere: 'Partir a Hóstia sobre o cálice',
    signareParticula: 'Traçar três cruzes com a partícula',
    commiscere: 'Deixar cair a partícula no cálice',
    sumereHostiam: 'Comungar a Sagrada Hóstia',
    colligere: 'Recolher os fragmentos com a patena',
    sumereSanguinem: 'Comungar o Preciosíssimo Sangue',
    aperireTabernaculum: 'Abrir o sacrário e tirar a âmbula',
    distribuere: 'Distribuir a Sagrada Comunhão',
    claudereTabernaculum: 'Repor a âmbula e fechar o sacrário',
    porrigereCalicem: 'Estender o cálice ao acólito (purificação)',
    ablutio: 'Ablução dos dedos sobre o cálice',
    componereCalicem: 'Compor o cálice (véu e bolsa)',
    tollereCalicem: 'Tomar o cálice velado',
    accipereBirettum: 'Receber o barrete',
    // acólito
    deponereMissale: 'Pôr o Missal (fechado) na estante',
    transferreMissale: 'Pegar o Missal com a estante',
    ponereMissaleEv: 'Pôr o Missal no lado do Evangelho',
    ponereMissaleEp: 'Pôr o Missal no lado da Epístola',
    tollereUrceolos: 'Pegar as galhetas',
    praebereVinum: 'Apresentar a galheta do vinho',
    praebereAquam: 'Apresentar a galheta da água',
    reddereUrceolos: 'Devolver as galhetas à credência',
    tollereLavabo: 'Pegar a bacia, a água e o manustérgio',
    infundereLavabo: 'Derramar a água sobre os dedos do sacerdote',
    praebereManutergium: 'Oferecer o manustérgio',
    tollereCampanulam: 'Pegar a campainha',
    tollerePatenamComm: 'Pegar a patena de comunhão',
    infundereAblutio: 'Deitar vinho no cálice (purificação)',
    infundereDigitis: 'Deitar vinho e água sobre os dedos',
    tollereBirettum: 'Receber o barrete do sacerdote',
    deponereBirettum: 'Pôr o barrete na sedília',
    praebereBirettum: 'Entregar o barrete ao sacerdote',
    tollereCartulam: 'Pegar o cartão das orações',
  };
})(window.DG = window.DG || {});
