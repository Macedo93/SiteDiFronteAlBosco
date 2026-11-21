# Di Fronte al Bosco — contexto (Setup 2026-11-21)

Fonte de cada fato: arquivo do repo `Macedo93/SiteDiFronteAlBosco` (branch `seo-autopilot-setup-20261121`, base `ba0a8d0`) ou URL ao vivo indicada. Nada aqui vem de memória sem fonte. Última revisão: 2026-11-21.

## O produto

- Casa com 3 suítes privativas em Santa Teresa, ES — não é hotel nem pousada de muitos quartos. Cada hóspede tem quarto com banheiro exclusivo; sala, cozinha, piscina e convivência são compartilhadas. Fonte: `index.html` (seção "Como funciona a casa").
- Endereço: Rua Vicente da Costa Oliveira, 239, Santa Teresa — ES, CEP 29650-000. Fonte: `index.html` (seção Localização e rodapé).
- A ~900 m do centro histórico e da Rua do Lazer; 1,2 km do Mazzolin di Fiori; ~70 km do aeroporto de Vitória. Fonte: `index.html` (seção Localização).
- Santa Teresa: primeira cidade de colonização italiana do Brasil (1874). Fonte: `index.html` (seção O destino).

## As suítes e os preços

- Suíte Hidromassagem: 2 camas de casal, até 4 hóspedes, banheira de hidromassagem no banheiro privativo, closet. Diária a partir de R$ 550. Fonte: `index.html` e `suites/suite-hidromassagem/index.html`.
- Suíte 2: 1 cama de casal + 1 de solteiro, até 3 hóspedes, banheiro privativo com box, cama extra grátis mediante pedido. A partir de R$ 450. Fonte: `index.html` e `suites/suite-2/index.html`.
- Suíte 3: 1 cama de casal + 1 de solteiro, até 3 hóspedes, banheiro privativo, armário amplo, escrivaninha. A partir de R$ 450. Fonte: `index.html` e `suites/suite-3/index.html`.
- Casa inteira: até 10 hóspedes (4+3+3). Fonte: `index.html` (JSON-LD FAQ "Quantas pessoas cabem em cada suíte?").
- Preços são "diária de balcão / a partir de" e o valor final é confirmado no WhatsApp. Fonte: `index.html` (seção da calculadora de estimativa).

## O que está incluído / diferenciais

- Piscina ao ar livre aberta o ano todo, com deck. Fonte: `index.html`, `piscina/index.html`.
- Lareira na sala de convivência; 2 áreas de churrasco; espaço fitness; estacionamento privativo gratuito; Wi-Fi; TV com Netflix e YouTube; roupa de cama e banho, amenities, secador. Fonte: `index.html` (seções Lazer, Comodidades, Suítes).
- Café da manhã sem horário fixo: pães, biscoitos, ovos, frutas, café e chá deixados à disposição para o hóspede montar quando quiser, na cozinha compartilhada equipada. Fonte: `index.html` (seção Café da manhã).
- Portão aberto remotamente pelo anfitrião; hóspede avisa o horário previsto de chegada. Fonte: `index.html` (seção Regras).

## Regras e limites (não negociar em texto de SEO)

- Estadias só em fins de semana e feriados: dias de semana são fechados, salvo feriado liberado pelo anfitrião. Fonte: `index.html` (legenda do calendário) e `lua-de-mel/index.html` ("fins de semana e feriados").
- Check-in 13h às 18h; check-out 7h às 11h. Silêncio 22h às 8h. Fonte: `index.html` (seção Regras) e JSON-LD `checkinTime`/`checkoutTime`.
- Crianças bem-vindas em qualquer idade; cama extra grátis sob consulta; sem berço. Fonte: `index.html` (Regras e FAQ).
- Pets NÃO permitidos. Festas e eventos NÃO permitidos. Fumar só em áreas externas. Fonte: `index.html` (Regras).
- Cancelamento gratuito até 7 dias após fazer a reserva (legislação brasileira); depois vale a política da tarifa combinada. Fonte: `index.html` (seção Regras e FAQ).

