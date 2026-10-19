// Search reads window.SEARCH from search.js, a script rather than a JSON fetch, so it works from file:// too.
(() => {
  const box = document.querySelector('.find input');
  const list = document.querySelector('.find ol');
  const esc = (s) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  box?.addEventListener('input', () => {
    const words = box.value.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = words.length ? (window.SEARCH || []).filter((e) => words.every((w) => e.k.includes(w))).slice(0, 12) : [];
    list.innerHTML = hits.map((e) => `<li><a href="${esc(e.u)}">${esc(e.t)}<span>${esc(e.l)}</span></a></li>`).join('');
  });
  box?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') list.querySelector('a')?.click();
    if (e.key === 'Escape') { box.value = ''; list.innerHTML = ''; }
  });

  // Scroll-spy: the section nearest the top of the screen is the current one in the contents.
  const links = [...document.querySelectorAll('.toc a[href^="#"]')];
  const targets = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
  const mark = () => {
    let at = targets[0];
    for (const t of targets) if (t.getBoundingClientRect().top < 120) at = t;
    links.forEach((a) => (a.hash === `#${at?.id}` ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  };
  if (targets.length) { addEventListener('scroll', mark, { passive: true }); mark(); }

  // Copy takes the code alone: line numbers and the rows standing in for hidden lines stay out.
  const icon = (d) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${d}</svg>`;
  const copyIcon = icon('<rect x="5.25" y="5.25" width="8.5" height="8.5" rx="1.5"/><path d="M10.75 5.25v-2a1 1 0 0 0-1-1h-6.5a1 1 0 0 0-1 1v6.5a1 1 0 0 0 1 1h2"/>');
  const doneIcon = icon('<path d="m3 8.5 3 3 7-7"/>');
  document.querySelectorAll('.code .file').forEach((bar) => {
    const button = document.createElement('button');
    button.className = 'copy';
    button.type = 'button';
    button.setAttribute('aria-label', 'Copy code');
    button.innerHTML = copyIcon;
    button.addEventListener('click', async () => {
      const frame = bar.parentElement;
      const rows = [...frame.querySelectorAll('.ln:not(.gap)')];
      const text = rows.length
        ? rows.map((r) => [...r.childNodes].filter((n) => n.nodeName !== 'I').map((n) => n.textContent).join('')).join('\n')
        : frame.querySelector('pre')?.textContent ?? '';
      try {
        await navigator.clipboard.writeText(text);
        button.innerHTML = doneIcon;
        button.setAttribute('aria-label', 'Copied');
        setTimeout(() => { button.innerHTML = copyIcon; button.setAttribute('aria-label', 'Copy code'); }, 1500);
      } catch { button.setAttribute('aria-label', 'Copy failed: select the code instead'); }
    });
    bar.append(button);
  });
})();
