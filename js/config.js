/* ============================================================
   Di Fronte al Bosco — configuração do site
   Edite APENAS este arquivo para trocar contato, links e fotos.
   ============================================================ */

const CONFIG = {
  /* WhatsApp em formato internacional, só dígitos: 55 (Brasil) + 27 (DDD) + número */
  whatsapp: '5527997574050',

  email: 'difrontalbosco@gmail.com',
  instagram: 'https://instagram.com/difrontalbosco',
  booking: 'https://www.booking.com/hotel/br/di-front-al-bosco.pt-br.html',

  /* Coordenadas exatas da casa (fonte: página do Booking) */
  lat: -19.941463,
  lon: -40.604819,
  googleMaps: 'https://www.google.com/maps/search/?api=1&query=-19.941463%2C-40.604819',

  endereco: {
    rua: 'Rua Vicente da Costa Oliveira, 239',
    cidade: 'Santa Teresa',
    estado: 'ES',
    cep: '29650-000',
  },

  /* Agenda (outro projeto): disponibilidade pública e pré-reserva.
     A pré-reserva só existe na agenda depois que a branch pre-reserva-agenda
     for mergeada e deployada; até lá o site cai para o fluxo só-WhatsApp. */
  availabilityUrl: 'https://agenda-hospedagem.vercel.app/api/availability',
  preReservaUrl: 'https://agenda-hospedagem.vercel.app/api/pre-reserva',
};

/* Diária de balcão por suíte, em reais.
   Usada na calculadora de estimativa do formulário de reserva.
   Ao mudar aqui, atualize também os cards no index.html e o priceRange do JSON-LD. */
const PRECOS = {
  'Suíte Hidromassagem': 550,
  'Suíte 2': 450,
  'Suíte 3': 450,
};

/* Número da suíte na agenda (1 = Hidro, 2 e 3 = Suítes 2 e 3).
   Conferir com o anfitrião se a numeração da agenda mudar. */
const SUITE_NUMERO = {
  'Suíte Hidromassagem': 1,
  'Suíte 2': 2,
  'Suíte 3': 3,
};

const SUITE_CAPACIDADE = {
  'Suíte Hidromassagem': 4,
  'Suíte 2': 3,
  'Suíte 3': 3,
};

/* Base das imagens hospedadas no CDN do Booking. */
const IMG = (id, k, size = 'max1024x768') =>
  `https://cf.bstatic.com/xdata/images/hotel/${size}/${id}.jpg?k=${k}&o=`;

/* ------------------------------------------------------------
   GALERIA — somente ÁREAS COMUNS.
   As fotos de quarto e banheiro ficam em SUITES, mais abaixo.
   Formato: [id, chave, legenda, categoria]
   ------------------------------------------------------------ */
