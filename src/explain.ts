// "Why does it come back?" article for languages other than English and Japanese.
// Arabic (and anything missing here) falls back to the static English article
// (those two are static HTML in index.html for crawlers without JavaScript).
import type { Lang } from "./i18n";

type Article = {
  h: [string, string, string, string, string, string, string];
  p: string[]; // 9 paragraphs, in order
  made: string;
};

const VIDEOS = `<ul class="videos">
  <li><a href="https://www.youtube.com/watch?v=5Koi1DRwRUM" rel="noopener" target="_blank">I Zipped a Smiley 5 Times and Got 1,024 Smileys. 5 More and It Was One Again.</a></li>
  <li><a href="https://www.youtube.com/watch?v=Dd8sWlP-j5U" rel="noopener" target="_blank">Nothing Was Lost (Arnold's cat map on a picture of balls)</a></li>
  <li><a href="https://www.youtube.com/watch?v=1n84oxa9tkM" rel="noopener" target="_blank">I Kneaded 1,048,576 Balls 20 Times. The Smiley Came Back From the Side.</a></li>
  <li><a href="https://www.youtube.com/watch?v=pOpMOmPZ68g" rel="noopener" target="_blank">A smiley of 16,384 balls. What else can the same balls become?</a></li>
</ul>`;

