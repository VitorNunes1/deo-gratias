/* DEO GRATIAS — Manual litúrgico (texto educativo) */
(function (DG) {
  'use strict';
  const C = [];
  const ch = (key, group, title, html) => C.push({ key, group, title, html });

  // ---------------- A SANTA MISSA ----------------
  ch('missa', 'A Santa Missa', 'O que é a Santa Missa',
    `<p><span class="initial">A</span> Santa Missa é o verdadeiro e próprio Sacrifício da Nova Lei, no qual Nosso Senhor Jesus Cristo, por ministério do sacerdote, se oferece a Deus Pai de modo incruento, sob as espécies do pão e do vinho. É o mesmo Sacrifício da Cruz: o mesmo Sacerdote principal e a mesma Vítima; só o modo de oferecer é diferente (Concílio de Trento, sessão XXII).</p>
     <p>A Missa tem quatro fins: <b>latrêutico</b> (adorar a Deus), <b>eucarístico</b> (dar-Lhe graças), <b>propiciatório</b> (satisfazer pelos pecados) e <b>impetratório</b> (pedir os bens de que precisamos).</p>
     <p>O rito romano que este jogo apresenta é o do <i>Missale Romanum</i> de 1962, a última edição típica do Missal codificado por São Pio V em 1570, com as rubricas do <i>Codex Rubricarum</i> de 1960.</p>
     <div class="note">Este jogo é um instrumento de estudo e de treino. A celebração real dos sacramentos só se dá por ministros ordenados, na Igreja.</div>`);
  ch('estrutura', 'A Santa Missa', 'A estrutura do Ordinário',
    `<p>Tradicionalmente a Missa divide-se em duas grandes partes:</p>
     <h3>Missa dos Catecúmenos</h3>
     <p>Orações ao pé do altar · Intróito · Kyrie · Glória · Coleta · Epístola · Gradual (Aleluia, Trato ou Sequência) · Evangelho · (Sermão) · Credo.</p>
     <p>Chamava-se assim porque os catecúmenos — os que se preparavam para o Batismo — podiam assistir a ela.</p>
     <h3>Missa dos Fiéis</h3>
     <p><b>Ofertório:</b> antífona, oferta da hóstia e do cálice, Lavabo, Súscipe sancta Trínitas, Oráte fratres, Secreta.<br>
     <b>Cânon:</b> Prefácio e Sanctus; Te ígitur; Memento dos vivos; Communicántes; Hanc ígitur; Quam oblatiónem; <b>Consagração</b>; Unde et mémores; Supra quæ; Súpplices; Memento dos defuntos; Nobis quoque; Per ipsum.<br>
     <b>Comunhão:</b> Pater noster; Líbera nos; fração e commíxtio; Agnus Dei; orações antes da Comunhão; comunhão do sacerdote e dos fiéis; abluções; antífona da Comunhão; Pós-Comunhão.<br>
     <b>Conclusão:</b> Ite, missa est; Pláceat; Bênção; Último Evangelho.</p>
     <p>As partes <b>fixas</b> formam o <i>Ordinário</i>; as que mudam conforme o dia (Intróito, Coleta, Epístola, Gradual, Evangelho, Ofertório, Secreta, Comunhão, Pós-Comunhão) formam o <i>Próprio</i>.</p>`);
  ch('formas', 'A Santa Missa', 'Missa rezada, cantada e solene',
    `<p><b>Missa rezada (Missa lecta)</b>: o sacerdote diz tudo, servido normalmente por um único acólito. Partes em voz alta, partes em voz média e partes em silêncio. Depois dela rezam-se as orações leoninas.</p>
     <p><b>Missa cantada (Missa cantata)</b>: o celebrante canta as partes que lhe cabem (Dominus vobiscum, orações, Prefácio, Pater noster…) e o coro canta o Ordinário (Kyriale) e o Próprio (Graduale). Não há diácono nem subdiácono. As rubricas de 1960 permitem nela o uso do incenso.</p>
     <p><b>Missa solene (Missa solemnis)</b>: com diácono e subdiácono, turiferário, acólitos ceroferários, cerimoniário; incensações, canto da Epístola pelo subdiácono e do Evangelho pelo diácono, beijo da paz.</p>
     <div class="note">Neste jogo a <b>Missa rezada</b> está completa nos dois papéis. A <b>Missa cantada</b> pode ser jogada sem incenso (forma permitida): o coro canta o Próprio e o Kyriale do dia e o celebrante canta as orações e as leituras no tom ferial (tom reto), o diálogo do Prefácio e o Pater noster no tom solene. A <b>Missa solene</b>, com diácono e subdiácono, está descrita aqui; sua simulação é a próxima etapa do projeto.</div>`);

  // ---------------- AS PARTES ----------------
  ch('fraternitas', 'A Santa Missa', 'A Capela São Pio X e a Fraternidade',
    `<p>O jogo se passa na <b>Capela São Pio X</b>, do Priorado Padre Anchieta da <b>Fraternidade Sacerdotal São Pio X</b> (FSSPX), na Vila Mariana, em São Paulo. A fachada e o interior foram desenhados em pixel art a partir de fotografias da capela: nave única branca de abóbada ogival, arco do presbitério sobre colunas de capitéis verdes, grande crucifixo de madeira, portas vermelhas em ogiva e altar de mármore branco com arcaria gótica. O emblema da Fraternidade, dois corações entrelaçados sob uma coroa com a cruz, está na placa da fachada.</p>
     <p>A Fraternidade foi fundada em 1970 por Dom <b>Marcel Lefebvre</b> (1905–1991), arcebispo missionário. Seu padroeiro é <b>São Pio X</b>, Papa de 1903 a 1914, cujo lema era “Instauráre ómnia in Christo”.</p>
     <p>As capelas da Fraternidade celebram a Missa segundo os livros litúrgicos de 1962, os mesmos que este jogo segue.</p>
     <div class="note">Este é um projeto independente de fiéis. Não é uma publicação oficial da Fraternidade Sacerdotal São Pio X.</div>`);
  ch('pe', 'As partes da Missa', 'Orações ao pé do altar',
    `<p>Antes de subir ao altar, o sacerdote — como Moisés que tirou as sandálias diante da sarça — se humilha ao pé dos degraus. Reza com o acólito o <b>Salmo 42</b> (“Júdica me, Deus”), cuja antífona é “Introíbo ad altáre Dei”: “Subirei ao altar de Deus, de Deus que alegra a minha juventude”.</p>
     <p>Segue o <b>Confíteor</b>: primeiro o sacerdote, profundamente inclinado, confessa-se diante de Deus, dos santos e “de vós, irmãos”; o acólito responde “Misereátur tui…”. Depois o acólito, em nome do povo, diz o seu Confíteor (“tibi, pater… te, pater”), e o sacerdote pronuncia o <i>Misereátur</i> e o <i>Indulgéntiam</i>.</p>
     <div class="note"><b>Diferenças:</b> nas Missas de defuntos e nas Missas do Tempo da Paixão (do I Domingo da Paixão até Sábado Santo, exclusive) omite-se o Salmo 42 com o seu Glória ao Pai: diz-se só a antífona e passa-se ao “Adjutórium nostrum”.</div>
     <p>Subindo, o sacerdote reza em silêncio <i>Aufer a nobis</i> (“Tirai de nós as nossas iniquidades”) e, inclinado, <i>Orámus te</i>, beijando o altar onde estão as relíquias dos mártires.</p>`);
  ch('altar', 'As partes da Missa', 'O altar e o beijo do altar',
    `<p>O altar representa o próprio Cristo, “altar, vítima e sacerdote”. A sua mesa contém a <b>pedra d’ara</b> consagrada pelo bispo, com relíquias de mártires — lembrança das Missas celebradas sobre os túmulos dos mártires nas catacumbas.</p>
     <p>Sobre o altar: três toalhas de linho, o crucifixo, os castiçais, as sacras e, no meio, o sacrário com o Santíssimo. Por isso, quem passa pelo meio do altar <b>genuflecte</b>.</p>
     <p>O sacerdote beija o altar ao subir, antes de cada “Dóminus vobíscum” dirigido ao povo, no Te ígitur, no Súpplices e antes da bênção. Beija-o pondo as mãos estendidas sobre ele; depois da Consagração, sem separar os polegares dos indicadores.</p>`);
  ch('introitus', 'As partes da Missa', 'Intróito',
    `<p>O Intróito (“entrada”) era o canto que acompanhava a procissão de entrada do Papa nas basílicas romanas: uma antífona, um versículo de salmo e o Glória ao Pai. Na Missa rezada o sacerdote o lê no lado da Epístola, fazendo o sinal da cruz no começo.</p>
     <div class="note">Nas Missas de defuntos o sacerdote não se benze: traça a cruz sobre o livro, como que abençoando as almas do Purgatório. No Tempo da Paixão omite-se o Glória ao Pai.</div>`);
  ch('kyrie', 'As partes da Missa', 'Kyrie, eléison',
    `<p>Única parte da Missa romana em grego: “Senhor, tende piedade”. São nove invocações — três ao Pai (Kyrie), três ao Filho (Christe), três ao Espírito Santo (Kyrie) — em honra da Santíssima Trindade. O sacerdote, no meio do altar, as diz <b>alternadamente</b> com o acólito.</p>`);
  ch('gloria', 'As partes da Missa', 'Glória in excélsis',
    `<p>O “hino angélico” começa com o canto dos anjos em Belém e continua com louvores à Santíssima Trindade. É um hino de alegria: <b>não se diz</b> no Advento, da Septuagésima à Semana Santa, nas Missas de defuntos e nas férias comuns.</p>
     <p>Gestos: ao “Glória in excélsis” o sacerdote estende, eleva e junta as mãos; ao “Deo” inclina a cabeça para a cruz; inclina-a também a “Adorámus te”, “Grátias ágimus tibi”, “Jesu Christe” (duas vezes) e “Súscipe deprecatiónem nostram”; ao “Cum Sancto Spíritu” benze-se.</p>`);
  ch('oratio', 'As partes da Missa', 'A Coleta',
    `<p>Depois de saudar o povo (“Dóminus vobíscum”), o sacerdote diz “Orémus” e reza, com as mãos estendidas, a Coleta — oração que “recolhe” os pedidos de todos e exprime o espírito da festa. Termina com a conclusão trinitária (“Per Dóminum nostrum Jesum Christum…”), à qual o acólito responde “Amen”.</p>
     <p>Ao nome de Jesus o sacerdote inclina a cabeça para a cruz.</p>`);
  ch('lectio', 'As partes da Missa', 'A Epístola',
    `<p>A primeira leitura, geralmente de uma epístola de São Paulo ou de outro Apóstolo (às vezes do Antigo Testamento: “Lectio libri Sapiéntiæ”, “Léctio Isaíæ prophétæ”). O sacerdote a lê no lado da Epístola, com as mãos sobre o livro ou sobre o altar; o acólito responde “Deo grátias”.</p>`);
  ch('graduale', 'As partes da Missa', 'Gradual, Aleluia, Trato e Sequência',
    `<p>O <b>Gradual</b> é um responsório entre as leituras, cantado outrora nos degraus (<i>gradus</i>) do ambão. Segue-o o <b>Aleluia</b> com seu versículo — ou, da Septuagésima à Páscoa, o <b>Trato</b>, salmo sem refrão, de tom penitente.</p>
     <p>Em cinco ocasiões o Missal de 1962 tem uma <b>Sequência</b>: <i>Victimæ paschali laudes</i> (Páscoa), <i>Veni, Sancte Spíritus</i> (Pentecostes), <i>Lauda Sion</i> (Corpus Christi), <i>Stabat Mater</i> (Sete Dores) e <i>Dies iræ</i> (defuntos).</p>
     <div class="note">No Pentecostes, ao versículo “Veni, Sancte Spíritus”, todos genuflectem.</div>`);
  ch('evangelium', 'As partes da Missa', 'O Evangelho',
    `<p>Enquanto o acólito transporta o Missal para o lado do Evangelho (à esquerda) — sinal da pregação que passou dos judeus aos gentios —, o sacerdote, profundamente inclinado no meio, pede a purificação dos lábios: <i>Munda cor meum</i>, recordando o serafim que purificou Isaías com uma brasa (Is 6).</p>
     <p>Diz “Dóminus vobíscum”, anuncia “Sequéntia sancti Evangélii secúndum N.”, assinala com o polegar o livro e a si mesmo na fronte, na boca e no peito (para que a palavra de Deus esteja na mente, nos lábios e no coração). Todos estão de pé. No fim, o acólito responde “Laus tibi, Christe” e o sacerdote beija o texto: “Per evangélica dicta deleántur nostra delícta”.</p>
     <div class="note">Nas Missas de defuntos não se pede a bênção (“Jube, Dómine”) nem se beija o livro.</div>`);
  ch('credo', 'As partes da Missa', 'O Credo',
    `<p>O Símbolo Niceno-Constantinopolitano diz-se aos domingos, nas festas de I classe, em algumas de II classe (do Senhor, de Nossa Senhora, dos Apóstolos), nas oitavas privilegiadas e em certas Missas votivas solenes.</p>
     <p>Às palavras <b>“Et incarnátus est… et homo factus est”</b> todos genuflectem, adorando o mistério da Encarnação. O sacerdote inclina a cabeça a “Deum”, a “Jesum Christum” e a “simul adorátur”, e benze-se a “Et vitam ventúri sǽculi”.</p>`);
  ch('offertorium', 'As partes da Missa', 'O Ofertório',
    `<p>O sacerdote descobre o cálice e oferece a hóstia na patena (<i>Súscipe, sancte Pater</i>): “esta hóstia imaculada… pelos meus inumeráveis pecados… por todos os circunstantes e por todos os fiéis, vivos e defuntos”.</p>
     <p>No canto da Epístola o acólito apresenta as galhetas. O sacerdote deita o vinho e, depois de abençoar a água, algumas gotas dela: a água misturada ao vinho significa a união da natureza humana à divina em Cristo e a do povo fiel com o seu Senhor. Na Missa de defuntos a água não é abençoada.</p>
     <p>Oferece então o cálice (<i>Offérimus tibi</i>), cobre-o com a pala, inclina-se (<i>In spíritu humilitátis</i>) e invoca o Espírito Santo (<i>Veni, sanctificátor</i>), abençoando as oblatas.</p>`);
  ch('lavabo', 'As partes da Missa', 'O Lavabo',
    `<p>O sacerdote lava as pontas dos polegares e dos indicadores — os dedos que tocarão a Hóstia consagrada — enquanto reza o Salmo 25: “Lavábo inter innocéntes manus meas”. O acólito derrama a água e oferece o manustérgio.</p>
     <div class="note">No Tempo da Paixão e nas Missas de defuntos omite-se o Glória ao Pai no fim do salmo.</div>`);
  ch('secreta', 'As partes da Missa', 'Oráte, fratres e Secreta',
    `<p>No meio do altar, o sacerdote reza <i>Súscipe, sancta Trínitas</i>, beija o altar e, voltando-se, convida: <i>Oráte, fratres</i> — “Orai, irmãos, para que o meu e vosso sacrifício seja aceito por Deus Pai todo-poderoso”. Completa o círculo voltando-se ao altar; o acólito responde <i>Suscípiat</i>.</p>
     <p>A <b>Secreta</b> é dita em silêncio, de mãos estendidas, sem “Orémus”; só a conclusão “Per ómnia sǽcula sæculórum” é dita em voz alta, iniciando o Prefácio.</p>`);
  ch('praefatio', 'As partes da Missa', 'O Prefácio',
    `<p>Diálogo solene — “Sursum corda”, “Corações ao alto” — e grande ação de graças que termina com o Sanctus. O Missal de 1962 tem quinze prefácios: comum, da Trindade (domingos sem prefácio próprio), do Natal, da Epifania, da Quaresma, da Santa Cruz, Pascal, da Ascensão, do Espírito Santo, do Sagrado Coração, de Cristo Rei, de Nossa Senhora, de São José, dos Apóstolos e dos Defuntos.</p>`);
  ch('sanctus', 'As partes da Missa', 'Sanctus',
    `<p>O hino dos serafins (Is 6, 3) e das multidões de Jerusalém (Mt 21, 9). O sacerdote o diz inclinado, em voz média, e benze-se ao “Benedíctus qui venit”. O acólito toca a campainha três vezes.</p>`);
  ch('canon', 'As partes da Missa', 'O Cânon Romano',
    `<p>O Cânon (“regra”) é a oração consecratória imutável do rito romano, dita em silêncio, em antiquíssima redação latina. Contém: o <b>Te ígitur</b> (pela Igreja, o Papa e o bispo); o <b>Memento dos vivos</b>; o <b>Communicántes</b> (memória da Virgem, de São José — acrescentado por João XXIII em 1962 —, dos Apóstolos e mártires); o <b>Hanc ígitur</b>, em que o sacerdote estende as mãos sobre as oblatas como sobre a vítima no Antigo Testamento; e o <b>Quam oblatiónem</b>, com cinco sinais da cruz.</p>
     <div class="note">Em certas festas o Communicántes e o Hanc ígitur são próprios: Natal, Epifania, Páscoa, Ascensão e Pentecostes.</div>`);
  ch('consecratio', 'As partes da Missa', 'A Consagração',
    `<p>O coração da Missa. O sacerdote, agindo <i>in persona Christi</i>, profere sobre a hóstia as palavras <b>HOC EST ENIM CORPUS MEUM</b> e sobre o cálice <b>HIC EST ENIM CALIX SANGUINIS MEI…</b>; pela transubstanciação, o pão e o vinho tornam-se o Corpo e o Sangue de Cristo.</p>
     <p>Imediatamente o sacerdote genuflecte e adora; eleva a Hóstia e depois o Cálice para a adoração dos fiéis; genuflecte de novo. O acólito toca a campainha e ergue a orla da casula. Desde então, até a ablução, o sacerdote não separa os polegares dos indicadores.</p>
     <p>Diante da Hóstia elevada, é costume dizer em silêncio: “Meu Senhor e meu Deus” (indulgenciado por São Pio X).</p>`);
  ch('pater', 'As partes da Missa', 'Pater noster, Líbera nos e fração',
    `<p>Depois da pequena elevação (“Per ipsum… omnis honor et glória”), o sacerdote reza em voz alta o Pai-Nosso; o acólito responde “Sed líbera nos a malo”. No <i>Líbera nos</i> o sacerdote se benze com a patena e a beija.</p>
     <p>Parte a Hóstia em três: duas metades sobre a patena e uma pequena partícula, com a qual traça três cruzes sobre o cálice (“Pax ✠ Dómini sit ✠ semper ✠ vobíscum”) e que deixa cair no Precioso Sangue (<i>commíxtio</i>), sinal da Ressurreição: o Corpo e o Sangue reunidos.</p>`);
  ch('agnus', 'As partes da Missa', 'Agnus Dei',
    `<p>Três invocações ao Cordeiro de Deus, batendo no peito. Nas Missas de defuntos diz-se “dona eis réquiem” (e “sempitérnam” na terceira) e não se bate no peito; omite-se também a primeira das três orações seguintes, a que pede a paz.</p>`);
  ch('communio', 'As partes da Missa', 'A Comunhão',
    `<p>O sacerdote diz três vezes “Dómine, non sum dignus” (as palavras do centurião), batendo no peito, e comunga a Sagrada Hóstia e o Preciosíssimo Sangue.</p>
     <p>Para a comunhão dos fiéis, abre o sacrário, mostra uma partícula — “Ecce Agnus Dei” — repete três vezes “Dómine, non sum dignus” e dá a Comunhão de joelhos, na língua, dizendo a cada um: “Corpus Dómini nostri Jesu Christi custódiat ánimam tuam in vitam ætérnam. Amen”. O acólito comunga primeiro e depois segura a patena.</p>
     <div class="note"><b>1962:</b> o Missal de 1962 suprimiu o Confíteor, o Misereátur e o Indulgéntiam antes da Comunhão dos fiéis (O’Connell, 1964, p. 367). Em muitos lugares, porém, o costume foi mantido — o jogo permite ativá-lo em Configurações → Costumes.</div>`);
  ch('ablutio', 'As partes da Missa', 'As abluções',
    `<p>Para que nenhum fragmento se perca, o sacerdote purifica o cálice com um pouco de vinho (<i>Quod ore súmpsimus</i>) e depois os dedos, sobre o cálice, com vinho e água (<i>Corpus tuum, Dómine</i>), tomando as abluções. Enxuga o cálice e o compõe com o sanguinho, a patena, a pala, o véu e a bolsa.</p>`);
  ch('postcommunio', 'As partes da Missa', 'Comunhão e Pós-Comunhão',
    `<p>Com o Missal de novo no lado da Epístola, o sacerdote lê a antífona da Comunhão (outrora cantada durante a distribuição) e, depois de saudar o povo, a <b>Pós-Comunhão</b>, oração de ação de graças com a mesma forma da Coleta.</p>
     <div class="note">Nas férias da Quaresma segue-se a <b>Oração sobre o povo</b>, introduzida por “Humiliáte cápita vestra Deo”.</div>`);
  ch('conclusio', 'As partes da Missa', 'Ite, missa est e bênção',
    `<p>“Ide, a Missa está terminada” (<i>missa</i> = despedida). Pelas rubricas de 1960 diz-se sempre <i>Ite, missa est</i>; <i>Benedicámus Dómino</i> só quando segue outra ação litúrgica (por exemplo uma procissão); nas Missas de defuntos, voltado para o altar: <i>Requiéscant in pace</i> — “Amen”. Na oitava da Páscoa acrescenta-se “allelúja, allelúja”.</p>
     <p>O sacerdote reza <i>Pláceat tibi, sancta Trínitas</i>, beija o altar e abençoa o povo uma só vez. Na Missa de defuntos não há bênção.</p>`);
  ch('ultimum', 'As partes da Missa', 'O Último Evangelho',
    `<p>O prólogo de São João (Jo 1, 1-14), lido no lado do Evangelho, geralmente na sacra. Às palavras <b>“Et Verbum caro factum est”</b> todos genuflectem.</p>
     <div class="note"><b>1960, n. 509:</b> o Último Evangelho é sempre o de São João; omite-se, por exemplo, na terceira Missa do Natal (cujo Evangelho já é o prólogo), na Missa de Ramos quando precedida da bênção e procissão, e quando a Missa é seguida imediatamente de outra ação litúrgica.</div>`);
  ch('leonine', 'As partes da Missa', 'As orações leoninas',
    `<p>Prescritas por Leão XIII (1884, 1886) e confirmadas por Pio XI (1934, pela Rússia), rezam-se de joelhos ao pé do altar depois da Missa rezada: três Ave-Marias, a Salve Rainha, o versículo e a oração <i>Deus, refúgium nostrum</i>, a oração a São Miguel Arcanjo e, por costume, três vezes “Cor Jesu sacratíssimum, miserére nobis”.</p>
     <div class="review">Ponto para revisão: a legislação de 1958–1960 admitia a omissão destas orações quando à Missa segue outra função ou um sermão, ou em Missas “dialogadas” em certas circunstâncias. O jogo sempre as inclui depois da Missa rezada.</div>`);
  ch('recessus', 'As partes da Missa', 'Retorno e ação de graças',
    `<p>O sacerdote toma o cálice, genuflecte ao pé do altar, recebe o barrete e volta à sacristia precedido do acólito; ali ambos se inclinam ao crucifixo. Depois de se desparamentar, o sacerdote faz a ação de graças (o Missal propõe a antífona <i>Trium puerórum</i> com o cântico Benedícite e o Salmo 150).</p>`);

  // ---------------- GESTOS E VESTES ----------------
  ch('gestos', 'Gestos e vestes', 'Os gestos litúrgicos',
    `<p>Na liturgia tradicional cada gesto é prescrito pelas rubricas, para que nada dependa do gosto pessoal.</p>
     <div class="legend">
     <b>Sinal da cruz</b><span>Grande (fronte, peito, ombros) ou pequeno (fronte, boca e peito, ao Evangelho).</span>
     <b>Inclinação de cabeça</b><span>Ao nome de Jesus, de Maria, do santo do dia; ao Glória ao Pai; ao “Orémus”.</span>
     <b>Inclinação média</b><span>“Aliquántulum inclinátus”: In spíritu humilitátis, Súscipe sancta Trínitas, Pláceat.</span>
     <b>Inclinação profunda</b><span>Confíteor, Munda cor, Te ígitur, Súpplices.</span>
     <b>Genuflexão</b><span>Joelho direito até o chão: ao Santíssimo; no Credo (Et incarnatus); no Último Evangelho (Et Verbum caro).</span>
     <b>Mãos estendidas</b><span>Na oração presidencial: Coleta, Secreta, Prefácio, Cânon, Pós-Comunhão.</span>
     <b>Mãos juntas</b><span>Polegar direito sobre o esquerdo, em forma de cruz.</span>
     <b>Bater no peito</b><span>Mea culpa, Nobis quoque peccatóribus, Agnus Dei, Domine non sum dignus.</span>
     <b>Elevar os olhos</b><span>Veni sanctificátor, Te ígitur, Qui prídie, bênção final.</span>
     <b>Beijo</b><span>Do altar, do Evangelho, da patena; os ósculos do acólito (galhetas, barrete) são omitidos nas Missas de defuntos.</span>
     </div>`);
  ch('vestes', 'Gestos e vestes', 'As vestes sagradas',
    `<p>O sacerdote reveste-se na sacristia, rezando uma oração a cada peça (Missal, “Cum sacerdos induitur”):</p>
     <p><b>Amito</b> — “o elmo da salvação”; <b>alva</b> — “alvejado no Sangue do Cordeiro”; <b>cíngulo</b> — a pureza; <b>manípulo</b> — “o pranto e a dor”; <b>estola</b> — “a estola da imortalidade”; <b>casula</b> — “o meu jugo é suave”.</p>
     <p>Antes, lava as mãos (“Da, Dómine, virtútem”). Beija a cruz do amito, do manípulo e da estola. O presbítero cruza a estola sobre o peito; o bispo, não.</p>`);
  ch('cores', 'Gestos e vestes', 'As cores litúrgicas',
    `<p><b>Branco</b>: festas do Senhor (exceto as da Paixão), de Nossa Senhora, dos Anjos, dos santos não mártires; Natal e Tempo Pascal.<br>
     <b>Vermelho</b>: Pentecostes, festas da Paixão e da Cruz, Apóstolos (exceto São João) e mártires.<br>
     <b>Verde</b>: domingos e férias depois da Epifania e depois de Pentecostes.<br>
     <b>Roxo</b>: Advento, Septuagésima, Quaresma, Têmporas, vigílias penitenciais.<br>
     <b>Rosáceo</b> (facultativo): domingos Gaudete e Lætare.<br>
     <b>Preto</b>: Sexta-feira Santa e Missas de defuntos.</p>
     <p>Os paramentos de tecido de ouro podem substituir o branco, o vermelho e o verde.</p>`);

  // ---------------- O ACÓLITO ----------------
  ch('acolito', 'O ofício do acólito', 'Regras gerais do acólito',
    `<p>O acólito “faz as vezes de todo o povo católico” (São Tomás). Segundo O’Connell (cap. XXI):</p>
     <p>• Movimentos graves, reverentes e silenciosos; mãos juntas, polegar direito sobre o esquerdo.<br>
     • Na Missa rezada, quando não está ocupado, <b>fica de joelhos</b> — exceto nos Evangelhos.<br>
     • Nas orações ao pé do altar ajoelha-se no chão, à esquerda do sacerdote e um pouco atrás; depois, no degrau inferior, <b>do lado oposto ao Missal</b>.<br>
     • Genuflecte (sempre no chão) ao chegar, ao passar pelo meio e ao sair.<br>
     • Responde com clareza, sem antecipar nem atrasar; no Kyrie responde alternadamente, não junto.<br>
     • Nunca abre o Missal nem procura as páginas.<br>
     • Ao voltar-se, evita dar as costas ao Santíssimo.</p>`);
  ch('acolitoPassos', 'O ofício do acólito', 'O serviço passo a passo',
    `<p><b>Antes:</b> batina e sobrepeliz; galhetas, bacia e manustérgio na credência; campainha, patena e cartão; tirar a cobertura do altar; acender duas velas (Epístola primeiro); ajudar o sacerdote a paramentar-se; levar o Missal.</p>
     <p><b>Ao pé do altar:</b> recebe o barrete, genuflecte, põe o barrete na sedília e o Missal fechado na estante; ajoelha-se à esquerda do sacerdote.</p>
     <p><b>Epístola:</b> “Deo grátias”; vai ao canto da Epístola e transporta o Missal (genuflectindo no meio, sem parar com o livro na mão — genuflecte com ele).</p>
     <p><b>Ofertório:</b> galhetas (beijando-as), depois o lavabo; toma a campainha.</p>
     <p><b>Cânon:</b> Sanctus (3 toques); Hanc ígitur (1 toque, por costume); sobe ao supedâneo; campainha e orla da casula em cada elevação.</p>
     <p><b>Comunhão:</b> um toque depois do Agnus Dei se há comungantes; comunga e segura a patena.</p>
     <p><b>Abluções:</b> vinho no cálice; vinho e água sobre os dedos; Missal de volta ao lado da Epístola.</p>
     <p><b>Fim:</b> “Deo grátias”, bênção, Último Evangelho, orações leoninas, barrete, volta à sacristia.</p>`);

  // ---------------- ANO, LATIM, CANTO, RUBRICAS ----------------
  ch('ano', 'O ano e as rubricas', 'O ano litúrgico',
    `<p><b>Ciclo do Natal:</b> Advento (4 domingos) · Natal · Epifania · domingos depois da Epifania.<br>
     <b>Ciclo da Páscoa:</b> Septuagésima, Sexagésima, Quinquagésima (o “pré-quaresma”) · Quaresma (desde a Quarta-feira de Cinzas) · Tempo da Paixão · Semana Santa · Páscoa · Ascensão · Pentecostes.<br>
     <b>Tempo depois de Pentecostes:</b> Santíssima Trindade, Corpus Christi, Sagrado Coração, até 24 domingos (o último anuncia o fim dos tempos); Cristo Rei no último domingo de outubro.</p>
     <p>Ao ciclo do Tempo (<i>Proprium de Tempore</i>) sobrepõe-se o dos santos (<i>Proprium Sanctorum</i>). O Codex Rubricarum de 1960 classifica os dias em festas de I, II, III classe e comemorações.</p>`);
  ch('rubricas1962', 'O ano e as rubricas', 'O que mudou em 1960–1962',
    `<p>O Missal de 1962 incorpora o <i>Codex Rubricarum</i> (1960) e a reforma da Semana Santa (1955). Entre as mudanças:</p>
     <p>• classes de dias (I, II, III, IV) em lugar de duplex, semiduplex etc.;<br>
     • suprimido o Confíteor antes da Comunhão dos fiéis;<br>
     • Último Evangelho sempre o de São João (salvo exceções);<br>
     • “Ite, missa est” sempre, salvo quando segue procissão;<br>
     • o barrete na ida ao altar torna-se facultativo;<br>
     • limites às comemorações (no máximo duas orações adicionais);<br>
     • pela decisão de 13 de novembro de 1962, o nome de <b>São José</b> entra no Communicántes.</p>`);
  ch('latim', 'O ano e as rubricas', 'O latim e sua pronúncia',
    `<p>O latim é a língua própria do rito romano: imutável, universal e sagrada. A pronúncia eclesiástica (romana) é próxima do italiano:</p>
     <div class="legend">
     <b>c</b> antes de e, i, æ, œ<span>“tch”: <i>cælum</i> = tchélum</span>
     <b>g</b> antes de e, i<span>“dj”: <i>génitum</i> = djénitum</span>
     <b>gn</b><span>“nh”: <i>agnus</i> = ánhus</span>
     <b>sc</b> antes de e, i<span>“ch”: <i>descéndit</i> = dechéndit</span>
     <b>ti</b> + vogal<span>“tsi”: <i>grátia</i> = grátsia</span>
     <b>æ, œ</b><span>“é”: <i>sǽcula</i> = sécula</span>
     <b>j</b><span>“i”: <i>Jesus</i> = Iésus</span>
     <b>h</b><span>mudo; <i>mihi, nihil</i> = míki, níkil</span>
     <b>ch</b><span>“k”: <i>Christe</i> = Kriste</span>
     </div>
     <p>Os acentos gráficos dos livros litúrgicos (Dóminus, vobíscum) indicam a sílaba tônica.</p>
     <div class="review">A voz do jogo usa a síntese de fala do seu navegador: com uma voz italiana instalada a pronúncia fica muito próxima da romana; com outras vozes é apenas aproximada. Escolha as vozes em Configurações.</div>`);
  ch('canto', 'O ano e as rubricas', 'O canto gregoriano e o Kyriale',
    `<p>O canto gregoriano é o canto próprio da Igreja romana (São Pio X, 1903): monódico, sem compasso fixo, escrito em notação quadrada sobre pauta de quatro linhas, com claves de dó e de fá.</p>
     <p>O <b>Kyriale</b> reúne dezoito Missas do Ordinário (Kyrie, Glória, Sanctus, Agnus Dei) e vários Credos, atribuídos aos tempos e festas: Missa I (Lux et origo) no Tempo Pascal, II e III nas festas de I classe, IV nas dos Apóstolos, VIII (De Angelis), IX e X nas de Nossa Senhora, XI nos domingos do ano, XVII nos domingos do Advento e da Quaresma, XVIII nas férias penitenciais.</p>
     <p>No Livro de orações deste jogo, as partituras vêm do <i>Graduale Romanum</i> e do <i>Liber Usualis</i> de 1961 (via GregoBase) e são cantadas por uma schola sintetizada.</p>`);

  // ---------------- FONTES ----------------
  ch('fontes', 'Fontes e revisão', 'Fontes utilizadas',
    `<p><b>Textos latinos</b> do Ordinário, dos Próprios e dos Prefácios: projeto <i>Divinum Officium</i> (versão das rubricas de 1960), conferidos com a estrutura do Missale Romanum de 1962.</p>
     <p><b>Rubricas do celebrante e do acólito</b>: <i>Ritus servandus in celebratione Missæ</i> (Missal de 1962) e J. B. O’Connell, <i>The Celebration of Mass</i>, 4.ª ed. revista segundo o Codex Rubricarum de 1960 e a edição típica de 1962 (Bruce, 1964), sobretudo os capítulos IV–XV (celebrante) e XXI (o acólito).</p>
     <p><b>Melodias</b>: GregoBase (edição vaticana; Graduale Romanum e Liber Usualis, 1961), conforme o mapeamento do projeto jgabc.</p>
     <p><b>Traduções</b>: Ordinário e Prefácios traduzidos para este jogo; Próprios a partir da tradução portuguesa do Divinum Officium, adaptada à norma brasileira.</p>`);
  ch('revisao', 'Fontes e revisão', 'Pontos a revisar por um liturgista',
    `<p>O jogo procura a máxima fidelidade, mas alguns pontos merecem a revisão de alguém com formação litúrgica:</p>
     <div class="review">1. <b>Traduções</b> portuguesas do Ordinário (próprias) e dos Próprios (adaptadas automaticamente do português europeu).</div>
     <div class="review">2. <b>Usos variáveis do acólito</b> descritos por O’Connell como costumes: campainha no Hanc ígitur; maneira de apresentar as galhetas; dobra do véu do cálice; “Prosit” na sacristia; água benta à porta.</div>
     <div class="review">3. <b>Campainha</b> no “Dómine, non sum dignus”: O’Connell (1962) diz que já não se toca; o costume persiste em muitos lugares (opção em Configurações).</div>
     <div class="review">4. <b>Confíteor antes da Comunhão</b>: suprimido em 1962; opção de costume disponível.</div>
     <div class="review">5. <b>Posturas dos fiéis</b> na Missa rezada: as rubricas não as fixam; o jogo segue um uso comum (ajoelhados, de pé nos Evangelhos e no Credo).</div>
     <div class="review">6. <b>Corpus Christi</b>: o jogo usa o Prefácio comum, conforme O’Connell (o Prefácio do Natal deixou de ser próprio em 1960); o Divinum Officium indica outro prefácio.</div>
     <div class="review">7. <b>Orações leoninas</b>: sempre incluídas após a Missa rezada (ver o capítulo próprio).</div>
     <div class="review">8. <b>Pronúncia</b> da voz sintética e <b>interpretação</b> sintetizada do canto (ritmo aproximado do método de Solesmes).</div>
     <div class="review">9. <b>Missa cantada</b>: as orações, a Epístola e o Evangelho são cantados em tom reto (tom ferial), sem as inflexões dos tons solenes; o Glória ao Pai do Intróito é cantado em tom reto na dominante do versículo; o Pater noster usa a melodia solene tradicional (transcrição do Graduale Romanum de 1974); o Prefácio canta-se em tom reto depois do diálogo (tom solene do Graduale de 1961). Não há incensação (a Missa cantada sem incenso é permitida).</div>
     <div class="review">10. <b>Gestos simplificados</b> na animação (por exemplo, a fração em três partes e as cruzes com a Hóstia aparecem como uma só ação).</div>`);
  ch('controles', 'Fontes e revisão', 'Controles do jogo',
    `<div class="legend">
     <b>WASD / setas</b><span>andar (Shift: devagar) · clique: ir até o ponto ou usar o objeto</span>
     <b>E / Espaço / Enter</b><span>interagir, servir, confirmar</span>
     <b>Botão direito</b><span>examinar o objeto (enciclopédia)</span>
     <b>1–0, Q, G, H, C</b><span>gestos (veja a barra inferior; passe o mouse para ver o nome)</span>
     <b>K, B, X, Z</b><span>acólito: ajoelhar/levantar, campainha, beijar, erguer a casula</span>
     <b>Z X C V</b><span>sacerdote: ações do altar (quando aparecem)</span>
     <b>1, 2, 3</b><span>escolher a resposta em latim</span>
     <b>F</b><span>pular a leitura em curso</span>
     <b>R</b><span>mostrar/ocultar a rubrica · <b>T</b> alternar latim/tradução</span>
     <b>M</b><span>Missal e livro de orações · <b>L</b> Manual · <b>O</b> Objetos · <b>I</b> inventário</span>
     <b>Esc</b><span>pausa</span>
     <b>Controle</b><span>analógico: andar · A: interagir · B: voltar · X/LB/RB: gestos · Y: Missal</span>
     </div>`);

  DG.data.manual = {
    chapters: C,
    byKey: k => C.find(c => c.key === k) || null,
    groups() { const g = []; C.forEach(c => { if (!g.includes(c.group)) g.push(c.group); }); return g; },
  };
})(window.DG = window.DG || {});
