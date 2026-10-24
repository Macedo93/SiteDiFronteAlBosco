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

  /* ── Disponibilidade da agenda + pré-reserva ──────────────────
     A API pública devolve, por suíte, os períodos ocupados (reservas locais
     + iCal da Booking). O input type="date" nativo não desabilita dias
     avulsos, por isso a trava real é a validação abaixo + o calendário
     visual, e a confirmação final é refeita no servidor antes de gravar.
     Se a API estiver fora do ar, o site NÃO quebra: avisa e o WhatsApp
     continua funcionando. */
  let disponibilidade = null;
  let disponibilidadeAviso = '';

  const diaSemana = (iso) => {
    const [a, m, d] = iso.split('-').map(Number);
    return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
  };
  const noiteFimDeSemana = (iso) => {
    const dia = diaSemana(iso);
    return dia === 5 || dia === 6;
  };
  const somarDia = (iso, n) => {
    const [a, m, d] = iso.split('-').map(Number);
    const dt = new Date(Date.UTC(a, m - 1, d + n));
    return dt.toISOString().slice(0, 10);
  };
  const noitesOcupadas = (numSuite) => {
    const ocupadas = new Set();
    if (!disponibilidade || !disponibilidade.occupied) return ocupadas;
    const periodos = disponibilidade.occupied[String(numSuite)] || [];
    periodos.forEach((p) => {
      let dia = p.checkIn;
      while (dia < p.checkOut) { ocupadas.add(dia); dia = somarDia(dia, 1); }
    });
    return ocupadas;
  };
  // Motivo do bloqueio manual do anfitrião, por noite (source Bloqueio).
  const motivosBloqueio = (numSuite) => {
    const motivos = new Map();
    if (!disponibilidade || !disponibilidade.occupied) return motivos;
    const periodos = disponibilidade.occupied[String(numSuite)] || [];
    periodos.forEach((p) => {
      if (p.source !== 'Bloqueio') return;
      let dia = p.checkIn;
      while (dia < p.checkOut) { if (!motivos.has(dia)) motivos.set(dia, p.reason || ''); dia = somarDia(dia, 1); }
    });
    return motivos;
  };
  // Noites fora do fim de semana liberadas pelo anfitrião (openExceptions).
  const noitesLiberadas = (numSuite) => {
    const liberadas = new Map();
    if (!disponibilidade || !disponibilidade.openExceptions) return liberadas;
    const periodos = disponibilidade.openExceptions[String(numSuite)] || [];
    periodos.forEach((p) => {
      let dia = p.checkIn;
      while (dia < p.checkOut) { if (!liberadas.has(dia)) liberadas.set(dia, p.reason || ''); dia = somarDia(dia, 1); }
    });
    return liberadas;
  };

  const validarPeriodo = (numSuite, ini, fim) => {
    if (!ini || !fim) return 'Informe as datas de check-in e check-out.';
    if (fim <= ini) return 'O check-out precisa ser depois do check-in.';
    if (noites(ini, fim) > 14) return 'Estadia máxima de 14 noites pelo site. Para estadias maiores, fale com a gente no WhatsApp.';
    if (ini < hoje) return 'O check-in não pode ser no passado.';
    // Regra da casa, noite por noite: sexta ou sábado, ou noite liberada
    // pelo anfitrião (feriado). Um bloqueio manual vence a liberação.
    const bloqueios = motivosBloqueio(numSuite);
    const liberadas = noitesLiberadas(numSuite);
    let dia = ini;
    while (dia < fim) {
      if (bloqueios.has(dia)) {
        const motivo = bloqueios.get(dia);
        return motivo
          ? `A noite de ${dataBr(dia)} está bloqueada pelo anfitrião: ${motivo}. Escolha outro período.`
          : `A noite de ${dataBr(dia)} está bloqueada pelo anfitrião. Escolha outro período.`;
      }
      if (!noiteFimDeSemana(dia) && !liberadas.has(dia)) {
        return 'A pré-reserva pelo site é só para noites de sexta ou sábado, ou feriado liberado pelo anfitrião. Para outras datas, fale com a gente no WhatsApp.';
      }
      dia = somarDia(dia, 1);
    }
    if (disponibilidade) {
      const ocupadas = noitesOcupadas(numSuite);
      let d2 = ini;
      while (d2 < fim) {
        if (ocupadas.has(d2)) return `A noite de ${dataBr(d2)} já está ocupada para esta suíte. Escolha outro período.`;
        d2 = somarDia(d2, 1);
      }
    }
    return null;
  };

  /* ── Calendário único, data primeiro ──────────────────────
     Dados continuam separados por suíte (uma reserva ocupa só uma
     suíte); o que é único é a visualização. Cada noite mostra pontos
     para as 3 suítes, em ordem Hidro, Suíte 2, Suíte 3: verde = livre,
     vermelho = ocupada ou bloqueada, cinza = dia de semana fechado. */
  const SUITES_INFO = [
    { nome: 'Suíte Hidromassagem', numero: 1, destaque: 'Banheira de hidromassagem · 2 camas de casal' },
    { nome: 'Suíte 2', numero: 2, destaque: 'Cama de casal + solteiro' },
    { nome: 'Suíte 3', numero: 3, destaque: 'TV + espaço de trabalho' },
  ];

  const mapasDisponibilidade = () => {
    const mapas = { ocupadas: {}, bloqueios: {}, liberadas: {} };
    for (const s of SUITES_INFO) {
      mapas.ocupadas[s.numero] = noitesOcupadas(s.numero);
      mapas.bloqueios[s.numero] = motivosBloqueio(s.numero);
      mapas.liberadas[s.numero] = noitesLiberadas(s.numero);
    }
    return mapas;
  };

  const pontoSuite = (numSuite, iso, mapas) => {
    if (mapas.bloqueios[numSuite].has(iso)) return 'ocupado';
    if (mapas.ocupadas[numSuite].has(iso)) return 'ocupado';
    if (noiteFimDeSemana(iso)) return 'livre';
    if (mapas.liberadas[numSuite].has(iso)) return 'livre';
    return 'fechado';
  };

  const suitesLivresNoite = (iso, mapas) => {
    if (!disponibilidade) return [];
    return SUITES_INFO.filter((s) => pontoSuite(s.numero, iso, mapas) === 'livre');
  };

  const suitesLivresPeriodo = (ini, fim, hospedesNum) => {
    if (!disponibilidade || !ini || !fim || fim <= ini) return [];
    const mapas = mapasDisponibilidade();
    return SUITES_INFO.filter((s) => {
      if (typeof hospedesNum === 'number' && hospedesNum > SUITE_CAPACIDADE[s.nome]) return false;
      let dia = ini;
      while (dia < fim) {
        if (pontoSuite(s.numero, dia, mapas) !== 'livre') return false;
        dia = somarDia(dia, 1);
      }
      return true;
    });
  };

  const renderSuitesLivres = () => {
    const el = $('#suites-livres');
    if (!el) return;
    if (!disponibilidade) { el.innerHTML = ''; return; }
    const ini = $('#f-in').value, fim = $('#f-out').value;
    if (!ini || !fim || fim <= ini) {
      el.innerHTML = '<p class="suites-livres__aviso">Escolha uma noite no calendário para ver as suítes livres para o período.</p>';
      return;
    }
    const hospedesRaw = $('#f-h').value;
    const hospedes = hospedesRaw === '5 ou mais' ? 5 : Number(hospedesRaw);
    const livres = suitesLivresPeriodo(ini, fim, hospedes);
    if (!livres.length) {
      el.innerHTML = '<p class="suites-livres__aviso">Nenhuma suíte livre para todo o período escolhido. Tente outras datas, ou fale no WhatsApp que confirmamos por lá.</p>';
      return;
    }
    const n = noites(ini, fim);
    const escolhida = $('#f-s').value;
    el.innerHTML = '<p class="suites-livres__titulo">Suítes livres para o período escolhido:</p>' + livres.map((s) => {
      const diaria = PRECOS[s.nome];
      const total = diaria * n;
      const sel = escolhida === s.nome;
      return `<button type="button" class="suite-livre${sel ? ' suite-livre--escolhida' : ''}" data-suite-nome="${s.nome}">` +
        `<span class="suite-livre__nome">${s.nome}</span>` +
        `<span class="suite-livre__det">${s.destaque} · até ${SUITE_CAPACIDADE[s.nome]} hóspedes</span>` +
        `<span class="suite-livre__preco">${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} <small>(${n} ${n === 1 ? 'noite' : 'noites'} × ${diaria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })})</small></span>` +
        `<span class="suite-livre__acao">${sel ? 'Suíte escolhida' : 'Escolher esta suíte'}</span></button>`;
    }).join('');
    el.querySelectorAll('[data-suite-nome]').forEach((btn) => {
      btn.addEventListener('click', () => {
        $('#f-s').value = btn.dataset.suiteNome;
        pintarCalc();
        renderSuitesLivres();
        document.getElementById('fform-note').textContent = '';
      });
    });
  };

  const renderCalendario = () => {
    const grade = $('#calendario-grade');
    const aviso = $('#calendario-aviso');
    if (!grade || !aviso) return;
    if (!disponibilidade) {
      aviso.textContent = disponibilidadeAviso || 'Calendário indisponível no momento. Você ainda pode enviar pelo WhatsApp.';
      grade.innerHTML = '';
      renderSuitesLivres();
      return;
    }
    aviso.textContent = 'Toque numa noite verde para começar a pré-reserva nela. Depois, escolha uma das suítes livres abaixo.';
    const mapas = mapasDisponibilidade();
    const meses = [];
    const base = new Date(hoje + 'T00:00:00Z');
    for (let off = 0; off < 2; off++) {
      const ano = base.getUTCFullYear();
      const mes = base.getUTCMonth() + off;
      const primeiro = new Date(Date.UTC(ano, mes, 1));
      const diasNoMes = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
      const nomeMes = primeiro.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
      let html = `<div class="cal__mes">${nomeMes}</div><div class="cal__grid">`;
      for (let i = 0; i < primeiro.getUTCDay(); i++) html += '<span class="cal__dia cal__dia--vazio"></span>';
      for (let d = 1; d <= diasNoMes; d++) {
        const iso = new Date(Date.UTC(ano, mes, d)).toISOString().slice(0, 10);
        if (iso < hoje) {
          html += `<span class="cal__dia cal__dia--fechado">${d}</span>`;
          continue;
        }
        const livres = suitesLivresNoite(iso, mapas);
        const pontos = SUITES_INFO.map((s) => {
          const p = pontoSuite(s.numero, iso, mapas);
          return `<span class="cal__ponto cal__ponto--${p}" title="${s.nome}"></span>`;
        }).join('');
        const corpo = `${d}<span class="cal__pontos">${pontos}</span>`;
        if (!livres.length) {
          let motivo = '';
          for (const s of SUITES_INFO) {
            if (mapas.bloqueios[s.numero].has(iso)) { motivo = mapas.bloqueios[s.numero].get(iso); break; }
          }
          html += `<span class="cal__dia cal__dia--ocupado" title="${motivo ? 'Bloqueada: ' + motivo.replace(/"/g, '') : 'Todas as suítes ocupadas'}">${corpo}</span>`;
        } else {
          const feriado = !noiteFimDeSemana(iso) && livres.some((s) => mapas.liberadas[s.numero].has(iso));
          html += `<button type="button" class="cal__dia cal__dia--livre${feriado ? ' cal__dia--feriado' : ''}" data-dia="${iso}" title="Livres: ${livres.map((s) => s.nome).join(', ')}">${corpo}</button>`;
        }
      }
      html += '</div>';
      meses.push(html);
    }
    grade.innerHTML = meses.join('');
    grade.querySelectorAll('[data-dia]').forEach((btn) => {
      btn.addEventListener('click', () => {
        $('#f-in').value = btn.dataset.dia;
        $('#f-out').value = somarDia(btn.dataset.dia, 1);
        pintarCalc();
        renderSuitesLivres();
        document.getElementById('fform-note').textContent = '';
      });
    });
  };

  const carregarDisponibilidade = async () => {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const resp = await fetch(CONFIG.availabilityUrl, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
      clearTimeout(timer);
      if (!resp.ok) throw new Error('availability HTTP ' + resp.status);
      disponibilidade = await resp.json();
      disponibilidadeAviso = '';
    } catch {
      disponibilidade = null;
      disponibilidadeAviso = 'Não foi possível carregar o calendário agora. Você ainda pode enviar pelo WhatsApp, e confirmamos a disponibilidade por lá.';
    }
    renderCalendario();
    renderSuitesLivres();
  };
  carregarDisponibilidade();

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
    $(s).addEventListener('change', renderCalendario);
    $(s).addEventListener('change', renderSuitesLivres);
  });

  $('#fform').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = $('#f-nome').value.trim();
    const telefone = ($('#f-tel') ? $('#f-tel').value : '').replace(/\D/g, '');
    const ini = $('#f-in').value;
    const fim = $('#f-out').value;

    if (!nome) { nota.textContent = 'Por favor, informe seu nome.'; $('#f-nome').focus(); return; }
    if (!ini || !fim) { nota.textContent = 'Informe as datas de check-in e check-out.'; return; }
    if (fim <= ini) { nota.textContent = 'O check-out precisa ser depois do check-in.'; return; }

    const msg = $('#f-msg').value.trim();
    const n = noites(ini, fim);
    const est = estimar();
    const suite = $('#f-s').value;
    const hospedesRaw = $('#f-h').value;
    const hospedes = hospedesRaw === '5 ou mais' ? 5 : Number(hospedesRaw);

    const textoWa = (extra) =>
      `Olá! Meu nome é ${nome} e vim pelo site da Di Fronte al Bosco.\n\n` +
      `Gostaria de reservar a ${SUITE_NUMERO[suite] ? suite : 'suíte (a escolher)'}\n` +
      `Check-in: ${dataBr(ini)}\n` +
      `Check-out: ${dataBr(fim)}\n` +
      `Noites: ${n}\n` +
      `Hóspedes: ${hospedesRaw}\n` +
      (telefone ? `Telefone: ${telefone}\n` : '') +
      (est ? `Valor estimado: ${reais(est.total)} (${est.n} × ${reais(est.diaria)})\n` : '') +
      (msg ? `\nObservação: ${msg}\n` : '') +
      (extra ? `\n${extra}\n` : '') +
      `\nPode confirmar a disponibilidade?`;

    // Sem suíte definida ou acima da capacidade, não dá para gravar pré-reserva:
    // vai só pelo WhatsApp, como antes.
    const numSuite = SUITE_NUMERO[suite];
    if (!numSuite) {
      const livresPeriodo = suitesLivresPeriodo(ini, fim, hospedes);
      if (livresPeriodo.length) {
        nota.textContent = 'Escolha uma das suítes livres acima para gravar a pré-reserva.';
        document.getElementById('suites-livres')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      nota.textContent = 'Sem suíte definida, enviamos só pelo WhatsApp.';
      abrirWa(textoWa(''));
      return;
    }
    if (hospedes > SUITE_CAPACIDADE[suite]) {
      nota.textContent = 'Para mais hóspedes que a capacidade da suíte, enviamos só pelo WhatsApp.';
      abrirWa(textoWa(''));
      return;
    }

    // Validação local (calendário + fim de semana). Se falhar, não envia nada:
    // o hóspede precisa escolher outro período, em vez de mandar um pedido inválido.
    const erroPeriodo = validarPeriodo(numSuite, ini, fim);
    if (erroPeriodo) { nota.textContent = erroPeriodo; return; }
    if (!/^\d{10,13}$/.test(telefone)) {
      nota.textContent = 'Informe um telefone válido, com DDD, para gravar a pré-reserva.';
      if ($('#f-tel')) $('#f-tel').focus();
      return;
    }

    const botao = e.target.querySelector('button[type="submit"]');
    if (botao) botao.disabled = true;
    nota.textContent = 'Enviando sua pré-reserva…';
    let gravada = null;
    let erroApi = '';
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      const resp = await fetch(CONFIG.preReservaUrl, {
        method: 'POST',
        signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: nome,
          phone: telefone,
          suite: numSuite,
          guests: hospedes,
          checkIn: ini,
          checkOut: fim,
          observation: msg,
        }),
      });
      clearTimeout(timer);
      const dados = await resp.json().catch(() => ({}));
      if (resp.ok && dados.success) {
        gravada = dados;
      } else {
        erroApi = (dados && dados.error) || `a agenda respondeu ${resp.status}`;
      }
    } catch {
      erroApi = 'a agenda está fora do ar no momento';
    }
    if (botao) botao.disabled = false;

    if (gravada) {
      nota.textContent = `Pré-reserva recebida! Aguardando confirmação do anfitrião. Abrimos o WhatsApp para avisar na hora.`;
      abrirWa(textoWa(`Pré-reserva registrada na agenda, aguardando confirmação.`));
    } else {
      // Fallback exigido: a pré-reserva NÃO foi gravada, mas o pedido não se perde.
      nota.textContent = `Não foi possível gravar a pré-reserva na agenda (${erroApi}). Enviamos pelo WhatsApp mesmo assim.`;
      abrirWa(textoWa('A pré-reserva não foi gravada na agenda, por favor confirme por aqui.'));
    }
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
