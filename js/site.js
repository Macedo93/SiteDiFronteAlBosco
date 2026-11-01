/* Di Fronte al Bosco — comportamento partilhado (cookies, GTM com consentimento) */
(function () {
  'use strict';
  var KEY = 'dfb-consent';
  var GTM_ID = 'GTM-WN5D63Q2';
  var gtmLoaded = false;

  function getConsent() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setConsent(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* armazenamento indisponível: vale só a sessão */ }
  }
  function loadGTM() {
    if (gtmLoaded) return;
    gtmLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    document.head.appendChild(s);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var banner = document.getElementById('cookie');
    if (!banner) return;
    var consent = getConsent();
    if (consent === 'accepted') {
      loadGTM();
    } else if (!consent) {
      banner.hidden = false;
    }
    var aceitar = document.getElementById('cookie-aceitar');
    var recusar = document.getElementById('cookie-recusar');
    if (aceitar) aceitar.addEventListener('click', function () {
      setConsent('accepted');
      loadGTM();
      banner.hidden = true;
    });
    if (recusar) recusar.addEventListener('click', function () {
      setConsent('rejected');
      banner.hidden = true;
    });
    document.querySelectorAll('[data-cookie-reabrir]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        banner.hidden = false;
      });
    });
  });
})();
