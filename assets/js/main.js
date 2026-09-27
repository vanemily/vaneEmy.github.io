// ── Movimiento reducido (preferencia del sistema) ──
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Idioma actual (usado por cualquier contenido que se genera con JS) ──
function currentLang() {
  try {
    return localStorage.getItem('site-lang') || 'es';
  } catch (e) {
    return 'es';
  }
}

// ── Escapa texto antes de meterlo en innerHTML ──
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Aviso para lectores de pantalla en enlaces que abren otra pestaña ──
const NEW_TAB_ES = ' (se abre en otra pestaña)';
const NEW_TAB_EN = ' (opens in a new tab)';

function newTabHint() {
  const text = currentLang() === 'en' ? NEW_TAB_EN : NEW_TAB_ES;
  return `<span class="sr-only i18n" data-es="${NEW_TAB_ES}" data-en="${NEW_TAB_EN}">${text}</span>`;
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

  if (reduceMotion) {
    target.textContent = text;
    return;
  }

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

  // Es un <a> real: sin JS (o con Cmd/Ctrl+clic) navega normal.
  // Con JS, primero se cae al hoyo y luego sigue el enlace.
  rabbit.addEventListener('click', e => {
    if (reduceMotion || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (rabbitBusy) return;
    rabbitBusy = true;

    rabbit.classList.add('falling');

    setTimeout(() => {
      window.location.href = rabbit.href;
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
      s.setAttribute('aria-hidden', 'true');
      section.appendChild(s);
    }
  }

  if (!reduceMotion) document.querySelectorAll('.room').forEach(r => scatterStars(r, 8));
})();

// ── Sparkle on click ──────────────────────────────
(function () {
  function burst(x, y, symbols, colors) {
    for (let i = 0; i < 7; i++) {
      const el = document.createElement('span');
      el.className = 'sparkle';
      el.setAttribute('aria-hidden', 'true');
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
    if (reduceMotion) return;
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
  // Abre y cierra el mensaje escondido (sin temporizador, para que
  // cualquiera tenga el tiempo que necesite para leerlo).
  document.querySelectorAll('.semilla-toggle').forEach(btn => {
    const card = btn.closest('.semilla-card');
    btn.addEventListener('click', () => {
      const open = card.classList.toggle('revealed');
      btn.setAttribute('aria-expanded', String(open));
    });
  });
})();

// ── Hamburger (móvil) ─────────────────────────────
(function () {
  const sidebar   = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  const overlay   = document.getElementById('sidebar-overlay');
  if (!sidebar || !hamburger || !overlay) return;

  const icon   = hamburger.querySelector('.hamburger-icon');
  const mobile = window.matchMedia('(max-width: 720px)');

  // En móvil el sidebar cerrado queda fuera de pantalla: con `inert`
  // sus enlaces tampoco reciben foco con Tab ni los lee el lector.
  function syncInert() {
    sidebar.inert = mobile.matches && !sidebar.classList.contains('open');
  }

  function setLabel(open) {
    const en = currentLang() === 'en';
    hamburger.setAttribute('aria-label', open
      ? (en ? 'Close menu' : 'Cerrar menú')
      : (en ? 'Open menu'  : 'Abrir menú'));
  }

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    icon.textContent = '✕';
    hamburger.setAttribute('aria-expanded', 'true');
    setLabel(true);
    syncInert();
    const first = sidebar.querySelector('a');
    if (first) first.focus();
  }

  function closeSidebar({ returnFocus = false } = {}) {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    icon.textContent = '☰';
    hamburger.setAttribute('aria-expanded', 'false');
    setLabel(false);
    syncInert();
    if (returnFocus) hamburger.focus();
  }

  hamburger.addEventListener('click', () => sidebar.classList.contains('open') ? closeSidebar() : openSidebar());
  overlay.addEventListener('click', () => closeSidebar());

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar({ returnFocus: true });
  });

  sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeSidebar()));

  // Si la ventana pasa de móvil a escritorio (o al revés), recalcular.
  mobile.addEventListener('change', () => {
    if (!mobile.matches) closeSidebar();
    syncInert();
  });

  // Etiqueta en el idioma actual cuando cambian ES/EN.
  document.addEventListener('langchange', () => setLabel(sidebar.classList.contains('open')));

  setLabel(false);
  syncInert();
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
        <span class="cs-icon" aria-hidden="true">${icon}</span>
        <p class="i18n" data-es="${esc(textEs)}" data-en="${esc(textEn)}">${lang === 'en' ? textEn : textEs}</p>
        <small class="i18n" data-es="${esc(hintEs)}" data-en="${esc(hintEn)}">${lang === 'en' ? hintEn : hintEs}</small>
      </div>`;
  }

  const status = document.getElementById('arena-status');
  const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  function announce(textEs, textEn) {
    grid.setAttribute('aria-busy', 'false');
    if (status) status.textContent = currentLang() === 'en' ? textEn : textEs;
  }

  // Títulos que en realidad son nombres de archivo ("IMG_2034.jpg") no
  // sirven como texto alternativo.
  function looksLikeFilename(s) {
    return /\.(jpe?g|png|gif|webp|avif|heic|svg)$/i.test(s) || /^(img|dsc|screenshot|captura)[\s_-]?\d/i.test(s);
  }

  // Tipo de bloque de Are.na → etiqueta en español / inglés
  const KINDS = {
    Text: ['texto', 'text'], Image: ['imagen', 'image'], Link: ['enlace', 'link'],
    Attachment: ['archivo', 'file'], Embed: ['video', 'embed'], Media: ['video', 'media'],
    Channel: ['canal', 'channel'],
  };

  function kindLabel(kind) {
    const [es, en] = KINDS[kind] || [kind, kind];
    const lang = currentLang();
    return `<span class="arena-card-kind i18n" lang="${lang}" data-es="${escHtml(es)}" data-en="${escHtml(en)}">${escHtml(lang === 'en' ? en : es)}</span>`;
  }

  function blockToCard(block) {
    const title = escHtml((block.title || block.generated_title || '').trim());
    const kind = kindLabel(block.class || block.base_class || block.type || 'block');

    // API v3: las imágenes vienen en image.src / image.medium.src.
    // Se dejan los campos de la v2 como respaldo.
    const image =
      block?.image?.medium?.src ||
      block?.image?.large?.src ||
      block?.image?.src ||
      block?.image?.display?.url ||
      block?.image?.large?.url ||
      block?.image?.original?.url ||
      block?.attachment?.url ||
      null;

    // block?._links?.self?.href apunta al endpoint de la API (JSON, no una
    // página) — si el bloque no es un link en sí, mejor mandar al canal.
    const href = block?.source?.url || channelUrl;

    const textHtml = block?.content?.html || '';
    const textPlain = escHtml((block?.content?.plain || block?.description?.plain || '').trim());

    // Texto alternativo: primero el "alt text" que se escribe en Are.na;
    // si no hay, el título (si no es un nombre de archivo); si no, vacío.
    // (title ya viene escapado)
    const altText = escHtml((block?.image?.alt_text || '').trim()) ||
      (title && !looksLikeFilename(title) ? title : '');

    const media = image
      ? `<img src="${escAttr(image)}" alt="${altText}" loading="lazy">`
      : '';

    // Bloque de puro texto (sin imagen, con o sin título): se muestra
    // completo, con sus párrafos, y a todo el ancho de la vitrina para
    // que se lea bien. Por ahora no enlaza a nada (eso se activa después).
    const isFullText = !image && textHtml;

    if (isFullText) {
      const when = block.created_at || block?.connection?.connected_at;
      const dateStr = formatBlockDate(when);
      const dateHtml = dateStr
        ? `<p class="arena-card-date" lang="${currentLang()}"><time datetime="${escAttr(when)}">${dateStr}</time></p>`
        : '';
      const titleHtml = title ? `<h2 class="arena-card-heading">${title}</h2>` : '';
      const body = `<div class="arena-card-body">
                ${kind}
                ${titleHtml}
                <div class="arena-card-title">${textHtml}</div>
                ${dateHtml}
              </div>`;
      return `<article class="arena-card arena-card-full" lang="es">${body}</article>`;
    }

    let body = '';
    const content = title || textPlain;
    if (content) {
      body = `<div class="arena-card-body">
                ${kind}
                <div class="arena-card-title">${content}</div>
              </div>`;
    }

    // Un enlace nunca puede quedarse sin nombre: si no hay texto visible
    // ni alt, se le da uno con aria-label (que cambia con ES/EN).
    const labelEs = 'Abrir bloque en Are.na' + NEW_TAB_ES;
    const labelEn = 'Open block on Are.na' + NEW_TAB_EN;
    const label = !content && !altText
      ? ` aria-label="${currentLang() === 'en' ? labelEn : labelEs}" data-es-label="${labelEs}" data-en-label="${labelEn}"`
      : '';

    return `<a class="arena-card" lang="es" href="${escAttr(href)}" target="_blank" rel="noopener"${label}>${media}${body}${newTabHint()}</a>`;
  }

  fetch(`https://api.are.na/v3/channels/${channel}/contents?per=24`)
    .then(res => {
      if (!res.ok) throw new Error('arena request failed');
      return res.json();
    })
    .then(({ data }) => {
      if (!data || data.length === 0) {
        emptyState('🔭', 'todavía no hay nada aquí', 'there\'s nothing here yet', 'vuelve pronto', 'come back soon');
        announce('todavía no hay nada aquí', 'there\'s nothing here yet');
        return;
      }
      grid.innerHTML = data.map(blockToCard).join('');
      announce(`se cargaron ${data.length} curiosidades`, `${data.length} curiosities loaded`);
    })
    .catch(() => {
      emptyState('🔭', 'no se pudo cargar la vitrina ahora mismo', 'couldn\'t load this right now', 'vuelve pronto', 'come back soon');
      announce('no se pudo cargar la vitrina ahora mismo', 'couldn\'t load this right now');
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
        // El title no llega al teclado ni al móvil: el aviso va también como texto.
        const hint = document.createElement('span');
        hint.className = 'sr-only';
        hint.textContent = ' (todavía no existe esta página)';
        span.appendChild(hint);
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
    results.innerHTML = '<div class="blog-coming"><span class="bc-icon" aria-hidden="true">🔎</span><p>no se especificó ningún tag</p></div>';
    return;
  }

  // El tag viene de la URL: siempre como texto, nunca como HTML.
  const tagName = tag.replace(/_/g, ' ');
  const em = document.createElement('em');
  em.textContent = tagName;
  titleEl.replaceChildren('Memorias con ', em);
  document.title = document.title.replace(/^[^·]+/, `Memorias con ${tagName} `);

  const matches = posts.filter(p => Array.isArray(p.tags) && p.tags.includes(tag));

  if (matches.length === 0) {
    results.innerHTML = '<div class="blog-coming"><span class="bc-icon" aria-hidden="true">🔎</span><p>todavía no hay memorias con este tag</p></div>';
    return;
  }

  results.innerHTML = matches.map(post => `
    <article class="blog-entry">
      <time class="entry-date" datetime="${escHtml(post.date)}">${fechaEs(post.date)}</time>
      <a class="entry-title" href="${escHtml(post.url)}">${escHtml(post.title)}</a>
      <p class="entry-excerpt">${escHtml(post.excerpt)}</p>
    </article>
  `).join('');
})();

