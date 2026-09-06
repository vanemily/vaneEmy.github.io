// ── Idioma actual (usado por cualquier contenido que se genera con JS) ──
function currentLang() {
  try {
    return localStorage.getItem('site-lang') || 'es';
  } catch (e) {
    return 'es';
  }
}

// ── Formatea una fecha (ISO) en el idioma actual ─────
function formatBlockDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';

  if (currentLang() === 'en') {
    const meses = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${meses[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

// ── Typewriter (solo en la portada) ──────────────
(function () {
  const target = document.getElementById('typewriter-target');
  if (!target) return;

  const text = 'el mundo de:';
  let ti = 0;

  function typeNext() {
    if (ti <= text.length) {
      target.textContent = text.slice(0, ti++);
      setTimeout(typeNext, ti === 1 ? 800 : 80 + Math.random() * 40);
    }
  }

  setTimeout(typeNext, 600);
})();

// ── Rabbit click → cae al hoyo y sigue a "sobre mí" (solo en la portada) ──
(function () {
  const rabbit = document.getElementById('rabbit');
  if (!rabbit) return;

  let rabbitBusy = false;

  rabbit.addEventListener('click', () => {
    if (rabbitBusy) return;
    rabbitBusy = true;

    rabbit.classList.add('falling');

    setTimeout(() => {
      if (rabbit.dataset.href) {
        window.location.href = rabbit.dataset.href;
      }
    }, 900);
  });
})();

// ── Scroll reveal ─────────────────────────────────
(function () {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal, .reveal-group').forEach(el => io.observe(el));
})();

// ── Stars ─────────────────────────────────────────
(function () {
  function scatterStars(section, count) {
    const hues = [270, 300, 200, 340, 60, 280];
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'star-deco';
      s.textContent = Math.random() > 0.5 ? '✦' : '✧';
      const hue = hues[Math.floor(Math.random() * hues.length)];
      s.style.cssText = `
        left:${(Math.random()*88+4).toFixed(1)}%;
        top:${(Math.random()*85+5).toFixed(1)}%;
        font-size:${(Math.random()*0.5+0.45).toFixed(2)}rem;
        opacity:${(Math.random()*0.12+0.05).toFixed(2)};
        animation-duration:${(Math.random()*12+8).toFixed(1)}s;
        animation-delay:-${(Math.random()*10).toFixed(1)}s;
        color:hsl(${hue},55%,68%);
      `;
      section.appendChild(s);
    }
  }

  document.querySelectorAll('.room').forEach(r => scatterStars(r, 8));
})();

// ── Sparkle on click ──────────────────────────────
(function () {
  function burst(x, y, symbols, colors) {
    for (let i = 0; i < 7; i++) {
      const el = document.createElement('span');
      el.className = 'sparkle';
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      const angle = (i / 7) * 360 + Math.random() * 25;
      const dist = 38 + Math.random() * 52;
      el.style.cssText = `
        left:${x}px; top:${y}px;
        color:${colors[Math.floor(Math.random() * colors.length)]};
        --tx:${Math.cos(angle * Math.PI / 180) * dist}px;
        --ty:${Math.sin(angle * Math.PI / 180) * dist}px;
        font-size:${0.6 + Math.random() * 0.8}rem;
        animation-delay:${i * 0.03}s;
      `;
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }
  }

  const clickMap = [
    { sel: '.semilla-card.wide',      symbols: ['❤️','🩷','💕','💗','♡'],    colors: ['#FF6090','#FF90B0','#FFB0C8'] },
    { sel: '.semilla-card.half-left', symbols: ['🌸','🌺','🌼','✿','🌷'],    colors: ['#FFB0D0','#FF90C0','#E0B0FF'] },
    { sel: '.semilla-card.tree-card', symbols: ['🍃','🌿','🌱','🍀'],         colors: ['#80C890','#A0D8A0','#C0F0C0'] },
    { sel: '.letter',                 symbols: ['✦','✧','⋆','·','★'],        colors: ['#C8A0FF','#FFB0D8','#80E0B8','#FFE060'] },
    { sel: '.passion-tag:nth-child(1)', symbols: ['✦','✧','🎨'],             colors: ['#C8A0FF','#B090E0'] },
    { sel: '.passion-tag:nth-child(2)', symbols: ['🎵','🎶','♪','♫'],        colors: ['#FFB0D8','#FF90C0'] },
    { sel: '.passion-tag:nth-child(3)', symbols: ['✿','🌀','💫'],             colors: ['#80E0B8','#60C090'] },
    { sel: '.passion-tag:nth-child(4)', symbols: ['✧','⋆','🌟'],             colors: ['#FFE060','#F0C020'] },
    { sel: '.passion-tag:nth-child(5)', symbols: ['🌙','⭐','✦'],            colors: ['#A0C0FF','#8090E0'] },
    { sel: '.blog-coming',            symbols: ['📝','✍️','📖'],              colors: ['#A0B0FF','#C0D0FF'] },
    { sel: '.chip',                   symbols: ['✦','⋆','·','✧'],            colors: ['#C8A0FF','#FFB0D8','#80E0B8'] },
  ];

  const elementMap = new Map();
  clickMap.forEach(({ sel, symbols, colors }) => {
    document.querySelectorAll(sel).forEach(el => elementMap.set(el, { symbols, colors }));
  });

  const defaultSymbols = ['✦','✧','✿','♡','⋆'];
  const defaultColors  = ['#C8A0FF','#FFB0D8','#80E0B8','#FFE060','#A0D0FF'];

  document.addEventListener('click', e => {
    let config = null, node = e.target;
    while (node && node !== document.body) {
      if (elementMap.has(node)) { config = elementMap.get(node); break; }
      node = node.parentElement;
    }
    const { symbols, colors } = config || { symbols: defaultSymbols, colors: defaultColors };
    burst(e.clientX, e.clientY, symbols, colors);
  });
})();

// ── Card reveal (laboratorio) ────────────────────
(function () {
  document.querySelectorAll('.semilla-card').forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('revealed')) return;
      card.classList.add('revealed');
      setTimeout(() => card.classList.remove('revealed'), 3000);
    });
  });
})();

