/* DEO GRATIAS — enciclopédia dos objetos litúrgicos */
(function (DG) {
  'use strict';
  const L = [];
  const add = (id, name, la, cat, icon, desc, use, symb, rule) => L.push({ id, name, la, cat, icon, desc, use, symb, rule });
  const CATS = { vasa: 'Vasos sagrados', linteamina: 'Alfaias (panos sagrados)', vestes: 'Vestes sagradas', libri: 'Livros e sacras', altare: 'Altar e presbitério', ministerium: 'Objetos do serviço', ecclesia: 'Igreja' };

  // ---------------- vasos sagrados ----------------
  add('calix', 'Cálice', 'calix', 'vasa', 'calix',
    'Vaso sagrado em que o vinho, misturado com um pouco de água, é consagrado e se torna o Sangue de Cristo. Compõe-se de copa, nó (para segurá-lo) e pé.',
    'É levado ao altar velado, com a bolsa por cima. No Ofertório o sacerdote o oferece (“Offérimus tibi”); na Consagração profere sobre ele as palavras “Hic est enim Calix Sánguinis mei” e o eleva para a adoração dos fiéis.',
    'Lembra o cálice da Última Ceia e o “cálice” da Paixão aceito pelo Senhor no Getsêmani.',
    'Deve ser de ouro ou de prata (ao menos a copa de prata dourada por dentro) e consagrado por um bispo. Só clérigos ou quem tem permissão podem tocá-lo (Ritus servandus I, 1).');
  add('patena', 'Patena', 'patena', 'vasa', 'patena',
    'Pequeno prato de metal dourado, consagrado com o cálice, sobre o qual repousa a hóstia.',
    'No Ofertório o sacerdote eleva a patena com a hóstia (“Súscipe, sancte Pater”). Depois do Pater noster benze-se com ela, beija-a e a põe sob a Hóstia; com ela recolhe os fragmentos antes de tomar o Sangue.',
    'Recorda o prato da Ceia e a paz de Cristo que a Igreja pede (“da propítius pacem”).',
    'Consagrada pelo bispo com o mesmo crisma do cálice.');
  add('hostia', 'Hóstia', 'hostia', 'vasa', 'hostia',
    'Pão ázimo (sem fermento), de trigo puro, em forma de disco. A hóstia grande é para o sacerdote; as pequenas, para a comunhão dos fiéis.',
    'É oferecida no Ofertório e consagrada com as palavras “Hoc est enim Corpus meum”. Depois do Pater noster é partida em três: uma partícula cai no cálice (commíxtio).',
    '“Hóstia” significa vítima: é o próprio Cristo, imolado de modo incruento sobre o altar.',
    'Deve ser recente, íntegra e de trigo; usam-se pães ázimos no rito latino (De defectibus III).');
  add('hostiae', 'Partículas', 'particulæ', 'vasa', 'hostiae', 'Hóstias pequenas, consagradas para a comunhão dos fiéis.', 'Guardam-se na âmbula; na distribuição o sacerdote traça com cada uma a cruz sobre a âmbula.', 'Um só Pão para todos: a comunhão faz da Igreja um só Corpo.', 'Devem ser renovadas com frequência (O’Connell).');
  add('pyxis', 'Âmbula (cibório)', 'pyxis, ciborium', 'vasa', 'pyxisVelata',
    'Vaso com tampa, semelhante a um cálice largo, em que se conservam e se distribuem as hóstias consagradas. No Brasil diz-se “âmbula”; também se chama “cibório”.',
    'Fica no sacrário, coberta por um véu de seda branca. Na comunhão dos fiéis, o sacerdote a tira do sacrário, mostra uma partícula (“Ecce Agnus Dei”) e distribui a Comunhão.',
    'É o celeiro do Pão da Vida.',
    'Deve ser de metal nobre, dourada por dentro, e benzida.');
  add('ciborium', 'Cibório (baldaquino)', 'ciborium', 'altare', 'pyxis',
    'Em arquitetura, “cibório” é também o dossel ou baldaquino sobre colunas que coroa o altar-mor nas basílicas antigas.',
    'Honra o altar como trono do Sacrifício. O termo passou a designar também o vaso das hóstias (âmbula).',
    'Imagem da tenda do encontro e do céu que se abre sobre o altar.', 'O Cerimonial dos Bispos recomenda que o altar seja coberto por um dossel.');
  add('ostensorium', 'Custódia (ostensório)', 'ostensorium', 'vasa', 'ostensorium',
    'Peça de ourivesaria, geralmente em forma de sol com raios, em cujo centro (luneta) se coloca a Sagrada Hóstia para a adoração.',
    'Usa-se na Exposição e Bênção do Santíssimo e na procissão de Corpus Christi; não se usa na Missa rezada.',
    'Cristo, “Sol de justiça”, irradiando a sua luz sobre o mundo.', 'A luneta que toca a Hóstia deve ser dourada e benzida.');

  // ---------------- alfaias ----------------
  add('corporale', 'Corporal', 'corporale', 'linteamina', 'corporale',
    'Pano quadrado de linho branco, dobrado em nove partes, sobre o qual repousam a Hóstia e o cálice.',
    'É levado ao altar dentro da bolsa; o sacerdote o estende no meio do altar ao chegar e o dobra depois das abluções. Depois da Consagração, o celebrante pousa as mãos sobre ele ao genuflectir.',
    'Recorda o sudário que envolveu o Corpo do Senhor no sepulcro.',
    'Deve ser de linho, inteiramente branco, e benzido; não pode ficar estendido no altar de uma Missa para outra.');
  add('purificatorium', 'Sanguinho (purificatório)', 'purificatorium', 'linteamina', 'purificatorium',
    'Pano de linho, dobrado em três, com que o sacerdote enxuga o cálice, os lábios e os dedos.',
    'Na preparação é posto sobre a boca do cálice; depois da comunhão e das abluções enxuga com ele o cálice.',
    'Expressa o cuidado extremo com as Espécies sagradas.', 'De linho; marcado com uma pequena cruz.');
  add('palla', 'Pala', 'palla', 'linteamina', 'palla',
    'Pequeno quadrado de linho engomado (ou com cartão) que cobre o cálice.',
    'Protege o cálice desde o Ofertório; o sacerdote a tira para a Consagração e para a comunhão e a repõe em seguida.',
    'Como uma pedra sobre o sepulcro, guarda o Sangue do Senhor.', 'A face inferior deve ser de linho branco; benzida.');
  add('velum', 'Véu do cálice', 'velum calicis', 'linteamina', 'velum',
    'Véu de seda, da cor dos paramentos, que cobre inteiramente o cálice na ida e na volta do altar.',
    'O sacerdote o retira no Ofertório; na Missa rezada, o acólito pode dobrá-lo (onde for costume).',
    'Os mistérios sagrados são velados: só se revelam no momento do Sacrifício.', 'Na cor litúrgica do dia.');
  add('bursa', 'Bolsa (do corporal)', 'bursa', 'linteamina', 'bursa',
    'Estojo quadrado, revestido de tecido da cor litúrgica, que guarda o corporal dobrado.',
    'Vai sobre o cálice velado; no altar fica encostada à banqueta, do lado do Evangelho, com a abertura voltada para o meio.',
    'Guarda com dignidade o pano que receberá o Corpo do Senhor.', 'Da cor dos paramentos.');
  add('manutergium', 'Manustérgio', 'manutergium', 'linteamina', 'manutergium',
    'Toalhinha de linho com que o sacerdote enxuga os dedos no Lavabo.',
    'O acólito a oferece ao sacerdote depois de derramar a água sobre os seus dedos.',
    'A purificação das mãos significa a pureza interior exigida para o Sacrifício (“Lavábo inter innocéntes”).', '—');
  add('mappae', 'Toalhas do altar', 'mappæ', 'linteamina', 'mappae',
    'Três toalhas de linho cobrem a mesa do altar; a de cima desce até o chão dos lados.',
    'O acólito retira a cobertura protetora (vesperal) antes da Missa e a recoloca depois.',
    'Recordam os lençóis em que foi envolto o Corpo de Cristo.', 'Três toalhas de linho benzidas (Rubricæ generales Missalis).');

  // ---------------- vestes ----------------
  add('amictus', 'Amito', 'amictus', 'vestes', 'amictus',
    'Pano retangular de linho branco com uma cruz no centro, que cobre o pescoço e os ombros.',
    'É o primeiro paramento: o sacerdote beija a cruz, toca com ele a cabeça e o dobra sobre os ombros, dizendo “Impóne, Dómine, cápiti meo gáleam salútis”.',
    'O elmo da salvação (Ef 6, 17): defesa contra os assaltos do demônio.', 'De linho; benzido.');
  add('alba', 'Alva', 'alba', 'vestes', 'alba',
    'Túnica longa de linho branco que desce até perto do chão; muitas vezes ornada de renda.',
    'Veste-se depois do amito, com a oração “Deálba me, Dómine”.',
    'A pureza da alma alvejada no Sangue do Cordeiro (Ap 7, 14).', 'Deve ficar a cerca de um dedo do chão (Ritus servandus I, 3).');
  add('cingulum', 'Cíngulo', 'cingulum', 'vestes', 'cingulum',
    'Cordão de linho ou lã (branco ou da cor do dia) com borlas, que prende a alva à cintura.',
    'O acólito o entrega por trás ao sacerdote, que o ata dizendo “Præcínge me, Dómine, cíngulo puritátis”. Prende também as pontas da estola.',
    'A castidade e a continência.', 'Benzido.');
  add('manipulus', 'Manípulo', 'manipulus', 'vestes', 'manipulus',
    'Faixa curta da cor litúrgica, presa no antebraço esquerdo.',
    'O sacerdote beija a cruz e o prende no braço, dizendo “Mérear, Dómine, portáre manípulum fletus et dolóris”.',
    'Antigo lenço para enxugar o suor e as lágrimas: o trabalho e a dor do ministério, recompensados com alegria.', 'Usado só na Missa (até 1967).');
  add('stola', 'Estola', 'stola', 'vestes', 'stola',
    'Longa faixa da cor litúrgica posta ao pescoço; o sacerdote a cruza sobre o peito na Missa.',
    'Beija-se a cruz central e veste-se com a oração “Redde mihi, Dómine, stolam immortalitátis”. O bispo não a cruza.',
    'A veste da imortalidade perdida pelo pecado de Adão; sinal do poder sacerdotal.', 'Cruzada pelo presbítero, pendente pelo bispo e posta a tiracolo pelo diácono.');
  add('casula', 'Casula', 'casula, planeta', 'vestes', 'casula',
    'Veste exterior própria da Missa, da cor do dia. A forma romana (“de guitarra”) tem uma coluna de galão na frente e, comumente, uma cruz nas costas.',
    'É o último paramento: “Dómine, qui dixísti: Jugum meum suáve est”. Na elevação, o acólito ergue levemente a sua orla.',
    'O jugo suave de Cristo e a caridade que tudo cobre.', 'Deve estar íntegra, limpa e benzida.');
  add('dalmatica', 'Dalmática', 'dalmatica', 'vestes', 'dalmatica',
    'Veste com mangas curtas, própria do diácono na Missa solene (o subdiácono usa a tunicela, semelhante).',
    'Não aparece na Missa rezada; na Missa solene, o diácono a veste sobre a alva e a estola.',
    'A alegria e a justiça (“indumento de salvação”).', 'Na cor do dia; na Quaresma o diácono usa, em certas Missas, a casula dobrada.');
  add('pluviale', 'Pluvial (capa de asperges)', 'pluviale', 'vestes', 'pluviale',
    'Capa ampla, semicircular, presa ao peito por um fecho (o “morse”), com um capuz ou escudo nas costas.',
    'Usa-se no Asperges antes da Missa principal do domingo, nas procissões, nas Vésperas solenes e na Bênção do Santíssimo; nunca na Missa como veste do celebrante.',
    'Antiga capa de chuva, tornou-se veste de dignidade e de procissão.', 'Na cor do ofício ou da função.');
  add('birretum', 'Barrete', 'biretum', 'vestes', 'birretum',
    'Barrete quadrado com três (ou quatro) cristas e uma borla; preto para os padres.',
    'O sacerdote o usa na ida e na volta do altar; ao pé do altar entrega-o ao acólito, que o beija e o põe na sedília. Pelas rubricas de 1960, usá-lo tornou-se “conveniente”, não obrigatório.',
    'Sinal da dignidade clerical.', 'Ritus servandus II, 1 (1962): “convenienter caput tegit”.');
  add('superpelliceum', 'Sobrepeliz', 'superpelliceum', 'vestes', 'superpelliceum',
    'Veste branca, curta, de mangas largas, usada sobre a batina pelos clérigos e pelos acólitos.',
    'O acólito veste batina e sobrepeliz para servir; o sacerdote a usa no coro e em várias funções fora da Missa.',
    'A nova criatura revestida de Cristo.', 'O O’Connell recomenda que, sempre que possível, o acólito sirva de batina e sobrepeliz.');
  add('vestisTalaris', 'Batina', 'vestis talaris', 'vestes', 'vestisTalaris',
    'Veste talar (até os calcanhares), preta para os sacerdotes; nos acólitos, preta ou, por costume, vermelha.',
    'É a veste ordinária do clero, sob a qual se põem os paramentos.', 'Morte ao mundo e dedicação a Deus.', 'O Ritus servandus supõe o celebrante de batina antes de se paramentar.');
  add('antependium', 'Frontal (antependium)', 'antependium', 'altare', 'antependium',
    'Pano decorado que cobre a face anterior do altar, na cor do dia.',
    'Muda com o tempo litúrgico; nas Missas de defuntos, havendo o Santíssimo no sacrário, usa-se o roxo em vez do preto.',
    'O altar, que representa Cristo, “veste” também as cores do mistério celebrado.', 'Rubricæ generales Missalis; Cerimonial dos Bispos.');

  // ---------------- livros ----------------
  add('missale', 'Missal Romano', 'Missale Romanum', 'libri', 'missale',
    'Livro com todas as orações, leituras e rubricas da Missa: Ordinário, Próprio do Tempo, Próprio dos Santos, Comum, Missas votivas e de defuntos.',
    'Fica sobre a estante no lado da Epístola; o acólito o transfere ao lado do Evangelho e, depois das abluções, de volta. Antes da Missa o celebrante o marca com as fitas.',
    'A Igreja põe nas mãos do sacerdote as palavras que ele deve dizer: na liturgia ninguém fala em nome próprio.', 'Edição típica de 1962 (João XXIII), com as rubricas do Codex Rubricarum de 1960.');
  add('sacrae', 'Sacras (cartas do altar)', 'tabellæ secretarum', 'libri', 'sacrae',
    'Três quadros com orações: no centro (Glória, Credo, ofertório, palavras da Consagração), à direita (Lavabo) e à esquerda (Último Evangelho).',
    'Auxiliam a memória do celebrante nas partes ditas no meio do altar e nos cantos.', 'Ajuda à atenção e à exatidão do rito.', 'O Missal de 1962 não as prescreve, mas o uso é universal.');

  // ---------------- serviço ----------------
  add('urceoli', 'Galhetas', 'urceoli', 'ministerium', 'urceoli',
    'Duas pequenas jarras, geralmente de vidro, com o vinho e a água para o Sacrifício, sobre uma bandeja.',
    'O acólito as leva ao altar no Ofertório (beijando a galheta antes e depois de entregá-la, exceto nas Missas de defuntos) e nas abluções.',
    'O vinho representa Cristo; a gota de água, o povo unido a Ele.', 'O vinho deve ser natural, de uva, não corrompido (De defectibus IV).');
  add('lavabo', 'Bacia do lavabo', 'pelvicula', 'ministerium', 'lavabo',
    'Pequena bacia em que cai a água do lavabo.',
    'O acólito derrama água sobre os dedos do sacerdote no canto da Epístola, durante o Salmo 25.', '“Lavarei as minhas mãos entre os inocentes.”', '—');
  add('campanula', 'Campainhas do altar', 'campanula', 'ministerium', 'campanula',
    'Pequena campainha (ou conjunto de sininhos) tocada pelo acólito.',
    'Toca-se ao Sanctus (três vezes, por costume) e em cada elevação; onde for costume, também no Hanc igitur. Pelo O’Connell de 1962, não se toca ao “Domine, non sum dignus”; havendo comungantes, toca-se uma vez depois do Agnus Dei.',
    'Convida os fiéis à atenção e à adoração.', 'Ritus servandus VII, 8; VIII, 6.');
  add('patenaCommunionis', 'Patena de comunhão', 'patena communionis', 'ministerium', 'patenaCommunionis',
    'Patena com cabo, segurada pelo acólito sob o queixo de cada comungante.', 'Evita que caia por terra algum fragmento da Hóstia.', 'O zelo pelo menor fragmento do Corpo do Senhor.', 'Instrução da S. C. dos Sacramentos (1929).');
  add('thuribulum', 'Turíbulo', 'thuribulum', 'ministerium', 'thuribulum',
    'Vaso de metal suspenso por correntes, onde arde o carvão sobre o qual se põe incenso.',
    'Na Missa solene (e, permitido, na cantada) incensam-se o altar, o livro do Evangelho, as oblatas, o celebrante, o clero e o povo; e o Santíssimo na elevação.',
    '“Suba a minha oração como incenso à vossa presença” (Sl 140).', 'Não se usa na Missa rezada.');
  add('navicula', 'Naveta', 'navicula', 'ministerium', 'navicula',
    'Pequeno recipiente em forma de barco que guarda o incenso, com uma colherinha.',
    'O turiferário a apresenta ao celebrante, que põe incenso no turíbulo e o abençoa (“Ab illo bene✠dicáris…”).', 'A barca da Igreja que leva a oração dos fiéis.', '—');
  add('thus', 'Incenso', 'thus', 'ministerium', 'thus', 'Resina aromática que, queimada, sobe em fumaça perfumada.', 'É abençoado pelo celebrante antes das incensações.', 'Oração, sacrifício e honra devida a Deus.', '—');
  add('crux', 'Cruz processional', 'crux processionalis', 'ministerium', 'crux',
    'Cruz com crucifixo, montada numa haste, levada à frente das procissões.',
    'Abre as procissões na Missa solene e em outras funções; na Missa rezada não é usada.', 'Cristo vai à frente do seu povo.', 'O crucífero não genuflecte quando leva a cruz.');
  add('candelabrum', 'Castiçais', 'candelabra', 'altare', 'candelabrum',
    'Castiçais com velas de cera sobre a banqueta do altar: seis no altar-mor.',
    'Na Missa rezada acendem-se duas velas; na cantada, comumente seis. Acende-se primeiro o lado da Epístola, a começar pela vela mais próxima da cruz; apagam-se na ordem inversa.',
    'Cristo, luz do mundo; a fé que arde diante de Deus.', 'Velas de cera de abelha (ao menos em boa parte).');
  add('cereus', 'Círio pascal', 'cereus paschalis', 'altare', 'cereus',
    'Grande vela bento na Vigília Pascal, com a cruz, o alfa e o ômega, o ano e cinco grãos de incenso.',
    'Acende-se nas Missas do Tempo Pascal; apaga-se depois do Evangelho da Ascensão.', 'Cristo ressuscitado, coluna de fogo que guia o seu povo.', '—');
  add('extinctorium', 'Acendedor e apagador', 'extinctorium', 'ministerium', 'extinctorium',
    'Vara longa com um pavio numa ponta e um pequeno cone na outra.',
    'O acólito acende as velas antes da Missa (Epístola primeiro) e as apaga depois (Evangelho primeiro).', '—', 'O’Connell, The Celebration of Mass, p. 355.');
  add('aspersorium', 'Caldeirinha e aspersório', 'vas aquæ benedictæ et aspergillum', 'ministerium', 'aspersorium',
    'Recipiente com água benta e a vara para aspergi-la.', 'Usados no Asperges dominical antes da Missa principal e em bênçãos.', 'A purificação e a lembrança do Batismo.', '—');
  add('aquaBenedicta', 'Água benta', 'aqua benedicta', 'ministerium', 'aspersorium', 'Água abençoada pelo sacerdote.', 'À porta da sacristia, o acólito pode oferecer água benta ao sacerdote antes de irem ao altar (costume).', 'Sacramental de purificação.', 'S. R. C. 2514.');
  add('clavis', 'Chave do sacrário', 'clavis tabernaculi', 'ministerium', 'clavis', 'Chave que fecha o sacrário.', 'Pode ser levada pelo celebrante sobre o cálice, ou deixada antes no altar.', 'A guarda vigilante do Santíssimo.', 'Deve ser guardada com toda a segurança.');
  add('credentia', 'Credência', 'credentia', 'altare', 'mappae',
    'Pequena mesa coberta de toalha branca, ao lado da Epístola.',
    'Nela ficam as galhetas, a bacia e o manustérgio, a campainha, a patena de comunhão e o cartão das orações depois da Missa.', '—', 'Rubricæ generales Missalis.');
  add('sedilia', 'Sedília', 'sedilia', 'altare', 'mappae', 'Banco dos ministros, do lado da Epístola.', 'Na Missa rezada, o acólito ali pousa o barrete do sacerdote; na cantada e na solene, os ministros sentam-se nela durante o Glória e o Credo cantados.', '—', '—');
  add('tintinnabulum', 'Sineta da sacristia', 'tintinnabulum', 'ministerium', 'campanula', 'Pequeno sino junto à porta da sacristia.', 'Por costume, o acólito o toca ao sair para o altar, avisando os fiéis do início da Missa.', '—', 'O’Connell, p. 356.');

  // ---------------- altar e igreja ----------------
  add('tabernaculum', 'Sacrário (tabernáculo)', 'tabernaculum', 'altare', 'tabernaculum',
    'Pequeno armário sólido e fechado à chave, no meio do altar-mor, onde se conserva o Santíssimo Sacramento.',
    'Coberto pelo conopeu (véu) — branco ou da cor do dia, nunca preto. Diante dele arde a lâmpada; quem passa pelo meio do altar genuflecte.',
    'A Tenda de Deus entre os homens.', 'Código de Direito Canônico (1917), cân. 1268–1269.');
  add('crucifixus', 'Crucifixo do altar', 'crux altaris', 'altare', 'crucifixus',
    'Cruz com a imagem de Cristo crucificado, sobre o altar, entre os castiçais, visível ao celebrante e ao povo.',
    'O celebrante inclina-se para ele em muitos momentos (ao nome de Jesus, ao Glória ao Pai, ao “Oremus”) e ergue para ele os olhos.',
    'O Sacrifício da Missa é o mesmo Sacrifício do Calvário.', 'Rubricæ generales Missalis; obrigatório em todo altar onde se celebra.');
  add('ara', 'Pedra d’ara', 'altare portatile', 'altare', 'ara',
    'Pedra consagrada pelo bispo, com cinco cruzes gravadas e um sepulcro com relíquias de mártires, embutida na mesa do altar.',
    'Ao beijar o altar no início, o sacerdote diz: “quorum relíquiæ hic sunt”.', 'Os mártires sob o altar de Deus (Ap 6, 9).', 'Sem pedra consagrada não se pode celebrar.');
  add('lampas', 'Lâmpada do Santíssimo', 'lampas', 'altare', 'lampas',
    'Lâmpada que arde dia e noite diante do sacrário, geralmente com vidro vermelho.',
    'Indica a presença real de Cristo no sacrário.', 'A fé e o amor vigilantes da Igreja.', 'Deve ser de azeite de oliva ou cera, sempre acesa (cân. 1271).');
  add('retabulum', 'Retábulo', 'retabulum', 'altare', 'crucifixus',
    'Grande estrutura entalhada e dourada atrás do altar-mor, típica do barroco luso-brasileiro, com colunas, nichos e imagens.',
    'Emoldura o trono e o crucifixo; aqui, com colunas salomônicas ornadas de videiras, e as imagens de São Pedro e São Paulo.', 'As videiras e as uvas lembram a Eucaristia.', '—');
  add('cancelli', 'Balaustrada (mesa da comunhão)', 'cancelli', 'altare', 'mappae',
    'Grade baixa de mármore que separa o presbitério da nave, com um portão no centro.',
    'Os fiéis ajoelham-se nela para comungar; uma toalha branca a cobre durante a comunhão.', 'O limiar do Santo dos Santos.', '—');
  add('pulpitum', 'Púlpito', 'pulpitum', 'ecclesia', 'missale', 'Tribuna elevada, de madeira entalhada, presa a uma coluna, com um dossel (abat-voix).', 'Dele se faz o sermão, depois do Evangelho.', 'A palavra de Deus que desce sobre o povo.', '—');
  add('fons', 'Pia batismal', 'fons baptismalis', 'ecclesia', 'lavabo', 'Pia de mármore, junto à entrada, onde se ministra o Batismo.', 'Fica perto da porta: pelo Batismo se entra na Igreja.', 'A fonte da vida nova.', 'Ritual Romano.');
  add('confessionale', 'Confessionário', 'sedes confessionalis', 'ecclesia', 'mappae', 'Móvel com grade entre o confessor e o penitente.', 'Lugar do sacramento da Penitência.', 'O tribunal da misericórdia.', 'Cân. 909–910 (1917).');
  add('lavaboSacristiae', 'Lavabo da sacristia', 'lavatorium', 'ecclesia', 'lavabo', 'Fonte de mármore onde o sacerdote lava as mãos antes de se paramentar.', 'Diz a oração “Da, Dómine, virtútem mánibus meis”.', 'Pureza da alma e do corpo.', 'Ritus servandus I, 1.');
  add('genuflexorium', 'Genuflexório', 'genuflexorium', 'ecclesia', 'mappae', 'Móvel para ajoelhar-se a rezar.', 'Na sacristia, o sacerdote ali faz a preparação para a Missa (orações do Missal).', '—', 'Cân. 810 (1917): preparação e ação de graças.');
  add('arcaz', 'Arcaz (paramenteira)', 'armarium paramentorum', 'ecclesia', 'casula', 'Grande cômoda de gavetas largas, comum nas sacristias luso-brasileiras, onde se guardam os paramentos estendidos.', 'Cada gaveta guarda as vestes de uma cor litúrgica; sobre o tampo dispõem-se os paramentos na ordem em que serão vestidos.', '—', '—');
  add('ultimaCena', 'Quadro da Última Ceia', 'Cena Domini', 'ecclesia', 'calix', 'Pintura da instituição da Eucaristia.', 'Recorda ao sacerdote o que vai realizar.', '“Fazei isto em memória de mim.”', '—');
  add('vitrum', 'Vitrais', 'vitrea', 'ecclesia', 'velum', 'Janelas de vidros coloridos unidos por chumbo, com figuras sagradas: aqui, Nossa Senhora, o Sagrado Coração, o Cordeiro, o Espírito Santo.', 'Filtram a luz natural, que entra colorida na igreja.', 'A luz de Deus que se faz visível através dos santos.', '—');
  add('imagoMariae', 'Imagem de Nossa Senhora', 'imago B. M. V.', 'ecclesia', 'velum', 'Imagem da Santíssima Virgem com manto azul, coroa e auréola.', 'Diante dela rezam-se as orações depois da Missa (Ave-Marias e Salve Rainha).', 'Mãe de Deus e da Igreja, Medianeira de todas as graças.', '—');
  add('altareMariae', 'Altar lateral de Nossa Senhora', 'altare B. M. V.', 'ecclesia', 'velum', 'Altar menor, à esquerda da nave.', 'Pode-se celebrar ali a Missa rezada; se o Santíssimo não está nele, o acólito faz inclinação em vez de genuflexão.', '—', 'O’Connell, p. 355 (n. 13).');
  add('altareJoseph', 'Altar lateral de São José', 'altare S. Joseph', 'ecclesia', 'velum', 'Altar menor, à direita da nave, com a imagem do Patrono da Igreja universal.', 'Lugar de devoção a São José.', 'Protetor da Sagrada Família e da Igreja.', '—');
  add('velarium', 'Velário', 'candelabrum votivum', 'ecclesia', 'candelabrum', 'Suporte de velas votivas diante de uma imagem.', 'Acende-se uma vela como sinal da oração que continua.', 'A oração que permanece diante de Deus.', '—');
  add('pieta', 'Pietà', 'Pietas', 'ecclesia', 'velum', 'Imagem de Nossa Senhora das Dores com o Filho morto nos braços.', 'Devoção às Sete Dores.', 'A Mãe associada ao Sacrifício do Filho.', '—');

  DG.data.objects = {
    list: L, CATS,
    get: id => L.find(o => o.id === id) || null,
    byCat() { const r = {}; L.forEach(o => { (r[o.cat] = r[o.cat] || []).push(o); }); return r; },
  };
})(window.DG = window.DG || {});
