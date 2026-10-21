/* ==========================================================================
   Abdullah Lutfi — portfolio behaviour. Vanilla JS, no build step.
   Content lives in js/data.js.
   ========================================================================== */
(() => {
  "use strict";

  const S = window.SITE;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const pad2 = (n) => String(n).padStart(2, "0");

  /* ---------- Safe localStorage ---------- */
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* storage unavailable: ignore */
      }
    },
  };

  /* ---------- Icons ---------- */
  const ICONS = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z"/>',
    globe:
      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 4.2 6.2 4.2 9S15 17.8 12 21M12 3C9 6.2 7.8 9.2 7.8 12S9 17.8 12 21"/>',
    arrow: '<path d="M5 19 19 5M9 5h10v10"/>',
    shuffle:
      '<path d="M3 7h3c5 0 5 10 10 10h5M18 14l3 3-3 3M3 17h3c2.2 0 3.4-1.9 4.6-4M15 7h6M18 4l3 3-3 3"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    heart:
      '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    thumbDown:
      '<path d="M7 3v12M3 4h4v11H3zM7 5c3-2 8-2 10-1 1 .5 1.5 1.4 1.2 2.5L17 11h2c1.7 0 2.5 1.8 1.5 3.1L15 21c-.7.9-2.2.4-2.1-.8l.4-5.2H7"/>',
    close: '<path d="M5 5l14 14M19 5 5 19"/>',
    chevL: '<path d="m15 5-7 7 7 7"/>',
    chevR: '<path d="m9 5 7 7-7 7"/>',
    menu: '<path d="M4 8h16M4 16h16"/>',
  };
  const icon = (name) =>
    `<svg class="i i-${name}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

  /* ---------- State ---------- */
  const state = {
    lang: store.get("lang", "en") === "ar" ? "ar" : "en",
    theme: store.get("theme", "dark") === "light" ? "light" : "dark",
    filter: "all",
    deckIndex: 0,
    fanned: false,
    selected: null,
    liked: new Set(store.get("liked", [])),
    disliked: new Set(store.get("disliked", [])),
    popped: new Set(),
    owner: false,
    adminKey: "",
    comments: [],
    commentsLoading: false,
    draft: "",
    status: "",
    copied: false,
    opener: null,
  };

  /* ---------- i18n helpers ---------- */
  const dict = () => S.i18n[state.lang];
  function t(path) {
    const walk = (obj) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
    const v = walk(dict());
    return v == null ? walk(S.i18n.en) : v;
  }
  const localize = (p) => (state.lang === "ar" ? { ...p, ...(S.projectsAr[p.id] || {}) } : p);
  const imgUrl = (p, w) => `${p.image}?scale-down-to=${w}&width=${p.w}&height=${p.h}`;
  const isRtl = () => state.lang === "ar";

  /* ---------- Element refs ---------- */
  const el = {
    nav: $("#nav"),
    themeBtn: $("#theme-toggle"),
    langBtn: $("#lang-toggle"),
    menuBtn: $("#menu-toggle"),
    deck: $("#deck"),
    deckShuffle: $("#deck-shuffle"),
    deckFan: $("#deck-fan"),
    deckCount: $("#deck-count"),
    funBtn: $("#fun-btn"),
    filters: $("#filters"),
    grid: $("#grid"),
    workCount: $("#work-count"),
    facts: $("#facts"),
    tools: $("#tools"),
    socials: $("#socials"),
    mailLink: $("#mail-link"),
    copyBtn: $("#copy-email"),
    lightbox: $("#lightbox"),
    sheet: $("#lightbox-sheet"),
    stickers: $("#sticker-layer"),
  };

  /* ====================================================================
     Static + localised UI
     ==================================================================== */
  function applyChrome() {
    const root = document.documentElement;
    root.lang = state.lang;
    root.dir = isRtl() ? "rtl" : "ltr";
    root.dataset.theme = state.theme;
    document.title = t("meta.title");
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = state.theme === "dark" ? "#1A1318" : "#F8EEE9";

    $$("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    $$("[data-i18n-aria]").forEach((node) => {
      node.setAttribute("aria-label", t(node.dataset.i18nAria));
    });

    el.themeBtn.innerHTML = icon(state.theme === "dark" ? "sun" : "moon");
    const themeLabel = state.theme === "dark" ? t("theme.toLight") : t("theme.toDark");
    el.themeBtn.setAttribute("aria-label", themeLabel);
    el.themeBtn.title = themeLabel;

    el.langBtn.innerHTML = icon("globe");
    el.langBtn.setAttribute("aria-label", t("languageLabel"));
    el.langBtn.title = t("language");

    el.menuBtn.innerHTML = icon("menu");
    el.menuBtn.setAttribute("aria-label", t("nav.menu"));

    el.deckShuffle.innerHTML = `${icon("shuffle")}<span>${t("hero.shuffle")}</span>`;
    updateFanButton();
    renderCopyLabel();
  }

  function updateFanButton() {
    el.deckFan.innerHTML = `${icon("layers")}<span>${state.fanned ? t("hero.stack") : t("hero.fan")}</span>`;
    el.deckFan.setAttribute("aria-pressed", String(state.fanned));
  }

  function renderCopyLabel() {
    el.copyBtn.textContent = state.copied ? t("contact.copied") : t("contact.copyEmail");
  }

  /* ---------- Filters ---------- */
  function renderFilters() {
    const keys = ["all", "oil", "poster", "mulearn"];
    el.filters.innerHTML = keys
      .map(
        (k) =>
          `<button class="filter" type="button" data-filter="${k}" aria-pressed="${state.filter === k}">${t(
            "work.filters." + k,
          )}</button>`,
      )
      .join("");
  }

  /* ---------- Poster deck ---------- */
  function buildDeck() {
    el.deck.innerHTML = S.projects
      .map((p, i) => {
        const lp = localize(p);
        return `<button class="deck-item" type="button" data-deck="${i}">
          <img src="${imgUrl(p, 700)}" alt="" width="${p.w}" height="${p.h}" ${i === 0 ? "" : 'loading="lazy"'} decoding="async" />
          <span class="deck-pill"><span data-deck-title>${lp.title}</span><span aria-hidden="true">↗</span></span>
        </button>`;
      })
      .join("");
    updateDeck();
  }

  function updateDeck() {
    const n = S.projects.length;
    el.deck.classList.toggle("is-fanned", state.fanned);
    $$(".deck-item", el.deck).forEach((item, i) => {
      const p = S.projects[i];
      const lp = localize(p);
      const pos = (i - state.deckIndex + n) % n;
      item.style.setProperty("--pos", pos);
      item.style.setProperty("--fan", i - (n - 1) / 2);
      item.style.zIndex = n - pos;
      item.classList.toggle("is-front", pos === 0);
      item.setAttribute("aria-label", `${t("work.word")} ${lp.title}`);
      $("img", item).alt = lp.title;
      $("[data-deck-title]", item).textContent = lp.title;
    });
    el.deckCount.textContent = `${S.projects[state.deckIndex].number} / ${pad2(n)}`;
  }

  /* ---------- Work grid ---------- */
  const SPANS = [7, 4, 4, 7, 7, 4];
  const HEIGHTS = [640, 640, 520, 520, 600, 600];

  function reactionButtons(p) {
    const lp = localize(p);
    const liked = state.liked.has(p.id);
    const disliked = state.disliked.has(p.id);
    return `
      <button class="react" type="button" data-react="like" data-id="${p.id}" aria-pressed="${liked}"
        aria-label="${liked ? t("work.unlike") : t("work.like")} ${lp.title}">${icon("heart")}<span>${liked ? 1 : 0}</span></button>
      <button class="react" type="button" data-react="dislike" data-id="${p.id}" aria-pressed="${disliked}"
        aria-label="${disliked ? t("work.undislike") : t("work.dislike")} ${lp.title}">${icon("thumbDown")}<span>${disliked ? 1 : 0}</span></button>`;
  }

  function renderGrid() {
    const list = S.projects.filter((p) => state.filter === "all" || p.tag === state.filter);
    el.workCount.textContent = pad2(list.length);
    el.grid.innerHTML = list
      .map((p, i) => {
        const lp = localize(p);
        const alone = i === list.length - 1 && i % 2 === 0;
        const span = alone ? 7 : SPANS[i % SPANS.length];
        return `<article class="card" data-card="${p.id}" style="--span:${span};--h:${HEIGHTS[i % HEIGHTS.length]}px">
          <button class="card-thumb" type="button" data-open="${p.id}" aria-label="${t("work.open")} ${lp.title}">
            <img src="${imgUrl(p, 1024)}" alt="${lp.title}" width="${p.w}" height="${p.h}" loading="lazy" decoding="async" />
          </button>
          <div class="card-meta">
            <div>
              <h3>${lp.title}</h3>
              <p>${lp.category} · ${p.year}</p>
            </div>
            <div class="card-side">
              <span class="card-num">${p.number}</span>
              <div class="reactions">${reactionButtons(p)}</div>
            </div>
          </div>
        </article>`;
      })
      .join("");
  }

  function refreshReactions(id) {
    const card = $(`[data-card="${id}"]`, el.grid);
    const p = S.projects.find((x) => x.id === id);
    if (card && p) $(".reactions", card).innerHTML = reactionButtons(p);
  }

  function toggleReaction(kind, id) {
    const [mine, other] = kind === "like" ? [state.liked, state.disliked] : [state.disliked, state.liked];
    if (mine.has(id)) mine.delete(id);
    else {
      mine.add(id);
      other.delete(id);
    }
    store.set("liked", [...state.liked]);
    store.set("disliked", [...state.disliked]);
    refreshReactions(id);
    const next = $(`[data-react="${kind}"][data-id="${id}"]`, el.grid);
    if (next) next.focus();
  }

  /* ---------- About ---------- */
  function renderAbout() {
    const tiles = t("about.tiles");
    el.facts.innerHTML = tiles
      .map(
        (tile, i) =>
          `<div class="fact" data-sticker="${i}"><dt>${tile.title}</dt><dd>${tile.body}</dd></div>`,
      )
      .join("");
    const tools = t("about.tools");
    el.tools.innerHTML = tools
      .map(
        (name, i) =>
          `<button class="tool" type="button" data-tool="${i}" aria-pressed="${state.popped.has(i)}">${name}</button>`,
      )
      .join("");
  }

  function renderContact() {
    el.socials.innerHTML = S.socials
      .map(
        (s) =>
          `<li><a href="${s.href}" target="_blank" rel="noopener noreferrer">${s.label}<span aria-hidden="true"> ↗</span></a></li>`,
      )
      .join("");
    el.mailLink.href = `mailto:${S.email}`;
  }

  /* ====================================================================
     Stickers + copy
     ==================================================================== */
  function pointOf(event) {
    if (event.clientX || event.clientY) return { x: event.clientX, y: event.clientY };
    const r = event.currentTarget.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top };
  }
  function sticker(point, text) {
    const node = document.createElement("span");
    node.className = "sticker";
    node.textContent = text;
    const x = Math.min(Math.max(point.x, 90), window.innerWidth - 90);
    const y = Math.min(Math.max(point.y, 60), window.innerHeight - 40);
    node.style.left = x + "px";
    node.style.top = y + "px";
    el.stickers.appendChild(node);
    window.setTimeout(() => node.remove(), 1200);
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(S.email);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = S.email;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignore */
      }
      ta.remove();
    }
    state.copied = true;
    renderCopyLabel();
    window.setTimeout(() => {
      state.copied = false;
      renderCopyLabel();
    }, 1800);
  }

  /* ====================================================================
     Lightbox + comments wall
     ==================================================================== */
  const commentsApi = () => `https://${S.api.projectId}.supabase.co/functions/v1/${S.api.functionPath}`;
  const authHeaders = (extra = {}) => ({ Authorization: `Bearer ${S.api.anonKey}`, ...extra });

  function openProject(id, opener) {
    const p = S.projects.find((x) => x.id === id);
    if (!p) return;
    state.selected = p;
    if (opener) state.opener = opener;
    state.draft = "";
    state.status = "";
    state.comments = [];
    renderLightbox();
    el.lightbox.hidden = false;
    document.body.classList.add("is-locked");
    $(".lb-close", el.sheet).focus();
    loadComments(p.id);
  }

  function closeLightbox() {
    if (!state.selected) return;
    state.selected = null;
    el.lightbox.hidden = true;
    document.body.classList.remove("is-locked");
    if (state.opener && document.contains(state.opener)) state.opener.focus();
    state.opener = null;
  }

  function stepProject(delta) {
    const n = S.projects.length;
    const i = S.projects.findIndex((p) => p.id === state.selected.id);
    openProject(S.projects[(i + delta + n) % n].id);
    $(".lb-close", el.sheet).focus();
  }

  function renderLightbox() {
    const p = state.selected;
    if (!p) return;
    const lp = localize(p);
    const prevIcon = isRtl() ? "chevR" : "chevL";
    const nextIcon = isRtl() ? "chevL" : "chevR";
    el.sheet.innerHTML = `
      <div class="lb-top">
        <span>${t("work.word")} ${p.number} · ${lp.category}</span>
        <div class="lb-nav">
          <button class="icon-btn" type="button" data-lb="prev" aria-label="${t("lightbox.previous")}">${icon(prevIcon)}</button>
          <button class="icon-btn" type="button" data-lb="next" aria-label="${t("lightbox.next")}">${icon(nextIcon)}</button>
          <button class="icon-btn lb-close" type="button" data-lb="close" aria-label="${t("lightbox.close")}">${icon("close")}</button>
        </div>
      </div>
      <div class="lb-grid">
        <div class="lb-image"><img src="${imgUrl(p, 1600)}" alt="${lp.title}" width="${p.w}" height="${p.h}" decoding="async" /></div>
        <div>
          <h2 class="lb-title" id="lb-title">${lp.title}</h2>
          <p class="lb-desc">${lp.description}</p>
          <div class="specs">
            <div class="spec"><span>${t("lightbox.client")}</span><span>${lp.client}</span></div>
            <div class="spec"><span>${t("lightbox.medium")}</span><span>${lp.medium}</span></div>
            <div class="spec"><span>${t("lightbox.format")}</span><span>${p.dimensions}</span></div>
            <div class="spec"><span>${t("lightbox.year")}</span><span>${p.year}</span></div>
          </div>
          <a class="btn lb-link" href="${p.liveUrl}" target="_blank" rel="noopener noreferrer">${t("lightbox.viewProject")} ${icon("arrow").replace('class="i i-arrow"', 'class="i i-arrow" width="16" height="16"')}</a>
        </div>
      </div>
      <section class="comments" aria-labelledby="lb-comments-title">
        <div class="comments-head">
          <div>
            <span class="comments-kicker">${t("lightbox.wall")}</span>
            <h3 id="lb-comments-title">${t("lightbox.commentOn")} ${lp.title}</h3>
          </div>
          <button class="btn btn-line btn-sm" type="button" data-lb="owner">${state.owner ? t("lightbox.closeOwner") : t("lightbox.ownerMode")}</button>
        </div>
        <form class="comment-form" id="comment-form" novalidate>
          <label for="comment-input">${t("lightbox.postAnonymous")}</label>
          <textarea id="comment-input" rows="3" maxlength="500" placeholder="${t("lightbox.placeholder")} ${lp.title}${isRtl() ? "؟" : "?"}"></textarea>
          <div class="comment-form-actions">
            <span id="comment-count">0 / 500</span>
            <button class="btn btn-peach btn-sm" type="submit">${t("lightbox.post")}</button>
          </div>
          <p class="comment-status" id="comment-status" role="status"></p>
        </form>
        <label class="owner-key" id="owner-key" ${state.owner ? "" : "hidden"}>
          ${t("lightbox.ownerKey")}
          <input id="owner-key-input" type="password" autocomplete="current-password" placeholder="${t("lightbox.ownerPlaceholder")}" value="${""}" />
        </label>
        <div id="comment-list"></div>
      </section>`;
    $("#owner-key-input", el.sheet).value = state.adminKey;
    renderComments();
  }

  function setStatus(text) {
    state.status = text;
    const node = $("#comment-status", el.sheet);
    if (node) node.textContent = text;
  }

  function renderComments() {
    const host = $("#comment-list", el.sheet);
    if (!host) return;
    host.textContent = "";
    if (state.commentsLoading) {
      host.appendChild(textNode("p", "comments-empty", t("lightbox.loading")));
      return;
    }
    if (!state.comments.length) {
      host.appendChild(textNode("p", "comments-empty", t("lightbox.none")));
      return;
    }
    const list = document.createElement("div");
    list.className = "comment-list";
    state.comments.forEach((c, i) => {
      const art = document.createElement("article");
      art.className = "comment";
      const meta = document.createElement("div");
      meta.className = "comment-meta";
      meta.appendChild(textNode("span", "", `${t("lightbox.anonymous")} / ${pad2(i + 1)}`));
      const time = document.createElement("time");
      const d = new Date(c.createdAt);
      if (!isNaN(d)) {
        time.dateTime = c.createdAt;
        time.textContent = new Intl.DateTimeFormat(state.lang, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(d);
      }
      meta.appendChild(time);
      art.appendChild(meta);
      art.appendChild(textNode("p", "", c.body));
      if (state.owner) {
        const del = textNode("button", "comment-delete", t("lightbox.delete"));
        del.type = "button";
        del.dataset.deleteComment = c.id;
        art.appendChild(del);
      }
      list.appendChild(art);
    });
    host.appendChild(list);
  }

  function textNode(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    n.textContent = text;
    return n;
  }

  async function loadComments(projectId) {
    state.commentsLoading = true;
    renderComments();
    try {
      const res = await fetch(`${commentsApi()}?projectId=${encodeURIComponent(projectId)}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("load failed");
      const data = await res.json();
      if (!state.selected || state.selected.id !== projectId) return;
      state.comments = Array.isArray(data) ? data : [];
    } catch {
      if (state.selected && state.selected.id === projectId) setStatus(t("lightbox.statusLoadError"));
    } finally {
      if (state.selected && state.selected.id === projectId) {
        state.commentsLoading = false;
        renderComments();
      }
    }
  }

  async function submitComment(event) {
    event.preventDefault();
    const p = state.selected;
    if (!p) return;
    const input = $("#comment-input", el.sheet);
    const body = input.value.trim();
    if (body.length < 2) return setStatus(t("lightbox.statusShort"));
    setStatus(t("lightbox.statusPublishing"));
    try {
      const res = await fetch(commentsApi(), {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ body, projectId: p.id }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload && payload.error);
      state.comments = [payload, ...state.comments];
      input.value = "";
      $("#comment-count", el.sheet).textContent = "0 / 500";
      renderComments();
      setStatus(t("lightbox.statusPosted"));
    } catch {
      setStatus(t("lightbox.statusPostError"));
    }
  }

  async function deleteComment(id) {
    const p = state.selected;
    if (!p) return;
    if (!state.adminKey) return setStatus(t("lightbox.statusKey"));
    setStatus(t("lightbox.statusDeleting"));
    try {
      const res = await fetch(
        `${commentsApi()}/${encodeURIComponent(id)}?projectId=${encodeURIComponent(p.id)}`,
        {
          method: "DELETE",
          headers: authHeaders({ "X-Admin-Key": state.adminKey }),
        },
      );
      if (!res.ok) throw new Error("delete failed");
      state.comments = state.comments.filter((c) => c.id !== id);
      renderComments();
      setStatus(t("lightbox.statusDeleted"));
    } catch {
      setStatus(t("lightbox.statusDeleteError"));
    }
  }

  /* ====================================================================
     Events
     ==================================================================== */
  function renderAll() {
    applyChrome();
    renderFilters();
    updateDeck();
    renderGrid();
    renderAbout();
    renderContact();
    if (state.selected) renderLightbox();
  }

  el.themeBtn.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    store.set("theme", state.theme);
    applyChrome();
  });

  el.langBtn.addEventListener("click", () => {
    state.lang = state.lang === "en" ? "ar" : "en";
    store.set("lang", state.lang);
    const draft = $("#comment-input", el.sheet);
    state.draft = draft ? draft.value : "";
    renderAll();
    const next = $("#comment-input", el.sheet);
    if (next) next.value = state.draft;
  });

  el.menuBtn.addEventListener("click", () => setMenu(!el.nav.classList.contains("is-open")));
  function setMenu(open) {
    el.nav.classList.toggle("is-open", open);
    el.menuBtn.setAttribute("aria-expanded", String(open));
  }
  el.nav.addEventListener("click", (e) => {
    if (e.target.closest(".nav-link")) setMenu(false);
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#nav")) setMenu(false);
  });

  el.deck.addEventListener("click", (e) => {
    const item = e.target.closest("[data-deck]");
    if (!item) return;
    const i = Number(item.dataset.deck);
    if (state.fanned || i === state.deckIndex) openProject(S.projects[i].id, item);
    else {
      state.deckIndex = i;
      updateDeck();
    }
  });
  el.deckShuffle.addEventListener("click", () => {
    state.deckIndex = (state.deckIndex + 1) % S.projects.length;
    updateDeck();
  });
  el.deckFan.addEventListener("click", () => {
    state.fanned = !state.fanned;
    updateFanButton();
    updateDeck();
  });

  el.funBtn.addEventListener("click", (e) => sticker(pointOf(e), t("sticker.hello")));

  el.filters.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    state.filter = btn.dataset.filter;
    renderFilters();
    renderGrid();
    const again = $(`[data-filter="${state.filter}"]`, el.filters);
    if (again) again.focus();
  });

  el.grid.addEventListener("click", (e) => {
    const react = e.target.closest("[data-react]");
    if (react) return toggleReaction(react.dataset.react, react.dataset.id);
    const open = e.target.closest("[data-open]");
    if (open) openProject(open.dataset.open, open);
  });

  el.facts.addEventListener("click", (e) => {
    const row = e.target.closest("[data-sticker]");
    if (!row) return;
    sticker({ x: e.clientX, y: e.clientY }, t("about.tiles")[Number(row.dataset.sticker)].sticker);
  });

  el.tools.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tool]");
    if (!btn) return;
    const i = Number(btn.dataset.tool);
    if (state.popped.has(i)) state.popped.delete(i);
    else state.popped.add(i);
    btn.setAttribute("aria-pressed", String(state.popped.has(i)));
  });

  el.copyBtn.addEventListener("click", copyEmail);

  /* Lightbox interactions (delegated) */
  el.lightbox.addEventListener("click", (e) => {
    if (e.target === el.lightbox) return closeLightbox();
    const action = e.target.closest("[data-lb]");
    if (action) {
      const kind = action.dataset.lb;
      if (kind === "close") closeLightbox();
      if (kind === "prev") stepProject(-1);
      if (kind === "next") stepProject(1);
      if (kind === "owner") {
        state.owner = !state.owner;
        action.textContent = state.owner ? t("lightbox.closeOwner") : t("lightbox.ownerMode");
        $("#owner-key", el.sheet).hidden = !state.owner;
        renderComments();
      }
    }
    const del = e.target.closest("[data-delete-comment]");
    if (del) deleteComment(del.dataset.deleteComment);
  });
  el.lightbox.addEventListener("submit", (e) => {
    if (e.target.id === "comment-form") submitComment(e);
  });
  el.lightbox.addEventListener("input", (e) => {
    if (e.target.id === "comment-input")
      $("#comment-count", el.sheet).textContent = `${e.target.value.length} / 500`;
    if (e.target.id === "owner-key-input") state.adminKey = e.target.value;
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (state.selected) closeLightbox();
      setMenu(false);
      return;
    }
    if (!state.selected) return;
    const typing = /^(TEXTAREA|INPUT)$/.test(e.target.tagName);
    if (!typing && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      const forward = isRtl() ? e.key === "ArrowLeft" : e.key === "ArrowRight";
      stepProject(forward ? 1 : -1);
    }
    if (e.key === "Tab") {
      const focusables = $$(
        "a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex='-1'])",
        el.sheet,
      ).filter((n) => !n.closest("[hidden]"));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* Active section in the nav */
  if ("IntersectionObserver" in window) {
    const links = $$('.nav-link[href^="#"]');
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((x) => x.isIntersecting);
        if (!hit) return;
        links.forEach((a) => {
          if (a.getAttribute("href") === "#" + hit.target.id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-35% 0px -55%", threshold: 0 },
    );
    ["top", "work", "about", "contact"].forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
  }

  /* ---------- Boot ---------- */
  applyChrome();
  renderFilters();
  buildDeck();
  renderGrid();
  renderAbout();
  renderContact();
})();