// ── Enlaces que abren otra pestaña: avisar al lector de pantalla ──
// (va antes del switch de idioma para que el aviso también se traduzca;
// las tarjetas de Are.na lo traen incluido al generarse)
(function () {
  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    a.insertAdjacentHTML('beforeend', newTabHint());
  });
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
      const showEn = lang === 'en' && en;
      el.innerHTML = showEn ? en : es;
      // Marca el idioma de cada texto traducido, por si está dentro de un
      // bloque con lang="es" (así el lector usa la voz correcta).
      el.setAttribute('lang', showEn ? 'en' : 'es');
    });

    // Etiquetas accesibles (aria-label) con su versión en inglés en data-en-label.
    document.querySelectorAll('[data-en-label]').forEach(el => {
      if (el.dataset.esLabel === undefined) el.dataset.esLabel = el.getAttribute('aria-label') || '';
      el.setAttribute('aria-label', lang === 'en' ? el.dataset.enLabel : el.dataset.esLabel);
    });

    buttons.forEach(btn => {
      const on = btn.dataset.lang === lang;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    document.documentElement.setAttribute('lang', lang);

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}

    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  let saved = 'es';
  try { saved = localStorage.getItem(STORAGE_KEY) || 'es'; } catch (e) {}
  applyLang(saved);
})();
