// Coreloom UI — design-system loader for templates.
// One line in a page, <script src="./ds-base.js"></script>, loads the tokens,
// the compiled stylesheet (Tailwind + theme), React 19 and the shadcn-based
// component bundle, in order. Page code waits on `window.coreloomReady`, which
// resolves with every component part:
//   window.coreloomReady.then((UI) => { const { Button } = UI; ... })
// In a consuming project, repoint `base` at the bound _ds/<folder> tree
// (e.g. '_ds/coreloom' at the project root, '../_ds/coreloom' one level down).
(() => {
  const base = '../..';
  const NS = 'CoreloomUIDesignSystem_ff5f32';

  // Tokens (incl. font faces), then the compiled component stylesheet (Tailwind + theme).
  for (const p of ['tokens.css', 'components/bundle.css']) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = base + '/' + p;
    document.head.appendChild(link);
  }

  const scripts = ['components/lib/react.js', 'components/lib/react-dom.js', 'components/bundle.js'];
  window.coreloomReady = new Promise((resolve, reject) => {
    scripts.forEach((p, i) => {
      const s = document.createElement('script');
      s.src = base + '/' + p;
      s.async = false; // execute in order: React, ReactDOM, then the bundle
      s.onerror = () => {
        const msg = 'ds-base.js: failed to load ' + s.src +
          ' — if this is a consuming project, point `base` at the bound _ds/<folder> tree relative to this page.';
        console.error(msg);
        reject(new Error(msg));
      };
      if (i === scripts.length - 1) s.onload = () => resolve(window[NS]);
      document.head.appendChild(s);
    });
  });
  window.coreloomReady.catch(() => {
    const show = () => {
      const el = document.getElementById('app');
      if (el) el.innerHTML = '<p style="font-family:sans-serif;color:#888;padding:40px">Component bundle not loaded — check the base path in ds-base.js.</p>';
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show); else show();
  });
})();
