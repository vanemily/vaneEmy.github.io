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

// ── Conejo ────────────────────────────────────────
// Por ahora vive quieto en la esquina de abajo a la derecha y, si le das
// clic, sonríe. El código del paseo (salir de un hoyo, dar una vuelta
// saltando y regresar) está apagado: para encenderlo, ROAM = true y
// descomentar el hoyo en _includes/rabbit.html.
(function () {
  const ROAM = false;

  const rabbit = document.getElementById('rabbit');
  const hole = document.querySelector('.rabbit-hole');
  if (!rabbit) return;

  // Clic → sonríe un ratito; al quinto clic seguido se mete al hoyo y
  // lleva a «sobre mí»
  const CLICS = 5;
  let smileTimer = null, clics = 0, lastClick = 0, leaving = false;
  rabbit.addEventListener('click', () => {
    if (leaving) return;
    const now = Date.now();
    clics = now - lastClick < 2000 ? clics + 1 : 1;
    lastClick = now;
    if (clics >= CLICS && rabbit.dataset.href) {
      leaving = true;
      rabbit.classList.add('falling');
      setTimeout(() => { window.location.href = rabbit.dataset.href; }, reduceMotion ? 0 : 800);
      return;
    }
    rabbit.classList.remove('smiling');
    void rabbit.offsetWidth; // reinicia la animación si lo vuelven a tocar
    rabbit.classList.add('smiling');
    clearTimeout(smileTimer);
    smileTimer = setTimeout(() => rabbit.classList.remove('smiling'), 1800);
  });

  if (reduceMotion || !ROAM || !hole) return;

  let x = 0, y = 0;     // posición actual (px, esquina superior izquierda)
  let paused = false;   // quieto mientras el mouse o el foco están encima
  let hidden = true;    // metido en su hoyo
  let busy = false;
  let timer = null;

  const wait = ms => new Promise(r => { timer = setTimeout(r, ms); });
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const cssPx = name => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;

  // Zona donde puede andar: la ventana sin el banner, el menú lateral ni el pie
  function bounds() {
    const w = rabbit.offsetWidth, h = rabbit.offsetHeight;
    const minX = cssPx('--sidebar-w') + 16, minY = cssPx('--banner-h') + 16;
    return {
      minX, minY,
      maxX: Math.max(minX, window.innerWidth - w - 16),
      maxY: Math.max(minY, window.innerHeight - cssPx('--footer-h') - h - 8),
    };
  }

  // Lugar justo encima del hoyo
  function home() {
    const r = hole.getBoundingClientRect();
    return [r.left + r.width / 2 - rabbit.offsetWidth / 2, r.top - rabbit.offsetHeight + 8];
  }


  function place(nx, ny, ms) {
    rabbit.style.transition = ms ? `transform ${ms}ms linear, filter 0.2s` : '';
    rabbit.style.transform = `translate(${nx}px, ${ny}px)`;
    x = nx; y = ny;
  }

  // Salta hasta (nx, ny); el dibujo mira a la izquierda, así que se voltea al ir a la derecha
  async function hopTo(nx, ny, speed = 5) {
    const ms = Math.max(450, Math.hypot(nx - x, ny - y) * speed);
    if (Math.abs(nx - x) > 2) rabbit.classList.toggle('facing-right', nx > x);
    rabbit.classList.add('hopping');
    place(nx, ny, ms);
    await wait(ms);
    rabbit.classList.remove('hopping');
  }

  // Sale de su hoyo (si alguien lo despierta lejos de casa, sale donde esté)
  async function popOut() {
    if (!hidden) return;
    hidden = false;
    rabbit.classList.remove('is-hidden', 'hiding');
    rabbit.classList.add('popping');
    await sleep(500);
    rabbit.classList.remove('popping');
  }

  // Regresa a casa y se mete; si lo atrapan en el camino, se queda afuera
  async function goHome() {
    await hopTo(...home());
    if (paused || busy) return;
    await wait(500);
    if (paused || busy) return;
    rabbit.classList.add('hiding');
    await wait(600);
    rabbit.classList.add('is-hidden');
    rabbit.classList.remove('hiding');
    hidden = true;
  }

  async function holdWhilePaused() {
    while (paused && !busy) await wait(500);
  }

  async function roam() {
    await wait(rand(2000, 5000));
    while (!busy) {
      if (document.hidden) { await wait(1000); continue; }
      await holdWhilePaused();
      if (busy) return;

      if (hidden) {
        place(...home(), 0);
        rabbit.classList.remove('facing-right');
        await popOut();
      }

      // Da una vuelta: unos saltos por la pantalla, descansando entre uno y otro
      const hops = Math.round(rand(3, 6));
      for (let i = 0; i < hops && !busy; i++) {
        await wait(rand(1200, 3000));
        await holdWhilePaused();
        if (busy) return;
        const b = bounds();
        await hopTo(
          clamp(x + rand(-320, 220), b.minX, b.maxX),
          clamp(y + rand(-220, 160), b.minY, b.maxY)
        );
      }

      await wait(rand(800, 2000));
      await holdWhilePaused();
      if (busy) return;

      await goHome();
      if (hidden) await wait(rand(5000, 12000));
    }
  }

  // Se detiene donde va para que sea fácil atraparlo; si estaba escondido, sale
  function pause() {
    if (busy) return;
    paused = true;
    const m = new DOMMatrixReadOnly(getComputedStyle(rabbit).transform);
    rabbit.classList.remove('hopping');
    place(m.m41, m.m42, 0);
    popOut();
  }

  rabbit.addEventListener('mouseenter', pause);
  rabbit.addEventListener('focus', pause);
  rabbit.addEventListener('mouseleave', () => { paused = document.activeElement === rabbit; });
  rabbit.addEventListener('blur', () => { paused = false; });

  // Si la ventana cambia de tamaño, que no se quede afuera
  window.addEventListener('resize', () => {
    if (hidden) { place(...home(), 0); return; }
    const b = bounds();
    place(clamp(x, b.minX, b.maxX), clamp(y, b.minY, b.maxY), 0);
  });

  rabbit.classList.remove('resting');
  rabbit.classList.add('is-hidden');
  place(...home(), 0);
  roam();

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
    { sel: '#rabbit',                 symbols: ['♡','💕','✿','🥕'],          colors: ['#F2A7C8','#E87FAE','#FFB0D8'] },
    { sel: '.letter',                 symbols: ['✦','✧','⋆','·','★'],        colors: ['#C8A0FF','#FFB0D8','#80E0B8','#FFE060'] },
    { sel: '.passion-tag:nth-child(5n+1)', symbols: ['✦','✧','🎨'],             colors: ['#C8A0FF','#B090E0'] },
    { sel: '.passion-tag:nth-child(5n+2)', symbols: ['🎵','🎶','♪','♫'],        colors: ['#FFB0D8','#FF90C0'] },
    { sel: '.passion-tag:nth-child(5n+3)', symbols: ['✿','🌀','💫'],             colors: ['#80E0B8','#60C090'] },
    { sel: '.passion-tag:nth-child(5n+4)', symbols: ['✧','⋆','🌟'],             colors: ['#FFE060','#F0C020'] },
    { sel: '.passion-tag:nth-child(5n+5)', symbols: ['🌙','⭐','✦'],            colors: ['#A0C0FF','#8090E0'] },
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

// ── Dibujitos del menú (disco y librito) ─────────
// Al tocarlos se muestra / esconde su globito (para el celular, donde no
// hay mouse). El disco, cada vez que el mouse o el teclado llegan a
// ellas, muestran un artista al azar (sin repetir el anterior).
(function () {
  const dibujos = document.querySelectorAll('.dibujo');
  if (!dibujos.length) return;

  dibujos.forEach(d => d.addEventListener('click', () => d.classList.toggle('abierto')));
  document.addEventListener('click', e => {
    dibujos.forEach(d => { if (!d.contains(e.target)) d.classList.remove('abierto'); });
  });

  const notas = document.querySelector('.dibujo-musica');
  if (!notas) return;
  const artistas = notas.dataset.artistas.split('|');
  const texto = notas.querySelector('.dibujo-globo em');
  let actual = texto.textContent;

  function otroArtista() {
    const opciones = artistas.filter(a => a !== actual);
    actual = opciones[Math.floor(Math.random() * opciones.length)];
    texto.textContent = actual;
  }

  notas.addEventListener('mouseenter', otroArtista);
  notas.addEventListener('focus', otroArtista);
  notas.addEventListener('click', () => { if (notas.classList.contains('abierto')) otroArtista(); });
  otroArtista();
})();

// ── Botón ☰: menú lateral ─────────────────────────
// En el celular abre el menú encima de la página (con fondo oscuro).
// En computadora lo esconde o lo muestra, y se recuerda entre páginas.
(function () {
  const sidebar   = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  const overlay   = document.getElementById('sidebar-overlay');
  if (!sidebar || !hamburger || !overlay) return;

  const root   = document.documentElement;
  const icon   = hamburger.querySelector('.hamburger-icon');
  const mobile = window.matchMedia('(max-width: 720px)');

  const isOpen = () => mobile.matches
    ? sidebar.classList.contains('open')
    : !root.classList.contains('menu-cerrado');

  // Menú fuera de pantalla: con `inert` sus enlaces tampoco reciben foco
  // con Tab ni los lee el lector de pantalla.
  function sync() {
    const open = isOpen();
    sidebar.inert = !open;
    hamburger.setAttribute('aria-expanded', String(open));
    icon.textContent = open && mobile.matches ? '✕' : '☰';
    const en = currentLang() === 'en';
    hamburger.setAttribute('aria-label', mobile.matches
      ? (open ? (en ? 'Close menu' : 'Cerrar menú') : (en ? 'Open menu' : 'Abrir menú'))
      : (open ? (en ? 'Hide menu' : 'Ocultar menú') : (en ? 'Show menu' : 'Mostrar menú')));
  }

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    sync();
    const first = sidebar.querySelector('a');
    if (first) first.focus();
  }

  function closeSidebar({ returnFocus = false } = {}) {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    sync();
    if (returnFocus) hamburger.focus();
  }

  function toggleDesktop() {
    const closed = root.classList.toggle('menu-cerrado');
    try { localStorage.setItem('menu-cerrado', closed ? '1' : '0'); } catch (e) {}
    sync();
  }

  hamburger.addEventListener('click', () => {
    if (!mobile.matches) return toggleDesktop();
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  overlay.addEventListener('click', () => closeSidebar());

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobile.matches && sidebar.classList.contains('open')) closeSidebar({ returnFocus: true });
  });

  sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    if (mobile.matches) closeSidebar();
  }));

  // Si la ventana pasa de móvil a escritorio (o al revés), recalcular.
  mobile.addEventListener('change', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    sync();
  });

  // Etiqueta en el idioma actual cuando cambian ES/EN.
  document.addEventListener('langchange', sync);

  sync();
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

  // El botón cubre toda la tarjeta y no se ve; su texto es solo para
  // lectores de pantalla.
  function moreLabel() {
    const [es, en] = ['leer completo', 'read it all'];
    return `<span class="sr-only i18n" data-es="${es}" data-en="${en}">${currentLang() === 'en' ? en : es}</span>`;
  }

  // Modal para leer un texto completo. <dialog> ya se encarga de cerrar
  // con Esc, dejar el foco dentro y devolverlo al botón al cerrarse.
  const modal = document.createElement('dialog');
  modal.className = 'arena-modal';
  modal.setAttribute('lang', 'es');
  modal.innerHTML = `
    <div class="arena-modal-inner">
      <button type="button" class="arena-modal-close" aria-label="Cerrar" data-en-label="Close"><span aria-hidden="true">✕</span></button>
      <div class="arena-modal-body"></div>
    </div>`;
  document.body.appendChild(modal);
  const modalBody = modal.querySelector('.arena-modal-body');

  modal.querySelector('.arena-modal-close').addEventListener('click', () => modal.close());
  // Clic en el fondo oscuro (fuera de la tarjeta) también cierra
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });

  grid.addEventListener('click', e => {
    const btn = e.target.closest('.arena-card-more');
    if (!btn) return;
    const card = btn.closest('.arena-card-text');
    const pick = sel => card.querySelector(sel)?.outerHTML || '';
    modalBody.innerHTML =
      pick('.arena-card-kind') + pick('.arena-card-heading') +
      `<div class="arena-modal-text">${card.querySelector('.arena-card-title').innerHTML}</div>` +
      pick('.arena-card-date');

    const heading = modalBody.querySelector('.arena-card-heading');
    if (heading) {
      heading.id = 'arena-modal-title';
      modal.setAttribute('aria-labelledby', heading.id);
      modal.removeAttribute('aria-label');
    } else {
      modal.removeAttribute('aria-labelledby');
      modal.setAttribute('aria-label', currentLang() === 'en' ? 'Text' : 'Texto');
    }
    modal.showModal();
    modalBody.scrollTop = 0;
  });

  // Los textos que caben completos en la tarjeta no necesitan "leer completo"
  function markShortTexts() {
    grid.querySelectorAll('.arena-card-text').forEach(card => {
      const text = card.querySelector('.arena-card-title');
      card.classList.toggle('fits', text.scrollHeight <= text.clientHeight + 1);
    });
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

    // Bloque de puro texto (sin imagen, con o sin título): es una tarjeta
    // más de la cuadrícula y solo enseña el principio; el botón "leer
    // completo" la abre a todo el ancho para leerla con calma.
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
                <button type="button" class="arena-card-more" aria-haspopup="dialog">${moreLabel()}</button>
                ${dateHtml}
              </div>`;
      return `<article class="arena-card arena-card-text" lang="es">${body}</article>`;
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

  // Solo los 6 más recientes: dos filas de 3 tarjetas
  fetch(`https://api.are.na/v3/channels/${channel}/contents?per=6`)
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
      markShortTexts();
      if (document.fonts) document.fonts.ready.then(markShortTexts);
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