const A: Record<string, Article> = {
  "zh-Hans": {
    h: ["打乱的图片为什么会回来？", "拉链：1024 用 10 次回来，1022 要 340 次", "阿诺德猫映射与面包师映射", "转圈", "重排：同样的像素，不同的图", "发送一张秘密图片", "看视频"],
    p: [
      "这里的每条规则都只是<em>移动</em>像素，不会新增、删除或改变任何像素的颜色。跟着一个像素看，它从一个位置跳到另一个位置；位置的数量有限，所以它迟早会回到起点。每个像素都在走自己的环。",
      "当所有的环在同一时刻走完一圈，整张图就回来了。那一步正是所有环长的最小公倍数。这个页面会找出你图片里的每一个环，并精确算出这个数，哪怕它有几百位。",
      "拉链就是先对行做一次完美洗牌，再对列做一次。1024 行时，第 <i>r</i> 行移到第 2<i>r</i> 行（对 1023 取余）。10 次之后每一行都被乘了 10 次 2，而 2<sup>10</sup> = 1024 恰好比 1023 大 1，于是全部回家。走到一半的第 5 次，图片会变成 1,024 个小小的自己。",
      "只少两行，情况就完全不同：1022 要 340 次，1000 要 36 次，1026 要 20 次。试试尺寸框和下面的表格：相邻尺寸的步数会剧烈跳动。",
      "猫映射把正方形斜着错开，再像甜甜圈一样首尾相接；面包师映射则是压扁、拉长、叠起，像揉面团。两者都是混沌的经典例子：相邻像素很快分开，几步之内图片就变成雪花。但因为格子是有限的，它们都必然回来。101×101 的猫 25 步回来，1000×1000 的揉面大约要 2.13 × 10<sup>253</sup> 步。",
      "每一圈方形都顺时针走一格。64×64 图片最外圈有 252 个像素，下一圈 244 个，依此类推。每一圈各自按自己的长度回家，但所有圈一起回家需要最小公倍数：大约 7.38 × 10<sup>25</sup> 步。",
      "选一个目标，看你图片的每个像素飞到新位置。暗的像素去目标暗的地方，亮的去亮的地方；如果相邻两个像素交换后颜色都更接近，就交换。它始终是同一组像素，所以随时都能飞回去。",
      "把照片打乱到第 <i>k</i> 步并保存 PNG。只要知道规则、尺寸和 <i>k</i>，任何人都能还原：用“按原像素使用”打开，再后退 <i>k</i> 步。这是好玩的谜题，不是真正的加密。",
    ],
    made: "制作：",
  },
  "zh-Hant": {
    h: ["打亂的圖片為什麼會回來？", "拉鍊：1024 用 10 次回來，1022 要 340 次", "阿諾德貓映射與麵包師映射", "轉圈", "重排：同樣的像素，不同的圖", "傳送一張秘密圖片", "看影片"],
    p: [
      "這裡的每條規則都只是<em>移動</em>像素，不會新增、刪除或改變任何像素的顏色。跟著一個像素看，它從一個位置跳到另一個位置；位置的數量有限，所以它遲早會回到起點。每個像素都在走自己的環。",
      "當所有的環在同一時刻走完一圈，整張圖就回來了。那一步正是所有環長的最小公倍數。這個頁面會找出你圖片裡的每一個環，並精確算出這個數，哪怕它有幾百位。",
      "拉鍊就是先對列做一次完美洗牌，再對欄做一次。1024 列時，第 <i>r</i> 列移到第 2<i>r</i> 列（對 1023 取餘）。10 次之後每一列都被乘了 10 次 2，而 2<sup>10</sup> = 1024 恰好比 1023 大 1，於是全部回家。走到一半的第 5 次，圖片會變成 1,024 個小小的自己。",
      "只少兩列，情況就完全不同：1022 要 340 次，1000 要 36 次，1026 要 20 次。試試尺寸框和下面的表格：相鄰尺寸的步數會劇烈跳動。",
      "貓映射把正方形斜著錯開，再像甜甜圈一樣首尾相接；麵包師映射則是壓扁、拉長、疊起，像揉麵團。兩者都是混沌的經典例子：相鄰像素很快分開，幾步之內圖片就變成雪花。但因為格子是有限的，它們都必然回來。101×101 的貓 25 步回來，1000×1000 的揉麵大約要 2.13 × 10<sup>253</sup> 步。",
      "每一圈方形都順時針走一格。64×64 圖片最外圈有 252 個像素，下一圈 244 個，依此類推。每一圈各自按自己的長度回家，但所有圈一起回家需要最小公倍數：大約 7.38 × 10<sup>25</sup> 步。",
      "選一個目標，看你圖片的每個像素飛到新位置。暗的像素去目標暗的地方，亮的去亮的地方；如果相鄰兩個像素交換後顏色都更接近，就交換。它始終是同一組像素，所以隨時都能飛回去。",
      "把照片打亂到第 <i>k</i> 步並儲存 PNG。只要知道規則、尺寸和 <i>k</i>，任何人都能還原：用「按原像素使用」開啟，再後退 <i>k</i> 步。這是好玩的謎題，不是真正的加密。",
    ],
    made: "製作：",
  },
  ko: {
    h: ["뒤섞인 그림은 왜 다시 돌아올까?", "지퍼: 1024는 10번, 1022는 340번", "아놀드의 고양이 사상과 제빵사 사상", "고리 회전", "재배치: 같은 픽셀, 다른 그림", "비밀 그림 보내기", "영상으로 보기"],
    p: [
      "여기 있는 규칙은 모두 픽셀을 <em>옮기기</em>만 합니다. 새로 만들거나 지우거나 색을 바꾸는 픽셀은 없습니다. 픽셀 하나를 따라가 보면 자리에서 자리로 뛰어다니는데, 자리의 수가 정해져 있으니 언젠가는 반드시 출발한 자리로 돌아옵니다. 모든 픽셀은 저마다의 고리를 돌고 있습니다.",
      "그림 전체가 돌아오는 때는 모든 고리가 같은 순간에 한 바퀴를 마칠 때, 즉 고리 길이들의 최소공배수 단계입니다. 이 페이지는 그림 속 모든 고리를 찾아 그 수를 정확히 계산합니다. 수백 자리가 되더라도요.",
      "지퍼는 행을 완벽하게 셔플한 다음 열을 셔플하는 것입니다. 1024행이라면 <i>r</i>번째 행은 2<i>r</i>번째 행(1023으로 나눈 나머지)으로 갑니다. 10번이면 모든 행이 2를 10번 곱한 셈이고, 2<sup>10</sup> = 1024는 1023보다 딱 1 크므로 모두 제자리로 돌아옵니다. 절반인 5번째에는 그림이 자기 자신의 작은 복사본 1,024개가 됩니다.",
      "두 행만 줄여도 이야기가 완전히 달라집니다. 1022는 340번, 1000은 36번, 1026은 20번. 크기 칸과 그 아래 표로 확인해 보세요. 이웃한 크기끼리도 단계 수가 크게 널뛰기합니다.",
      "고양이 사상은 정사각형을 비스듬히 밀고 도넛처럼 끝을 이어 붙입니다. 제빵사 사상은 눌러서 늘리고 겹치는, 반죽을 치대는 동작입니다. 둘 다 카오스의 교과서적인 예로, 가까운 픽셀이 금세 멀어지고 몇 단계 만에 그림은 잡음이 됩니다. 그래도 격자가 유한하므로 반드시 돌아옵니다. 101×101 고양이는 25단계, 1000×1000 반죽은 약 2.13 × 10<sup>253</sup>단계입니다.",
      "네모난 고리마다 시계 방향으로 한 칸씩 움직입니다. 64×64 그림의 가장 바깥 고리는 252픽셀, 다음은 244픽셀…. 각 고리는 자기 길이만큼이면 돌아오지만 전부 함께 돌아오려면 최소공배수, 약 7.38 × 10<sup>25</sup>단계가 필요합니다.",
      "목표를 고르면 그림의 모든 픽셀이 새 자리로 날아갑니다. 어두운 픽셀은 목표의 어두운 곳으로, 밝은 픽셀은 밝은 곳으로. 그다음 가까운 두 픽셀을 바꿔서 둘 다 색이 가까워지면 바꿉니다. 여전히 같은 픽셀의 모음이므로 언제든 날아서 돌아갈 수 있습니다.",
      "사진을 <i>k</i>단계까지 뒤섞고 PNG로 저장하세요. 규칙, 크기, <i>k</i>를 아는 사람이라면 되돌릴 수 있습니다. ‘픽셀 그대로 사용’으로 열고 <i>k</i>단계 뒤로 가면 됩니다. 진짜 암호가 아니라 재미있는 퍼즐입니다.",
    ],
    made: "만든 곳: ",
  },
  es: {
    h: ["¿Por qué vuelve una imagen desordenada?", "La cremallera: 1024 vuelve en 10, 1022 necesita 340", "El gato de Arnold y la transformación del panadero", "Anillos", "Reordenar: los mismos píxeles, otra imagen", "Envía una imagen secreta", "Mira los vídeos"],
    p: [
      "Cada regla de esta página solo <em>mueve</em> píxeles. Ninguno se crea, se destruye ni cambia de color. Si sigues un píxel, salta de sitio en sitio y, como hay un número limitado de sitios, tarde o temprano cae donde empezó. Cada píxel recorre su propio ciclo.",
      "La imagen entera vuelve cuando todos los ciclos terminan en el mismo instante, es decir, en el mínimo común múltiplo de todas sus longitudes. Esta página encuentra todos los ciclos de tu imagen y calcula ese número exacto, aunque tenga cientos de cifras.",
      "Una cremallera es una mezcla perfecta de las filas y luego de las columnas. Con 1024 filas, la fila <i>r</i> pasa a la 2<i>r</i> (módulo 1023). Tras 10 cremalleras cada fila se ha duplicado 10 veces, y 2<sup>10</sup> = 1024 es justo 1 más que 1023: todos en casa. A mitad de camino, en la 5.ª, la imagen se convierte en 1.024 copias diminutas de sí misma.",
      "Quita dos filas y todo cambia: 1022 necesita 340 cremalleras, 1000 necesita 36 y 1026 necesita 20. Prueba la casilla de tamaño y la tabla de debajo: el número de pasos salta de forma loca entre vecinos.",
      "El gato inclina el cuadrado y lo enrolla como un donut. El panadero aplasta, estira y apila, como al amasar. Ambos son ejemplos clásicos de caos: los píxeles vecinos se separan enseguida y la imagen se vuelve ruido en pocos pasos. Pero como la cuadrícula es finita, los dos tienen que volver. Un gato de 101×101 vuelve en 25 pasos; amasar 1000×1000 lleva unos 2,13 × 10<sup>253</sup>.",
      "Cada anillo cuadrado avanza un píxel en sentido horario. El anillo exterior de una imagen de 64×64 tiene 252 píxeles, el siguiente 244, y así. Cada anillo vuelve tras su propia longitud, pero todos juntos necesitan el mínimo común múltiplo: unos 7,38 × 10<sup>25</sup> pasos.",
      "Elige un objetivo y mira cómo cada píxel de tu imagen vuela a un sitio nuevo. Los oscuros van donde el objetivo es oscuro y los claros donde es claro; luego, parejas cercanas se intercambian si así ambos colores se acercan. Sigue siendo el mismo conjunto de píxeles, así que siempre puede volver volando.",
      "Desordena una foto hasta el paso <i>k</i> y guarda el PNG. Quien conozca la regla, el tamaño y <i>k</i> puede recuperarla: ábrela con «Usar píxeles exactos» y retrocede <i>k</i> pasos. Es un acertijo divertido, no cifrado de verdad.",
    ],
    made: "Hecho por ",
  },
  "pt-BR": {
    h: ["Por que uma imagem embaralhada volta?", "O zíper: 1024 volta em 10, 1022 precisa de 340", "O gato de Arnold e a transformação do padeiro", "Anéis", "Reorganizar: os mesmos pixels, outra imagem", "Envie uma imagem secreta", "Veja os vídeos"],
    p: [
      "Toda regra aqui apenas <em>move</em> pixels. Nenhum é criado, destruído ou recolorido. Se você seguir um pixel, ele pula de lugar em lugar e, como os lugares são finitos, uma hora cai onde começou. Cada pixel percorre o seu próprio ciclo.",
      "A imagem inteira volta quando todos os ciclos terminam no mesmo instante, ou seja, no mínimo múltiplo comum de todos os comprimentos. Esta página encontra todos os ciclos da sua imagem e calcula esse número exato, mesmo com centenas de dígitos.",
      "Um zíper é um embaralhamento perfeito das linhas e depois das colunas. Com 1024 linhas, a linha <i>r</i> vai para a linha 2<i>r</i> (módulo 1023). Depois de 10 zíperes, cada linha dobrou 10 vezes, e 2<sup>10</sup> = 1024 é exatamente 1 a mais que 1023: todo mundo em casa. Na metade, no 5.º, a imagem vira 1.024 cópias minúsculas de si mesma.",
      "Tire duas linhas e tudo muda: 1022 precisa de 340 zíperes, 1000 de 36 e 1026 de 20. Teste a caixa de tamanho e a tabela abaixo dela: o número de passos pula loucamente entre vizinhos.",
      "O gato inclina o quadrado e o enrola como um donut. O padeiro achata, estica e empilha, como sovar massa. Os dois são exemplos clássicos de caos: pixels vizinhos se afastam rápido e a imagem vira chuvisco em poucos passos. Mas, como a grade é finita, os dois precisam voltar. Um gato de 101×101 volta em 25 passos; sovar 1000×1000 leva cerca de 2,13 × 10<sup>253</sup>.",
      "Cada anel quadrado anda um pixel no sentido horário. O anel externo de uma imagem 64×64 tem 252 pixels, o próximo 244, e assim por diante. Cada anel volta após o seu próprio comprimento, mas todos juntos precisam do mínimo múltiplo comum: cerca de 7,38 × 10<sup>25</sup> passos.",
      "Escolha um alvo e veja cada pixel da sua imagem voar para um novo lugar. Os escuros vão para onde o alvo é escuro, os claros para onde é claro; depois, pares próximos trocam de lugar se isso aproxima as duas cores. Continua sendo o mesmo conjunto de pixels, então sempre pode voar de volta.",
      "Embaralhe uma foto até o passo <i>k</i> e salve o PNG. Quem souber a regra, o tamanho e <i>k</i> pode desfazer: abra com “Usar pixels exatos” e volte <i>k</i> passos. É um quebra-cabeça divertido, não criptografia de verdade.",
    ],
    made: "Feito por ",
  },
  fr: {
    h: ["Pourquoi une image mélangée revient-elle ?", "Le zip : 1024 revient en 10, 1022 en demande 340", "Le chat d'Arnold et la transformation du boulanger", "Anneaux", "Réarranger : les mêmes pixels, une autre image", "Envoyer une image secrète", "Voir les vidéos"],
    p: [
      "Chaque règle ici ne fait que <em>déplacer</em> des pixels. Aucun n'est créé, détruit ni recoloré. Si vous suivez un pixel, il saute de place en place et, comme les places sont en nombre fini, il finit forcément par retomber là où il a commencé. Chaque pixel parcourt sa propre boucle.",
      "L'image entière revient quand toutes les boucles se terminent au même instant, c'est-à-dire au plus petit commun multiple de toutes leurs longueurs. Cette page trouve chaque boucle de votre image et calcule ce nombre exactement, même s'il a des centaines de chiffres.",
      "Un zip est un mélange parfait des lignes, puis des colonnes. Avec 1024 lignes, la ligne <i>r</i> va à la ligne 2<i>r</i> (modulo 1023). Après 10 zips, chaque ligne a été doublée 10 fois, et 2<sup>10</sup> = 1024 vaut exactement 1 de plus que 1023 : tout le monde est rentré. À mi-chemin, au 5ᵉ, l'image devient 1 024 minuscules copies d'elle-même.",
      "Retirez deux lignes et tout change : 1022 demande 340 zips, 1000 en demande 36 et 1026 en demande 20. Essayez la case de taille et le tableau en dessous : le nombre d'étapes saute d'un voisin à l'autre.",
      "Le chat incline le carré et l'enroule comme un tore. Le boulanger écrase, étire et empile, comme une pâte qu'on pétrit. Ce sont deux exemples classiques de chaos : des pixels voisins s'éloignent vite et l'image devient du bruit en quelques étapes. Mais la grille étant finie, les deux doivent revenir. Un chat de 101×101 revient en 25 étapes ; pétrir du 1000×1000 en prend environ 2,13 × 10<sup>253</sup>.",
      "Chaque anneau carré avance d'un pixel dans le sens horaire. L'anneau extérieur d'une image 64×64 compte 252 pixels, le suivant 244, et ainsi de suite. Chaque anneau revient après sa propre longueur, mais tous ensemble il faut le plus petit commun multiple : environ 7,38 × 10<sup>25</sup> étapes.",
      "Choisissez une cible et regardez chaque pixel de votre image s'envoler vers une nouvelle place. Les pixels sombres vont là où la cible est sombre, les clairs là où elle est claire, puis des paires voisines s'échangent si cela rapproche les deux couleurs. C'est toujours le même ensemble de pixels : il peut toujours revenir.",
      "Mélangez une photo jusqu'à l'étape <i>k</i> et enregistrez le PNG. Quiconque connaît la règle, la taille et <i>k</i> peut la retrouver : ouvrez-la avec « Utiliser les pixels exacts » puis reculez de <i>k</i> étapes. C'est un jeu, pas un vrai chiffrement.",
    ],
    made: "Créé par ",
  },
  de: {
    h: ["Warum kommt ein durcheinandergebrachtes Bild zurück?", "Der Reißverschluss: 1024 kommt nach 10 zurück, 1022 braucht 340", "Arnolds Katze und die Bäcker-Abbildung", "Ringe", "Umordnen: dieselben Pixel, ein anderes Bild", "Ein geheimes Bild senden", "Die Videos ansehen"],
    p: [
      "Jede Regel hier <em>verschiebt</em> nur Pixel. Kein Pixel wird erzeugt, gelöscht oder umgefärbt. Verfolgst du einen Pixel, springt er von Platz zu Platz – und weil es nur endlich viele Plätze gibt, landet er irgendwann wieder dort, wo er angefangen hat. Jeder Pixel läuft seine eigene Schleife.",
      "Das ganze Bild ist zurück, wenn alle Schleifen im selben Moment fertig sind – beim kleinsten gemeinsamen Vielfachen aller Schleifenlängen. Diese Seite findet jede Schleife in deinem Bild und berechnet diese Zahl exakt, selbst wenn sie Hunderte Stellen hat.",
      "Ein Reißverschluss mischt die Zeilen perfekt, dann die Spalten. Bei 1024 Zeilen wandert Zeile <i>r</i> nach Zeile 2<i>r</i> (modulo 1023). Nach 10 Durchgängen wurde jede Zeile 10-mal verdoppelt, und 2<sup>10</sup> = 1024 ist genau 1 mehr als 1023 – alle sind daheim. Auf halbem Weg, nach 5, wird das Bild zu 1.024 winzigen Kopien von sich selbst.",
      "Nimm zwei Zeilen weg, und alles ist anders: 1022 braucht 340 Durchgänge, 1000 braucht 36, 1026 braucht 20. Probier das Größenfeld und die Tabelle darunter: Die Schrittzahl springt zwischen Nachbarn wild hin und her.",
      "Die Katze schert das Quadrat und wickelt es wie einen Donut auf. Der Bäcker drückt, streckt und stapelt wie beim Teigkneten. Beides sind Lehrbuchbeispiele für Chaos: Benachbarte Pixel fliegen schnell auseinander, nach wenigen Schritten ist das Bild nur noch Rauschen. Weil das Gitter endlich ist, müssen aber beide zurückkommen. Eine 101×101-Katze ist nach 25 Schritten zurück, Kneten bei 1000×1000 dauert etwa 2,13 × 10<sup>253</sup>.",
      "Jeder quadratische Ring rückt einen Pixel im Uhrzeigersinn weiter. Der äußere Ring eines 64×64-Bildes hat 252 Pixel, der nächste 244 und so weiter. Jeder Ring ist nach seiner eigenen Länge zurück, alle zusammen aber erst beim kleinsten gemeinsamen Vielfachen: etwa 7,38 × 10<sup>25</sup> Schritte.",
      "Wähle ein Ziel und sieh zu, wie jeder Pixel deines Bildes an einen neuen Platz fliegt. Dunkle Pixel gehen dorthin, wo das Ziel dunkel ist, helle dorthin, wo es hell ist; danach tauschen benachbarte Paare, wenn beide Farben dadurch besser passen. Es bleibt dieselbe Menge Pixel – sie kann also jederzeit zurückfliegen.",
      "Bring ein Foto bis Schritt <i>k</i> durcheinander und speichere das PNG. Wer Regel, Größe und <i>k</i> kennt, kann es zurückholen: mit „Exakte Pixel verwenden“ öffnen und <i>k</i> Schritte zurückgehen. Ein lustiges Rätsel, keine echte Verschlüsselung.",
    ],
    made: "Gemacht von ",
  },
  it: {
    h: ["Perché un'immagine mescolata torna indietro?", "La zip: 1024 torna in 10, 1022 ne richiede 340", "Il gatto di Arnold e la trasformazione del fornaio", "Anelli", "Riordina: gli stessi pixel, un'altra immagine", "Invia un'immagine segreta", "Guarda i video"],
    p: [
      "Ogni regola qui <em>sposta</em> soltanto i pixel. Nessuno viene creato, distrutto o ricolorato. Se segui un pixel, salta da un posto all'altro e, poiché i posti sono finiti, prima o poi ricade dove è partito. Ogni pixel percorre il proprio ciclo.",
      "L'immagine intera torna quando tutti i cicli finiscono nello stesso istante, cioè al minimo comune multiplo di tutte le loro lunghezze. Questa pagina trova ogni ciclo della tua immagine e calcola quel numero esatto, anche se ha centinaia di cifre.",
      "Una zip è un mescolamento perfetto delle righe e poi delle colonne. Con 1024 righe, la riga <i>r</i> va alla riga 2<i>r</i> (modulo 1023). Dopo 10 zip ogni riga è stata raddoppiata 10 volte, e 2<sup>10</sup> = 1024 è esattamente 1 più di 1023: tutti a casa. A metà strada, alla 5ª, l'immagine diventa 1.024 minuscole copie di se stessa.",
      "Togli due righe e cambia tutto: 1022 richiede 340 zip, 1000 ne richiede 36 e 1026 ne richiede 20. Prova la casella della dimensione e la tabella sotto: il numero di passi salta all'impazzata tra vicini.",
      "Il gatto inclina il quadrato e lo avvolge come una ciambella. Il fornaio schiaccia, stira e impila, come quando si impasta. Sono esempi da manuale di caos: pixel vicini si allontanano in fretta e in pochi passi l'immagine diventa rumore. Ma poiché la griglia è finita, entrambi devono tornare. Un gatto 101×101 torna in 25 passi; impastare un 1000×1000 richiede circa 2,13 × 10<sup>253</sup>.",
      "Ogni anello quadrato avanza di un pixel in senso orario. L'anello esterno di un'immagine 64×64 ha 252 pixel, il successivo 244 e così via. Ogni anello torna dopo la propria lunghezza, ma tutti insieme serve il minimo comune multiplo: circa 7,38 × 10<sup>25</sup> passi.",
      "Scegli un obiettivo e guarda ogni pixel della tua immagine volare in un nuovo posto. I pixel scuri vanno dove l'obiettivo è scuro, quelli chiari dove è chiaro; poi coppie vicine si scambiano se così entrambi i colori si avvicinano. È sempre lo stesso insieme di pixel, quindi può sempre tornare indietro.",
      "Mescola una foto fino al passo <i>k</i> e salva il PNG. Chi conosce la regola, la dimensione e <i>k</i> può ripristinarla: aprila con «Usa i pixel esatti» e torna indietro di <i>k</i> passi. È un rompicapo divertente, non vera crittografia.",
    ],
    made: "Creato da ",
  },
  ru: {
    h: ["Почему перемешанная картинка возвращается?", "Молния: 1024 возвращается за 10, 1022 нужно 340", "Кот Арнольда и преобразование пекаря", "Кольца", "Пересбор: те же пиксели, другая картинка", "Отправить секретную картинку", "Смотреть видео"],
    p: [
      "Каждое правило здесь только <em>перемещает</em> пиксели. Ни один не создаётся, не исчезает и не меняет цвет. Если следить за одним пикселем, он прыгает с места на место, а поскольку мест конечное число, рано или поздно он обязательно вернётся туда, откуда начал. Каждый пиксель ходит по своему циклу.",
      "Вся картинка возвращается, когда все циклы заканчиваются в один и тот же момент — на наименьшем общем кратном их длин. Эта страница находит каждый цикл вашей картинки и вычисляет это число точно, даже если в нём сотни цифр.",
      "Молния — это идеальное перемешивание строк, а затем столбцов. При 1024 строках строка <i>r</i> переходит в строку 2<i>r</i> (по модулю 1023). После 10 молний каждая строка удвоена 10 раз, а 2<sup>10</sup> = 1024 ровно на 1 больше 1023 — все дома. На полпути, на 5-й, картинка превращается в 1 024 крошечные копии самой себя.",
      "Уберите две строки — и всё меняется: 1022 нужно 340 молний, 1000 — 36, 1026 — 20. Попробуйте поле размера и таблицу под ним: число шагов дико скачет между соседями.",
      "Кот сдвигает квадрат наискось и сворачивает его, как бублик. Пекарь сплющивает, растягивает и складывает, как тесто. Оба — хрестоматийные примеры хаоса: соседние пиксели быстро разлетаются, и за несколько шагов картинка превращается в шум. Но сетка конечна, поэтому оба обязаны вернуться. Кот 101×101 возвращается за 25 шагов, тесто 1000×1000 — примерно за 2,13 × 10<sup>253</sup>.",
      "Каждое квадратное кольцо сдвигается на один пиксель по часовой стрелке. Во внешнем кольце картинки 64×64 252 пикселя, в следующем 244 и так далее. Каждое кольцо возвращается через свою длину, а все вместе — через наименьшее общее кратное: около 7,38 × 10<sup>25</sup> шагов.",
      "Выберите цель и смотрите, как каждый пиксель вашей картинки летит на новое место. Тёмные пиксели идут туда, где цель тёмная, светлые — где светлая; затем соседние пары меняются местами, если от этого оба цвета становятся ближе. Это всё тот же набор пикселей, поэтому он всегда может улететь обратно.",
      "Перемешайте фото до шага <i>k</i> и сохраните PNG. Любой, кто знает правило, размер и <i>k</i>, может вернуть его: откройте с «Точные пиксели» и сделайте <i>k</i> шагов назад. Это забавная головоломка, а не настоящее шифрование.",
    ],
    made: "Автор: ",
  },
  hi: {
    h: ["उलटी-पुलटी तस्वीर वापस क्यों आती है?", "ज़िप: 1024 दस बार में लौटती है, 1022 को 340 चाहिए", "आर्नोल्ड का कैट मैप और बेकर मैप", "छल्ले", "नई जमावट: वही पिक्सल, दूसरी तस्वीर", "एक गुप्त तस्वीर भेजें", "वीडियो देखें"],
    p: [
      "यहाँ का हर नियम पिक्सलों को सिर्फ़ <em>खिसकाता</em> है। कोई पिक्सल न बनता है, न मिटता है, न उसका रंग बदलता है। एक पिक्सल का पीछा करें तो वह जगह-जगह कूदता है, और क्योंकि जगहें गिनी-चुनी हैं, वह कभी न कभी वहीं लौटता है जहाँ से चला था। हर पिक्सल अपने ही चक्कर में घूमता है।",
      "पूरी तस्वीर तब लौटती है जब सारे चक्कर एक ही पल में पूरे हों, यानी सभी चक्करों की लंबाई के लघुत्तम समापवर्त्य (LCM) पर। यह पेज आपकी तस्वीर का हर चक्कर ढूँढकर वह संख्या बिल्कुल सही निकालता है, चाहे उसमें सैकड़ों अंक हों।",
      "ज़िप का मतलब है पहले पंक्तियों का, फिर स्तंभों का एकदम सटीक फेंटना। 1024 पंक्तियों में पंक्ति <i>r</i> पंक्ति 2<i>r</i> पर जाती है (1023 से भाग का शेष)। 10 ज़िप के बाद हर पंक्ति 10 बार दोगुनी हो चुकी है, और 2<sup>10</sup> = 1024 ठीक 1023 से 1 ज़्यादा है, इसलिए सब घर लौट आते हैं। आधे रास्ते, 5वीं बार में, तस्वीर अपनी ही 1,024 छोटी-छोटी प्रतियाँ बन जाती है।",
      "दो पंक्तियाँ हटाइए और कहानी पूरी बदल जाती है: 1022 को 340 ज़िप, 1000 को 36 और 1026 को 20 चाहिए। आकार वाला खाना और उसके नीचे की तालिका आज़माइए: पड़ोसी आकारों में भी चरणों की गिनती बेतहाशा उछलती है।",
      "कैट मैप वर्ग को तिरछा करके डोनट की तरह लपेट देता है। बेकर मैप आटे की तरह दबाता, खींचता और तह लगाता है। दोनों अव्यवस्था (chaos) के पाठ्यपुस्तक वाले उदाहरण हैं: पास के पिक्सल जल्दी दूर हो जाते हैं और कुछ ही चरणों में तस्वीर शोर बन जाती है। फिर भी ग्रिड सीमित है, इसलिए दोनों को लौटना ही है। 101×101 की बिल्ली 25 चरणों में लौटती है; 1000×1000 को गूँधने में लगभग 2.13 × 10<sup>253</sup> लगते हैं।",
      "हर चौकोर छल्ला घड़ी की दिशा में एक पिक्सल आगे बढ़ता है। 64×64 तस्वीर के सबसे बाहरी छल्ले में 252 पिक्सल हैं, अगले में 244, और इसी तरह। हर छल्ला अपनी लंबाई के बाद लौटता है, पर सब एक साथ LCM पर लौटते हैं: लगभग 7.38 × 10<sup>25</sup> चरण।",
      "कोई लक्ष्य चुनिए और देखिए कि आपकी तस्वीर का हर पिक्सल नई जगह उड़ जाता है। गहरे पिक्सल वहाँ जाते हैं जहाँ लक्ष्य गहरा है, हल्के वहाँ जहाँ वह हल्का है; फिर पास के जोड़े अदला-बदली करते हैं अगर इससे दोनों रंग और मिलते हैं। यह वही पिक्सलों का समूह है, इसलिए यह हमेशा उड़कर वापस जा सकता है।",
      "किसी फ़ोटो को चरण <i>k</i> तक उलट-पुलट कर PNG सहेजें। जो नियम, आकार और <i>k</i> जानता है, वह उसे वापस ला सकता है: “बिल्कुल वही पिक्सल लें” के साथ खोलें और <i>k</i> चरण पीछे जाएँ। यह मज़ेदार पहेली है, असली एन्क्रिप्शन नहीं।",
    ],
    made: "बनाया: ",
  },
  id: {
    h: ["Kenapa gambar yang diacak bisa kembali?", "Ritsleting: 1024 kembali dalam 10, 1022 butuh 340", "Peta kucing Arnold dan peta tukang roti", "Cincin", "Susun ulang: piksel yang sama, gambar lain", "Kirim gambar rahasia", "Tonton videonya"],
    p: [
      "Setiap aturan di sini hanya <em>memindahkan</em> piksel. Tidak ada piksel yang dibuat, dihapus, atau diganti warnanya. Kalau kamu mengikuti satu piksel, ia melompat dari tempat ke tempat, dan karena jumlah tempatnya terbatas, cepat atau lambat ia pasti mendarat di tempat awalnya. Setiap piksel berjalan dalam putarannya sendiri.",
      "Seluruh gambar kembali ketika semua putaran selesai pada saat yang sama, yaitu pada kelipatan persekutuan terkecil (KPK) dari semua panjang putaran. Halaman ini menemukan setiap putaran di gambarmu dan menghitung angka itu dengan tepat, meski panjangnya ratusan digit.",
      "Ritsleting adalah kocokan sempurna untuk baris, lalu untuk kolom. Dengan 1024 baris, baris <i>r</i> pindah ke baris 2<i>r</i> (modulo 1023). Setelah 10 kali, setiap baris sudah digandakan 10 kali, dan 2<sup>10</sup> = 1024 tepat 1 lebih besar dari 1023, jadi semuanya pulang. Di tengah jalan, kali ke-5, gambar berubah jadi 1.024 salinan mungil dirinya sendiri.",
      "Kurangi dua baris dan ceritanya berubah total: 1022 butuh 340 kali, 1000 butuh 36, dan 1026 butuh 20. Coba kotak ukuran dan tabel di bawahnya: jumlah langkah melompat liar antar-ukuran yang bertetangga.",
      "Peta kucing memiringkan persegi lalu menggulungnya seperti donat. Peta tukang roti memipihkan, menarik, dan menumpuk, seperti menguleni adonan. Keduanya contoh klasik kekacauan (chaos): piksel yang berdekatan cepat terpisah dan gambar jadi semut dalam beberapa langkah. Tapi karena kisinya terbatas, keduanya pasti kembali. Kucing 101×101 kembali dalam 25 langkah; menguleni 1000×1000 butuh sekitar 2,13 × 10<sup>253</sup>.",
      "Setiap cincin persegi bergeser satu piksel searah jarum jam. Cincin terluar gambar 64×64 berisi 252 piksel, berikutnya 244, dan seterusnya. Tiap cincin kembali setelah panjangnya sendiri, tapi semuanya bersamaan butuh KPK: sekitar 7,38 × 10<sup>25</sup> langkah.",
      "Pilih target dan lihat setiap piksel gambarmu terbang ke tempat baru. Piksel gelap pergi ke bagian target yang gelap, yang terang ke bagian terang; lalu pasangan yang berdekatan bertukar jika itu membuat kedua warna lebih cocok. Ini tetap kumpulan piksel yang sama, jadi selalu bisa terbang kembali.",
      "Acak foto sampai langkah <i>k</i> lalu simpan PNG-nya. Siapa pun yang tahu aturan, ukuran, dan <i>k</i> bisa mengembalikannya: buka dengan “Pakai piksel persis”, lalu mundur <i>k</i> langkah. Ini teka-teki seru, bukan enkripsi sungguhan.",
    ],
    made: "Dibuat oleh ",
  },
  tr: {
    h: ["Karıştırılan bir resim neden geri gelir?", "Fermuar: 1024 10'da döner, 1022 için 340 gerekir", "Arnold'un kedisi ve fırıncı dönüşümü", "Halkalar", "Yeniden diz: aynı pikseller, başka bir resim", "Gizli bir resim gönder", "Videoları izle"],
    p: [
      "Buradaki her kural pikselleri yalnızca <em>taşır</em>. Hiçbir piksel yaratılmaz, silinmez ya da yeniden boyanmaz. Bir pikseli takip ederseniz yerden yere sıçrar; yerlerin sayısı sınırlı olduğu için er ya da geç başladığı yere döner. Her piksel kendi döngüsünde dolaşır.",
      "Resmin tamamı, bütün döngüler aynı anda tamamlandığında geri gelir; yani tüm döngü uzunluklarının en küçük ortak katında. Bu sayfa resminizdeki her döngüyü bulur ve o sayıyı, yüzlerce basamaklı olsa bile, tam olarak hesaplar.",
      "Fermuar, önce satırların sonra sütunların kusursuz karıştırılmasıdır. 1024 satırda <i>r</i>. satır 2<i>r</i>. satıra gider (mod 1023). 10 fermuardan sonra her satır 10 kez ikiye katlanmıştır ve 2<sup>10</sup> = 1024, 1023'ten tam 1 fazladır: herkes evinde. Yolun yarısında, 5.'de, resim kendisinin 1.024 minik kopyasına dönüşür.",
      "İki satır çıkarın, her şey değişir: 1022 için 340, 1000 için 36, 1026 için 20 fermuar gerekir. Boyut kutusunu ve altındaki tabloyu deneyin: komşu boyutlar arasında adım sayısı çılgınca zıplar.",
      "Kedi kareyi yamultup simit gibi sarar. Fırıncı ise hamur yoğurur gibi ezer, uzatır ve üst üste koyar. İkisi de kaosun ders kitabı örnekleridir: komşu pikseller hızla birbirinden uzaklaşır ve resim birkaç adımda karıncalanmaya döner. Ama ızgara sonlu olduğu için ikisi de geri dönmek zorundadır. 101×101 kedi 25 adımda döner; 1000×1000 yoğurma yaklaşık 2,13 × 10<sup>253</sup> adım sürer.",
      "Her kare halka saat yönünde bir piksel ilerler. 64×64 resmin en dış halkasında 252 piksel, bir sonrakinde 244 vardır ve böyle devam eder. Her halka kendi uzunluğu kadar adımda döner, ama hepsinin birlikte dönmesi için en küçük ortak kat gerekir: yaklaşık 7,38 × 10<sup>25</sup> adım.",
      "Bir hedef seçin ve resminizdeki her pikselin yeni bir yere uçuşunu izleyin. Koyu pikseller hedefin koyu olduğu yere, açıklar açık olduğu yere gider; sonra yakın çiftler, iki renk de daha iyi uyacaksa yer değiştirir. Hâlâ aynı piksel kümesidir, bu yüzden her zaman uçup geri dönebilir.",
      "Bir fotoğrafı <i>k</i>. adıma kadar karıştırıp PNG olarak kaydedin. Kuralı, boyutu ve <i>k</i>'yi bilen herkes onu geri getirebilir: “Pikselleri aynen kullan” ile açıp <i>k</i> adım geri gitmesi yeterli. Bu eğlenceli bir bulmaca, gerçek şifreleme değil.",
    ],
    made: "Yapan: ",
  },
  vi: {
    h: ["Vì sao bức ảnh bị xáo trộn lại trở về?", "Khóa kéo: 1024 về sau 10 lần, 1022 cần 340", "Ánh xạ con mèo của Arnold và ánh xạ thợ làm bánh", "Vòng", "Sắp lại: cùng điểm ảnh, bức ảnh khác", "Gửi một bức ảnh bí mật", "Xem video"],
    p: [
      "Mọi quy tắc ở đây chỉ <em>di chuyển</em> điểm ảnh. Không điểm nào được tạo ra, bị xóa hay đổi màu. Nếu bạn theo dõi một điểm ảnh, nó nhảy từ chỗ này sang chỗ khác, và vì số chỗ là hữu hạn, sớm muộn gì nó cũng quay về nơi xuất phát. Mỗi điểm ảnh đi trên vòng lặp của riêng nó.",
      "Cả bức ảnh trở về khi mọi vòng lặp cùng kết thúc tại một thời điểm, tức là ở bội chung nhỏ nhất của độ dài các vòng. Trang này tìm mọi vòng lặp trong ảnh của bạn và tính chính xác con số đó, kể cả khi nó dài hàng trăm chữ số.",
      "Khóa kéo là một lần trộn hoàn hảo các hàng, rồi đến các cột. Với 1024 hàng, hàng <i>r</i> chuyển tới hàng 2<i>r</i> (theo modulo 1023). Sau 10 lần, mỗi hàng đã được nhân đôi 10 lần, và 2<sup>10</sup> = 1024 lớn hơn 1023 đúng 1, nên tất cả đều về nhà. Ở giữa chặng, lần thứ 5, bức ảnh biến thành 1.024 bản sao tí hon của chính nó.",
      "Bớt đi hai hàng là mọi chuyện khác hẳn: 1022 cần 340 lần, 1000 cần 36 và 1026 cần 20. Hãy thử ô kích thước và bảng bên dưới: số bước nhảy loạn xạ giữa các kích thước liền kề.",
      "Con mèo đẩy lệch hình vuông rồi cuộn nó lại như chiếc bánh vòng. Thợ làm bánh thì ép, kéo và chồng lên như nhào bột. Cả hai là ví dụ kinh điển của hỗn loạn: các điểm ảnh gần nhau tách xa rất nhanh và chỉ sau vài bước bức ảnh thành nhiễu. Nhưng vì lưới là hữu hạn, cả hai buộc phải trở về. Con mèo 101×101 về sau 25 bước; nhào 1000×1000 mất khoảng 2,13 × 10<sup>253</sup>.",
      "Mỗi vòng hình vuông dịch một điểm theo chiều kim đồng hồ. Vòng ngoài cùng của ảnh 64×64 có 252 điểm, vòng kế 244, cứ thế. Mỗi vòng trở về sau độ dài của riêng nó, nhưng tất cả cùng về thì cần bội chung nhỏ nhất: khoảng 7,38 × 10<sup>25</sup> bước.",
      "Chọn một mục tiêu và xem mọi điểm ảnh của bạn bay đến chỗ mới. Điểm tối đến chỗ mục tiêu tối, điểm sáng đến chỗ sáng; sau đó các cặp gần nhau đổi chỗ nếu điều đó khiến cả hai màu khớp hơn. Đó vẫn là cùng một tập điểm ảnh, nên lúc nào cũng có thể bay trở lại.",
      "Xáo trộn một bức ảnh tới bước <i>k</i> rồi lưu PNG. Ai biết quy tắc, kích thước và <i>k</i> đều có thể khôi phục: mở bằng “Dùng đúng điểm ảnh” rồi lùi <i>k</i> bước. Đây là trò đố vui, không phải mã hóa thật.",
    ],
    made: "Thực hiện bởi ",
  },
};

export function explainHtml(lang: Lang): string | null {
  const a = A[lang];
  if (!a) return null;
  const [h1, h2, h3, h4, h5, h6, h7] = a.h;
  const p = a.p.map((x) => `<p>${x}</p>`);
  return [
    `<h2>${h1}</h2>`,
    p[0],
    p[1],
    `<h2>${h2}</h2>`,
    p[2],
    p[3],
    `<h2>${h3}</h2>`,
    p[4],
    `<h2>${h4}</h2>`,
    p[5],
    `<h2>${h5}</h2>`,
    p[6],
    `<h2>${h6}</h2>`,
    p[7],
    `<h2>${h7}</h2>`,
    VIDEOS,
    `<p>${a.made}<a href="https://www.youtube.com/@rrih0911" rel="noopener" target="_blank">Computed (YouTube)</a></p>`,
  ].join("\n");
}
