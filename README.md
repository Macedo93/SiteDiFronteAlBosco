# Di Fronte al Bosco — site

Código do site da pousada Di Fronte al Bosco (Santa Teresa, ES), publicado em
https://di-fronte-al-bosco.vercel.app/

Site estático (HTML, CSS e JavaScript puros, sem etapa de build):

- `index.html` — página única
- `css/style.css` — estilos
- `js/config.js` — dados editáveis do site (suítes, preços, avaliações, fotos)
- `js/main.js` — comportamento da página
- `img/` — favicon e imagem de compartilhamento (og.jpg)
- `robots.txt` e `sitemap.xml`

As fotos das suítes e áreas são carregadas do CDN do Booking em tempo de
execução, a partir dos IDs definidos em `js/config.js`.

Código recuperado do site em produção em 22/10/2026 (o projeto original estava
em outra conta da Vercel).

## Pré-reserva e calendário único (data primeiro)

O formulário completo (`#fform`) consulta a disponibilidade pública da
agenda (`CONFIG.availabilityUrl`) e mostra UM calendário para as 3 suítes:
cada noite tem pontos para Hidro, Suíte 2 e Suíte 3 (verde = livre,
vermelho = ocupada ou bloqueada, cinza = dia de semana fechado). O hóspede
escolhe as datas primeiro e, abaixo do calendário, aparecem só as suítes
livres para todo o período, com preço total. Ao escolher uma suíte e enviar,
o site chama a pré-reserva (`CONFIG.preReservaUrl`).

- Se a pré-reserva gravar na agenda, o site mostra a confirmação de
  "pré-reserva recebida, aguardando confirmação do anfitrião" e abre o
  WhatsApp com os mesmos dados.
- Se a agenda estiver fora do ar ou o endpoint falhar, o site avisa que a
  pré-reserva não foi gravada e envia só pelo WhatsApp, como antes.
- O formulário rápido do hero (`#quote`) continua só-WhatsApp, porque não
  tem suíte, nome nem telefone para gravar uma pré-reserva.
- A pré-reserva só existe no ar depois que a branch pre-reserva-agenda for
  mergeada e deployada na agenda; até lá, o site cai para o WhatsApp.

## Controle de datas (painel da agenda, refletido no calendário)

O anfitrião controla datas no painel "Controle de datas" da agenda (só admin),
sem mexer no código do site:

- Bloquear um período: a noite aparece em vermelho no calendário, com o
  motivo no título, e a pré-reserva é recusada com 409 e o motivo.
- Liberar um período fora do fim de semana (feriado): a noite aparece em
  verde tracejado no calendário e pode ser pré-reservada, mesmo sendo dia
  de semana.
- "Todas as suítes" no painel grava uma linha por suíte. Um bloqueio vence
  uma liberação na mesma noite.
- Regra da pré-reserva, noite por noite: sexta ou sábado, ou noite
  liberada pelo anfitrião. Sem isso, o pedido vai pelo WhatsApp.
- A migração `supabase_availability_overrides.sql` da agenda precisa ser
  rodada no Supabase antes de confiar nos bloqueios; sem ela, a API cai
  para o comportamento antigo e o site não quebra.
