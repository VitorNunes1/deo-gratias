# Deo Gratias — Simulador da Santa Missa Tridentina

Jogo de navegador, em pixel art, que ensina a celebrar e a servir a Missa segundo o **Missale Romanum de 1962**.
O jogador pode ser **sacerdote** ou **acólito**, da preparação na sacristia até o retorno depois das orações leoninas.
O jogo se passa na **Capela São Pio X**, uma capela da Fraternidade Sacerdotal São Pio X (FSSPX).

## Como abrir

**Jogar online:** https://vitornunes1.github.io/deo-gratias/

Para jogar sem internet, baixe o projeto e siga estes passos:

1. Dê dois cliques em `index.html`. Use **Chrome** ou **Edge** atualizados.
2. Clique uma vez na tela ou aperte uma tecla. O navegador só libera o som depois disso.

A versão baixada não precisa de internet, servidor nem instalação. Fontes, textos e melodias estão todos na pasta do projeto.
O progresso é salvo automaticamente no próprio navegador. Em **Configurações** é possível exportar ou apagar o salvamento.

**Voz em latim.** O jogo usa as vozes de síntese do sistema. A pronúncia eclesiástica fica muito melhor com uma voz **italiana**:
no Windows, abra *Configurações › Hora e idioma › Fala › Adicionar vozes* e instale *Italiano*.
Sem voz instalada, o texto avança no tempo estimado de leitura e o jogo continua normalmente.

## O que o jogo oferece

| Item | Conteúdo |
| --- | --- |
| Papéis | Sacerdote e acólito, cada um com suas rubricas, gestos e respostas |
| Modos | Tutorial guiado · Treino, que começa em qualquer parte da Missa · Celebração completa e avaliada |
| Formas | Missa rezada completa · Missa cantada sem incenso, liberada no modo Celebração depois de uma Missa completa |
| Celebrações | 27 Missas do ano litúrgico, com cores, paramentos, Próprios e cantos de cada dia |
| Calendário | Calendário tradicional com precedência de 1962, que sugere a próxima celebração disponível |
| Cenários | Nave e presbitério, altar-mor, sacristia, sala dos paramentos, capela de Nossa Senhora |
| A capela | Emblema da FSSPX no retábulo, nos estandartes, na sacristia e na fachada · imagem de São Pio X · retratos de São Pio X e de Dom Lefebvre |
| Livro | Missal bilíngue, orações, folha de respostas do acólito, cantos em notação quadrada, manual e enciclopédia de objetos |
| Avaliação | Rubrica, posição, respostas, tempo e reverência, com nota, lista de erros, histórico, conquistas e graus |

**Celebrações disponíveis**

- **Advento e Natal:** I Domingo do Advento, Gaudete, Imaculada Conceição, Natal (Missa da Noite e do Dia), Epifania.
- **Septuagésima e Quaresma:** Septuagésima, I Domingo da Quaresma, Lætare, São José, I Domingo da Paixão, Segunda-feira Santa.
- **Tempo pascal:** Páscoa, Ascensão, Pentecostes.
- **Depois de Pentecostes:** Santíssima Trindade, Corpus Christi, Sagrado Coração, IV e XXIV Domingos depois de Pentecostes, Cristo Rei.
- **Santos:** São Pedro e São Paulo, Assunção, Todos os Santos, São Gregório Taumaturgo, Santa Cecília.
- **Defuntos:** Comemoração de Todos os Fiéis Defuntos (Missa de Réquiem).

## Controles

| Tecla | Ação |
| --- | --- |
| WASD ou setas | Andar. Shift anda devagar. Clique leva até o ponto ou usa o objeto |
| E, Espaço ou Enter | Interagir, servir, confirmar |
| Botão direito | Examinar o objeto na enciclopédia |
| 1–0, Q, G, H, C | Gestos litúrgicos. A barra inferior mostra cada um |
| K, B, X, Z | Acólito: ajoelhar ou levantar, campainha, beijar, erguer a casula |
| Z, X, C, V | Sacerdote: ações do altar, quando aparecem |
| 1, 2, 3 | Escolher a resposta em latim |
| F | Pular a leitura em curso |
| R / T | Mostrar a rubrica / alternar latim e tradução |
| M / L / O / I | Missal / Manual / Objetos / Inventário |
| Esc | Pausa |
| Controle de videogame | Analógico anda, A interage, B volta, X/LB/RB fazem gestos, Y abre o Missal |

## Organização do código