const FOTOS = [
  ['873658560', 'cbc1a5b92089507101368f177dc17b84da50ed121a1497d18e652b1d35dd4358', 'Piscina iluminada à noite', 'areas'],
  ['873658568', '24224f57b85ddca3b128906aad7ccd7e28067772849a5a1ec50da787dd280211', 'Piscina e deck', 'areas'],
  ['873658576', '79818f633dd6339658e58e881ffd58bc208a88b8c9a03e5818cf02c43583271d', 'Piscina ao ar livre', 'areas'],
  ['872584102', 'ef849b73937f5005c999c21d2ac0d8090a439d988ce8f864832070c6c967c03e', 'Área da piscina', 'areas'],
  ['539648465', '7e33b57735eddd88ee072bb189e0ede08dd8cab3f137257e3fcef9fa915b30ed', 'A casa vista da piscina', 'areas'],
  ['873658584', '0ad8826cd0eec75200cfaef48454623614eb0eb98634779a70bd2e55e6b8756b', 'O bosque que dá nome à casa', 'areas'],
  ['539648129', 'de049af1a88bd34dd9b70bde69e3abba002a205a59fffd9690a27630d664db67', 'Área de churrasco', 'areas'],
  ['873658578', '974dc64d1fe7878802d7023331fd6922e407c123122d1938a744aa6dbc96e404', 'Segunda área de churrasco', 'areas'],
  ['468842276', '47cc6c841decec7bb92207975329c012894457f5b17c41b0b5df0763afadf6ec', 'Lareira acesa na sala', 'areas'],
  ['539649047', '7c5e087244303ce9dbda816973c21e76abe4f7ed23e4bc97436a9bd7376a4633', 'Noites junto à lareira', 'areas'],
  ['872584100', '124af0e19885ff94ca07fd184d6529406e232735f52d417a09ad3870fc2bb802', 'Sala de estar compartilhada', 'areas'],
  ['873658557', 'd894a7603bbe4340021bd128d7a5628bf839d9df293e9cb518304847d19622b9', 'Sala de convivência', 'areas'],
  ['873658573', '40857fb4e45cc76ea8ba52096fdf95bc87e5dfe406e0c03592cf812b331235fd', 'Espaço amplo de convivência', 'areas'],
  ['873658571', 'c1879a65e6156d7f88cfe66b6649f252aaa49a4fb1ce6743fcd08ff2b036f445', 'Sala de jantar', 'areas'],
  ['873658575', '7d4e614a0dd4197db6a11187fa8c2080cd4d14ef9a583353da5365e99980374b', 'Espaço de musculação', 'areas'],
  ['539648140', '7305b55ac5206bac0d55964e5886f22986bbd6e8f28f2fc7d48127a181472414', 'Cozinha compartilhada', 'cozinha'],
  ['873658572', '9b043ab715a361194069cc09a46bf520ecf69c96dde3f9bdb1c604e7aab07251', 'Cozinha ampla e equipada', 'cozinha'],
  ['873658581', '0f717a0e379fd06902f47eb01971e7cdf4a781333dc6bcdae8f61715469b02e3', 'Bancada da cozinha', 'cozinha'],
  ['873658574', 'a903b794af5eb683035199142ab7e24ad6b2f27cf9d7684688709985e34a4f6f', 'Eletrodomésticos à disposição', 'cozinha'],
  ['873658583', 'c4c4ac86a920f44008d1c41589d683bdf5cb09864b8278255478f94c562b03c2', 'Fachada da casa', 'casa'],
  ['872584105', 'f47a45c0faf9ed132ca34486ef5ddeba21848c991e231b58bcea5eed82659875', 'Frente da propriedade', 'casa'],
  ['872584104', 'd6dee93952f1ad2e1b77e8f409b5b5281e8bdbb04041dc440b2e63a07e7f04ac', 'Entrada e estacionamento', 'casa'],
  ['872584095', '531ef55f3d945aa20fa64351c85f8df25d4280c564a5640345f1cce8fe599f3a', 'Estacionamento privativo', 'casa'],
];

/* ------------------------------------------------------------
   ⚠️ AGRUPAMENTO DAS SUÍTES — CONFERIR COM O ANFITRIÃO

   As fotos do Booking não vêm identificadas por suíte. O agrupamento
   abaixo foi deduzido visualmente (decoração, piso, cortina, tapete).
   O banheiro com hidromassagem é certo; os quartos são hipótese.

   Para corrigir: mova as linhas de uma suíte para a outra. A legenda
   e a chave viajam junto com o id, então é só recortar e colar a linha.
   ------------------------------------------------------------ */
