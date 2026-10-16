// Load analytics only when this browser has not opted out on this site.
(function () {
  try { if (localStorage.getItem('lvk_analytics_excluded') === '1') return; }
  catch (_) { return; } // Respect browsers that block persistent storage.
  var beacon = document.createElement('script');
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  beacon.defer = true;
  beacon.setAttribute('data-cf-beacon', JSON.stringify({token:'f1ff71bafbf847e3889b206b4c4268f1'}));
  document.head.appendChild(beacon);
})();
