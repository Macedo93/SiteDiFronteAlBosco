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
