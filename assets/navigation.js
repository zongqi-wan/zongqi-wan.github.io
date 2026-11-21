(() => {
  'use strict';
  if (!['http:', 'https:'].includes(location.protocol) || !window.fetch || !window.AbortController) return;

  // Keep the document (and its Audio instance) alive while swapping the site shell.
  // Each HTML file still works independently, including when JavaScript is disabled.
  const base = new URL('../', document.currentScript.src);
  const pages = new Set(['', 'index.html', 'research.html', 'teaching.html', 'collaborators.html', 'links.html']
    .map(path => new URL(path, base).pathname));
  const metadata = 'meta[name="description"], meta[property^="og:"], link[rel="canonical"], script[type="application/ld+json"]';
  const stateKey = 'homepageNavigation';
  const pageKey = url => `${url.pathname === base.pathname ? `${base.pathname}index.html` : url.pathname}${url.search}`;
  const isSitePage = url => url.origin === location.origin && pages.has(url.pathname);
  let displayedURL = new URL(location.href);
  let pending;
  let scrollFrame;

  const saveScroll = () => {
    if (pending || location.href !== displayedURL.href) return;
    history.replaceState({ ...history.state, [stateKey]: { scroll: [scrollX, scrollY] } }, '', location.href);
  };
  history.scrollRestoration = 'manual';
  saveScroll();
  window.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(saveScroll);
  }, { passive: true });

  const positionPage = (url, savedScroll, changedPage) => {
    let target;
    try { target = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1))); }
    catch (_) { /* A malformed fragment should not prevent navigation. */ }
    const focusTarget = target || (changedPage && document.querySelector('#main h1'));
    if (focusTarget && !document.activeElement.closest('.music-player')) {
      if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
      focusTarget.focus({ preventScroll: true });
    }
    if (savedScroll) window.scrollTo({ left: savedScroll[0], top: savedScroll[1], behavior: 'instant' });
    else if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
    else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  async function navigate(url, { push = false, state = null } = {}) {
    pending?.abort();
    const controller = new AbortController();
    pending = controller;
    cancelAnimationFrame(scrollFrame);
    const changedPage = pageKey(url) !== pageKey(displayedURL);
    const main = document.querySelector('#main');
    if (changedPage) main.setAttribute('aria-busy', 'true');
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      let nextDocument;
      let nextShell;
      if (changedPage) {
        const response = await fetch(url.href, { signal: controller.signal });
        if (!response.ok || !isSitePage(new URL(response.url))) throw new Error('Page unavailable');
        nextDocument = new DOMParser().parseFromString(await response.text(), 'text/html');
        nextShell = nextDocument.querySelector('.site-shell');
        if (!nextShell?.querySelector('#main')) throw new Error('Page layout unavailable');
      }
      if (pending !== controller) return;
      if (push && url.href !== location.href) history.pushState({ [stateKey]: { scroll: [0, 0] } }, '', url.href);
      if (nextShell) {
        document.querySelector('.site-shell').replaceWith(nextShell);
        document.title = nextDocument.title;
        document.documentElement.lang = nextDocument.documentElement.lang || 'en';
        document.head.querySelectorAll(metadata).forEach(node => node.remove());
        nextDocument.head.querySelectorAll(metadata).forEach(node => document.head.append(node.cloneNode(true)));
      }
      displayedURL = new URL(url.href);
      pending = null;
      positionPage(url, push ? null : state?.[stateKey]?.scroll, changedPage);
      saveScroll();
    } catch (_) {
      // An older, cancelled request must never replace the user's newer destination.
      if (pending !== controller) return;
      pending = null;
      if (push) location.assign(url.href);
      else location.replace(url.href);
    } finally {
      clearTimeout(timeout);
      if (!pending || pending === controller) main.removeAttribute('aria-busy');
    }
  }

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href);
    if (!isSitePage(url) || url.hash.includes(':~:')) return;
    event.preventDefault();
    saveScroll();
    navigate(url, { push: true });
  });

  window.addEventListener('popstate', event => {
    const url = new URL(location.href);
    if (isSitePage(url)) navigate(url, { state: event.state });
    else location.reload();
  });
})();