// ── Hamburger (móvil) ─────────────────────────────
(function () {
  const sidebar   = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  const overlay   = document.getElementById('sidebar-overlay');
  if (!sidebar || !hamburger || !overlay) return;

  function openSidebar()  { sidebar.classList.add('open');    overlay.classList.add('active');    hamburger.textContent = '✕'; }
  function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('active'); hamburger.textContent = '☰'; }

  hamburger.addEventListener('click', () => sidebar.classList.contains('open') ? closeSidebar() : openSidebar());
  overlay.addEventListener('click', closeSidebar);

  sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', closeSidebar));
})();

// ── Vitrina: trae en vivo el canal de Are.na ─────
(function () {
  const grid = document.getElementById('arena-grid');
  if (!grid) return;

  const channel = grid.dataset.arenaChannel;
  const channelUrl = grid.dataset.arenaUrl || `https://www.are.na/${channel}`;

  function emptyState(icon, textEs, textEn, hintEs, hintEn) {
    // hintEs/hintEn a veces traen HTML con comillas (ej. un <a href="...">),
    // así que hay que escaparlas para que no rompan los atributos data-*.
    const esc = s => s.replace(/"/g, '&quot;');
    const lang = currentLang();
    grid.innerHTML = `
      <div class="coming-soon-box arena-loading" style="grid-column:1/-1;">
        <span class="cs-icon">${icon}</span>
        <p class="i18n" data-es="${esc(textEs)}" data-en="${esc(textEn)}">${lang === 'en' ? textEn : textEs}</p>
        <small class="i18n" data-es="${esc(hintEs)}" data-en="${esc(hintEn)}">${lang === 'en' ? hintEn : hintEs}</small>
      </div>`;
  }

  function blockToCard(block) {
    const title = (block.title || block.generated_title || '').trim();
    const kind = block.class || block.base_class || block.type || 'block';

    const image =
      block?.image?.display?.url ||
      block?.image?.large?.url ||
      block?.image?.original?.url ||
      block?.attachment?.url ||
      null;

    // block?._links?.self?.href apunta al endpoint de la API (JSON, no una
    // página) — si el bloque no es un link en sí, mejor mandar al canal.
    const href = block?.source?.url || channelUrl;

    const textHtml = block?.content?.html || '';
    const textPlain = (block?.content?.plain || block?.description?.plain || '').trim();

    const media = image
      ? `<img src="${image}" alt="${title.replace(/"/g, '&quot;')}" loading="lazy">`
      : '';

    // Bloque de puro texto (sin imagen ni título): se muestra completo,
    // con sus párrafos, y a todo el ancho de la vitrina para que se lea bien.
    const isFullText = !image && !title && textHtml;

    let body = '';
    if (title || textPlain) {
      const content = title ? title : (isFullText ? textHtml : textPlain);
      body = `<div class="arena-card-body">
                <span class="arena-card-kind">${kind}</span>
                <div class="arena-card-title">${content}</div>
              </div>`;
    }

    // Por ahora los bloques de puro texto no enlazan a nada (eso se
    // decide después); el resto sí sigue llevando a su link/canal.
    if (isFullText) {
      const dateStr = formatBlockDate(block.created_at || block?.connection?.connected_at);
      const dateHtml = dateStr ? `<p class="arena-card-date">${dateStr}</p>` : '';
      body = `<div class="arena-card-body">
                <span class="arena-card-kind">${kind}</span>
                <div class="arena-card-title">${textHtml}</div>
                ${dateHtml}
              </div>`;
      return `<div class="arena-card arena-card-full">${body}</div>`;
    }

    return `<a class="arena-card" href="${href}" target="_blank" rel="noopener">${media}${body}</a>`;
  }

  fetch(`https://api.are.na/v3/channels/${channel}/contents?per=24`)
    .then(res => {
      if (!res.ok) throw new Error('arena request failed');
      return res.json();
    })
    .then(({ data }) => {
      if (!data || data.length === 0) {
        emptyState('🔭', 'todavía no hay nada aquí', 'there\'s nothing here yet', 'vuelve pronto', 'come back soon');
        return;
      }
      grid.innerHTML = data.map(blockToCard).join('');
    })
    .catch(() => {
      emptyState('🔭', 'no se pudo cargar la vitrina ahora mismo', 'couldn\'t load this right now', 'vuelve pronto', 'come back soon');
    });
})();

// ── Wiki-links estilo Obsidian: [[Título]] dentro de una memoria ──
(function () {
  const container = document.querySelector('.post-content');
  const indexEl = document.getElementById('wiki-index');
  if (!container || !indexEl) return;

  let items;
  try {
    items = JSON.parse(indexEl.textContent);
  } catch (e) {
    return;
  }

  const norm = s => s.trim().toLowerCase();
  const byTitle = new Map();
  items.forEach(({ title, url }) => {
    if (title) byTitle.set(norm(title), url);
  });

  const WIKI_LINK = /\[\[(.+?)\]\]/g;

  function linkify(text) {
    const frag = document.createDocumentFragment();
    let lastIndex = 0;
    let match;

    WIKI_LINK.lastIndex = 0;
    while ((match = WIKI_LINK.exec(text))) {
      if (match.index > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }

      const [target, alias] = match[1].split('::').map(s => s.trim());
      const url = byTitle.get(norm(target));

      if (url) {
        const a = document.createElement('a');
        a.className = 'wiki-link';
        a.href = url;
        a.textContent = alias || target;
        frag.appendChild(a);
      } else {
        const span = document.createElement('span');
        span.className = 'wiki-link wiki-link-missing';
        span.title = 'todavía no existe esta página';
        span.textContent = alias || target;
        frag.appendChild(span);
      }

      lastIndex = WIKI_LINK.lastIndex;
    }

    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    return frag;
  }

  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (WIKI_LINK.test(node.nodeValue)) {
        node.parentNode.replaceChild(linkify(node.nodeValue), node);
      }
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.tagName === 'A' || node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
    Array.from(node.childNodes).forEach(walk);
  }

  walk(container);
})();