O projeto é JavaScript puro, sem dependências nem etapa de compilação. Todos os módulos ficam no objeto global `DG`.
A arte é desenhada por código em um canvas de 480×270 ampliado sem suavização.
A interface segue o estilo de um missal antigo: molduras douradas em pixel art, pergaminho, filetes vermelhos, letra gótica nos títulos e versaletes. As peças são geradas por `js/ui/skin.js` e aplicadas por `css/skin.css`. O emblema da Fraternidade é desenhado por `js/gfx/emblem.js`.

| Pasta | Conteúdo |
| --- | --- |
| `js/core` | Utilidades, eventos, tempo de jogo, salvamento e entrada (teclado, mouse, controle) |
| `js/gfx` | Paleta, primitivas de desenho, ícones dos objetos, personagens e efeitos de luz e partículas |
| `js/audio` | Mixagem com reverberação, sinos e ruídos, voz sintética em latim e síntese do canto gregoriano |
| `js/data` | Ordinário, Próprios, cantos, celebrações, calendário, enciclopédia e manual |
| `js/world` | Cenas com navegação, atores com animações e os mapas de cada ambiente |
| `js/rite` | Gestos, pontuação, construtor do rito a partir dos dados e motor que executa a Missa |
| `js/ui` | Telas, HUD, livro, notação quadrada e menu inicial |
| `js/game` | Laço principal, preparação na sacristia e vista aproximada do altar |
| `tools` | Scripts Node que geram os arquivos de dados |

O rito é descrito como dados em `js/rite/builder.js`. Cada passo traz o texto, a rubrica do sacerdote e do acólito e a fonte.
O motor em `js/rite/engine.js` executa esses passos, espera as ações do jogador e registra a avaliação.

## Regenerar os dados

Os arquivos `js/data/propers.js` e `js/data/chants.js` são gerados e já vêm prontos. Para refazê-los é preciso Node.js.

```sh
# Próprios, Prefácios e Communicantes, a partir de um clone do Divinum Officium
node tools/extract-propers.js <caminho>/divinum-officium/web/www

# Cantos, a partir de uma pasta com os arquivos .gabc do GregoBase
node tools/build-chants.js <pasta-gabc>
node tools/build-chants.js <pasta-gabc> --list
```

A configuração de cada celebração, com as regras de 1962, fica no início de `tools/extract-propers.js`.
A adaptação do português europeu para o brasileiro fica em `tools/pt-br.js`.

## Fontes

- **Textos latinos:** projeto Divinum Officium, rubricas de 1960, conferidos com a estrutura do Missal de 1962.
- **Rubricas:** *Ritus servandus in celebratione Missæ* (1962) e J. B. O'Connell, *The Celebration of Mass*, 4.ª edição, 1964.
- **Melodias:** GregoBase, edição vaticana, conforme o mapeamento do projeto jgabc.
- **Traduções:** Ordinário e Prefácios traduzidos para o jogo. Próprios adaptados da tradução portuguesa do Divinum Officium.

## Pontos para revisão de um liturgista

O capítulo **Fontes e revisão › Pontos a revisar** do manual do jogo detalha cada item. Em resumo:

1. As traduções portuguesas precisam de revisão.
2. Alguns usos do acólito são costumes locais e podem ser ligados ou desligados em Configurações.
3. A campainha no *Domine, non sum dignus* e o *Confiteor* antes da Comunhão foram suprimidos em 1962 e ficam como opção.
4. As posturas dos fiéis seguem um uso comum, porque as rubricas não as fixam.
5. Corpus Christi usa o Prefácio comum, conforme O'Connell, divergindo do Divinum Officium.
6. A Missa cantada usa tom reto em orações e leituras e não tem incensação.
7. Algumas sequências de gestos aparecem simplificadas na animação, como a fração da Hóstia.
8. A pronúncia da voz sintética e o ritmo do canto sintetizado são aproximados.

## Próximas etapas

- Missa solene, com diácono, subdiácono e incensação.
- Incensação na Missa cantada.
- Tríduo Pascal, Quarta-feira de Cinzas e Candelária.
- Próprios para o ano inteiro, com santoral completo e Missas votivas.
- Tons solenes das orações e leituras na Missa cantada.

## Licenças

As fontes tipográficas EB Garamond e UnifrakturMaguntia usam a SIL Open Font License. As licenças estão em `assets/fonts`.
O emblema da Fraternidade Sacerdotal São Pio X foi redesenhado em pixel art para o jogo. Este é um projeto independente de fiéis, sem vínculo oficial com a FSSPX.
Os textos e as transcrições musicais vêm do Divinum Officium e do GregoBase. Confira os termos desses projetos antes de uma distribuição pública.