const SUITES = [
  {
    id: 'hidro',
    nome: 'Suíte Hidromassagem',
    fotos: [
      ['872585385', 'b6a1f18c7b4da53146fd531b241b09a92767ffb62b9b75a161559d78a96597a7', 'Quarto da Suíte Hidromassagem'],
      ['873658555', '7865079516fbde23be71787e8be250c5e6197a0722c1b33f30228de9cab0fcfe', 'Suíte Hidromassagem — vista ampla'],
      ['873658582', 'a3c51ddb42aa0692e1910945a47b62fe42f58a2249ae8f0cdf7dd5c63c243f0b', 'Quarto no sótão'],
      ['873658580', 'e5b41c28e954157f397955b88047daad019f76a5a7772a607bae7fdd83ae911c', 'Banheira de hidromassagem'],
      ['873658562', '25bb838b5b3685cc667d07c8ce7234652e9250a8cf5139958ea0d34ec8eae55e', 'Banheiro com hidromassagem'],
      ['873658563', '0a74fd064ce7da1e6ad91649d3b372f1f5a5895263e872ef9e64da18db2751ab', 'Bancada do banheiro'],
      ['873658579', '4deb6c6922ca2afda8b27b754f6efeb88b30c94f0b0ed1963a378b6ddf3eac1f', 'Closet'],
    ],
  },
  {
    id: 'suite2',
    nome: 'Suíte 2',
    fotos: [
      ['873658570', '19c7b8a795272ba33a8f7ce326d3942a2c97b14da8480dc5c266224ab909f8e4', 'Quarto da Suíte 2'],
      ['873658565', 'bbfdc07a5b6fbaabae2494edf2bf52a1f1e34feed5a0eb1fd7f3264af780c892', 'Suíte 2 — cama de casal e solteiro'],
      ['873658559', '0aafcc44cb8d4f21c1bd184783d9a520b688a77e1cc41f0d555172b2029ca255', 'Banheiro privativo'],
      ['873658567', 'd1dc7272d62ecb80f6de13dafd66af1321921bfa50be4a6e5635856df79802e3', 'Banheiro com box'],
    ],
  },
  {
    id: 'suite3',
    nome: 'Suíte 3',
    fotos: [
      ['873658561', '91f6600b28620190924dcaed672761ce0d1493f94128b56137ace0e52dc38fbd', 'Quarto da Suíte 3'],
      ['872585580', 'e3182a1a028f3ef01fc7f7078003e47831d00c976cb5fc4ddfd662f327c46b40', 'Suíte 3 — TV e espaço de trabalho'],
      ['873658564', 'a0279b409c208ae839417845e3836b2e35c121d64757ccaccfc9c88516229b59', 'Suíte 3 — vista ampla'],
      ['873658569', '356319c28cc0940dc0862506b7ef4d1952c2d58daf0fbb094cf9dfa8991aefbf', 'Quarto com armário'],
      ['873658558', '6fc3252645fe98ab933c10498353b97f46db13052552a38adbd454ed32dbd662', 'Banheiro privativo'],
      ['873658566', '583aa1ef47f72cf8b504bf86e5efed6e7fdb9dfd1d48cb88dfff173a1e8a1983', 'Banheiro com box'],
      ['873658577', '984f38c8d6525bb1f6296d7f493c78233dc0baaa578f799c41d9cbe5ec9bcd7c', 'Lavabo'],
    ],
  },
];

/* Fotos usadas em blocos fixos da página */
const DESTAQUE = {
  /* Tríptico do topo — fotos retrato exibidas lado a lado no desktop.
     As fotos da casa são 9:16 (celular), então usamos a proporção natural
     em vez de esticar uma única imagem panorâmica. */
  hero:      IMG('873658568', '24224f57b85ddca3b128906aad7ccd7e28067772849a5a1ec50da787dd280211', 'max2560x1440'), // piscina e deck, de dia
  heroB:     IMG('873658583', 'c4c4ac86a920f44008d1c41589d683bdf5cb09864b8278255478f94c562b03c2', 'max2560x1440'), // fachada, céu azul
  heroC:     IMG('873658584', '0ad8826cd0eec75200cfaef48454623614eb0eb98634779a70bd2e55e6b8756b', 'max2560x1440'), // o bosque

  sobre:     IMG('539649047', '7c5e087244303ce9dbda816973c21e76abe4f7ed23e4bc97436a9bd7376a4633'),
  sobre2:    IMG('873658584', '0ad8826cd0eec75200cfaef48454623614eb0eb98634779a70bd2e55e6b8756b'),
  suite1:    IMG('873658580', 'e5b41c28e954157f397955b88047daad019f76a5a7772a607bae7fdd83ae911c'),
  suite2:    IMG('873658570', '19c7b8a795272ba33a8f7ce326d3942a2c97b14da8480dc5c266224ab909f8e4'),
  suite3:    IMG('873658561', '91f6600b28620190924dcaed672761ce0d1493f94128b56137ace0e52dc38fbd'),
  piscina:   IMG('873658576', '79818f633dd6339658e58e881ffd58bc208a88b8c9a03e5818cf02c43583271d'),
  churrasco: IMG('539648129', 'de049af1a88bd34dd9b70bde69e3abba002a205a59fffd9690a27630d664db67'),
  lareira:   IMG('468842276', '47cc6c841decec7bb92207975329c012894457f5b17c41b0b5df0763afadf6ec'),
  academia:  IMG('873658575', '7d4e614a0dd4197db6a11187fa8c2080cd4d14ef9a583353da5365e99980374b'),
  cafe:      IMG('539648140', '7305b55ac5206bac0d55964e5886f22986bbd6e8f28f2fc7d48127a181472414'),
  jantar:    IMG('873658571', 'c1879a65e6156d7f88cfe66b6649f252aaa49a4fb1ce6743fcd08ff2b036f445'),
};
