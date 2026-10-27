/* Plain JavaScript (Unit II): variables, arrow functions, scope, arrays, objects, DOM and events.
   Runs outside Angular. It shows an offline warning and a "back to top" button. */
(() => {
  'use strict'; // function scope: nothing here leaks into the global scope

  const messages = {
    offline: 'You are offline. If it is an emergency, call 112 from your phone now.'
  };

  // ----- Offline banner -----
  const banner = document.createElement('div');
  banner.id = 'network-banner';
  banner.setAttribute('role', 'status');
  banner.hidden = true;
  document.body.prepend(banner);

  const updateBanner = () => {
    banner.hidden = navigator.onLine;
    banner.textContent = navigator.onLine ? '' : messages.offline;
  };
  window.addEventListener('online', updateBanner);
  window.addEventListener('offline', updateBanner);
  updateBanner();

  // ----- Back to top button -----
  const topButton = document.createElement('button');
  topButton.type = 'button';
  topButton.id = 'back-to-top';
  topButton.textContent = 'Top';
  topButton.setAttribute('aria-label', 'Back to top');
  topButton.hidden = true;
  document.body.append(topButton);

  window.addEventListener('scroll', () => {
    topButton.hidden = window.scrollY < 300;
  });
  topButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ----- Load the ES module (classes, inheritance, callbacks) with a dynamic import -----
  import('./tips-bar.js').catch((error) => console.error('Could not load tips-bar.js', error));
})();