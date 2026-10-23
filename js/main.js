/* ============================================================
   Di Fronte al Bosco — comportamento do site
   ============================================================ */
(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ── WhatsApp ───────────────────────────────────────────── */

  const waLink = (msg) =>
    `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;

  const abrirWa = (msg) => window.open(waLink(msg), '_blank', 'noopener');

  const dataBr = (iso) => {
    if (!iso) return '';
    const [a, m, d] = iso.split('-');
    return `${d}/${m}/${a}`;
  };

  const noites = (ini, fim) => {
    const ms = new Date(fim) - new Date(ini);
    return Math.round(ms / 86400000);
  };

  /* ── Imagens dos blocos fixos ───────────────────────────── */

  const panes = $$('#heroBg .hero__pane');
  [DESTAQUE.hero, DESTAQUE.heroB, DESTAQUE.heroC].forEach((u, i) => {
    if (panes[i]) panes[i].style.backgroundImage = `url("${u}")`;
  });

  $$('img[data-src]').forEach((img) => {
    const key = img.dataset.src;
    if (DESTAQUE[key]) img.src = DESTAQUE[key];
  });

  /* ── Header ─────────────────────────────────────────────── */

  const hdr = $('#hdr');
  const hero = $('.hero');

  const onScroll = () => {
    const y = window.scrollY;
    hdr.classList.toggle('is-stuck', y > 40);
    hdr.classList.toggle('hero-top', y < hero.offsetHeight - 120);
    $('#wa').classList.toggle('is-on', y > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('#burger');
  const nav = $('#nav');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ── Botões com mensagem pronta ─────────────────────────── */

  $$('[data-wa]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      abrirWa(el.dataset.wa);
    });
  });

  $('#wa').href = waLink('Olá! Vim pelo site da Di Fronte al Bosco e gostaria de mais informações.');
  $('#mapsLink').href = CONFIG.googleMaps;
  $('#ano').textContent = new Date().getFullYear();

  /* ── Datas mínimas ──────────────────────────────────────── */

  const hoje = new Date().toISOString().slice(0, 10);
  $$('input[type="date"]').forEach((i) => (i.min = hoje));

  const parear = (ini, fim) => {
    ini.addEventListener('change', () => {
      fim.min = ini.value || hoje;
      if (fim.value && fim.value <= ini.value) fim.value = '';
    });
  };
  parear($('#q-in'), $('#q-out'));
  parear($('#f-in'), $('#f-out'));

  /* ── Formulário rápido do hero ──────────────────────────── */

  $('#quote').addEventListener('submit', (e) => {
    e.preventDefault();
    const ini = $('#q-in').value;
    const fim = $('#q-out').value;
    const h = $('#q-h').value;

    if (!ini || !fim) {
      abrirWa('Olá! Gostaria de consultar a disponibilidade da Di Fronte al Bosco.');
      return;
    }

    const n = noites(ini, fim);
    abrirWa(
      `Olá! Vim pelo site da Di Fronte al Bosco.\n\n` +
      `Check-in: ${dataBr(ini)}\n` +
      `Check-out: ${dataBr(fim)}\n` +
      `Noites: ${n}\n` +
      `Hóspedes: ${h}\n\n` +
      `Tem disponibilidade? Qual o valor?`
    );
  });

  /* ── Formulário completo + calculadora de diárias ───────── */

  const nota = $('#fform-note');
  const calc = $('#calc'), calcDet = $('#calc-detalhe'), calcTot = $('#calc-total');

  const reais = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  /* Devolve null quando não dá para estimar (falta data ou suíte definida) */
  const estimar = () => {
    const ini = $('#f-in').value, fim = $('#f-out').value;
    const suite = $('#f-s').value;
    const diaria = PRECOS[suite];
    if (!ini || !fim || fim <= ini || !diaria) return null;
    const n = noites(ini, fim);
    return { n, diaria, total: diaria * n, suite };
  };

  const pintarCalc = () => {
    const e = estimar();
    if (!e) { calc.hidden = true; return; }
    calc.hidden = false;
    calcDet.textContent = `${e.n} ${e.n === 1 ? 'noite' : 'noites'} × ${reais(e.diaria)}`;
    calcTot.textContent = reais(e.total);
  };

  ['#f-in', '#f-out', '#f-s', '#f-h'].forEach((s) => {
    $(s).addEventListener('change', pintarCalc);
  });

  $('#fform').addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = $('#f-nome').value.trim();
    const ini = $('#f-in').value;
    const fim = $('#f-out').value;

    if (!nome) { nota.textContent = 'Por favor, informe seu nome.'; $('#f-nome').focus(); return; }
    if (!ini || !fim) { nota.textContent = 'Informe as datas de check-in e check-out.'; return; }
    if (fim <= ini) { nota.textContent = 'O check-out precisa ser depois do check-in.'; return; }

    const msg = $('#f-msg').value.trim();
    const n = noites(ini, fim);
    const est = estimar();
    const suite = $('#f-s').value;

    nota.textContent = 'Abrindo o WhatsApp…';
    abrirWa(
      `Olá! Meu nome é ${nome} e vim pelo site da Di Fronte al Bosco.\n\n` +
      `Gostaria de reservar a ${suite === 'Sem preferência' ? 'suíte (sem preferência)' : suite}\n` +
      `Check-in: ${dataBr(ini)}\n` +
      `Check-out: ${dataBr(fim)}\n` +
      `Noites: ${n}\n` +
      `Hóspedes: ${$('#f-h').value}\n` +
      (est ? `Valor estimado: ${reais(est.total)} (${est.n} × ${reais(est.diaria)})\n` : '') +
      (msg ? `\nObservação: ${msg}\n` : '') +
      `\nPode confirmar a disponibilidade?`
    );
  });

  /* ── Comodidades ────────────────────────────────────────── */

  const ico = {
    piscina: '<circle cx="12" cy="6" r="2"/><path d="M8 20V8a2 2 0 0 1 4 0v12M16 20V8a2 2 0 0 0-4 0"/><path d="M3 17c1.5 0 1.5 1.5 3 1.5s1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5"/>',
    wifi: '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1"/>',
    carro: '<path d="M5 16v2a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1v-3.5l2-5A2 2 0 0 1 6.4 8h11.2a2 2 0 0 1 1.9 1.5l2 5V18a1 1 0 0 1-1 1H20a1 1 0 0 1-1-1v-2"/><path d="M3 14h18"/><circle cx="7" cy="14" r="0"/>',
    churrasco: '<path d="M8 3s-1 1.5 0 3 0 3 0 3M12 2s-1.2 2 0 3.8S12 9 12 9M16 3s-1 1.5 0 3 0 3 0 3"/><path d="M4 12h16a8 8 0 0 1-8 8 8 8 0 0 1-8-8Z"/><path d="M8 20l-1.5 2M16 20l1.5 2"/>',
    lareira: '<path d="M12 3s4 3.5 4 7a4 4 0 0 1-8 0c0-1.5 1-2.5 1-2.5S12 5 12 3Z"/><path d="M4 21V8a2 2 0 0 1 2-2M20 21V8a2 2 0 0 0-2-2"/><path d="M3 21h18"/>',
    cozinha: '<path d="M6 3v8M6 11a2 2 0 0 0 2-2V3M6 11a2 2 0 0 1-2-2V3M6 11v10"/><path d="M17 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4v9"/>',
    hidro: '<path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3Z"/><path d="M7 12V6a2 2 0 0 1 4 0"/><path d="M6 20l-1 2M18 20l1 2"/>',
    fitness: '<path d="M4 9v6M20 9v6M7 6v12M17 6v12M7 12h10"/>',
    tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8"/>',
    secador: '<path d="M3 8a4 4 0 0 1 4-4h7l4 3v2l-4 3H7a4 4 0 0 1-4-4Z"/><path d="M10 12v5a2 2 0 0 0 2 2"/>',
    banho: '<path d="M12 3a3 3 0 0 1 3 3v4H9V6a3 3 0 0 1 3-3Z"/><path d="M7 10h10l-1 10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2Z"/>',
    familia: '<circle cx="9" cy="7" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M15 20v-.5a4 4 0 0 1 6-3.4"/>',
  };

  const COMODIDADES = [
    ['piscina', 'Piscina ao ar livre'],
    ['hidro', 'Banheira de hidromassagem'],
    ['churrasco', 'Duas áreas de churrasco'],
    ['lareira', 'Lareira'],
    ['fitness', 'Aparelhos de musculação'],
    ['cozinha', 'Cozinha equipada'],
    ['wifi', 'Wi-Fi gratuito'],
    ['carro', 'Estacionamento privativo'],
    ['tv', 'TV com Netflix e YouTube'],
    ['banho', 'Banheiro privativo'],
    ['secador', 'Secador e amenities'],
    ['familia', 'Quartos para famílias'],
  ];

  $('#amen').innerHTML = COMODIDADES.map(([k, t]) =>
    `<li><svg viewBox="0 0 24 24" aria-hidden="true">${ico[k]}</svg><span>${t}</span></li>`
  ).join('');

  /* ── Café da manhã ──────────────────────────────────────── */

  const icoCafe = {
    pao: '<path d="M4 12a4 4 0 0 1 3-3.9C7.4 6.3 9 5 11 5h2c2 0 3.6 1.3 4 3.1A4 4 0 0 1 20 12v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M8 19v-5M16 19v-5"/>',
    cafe: '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M7 4.5V3M11 4.5V3M15 4.5V3"/>',
    fruta: '<path d="M12 8c-3.5-2.5-8 0-8 4.5S8 21 12 21s8-4 8-8.5S15.5 5.5 12 8Z"/><path d="M12 8V5c0-1.5 1.2-2.5 2.5-2.5"/>',
    ovo: '<ellipse cx="12" cy="13.5" rx="6" ry="8"/><path d="M12 5.5c1.6 1.6 2.6 3.4 3.1 5"/>',
    cha: '<path d="M5 7h11v6a4.5 4.5 0 0 1-4.5 4.5h-2A4.5 4.5 0 0 1 5 13Z"/><path d="M16 9h1.8a2.2 2.2 0 0 1 0 4.4H16"/><path d="M8 21h8"/>',
    cozinha: '<path d="M6 3v8M6 11a2 2 0 0 0 2-2V3M6 11a2 2 0 0 1-2-2V3M6 11v10"/><path d="M17 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4v9"/>',
  };

  const CAFE = [
    ['pao', 'Pães e biscoitos', 'Fresquinhos, para o café ou o lanche da tarde.'],
    ['fruta', 'Frutas da estação', 'Colhidas na região, sempre à disposição.'],
    ['ovo', 'Ovos', 'Para preparar do jeito que você gosta.'],
    ['cafe', 'Café coado na hora', 'Cafeteira à sua disposição, a qualquer hora.'],
    ['cha', 'Chás e acompanhamentos', 'Chaleira elétrica e uma seleção de chás.'],
    ['cozinha', 'Cozinha completa', 'Geladeira, forno, micro-ondas e mesa de jantar.'],
  ];

  $('#cafe-itens').innerHTML = CAFE.map(([k, t, d]) =>
    `<li class="cafe__item">
       <svg viewBox="0 0 24 24" aria-hidden="true">${icoCafe[k]}</svg>
       <h3>${t}</h3><p>${d}</p>
     </li>`
  ).join('');

  /* ── Perguntas frequentes ───────────────────────────────── */

  const FAQ = [
    ['Que horas posso fazer o check-in e o check-out?',
     'O check-in é das <strong>13h às 18h</strong> e o check-out das <strong>7h às 11h</strong>. Avise com antecedência o horário previsto de chegada — o portão é aberto remotamente e combinamos tudo pelo WhatsApp.'],
    ['As áreas da casa são compartilhadas?',
     'Sim. Cada hóspede tem sua <strong>suíte privativa com banheiro exclusivo</strong>, mas sala, cozinha, piscina, churrasqueiras e demais espaços de convivência são <strong>compartilhados</strong> entre os hóspedes. É o que dá o clima de casa.'],
    ['Posso cozinhar?',
     'Pode, à vontade. A cozinha é totalmente equipada, com geladeira, forno, micro-ondas, cafeteira, chaleira elétrica e mesa de jantar. Muitos hóspedes usam também as <strong>duas áreas de churrasco</strong>.'],
    ['O café da manhã está incluso?',
     'Não servimos em horário fixo, mas deixamos à disposição pães, biscoitos, ovos, frutas, café, chá e acompanhamentos para você montar o seu quando quiser.'],
    ['O que já vem na suíte?',
     'Roupa de cama e banho, produtos de banho de cortesia, secador de cabelo, TV com Netflix e YouTube, Wi-Fi e banheiro privativo com chuveiro.'],
    ['E o frio de Santa Teresa? Tem aquecimento ou ar-condicionado?',
     'As noites na serra são frescas o ano todo — a casa tem <strong>lareira</strong> na sala de convivência, que é onde todo mundo acaba se reunindo. Para saber a climatização de cada suíte, fale com a gente no WhatsApp antes de reservar.'],
    ['Posso levar meu pet?',
     'Infelizmente não. A casa <strong>não aceita animais de estimação</strong>.'],
    ['Tem estacionamento?',
     'Sim, <strong>estacionamento privativo e gratuito</strong> no local, sem necessidade de reserva.'],
    ['Crianças são bem-vindas?',
     'Sim, de qualquer idade. <strong>Cama extra gratuita</strong> mediante pedido e sujeita a disponibilidade. Não dispomos de berço. A partir de 18 anos, contam como adultos.'],
    ['Como funciona o cancelamento?',
     'Pela legislação brasileira, o cancelamento é <strong>gratuito até 7 dias após você fazer a reserva</strong>. Depois desse prazo, vale a política da tarifa escolhida — sempre combinada com você antes de confirmar.'],
  ];

  $('#faq-lista').innerHTML = FAQ.map(([p, r], i) =>
    `<div class="faq__item">
       <h3>
         <button class="faq__p" aria-expanded="false" aria-controls="faq-r-${i}" id="faq-p-${i}">
           <span>${p}</span>
           <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
         </button>
       </h3>
       <div class="faq__r" id="faq-r-${i}" role="region" aria-labelledby="faq-p-${i}" hidden>
         <p>${r}</p>
       </div>
     </div>`
  ).join('');

  $('#faq-lista').addEventListener('click', (e) => {
    const b = e.target.closest('.faq__p');
    if (!b) return;
    const aberto = b.getAttribute('aria-expanded') === 'true';

    // sanfona: fecha os outros para a lista não virar uma parede de texto
    $$('.faq__p').forEach((o) => {
      o.setAttribute('aria-expanded', 'false');
      $(`#${o.getAttribute('aria-controls')}`).hidden = true;
    });

    if (!aberto) {
      b.setAttribute('aria-expanded', 'true');
      $(`#${b.getAttribute('aria-controls')}`).hidden = false;
    }
  });

  /* ── Depoimentos ────────────────────────────────────────── */

  const DEPOIMENTOS = [
    ['A casa é excelente! O quarto é confortável e limpo. A área de convivência é ampla e tem de tudo. Fora que o responsável é super atencioso.', 'Dudu', 'Brasil'],
    ['A casa é linda, uma construção um pouco antiga com uma decoração linda. Tudo muito conservado e limpo, além da tranquilidade do local.', 'Rosimara', 'Itália'],
    ['Santa Teresa é uma cidade que guarda histórias de família e infância. Agora adicionamos a recordação desta belíssima casa, do silêncio do bosque e da proximidade com o centro!', 'Victorio', 'Brasil'],
    ['Ambiente super aconchegante, limpo e organizado, pensado para o conforto do hóspede. Local tranquilo e fácil acesso.', 'Rosania', 'Brasil'],
    ['Excelente casa, excelente suíte. Muito espaço, beleza e sossego.', 'Amarildo', 'Brasil'],
    ['Super agradável, aconchegante. Anfitrião muito receptivo e atencioso. Voltarei com certeza.', 'Helio', 'Brasil'],
  ];

  $('#deps').innerHTML = DEPOIMENTOS.map(([txt, nome, pais]) =>
    `<article class="dep"><p>${txt}</p><p class="dep__who">${nome}</p><p class="dep__from">${pais} · Booking.com</p></article>`
  ).join('');

  /* ── Contatos ───────────────────────────────────────────── */

  const icoWa = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 0 1-13.2 8L3 21l1.1-4.6A9 9 0 1 1 21 12Z"/></svg>';
  const icoMail = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
  const icoPin = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
  const icoIg = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5"/></svg>';
  const icoStar = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.2-5.4-2.9-5.4 2.9 1-6.2L3.2 9.5l6.1-.9Z"/></svg>';

  const { rua, cidade, estado, cep } = CONFIG.endereco;

  $('#cont').innerHTML = `
    <li><a href="${waLink('Olá! Vim pelo site da Di Fronte al Bosco.')}" target="_blank" rel="noopener">${icoWa}<span>Falar no WhatsApp</span></a></li>
    <li><a href="mailto:${CONFIG.email}">${icoMail}<span>${CONFIG.email}</span></a></li>
    <li><a href="${CONFIG.googleMaps}" target="_blank" rel="noopener">${icoPin}<span>${rua} — ${cidade}/${estado}, ${cep}</span></a></li>
    <li><a href="${CONFIG.instagram}" target="_blank" rel="noopener">${icoIg}<span>Instagram</span></a></li>
    <li><a href="${CONFIG.booking}" target="_blank" rel="noopener">${icoStar}<span>Ver as 89 avaliações no Booking</span></a></li>
  `;

  $('#ft-contato').innerHTML = `
    <h4>Fale com a gente</h4>
    <a href="${waLink('Olá! Vim pelo site da Di Fronte al Bosco.')}" target="_blank" rel="noopener">WhatsApp</a>
    <a href="mailto:${CONFIG.email}">${CONFIG.email}</a>
    <a href="${CONFIG.instagram}" target="_blank" rel="noopener">Instagram</a>
    <a href="${CONFIG.booking}" target="_blank" rel="noopener">Booking.com</a>
  `;

  /* ── Galeria ────────────────────────────────────────────── */

  const grid = $('#galeria-grid');
  let visiveis = FOTOS;

  const render = (cat) => {
    visiveis = cat === 'todas' ? FOTOS : FOTOS.filter((f) => f[3] === cat);
    grid.innerHTML = visiveis.map(([id, k, cap], i) =>
      `<button class="gitem" data-i="${i}" data-cap="${cap}" aria-label="Ampliar: ${cap}">
         <img src="${IMG(id, k, 'max500')}" alt="${cap}" loading="lazy">
       </button>`
    ).join('');
  };

  render('todas');

  $('#filtros').addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    $$('.chip').forEach((c) => { c.classList.remove('is-on'); c.setAttribute('aria-selected', 'false'); });
    b.classList.add('is-on');
    b.setAttribute('aria-selected', 'true');
    render(b.dataset.cat);
  });

  /* ── Lightbox ───────────────────────────────────────────── */

  const lb = $('#lb'), lbImg = $('#lb-img'), lbCap = $('#lb-cap');
  let idx = 0, ultimoFoco = null;
  let conjunto = [];   // o lightbox opera sobre qualquer lista de fotos
  let rotulo = '';     // prefixo da legenda (nome da suíte, quando houver)
  let arrastou = false; // distingue arrastar de clicar no fundo

  /* Deixa a próxima e a anterior já baixadas: a troca fica instantânea */
  const precarregar = (i) => {
    const f = conjunto[(i + conjunto.length) % conjunto.length];
    if (f) new Image().src = IMG(f[0], f[1], 'max1024x768');
  };

  const lbConta = $('#lb-conta'), lbLoad = $('#lb-load'), lbTiras = $('#lb-tiras');
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  const semAnimacao = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let troca = 0; // cancela animações antigas quando o hóspede clica rápido

  /* Fita de miniaturas: permite pular direto para qualquer foto */
  const montarTiras = () => {
    lbTiras.innerHTML = conjunto.map(([id, k, cap], i) =>
      `<button class="lb__tira" data-i="${i}" aria-label="Ir para: ${cap}">
         <img src="${IMG(id, k, 'max300')}" alt="" loading="lazy">
       </button>`
    ).join('');
  };

  const marcarTira = () => {
    const tiras = $$('.lb__tira', lbTiras);
    tiras.forEach((t, i) => t.classList.toggle('on', i === idx));
    const alvo = tiras[idx];
    if (alvo) {
      const c = lbTiras.getBoundingClientRect();
      const a = alvo.getBoundingClientRect();
      if (a.left < c.left || a.right > c.right) {
        lbTiras.scrollLeft += (a.left - c.left) - (c.width / 2) + (a.width / 2);
      }
    }
  };

  /* dir: +1 avança, -1 volta, 0 abre sem transição */
  const mostrar = async (i, dir = 0) => {
    const anterior = idx;
    idx = (i + conjunto.length) % conjunto.length;
    const [id, k, cap] = conjunto[idx];
    const url = IMG(id, k, 'max1024x768');
    const meu = ++troca;

    lbCap.textContent = rotulo + cap;
    lbConta.textContent = `${idx + 1} / ${conjunto.length}`;
    marcarTira();
    precarregar(idx + 1);
    precarregar(idx - 1);

    const anima = dir && anterior !== idx && !semAnimacao;

    if (anima) {
      // sai para o lado do movimento
      lbImg.style.transition = 'transform .15s ease-in, opacity .15s ease-in';
      lbImg.style.transform = `translateX(${-dir * 46}px)`;
      lbImg.style.opacity = '0';
      await espera(150);
      if (meu !== troca) return;
    }

    lbImg.src = url;
    lbImg.alt = cap;
    lbLoad.classList.add('on');

    /* decode() pode demorar ou nunca resolver (aba em segundo plano, rede ruim).
       Corremos contra um limite para a foto nunca ficar presa invisível. */
    await Promise.race([lbImg.decode().catch(() => {}), espera(1500)]);
    if (meu !== troca) return;          // chegou clique mais novo: ele assume daqui
    lbLoad.classList.remove('on');

    if (anima) {
      // posiciona do lado oposto e anima a entrada
      lbImg.style.transition = 'none';
      lbImg.style.transform = `translateX(${dir * 46}px)`;
      lbImg.style.opacity = '0';
      void lbImg.offsetWidth;           // força o recálculo antes de animar
      lbImg.style.transition = 'transform .3s cubic-bezier(.2,.7,.3,1), opacity .3s ease';
    } else {
      lbImg.style.transition = 'none';
    }
    lbImg.style.transform = 'translateX(0)';
    lbImg.style.opacity = '1';
  };

  lbTiras.addEventListener('click', (e) => {
    const t = e.target.closest('.lb__tira');
    if (!t) return;
    const alvo = Number(t.dataset.i);
    if (alvo !== idx) mostrar(alvo, alvo > idx ? 1 : -1);
  });

  const abrir = (lista, i, pre = '') => {
    conjunto = lista;
    rotulo = pre;
    idx = i;
    ultimoFoco = document.activeElement;
    montarTiras();
    mostrar(i);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#lb-x').focus();
    marcarTira();
  };

  const fechar = () => {
    lb.hidden = true;
    document.body.style.overflow = '';
    /* limpa qualquer estado de animação pendente para a próxima abertura */
    troca++;
    lbLoad.classList.remove('on');
    lbImg.style.transition = 'none';
    lbImg.style.transform = '';
    lbImg.style.opacity = '';
    if (ultimoFoco) ultimoFoco.focus();
  };

  grid.addEventListener('click', (e) => {
    const b = e.target.closest('.gitem');
    if (b) abrir(visiveis, Number(b.dataset.i));
  });

  /* Cada suíte abre com suas próprias fotos e segue nas áreas comuns */
  $$('.card__ver').forEach((btn) => {
    btn.addEventListener('click', () => {
      const s = SUITES[Number(btn.dataset.suite)];
      if (!s) return;
      abrir(s.fotos.concat(FOTOS), 0, `${s.nome} · `);
    });
  });

  $('#lb-x').addEventListener('click', fechar);
  $('#lb-prev').addEventListener('click', () => mostrar(idx - 1, -1));
  $('#lb-next').addEventListener('click', () => mostrar(idx + 1, 1));
  lb.addEventListener('click', (e) => {
    if (arrastou) { arrastou = false; return; }  // não fechar ao soltar um arrasto
    if (e.target === lb) fechar();
  });

  /* ── Gestos de toque ────────────────────────────────────────
     Arrastar para os lados troca a foto; arrastar para baixo fecha.
     A imagem acompanha o dedo para o gesto ter resposta visual.   */

  const dica = $('#lb-dica');
  const TROCA = 55;    // px para trocar de foto
  const FECHA = 110;   // px para fechar
  let px = 0, py = 0, dx = 0, dy = 0, ativo = false;

  const inicio = (e) => {
    if (lb.hidden || e.target.closest('.lb__nav, .lb__x')) return;
    ativo = true; arrastou = false;
    px = e.clientX; py = e.clientY; dx = 0; dy = 0;
    lbImg.style.transition = 'none';
  };

  const mover = (e) => {
    if (!ativo) return;
    dx = e.clientX - px;
    dy = e.clientY - py;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) arrastou = true;

    if (Math.abs(dx) >= Math.abs(dy)) {
      lbImg.style.transform = `translateX(${dx}px)`;
      lbImg.style.opacity = Math.max(0.35, 1 - Math.abs(dx) / 400);
    } else if (dy > 0) {
      lbImg.style.transform = `translateY(${dy}px) scale(${Math.max(0.85, 1 - dy / 900)})`;
      lbImg.style.opacity = Math.max(0.35, 1 - dy / 400);
    }
  };

  const soltar = () => {
    if (!ativo) return;
    ativo = false;
    lbImg.style.transition = 'transform .25s ease, opacity .25s ease';

    const horizontal = Math.abs(dx) >= Math.abs(dy);
    if (horizontal && Math.abs(dx) > TROCA) {
      const dir = dx < 0 ? 1 : -1;
      if (dica) dica.classList.add('some');
      mostrar(idx + dir, dir);   // a animação continua de onde o dedo parou
      return;
    }
    if (!horizontal && dy > FECHA) { fechar(); return; }

    lbImg.style.transform = '';
    lbImg.style.opacity = '';
  };

  lb.addEventListener('pointerdown', inicio);
  window.addEventListener('pointermove', mover, { passive: true });
  window.addEventListener('pointerup', soltar);
  window.addEventListener('pointercancel', soltar);

  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') fechar();
    if (e.key === 'ArrowLeft') mostrar(idx - 1, -1);
    if (e.key === 'ArrowRight') mostrar(idx + 1, 1);
  });

  /* ── Revelação no scroll ────────────────────────────────── */

  const alvos = $$('.sec .split__txt, .sec .split__img, .sechead, .card, .mos, .amen li, .dep, .regra, .dest__item, .cafe__item, .aviso, .faq__item, .selo__in');
  alvos.forEach((el) => el.classList.add('rv'));

  const io = new IntersectionObserver((ents) => {
    ents.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px' });

  /* Cascata por grade: o atraso vem da posição do elemento DENTRO do próprio
     container, não da ordem global — senão a sequência entra embaralhada. */
  const conjuntoAlvos = new Set(alvos);

  alvos.forEach((el) => {
    const irmaos = [...el.parentElement.children].filter((c) => conjuntoAlvos.has(c));
    const pos = irmaos.indexOf(el);
    el.style.transitionDelay = `${Math.min(pos, 7) * 85}ms`;
    io.observe(el);
  });
})();