## Avaliações (números do próprio site, 2026-11-21)

- Booking.com: 9,3 ("Fantástico"), 89 avaliações. Fonte: `index.html` (selo e JSON-LD `aggregateRating`).
- Airbnb: 5,0, 11 avaliações. Fonte: `index.html` (link "5,0 no Airbnb · 11 avaliações").
- Google: 5,0, 16 avaliações. Fonte: `index.html` (selo Google, verificado no código em 2026-11-21).
- Depoimentos em carrossel no site com filtro por plataforma (Booking, Airbnb, Google). Fonte: `index.html` e `js/main.js`.

## Conversão

- Pré-reserva pelo formulário do site (nome, telefone/WhatsApp, datas, hóspedes, suíte, mensagem). O envio grava na agenda via `POST https://agenda-hospedagem.vercel.app/api/pre-reserva` e abre o WhatsApp do anfitrião. Disponibilidade ao vivo via `GET https://agenda-hospedagem.vercel.app/api/availability`. Fonte: `js/config.js` (`availabilityUrl`, `preReservaUrl`) e `index.html` (formulário).
- WhatsApp direto: https://wa.me/5527997574050. Fonte: `index.html`, `llms.txt`.
- Instagram: https://instagram.com/difrontalbosco. Booking: https://www.booking.com/hotel/br/di-front-al-bosco.pt-br.html. Fonte: `index.html` (JSON-LD `sameAs`).

## O site (técnico)

- HTML/CSS/JS estático, sem framework e sem build. Produção: https://di-fronte-al-bosco.vercel.app (Vercel, integração GitHub→Vercel). Fonte: repo (raiz: `index.html`, `css/style.css`, `js/`).
- 13 URLs no sitemap (`sitemap.xml`, 2026-11-21): home, 3 suítes, privacidade, termos, 7 páginas de intenção (lua-de-mel, piscina, hidromassagem, familia, fim-de-semana, lareira, onde-ficar). Mais `/obrigado/` (noindex, fora do sitemap) e `404.html` (noindex, sem canonical).
- `robots.txt`: `Allow: /` + sitemap absoluto. `llms.txt` com as 13 páginas. GTM só carrega após aceite no banner de cookies. Fonte: `robots.txt`, `llms.txt`, `index.html`.
- Metadados por página em cada HTML (title, description, canonical, OG/Twitter, JSON-LD WebPage/LodgingBusiness/BreadcrumbList/FAQPage onde aplicável). Fonte: cada `index.html`.
- Pré-reserva depende do sistema de agenda (repo separado, `agenda-hospedagem.vercel.app`); o site público não toca nele. Fonte: `js/config.js`.

## Quem compra

- Casais em lua de mel/aniversário e famílias pequenas que buscam sossego na serra, a pé no centro, sem carro. Fonte: páginas `lua-de-mel/`, `familia/`, `onde-ficar/` e seção "O destino" (`index.html`).
- Quem NÃO é o público: quem viaja com pet, quem quer festa/evento, quem precisa se hospedar no meio da semana fora de feriado. Fonte: `index.html` (Regras e calendário).

## Concorrentes (verificados por busca em 2026-11-21; detalhe em `seo/competitors/`)

- Pousadas que rankeiam: Pousada Paradiso, Pousada Vita Verde, Pousada Valle di Trento, Chalés Villa Caravaggio (romântico/lua de mel), Hotel Pierazzo (centro/Rua do Lazer).
- Guias que rankeiam para as mesmas queries: queroviajarmais.com (Di Fronte já recomendada lá), dicasdeviagem.com (Di Fronte ausente — verificado 21/11), temqueir.com.br, viajali.com.br.
- TripAdvisor lista 57 propriedades em Santa Teresa; Vita Verde é nº 2 e Valle di Trento nº 3 em melhor relação qualidade/preço (verificado 21/11).
