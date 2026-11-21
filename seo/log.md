# Log de mudanças — Di Fronte al Bosco

- 2026-11-21 — Setup SEO Autopilot: descrições das 7 páginas de intenção encurtadas para ≤160 caracteres (meta + OG + Twitter + JSON-LD) — https://di-fronte-al-bosco.vercel.app/lua-de-mel/ https://di-fronte-al-bosco.vercel.app/piscina/ https://di-fronte-al-bosco.vercel.app/hidromassagem/ https://di-fronte-al-bosco.vercel.app/familia/ https://di-fronte-al-bosco.vercel.app/fim-de-semana/ https://di-fronte-al-bosco.vercel.app/lareira/ https://di-fronte-al-bosco.vercel.app/onde-ficar/
- 2026-11-21 — Setup SEO Autopilot: títulos das 5 páginas de intenção com mais de 60 caracteres encurtados para ≤60 (familia, fim-de-semana, hidromassagem, lareira, piscina) — mesmas URLs acima.
- 2026-11-21 — Setup SEO Autopilot: llms.txt atualizado com as 7 páginas de intenção — https://di-fronte-al-bosco.vercel.app/llms.txt
- 2026-11-21 — Setup SEO Autopilot: criado seo/ (context.md, keyword-map.csv, backlog.md, ai-prompts.md, competitors/, directories.md, reports/2026-11-21.md) — PR for review, sem merge.

## 2026-11-21 — Follow-up do Setup (branch seo-autopilot-followup-20261121, PR for review)
- Criadas `/casa-inteira/` e `/o-que-fazer/`; sitemap 13 → 15 URLs; llms.txt 13 → 15 páginas.
- Rascunho "como chegar sem carro" em `seo/como-chegar-sem-carro-RASCUNHO.md` (não publicar sem validação do dono).
- Aniversário/comemorações: item bloqueado — conflita com "Festas e eventos não são permitidos".
- FAQs do WhatsApp: expansão pendente das 3–5 perguntas mais frequentes do dono; nada inventado.
- Âncoras internas da home e "Veja também" das 7 páginas de intenção (patches A e B em `PATCHES-PARA-O-PAI.md`): NÃO aplicados nesta PR; próxima rodada com revisão do diff.
- Bloqueio da rodada: cartão de aprovação do GitHub expirou na leitura do repo pelo subagente — nada foi enviado ao repo por ele; arquivos preparados em `~/workspace/seo-followup-20261121/` e PR aberta pelo agente principal.

### Search Console — passo a passo para o dono (não feito: exige a conta Google dele)
1. Abrir https://search.google.com/search-console e entrar com a conta Google que gerencia a Di Fronte al Bosco.
2. Em "Adicionar propriedade", escolher "Prefixo do URL" e informar `https://di-fronte-al-bosco.vercel.app` (ou "Domínio", se preferir verificar pelo DNS — o prefixo de URL é o mais simples aqui).
3. Verificar a propriedade: o Search Console oferece a verificação por arquivo HTML, meta tag ou DNS. Como o site é estático na Vercel, o caminho mais simples costuma ser a meta tag no `<head>` da home (pedir ao agente para incluí-la) ou o registro TXT no DNS, se o domínio for próprio.
4. Com a propriedade verificada, ir em "Sitemaps" no menu lateral e enviar `https://di-fronte-al-bosco.vercel.app/sitemap.xml`.
5. Aguardar o processamento (pode levar dias) e conferir em "Páginas" quantas das 15 URLs foram indexadas.