// ── Memorias por tag (/blog/tag/?t=...) ──────────
(function () {
  const results = document.getElementById('tag-results');
  const titleEl = document.getElementById('tag-title');
  const dataEl = document.getElementById('posts-data');
  if (!results || !titleEl || !dataEl) return;

  let posts = [];
  try {
    posts = JSON.parse(dataEl.textContent);
  } catch (e) {
    posts = [];
  }

  function fechaEs(iso) {
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} de ${meses[m - 1]} de ${y}`;
  }

  const tag = new URLSearchParams(window.location.search).get('t');

  if (!tag) {
    results.innerHTML = '<div class="blog-coming reveal"><span class="bc-icon">🔎</span><p>no se especificó ningún tag</p></div>';
    return;
  }

  titleEl.innerHTML = `Memorias con <em>${tag.replace(/_/g, ' ')}</em>`;

  const matches = posts.filter(p => Array.isArray(p.tags) && p.tags.includes(tag));

  if (matches.length === 0) {
    results.innerHTML = '<div class="blog-coming reveal"><span class="bc-icon">🔎</span><p>todavía no hay memorias con este tag</p></div>';
    return;
  }

  results.innerHTML = matches.map(post => `
    <article class="blog-entry reveal">
      <span class="entry-date">${fechaEs(post.date)}</span>
      <a class="entry-title" href="${post.url}">${post.title}</a>
      <p class="entry-excerpt">${post.excerpt}</p>
    </article>
  `).join('');
})();

// ── Switch de idioma ES/EN ────────────────────────
// Textos marcados con class="i18n" data-en="..." cambian de idioma;
// todo lo demás (memorias, descripciones de proyectos, el texto del
// hero) se queda en español hasta que se le agregue su propio data-en.
(function () {
  const STORAGE_KEY = 'site-lang';
  const buttons = document.querySelectorAll('.lang-btn');
  if (!buttons.length) return;

  function applyLang(lang) {
    document.querySelectorAll('.i18n').forEach(el => {
      // Contenido escrito en el HTML: la primera vez que se toca,
      // captura lo que ya había ahí como el original en español.
      // Contenido generado por JS puede traer su propio data-es
      // explícito en vez de depender de esta captura perezosa.
      if (el.dataset.es === undefined && el.dataset.esOriginal === undefined) {
        el.dataset.esOriginal = el.innerHTML;
      }
      const es = el.dataset.es !== undefined ? el.dataset.es : el.dataset.esOriginal;
      const en = el.dataset.en;
      el.innerHTML = (lang === 'en' && en) ? en : es;
    });

    buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
    document.documentElement.setAttribute('lang', lang);

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  let saved = 'es';
  try { saved = localStorage.getItem(STORAGE_KEY) || 'es'; } catch (e) {}
  applyLang(saved);
})();
