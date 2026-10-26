// Forwarder / bridge to js/script.js for backward compatibility
(function() {
  const s = document.createElement('script');
  s.src = (document.currentScript && document.currentScript.src) ? 
          new URL('js/script.js', document.currentScript.src).href : 'js/script.js';
  document.head.appendChild(s);
})();
