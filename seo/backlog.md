# Backlog — Di Fronte al Bosco (Setup 2026-11-21)

Ordenado por valor esperado por hora de trabalho. Cada item: query, página, mudança.
Volumes e posições são "n/d" — Search Console não está conectado (ver relatório).

## Feito nesta rodada (PR `seo-autopilot-setup-20261121`)

1. [FEITO] Descriptions 170–177 → ≤160 caracteres nas 7 páginas de intenção (meta + OG + Twitter + JSON-LD WebPage). Query: as 7 de intenção. Páginas: `/lua-de-mel/`, `/piscina/`, `/hidromassagem/`, `/familia/`, `/fim-de-semana/`, `/lareira/`, `/onde-ficar/`.
2. [FEITO] Titles 61–68 → ≤60 caracteres em 5 páginas de intenção (familia, fim-de-semana, hidromassagem, lareira, piscina). Query: as respectivas. Páginas: as mesmas 5.
3. [FEITO] `llms.txt` atualizado com as 7 páginas de intenção (estava com só 6 páginas, pré-15/11). Query: n/a. Página: `/llms.txt`.

## A fazer

4. Página "casa inteira / até 10 hóspedes". Query: "pousada Santa Teresa casa inteira 10 pessoas". Página nova (a criar no padrão das páginas de intenção). Mudança: criar a página com o fato já existente na FAQ da home (3 suítes, 4+3+3), preço a partir de R$ 450, regras e CTA de pré-reserva; 3 links internos na home e nas páginas de suítes.
5. Página "como chegar sem carro / de Vitória". Query: "como chegar em Santa Teresa sem carro". Página nova. Mudança: criar a página com o que o site já diz (70 km do aeroporto de Vitória, 900 m do centro, tudo a pé no centro) + o que falta apurar com o dono (ônibus Vitória→Santa Teresa, transfer, táxi local). Sem inventar horários ou preços de transporte.
6. Página "aniversário e comemorações". Query: "pousada Santa Teresa aniversário comemoração". Página nova. Mudança: criar a página a partir do que a casa já oferece (suíte hidromassagem, lareira, churrasco, bolo/mesa — só o que o dono confirmar).
7. Artigo "o que fazer em Santa Teresa". Query: "o que fazer em Santa Teresa". Página nova (artigo). Mudança: expandir a seção #destino da home (Museu Mello Leitão, Rua do Lazer, vinícolas, trilhas) em artigo próprio, com links para as páginas de intenção.
8. Âncoras internas da home para as páginas de intenção. Query: as 7 de intenção. Página: `/` (home). Mudança: trocar âncoras curtas ("Lua de mel", "Piscina") por âncoras descritivas ("lua de mel em Santa Teresa", "pousada com piscina em Santa Teresa") sem mudar o layout.
9. Expandir as 3 FAQs de cada página de intenção. Query: as 7 de intenção. Páginas: as 7. Mudança: adicionar perguntas reais que chegam no WhatsApp (o dono precisa passar as 3–5 mais frequentes por página) com respostas no texto e no FAQPage.
10. Verificar indexação das 7 páginas novas (15/11). Query: as 7 de intenção. Páginas: as 7. Mudança: depende do Search Console (pedido ao dono); sem ele, marcar "not verified", não "indexed".
11. Pedir inclusão no guia dicasdeviagem.com. Query: "pousadas em Santa Teresa". Página: `/` (link de destino). Mudança: o dono envia o rascunho de `seo/directories.md` (Di Fronte ausente no artigo, verificado 21/11). Nada submetido sem o dono.
12. Verificar presença no guia temqueir.com.br e no hospedagembrasileira.com.br. Query: "onde ficar em Santa Teresa". Mudança: leitura completa dos artigos; se ausente, preparar pedido como no item 11.
13. Comparativas (Monthly): "Di Fronte al Bosco vs Valle di Trento" e "vs Vita Verde". Query: "Valle di Trento vs / alternativas". Mudança: só com fontes e data ("as of"), admitindo onde o concorrente é melhor. Sem inventar dados do concorrente.
14. Ferramenta gratuita (Monthly): calculadora de diária/estimativa de estadia. Query: a definir com o dono. Mudança: aproveitar a calculadora que já existe no formulário, como página própria, sem cadastro. Depende de decisão do dono.
15. Consolidar o bloco JSON-LD `LodgingBusiness` repetido em 8 páginas com `@id` único. Query: n/a. Páginas: home + 7 de intenção. Mudança: técnica, baixo impacto direto; só após os itens acima.
16. NÃO FAZER: páginas para "pet friendly", "chalé" e "pousada barata" — o produto não atende (pets proibidos, não é chalé, diária a partir de R$ 450). Ver `seo/keyword-map.csv`.

## Atualização 2026-11-21 (follow-up, PR seo-autopilot-followup-20261121)
- [x] Página "casa inteira / até 10 hóspedes" — criada (`/casa-inteira/`), no sitemap e no llms.txt.
- [x] Artigo "o que fazer em Santa Teresa" — criado (`/o-que-fazer/`), expandindo a seção #destino da home.
- [ ] Âncoras internas da home para as páginas de intenção — patch preparado em `PATCHES-PARA-O-PAI.md` (seção A), NÃO aplicado nesta PR: exige reescrever a home (1130 linhas) e o "Veja também" das 7 páginas de intenção (seção B); aplicar numa próxima rodada com revisão do diff.
- [ ] Página "como chegar sem carro" — RASCUNHO em `seo/como-chegar-sem-carro-RASCUNHO.md`, NÃO publicar: preço e último horário divergem entre fontes; falta confirmar preço/grade atuais, último horário de domingo e o trecho rodoviária → casa. Depende do dono.
- [ ] Página "aniversário e comemorações" — BLOQUEADA POR CONFLITO: as regras da casa publicadas dizem "Festas e eventos não são permitidos". Não criar página afirmando que festas são permitidas. Decisão do dono: (a) não ter a página ou (b) página de "comemoração tranquila" só com o aval dele sobre o que pode ser oferecido.
- [ ] Expansão das FAQs com as perguntas do WhatsApp — depende do dono informar as 3–5 perguntas mais frequentes. Nenhuma pergunta foi inventada. FAQs atuais no site (12, home): check-in/out; áreas compartilhadas; cozinhar; café da manhã; o que vem na suíte; frio/climatização; pet; estacionamento; crianças; cancelamento; perto do centro; quantas pessoas por suíte.
