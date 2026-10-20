/* Four Horsemen Comics site script: builds the sold covers, the archive filters,
   the grading guide and the contact form. Data lives in data/sold.json and data/settings.json. */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "$" + Number(n).toLocaleString("en-US");
  const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  const niceDate = (iso) => dateFmt.format(new Date(iso + "T12:00:00Z"));

  /* ---------- mobile menu ---------- */
  const menuBtn = $(".menu-btn");
  const nav = $(".nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }));
  }

  /* ---------- headline registration (once per page load) ---------- */
  $$(".plates[data-register]").forEach((el) => {
    el.classList.add("loading");
    el.addEventListener("animationend", () => el.classList.remove("loading"), { once: true });
  });

  /* ---------- covers ---------- */
  const PAIRS = [
    ["var(--cyan)", "var(--magenta)"], ["var(--yellow)", "var(--cyan)"], ["var(--magenta)", "var(--yellow)"],
    ["var(--yellow)", "var(--magenta)"], ["var(--cyan)", "var(--yellow)"], ["var(--magenta)", "var(--cyan)"],
  ];
  const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

  // Newsstand price printed on the cover, by year (close enough for the era).
  function coverPrice(s) {
    const y = s.year;
    if (y <= 1961) return "10¢";
    if (y <= 1968) return "12¢";
    if (y <= 1970) return "15¢";
    if (y === 1971) return s.publisher === "DC" ? "25¢" : "15¢";
    if (y <= 1973) return "20¢";
    if (y <= 1975) return "25¢";
    return "30¢";
  }

  function burst(s) {
    const n = s.note || "";
    if (/^First (full )?appearances?/i.test(n)) return "1st app!";
    if (/^Second appearance/i.test(n)) return "2nd app!";
    if (/^Death/i.test(n)) return "Death issue!";
    if (s.issue === "1") return "Issue #1!";
    return "";
  }

  function coverHTML(s) {
    const [c1, c2] = PAIRS[hash(s.id) % PAIRS.length];
    const b = burst(s);
    const photo = s.photo ? `<img class="photo" src="${esc(s.photo)}" alt="" loading="lazy">` : "";
    return `<div class="cover${s.graded ? " slabbed" : ""}" style="--c1:${c1};--c2:${c2}" aria-hidden="true">
      ${s.graded ? `<div class="cv-slab"><span>CGC</span><span>${esc(s.gradeNumber.toFixed(1))}</span></div>` : ""}
      <div class="cv-top"><div class="cv-box">${esc(s.publisher)}<b>${esc(coverPrice(s))}</b><i>${esc(s.year)}</i></div><div class="cv-title">${esc(s.title)}</div></div>
      ${b ? `<div class="cv-burst"${c2 === "var(--yellow)" ? ' style="background:var(--paper-hi)"' : ""}>${esc(b)}</div>` : ""}
      <div class="cv-num">#${esc(s.issue)}</div>
      ${photo}
      ${s.sample ? '<div class="stamp">Sample</div>' : ""}
    </div>`;
  }

  const gradeText = (s) => `${s.graded ? "CGC" : "Raw"} ${s.grade} ${s.gradeNumber.toFixed(1)}`;

  function cardHTML(s) {
    return `<button class="card" type="button" data-id="${esc(s.id)}" aria-label="${esc(`${s.title} #${s.issue}, ${gradeText(s)}, sold for ${money(s.price)}`)}">
      ${coverHTML(s)}
      <div class="card-meta"><span class="t">${esc(s.title)} #${esc(s.issue)}</span><span class="p">${money(s.price)}</span>
      <span class="g">${esc(gradeText(s))} · Sold ${esc(niceDate(s.soldOn))}</span></div>
    </button>`;
  }

  /* ---------- detail dialog ---------- */
  let sales = [];
  const dialog = $("dialog.detail");
  function openDetail(id) {
    const s = sales.find((x) => x.id === id);
    if (!s || !dialog) return;
    $(".detail-body", dialog).innerHTML = `
      ${coverHTML(s)}
      <div>
        <h2>${esc(s.title)} #${esc(s.issue)}</h2>
        <p>${esc(s.note)}</p>
        <div class="detail-price">${money(s.price)}</div>
        <dl>
          <dt>Grade</dt><dd>${esc(gradeText(s))}${s.graded ? " (certified)" : " (our grade)"}</dd>
          <dt>Published</dt><dd>${esc(s.publisher)}, ${esc(s.year)}</dd>
          <dt>Sold</dt><dd>${esc(niceDate(s.soldOn))}</dd>
          ${s.sample ? "<dt>Note</dt><dd>Sample listing for layout. Real sales replace these.</dd>" : ""}
        </dl>
      </div>`;
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
  }
  if (dialog) {
    $(".detail-close", dialog).addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  }
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".card[data-id]");
    if (card) openDetail(card.dataset.id);
  });

  function sampleNote(list, el) {
    if (!el) return;
    el.hidden = !list.some((s) => s.sample);
  }

  /* ---------- home page ---------- */
  function renderHome() {
    const stack = $("#hero-stack");
    if (stack) {
      const picks = [...sales].sort((a, b) => b.price - a.price).slice(0, 3);
      stack.innerHTML = picks.map(coverHTML).join("");
    }
    const recent = $("#recent");
    if (recent) {
      const newest = [...sales].sort((a, b) => b.soldOn.localeCompare(a.soldOn)).slice(0, 10);
      recent.innerHTML = newest.map(cardHTML).join("");
      sampleNote(newest, $("#recent-note"));
    }
    const count = $("#sold-count");
    if (count) count.textContent = String(sales.length);
  }

  /* ---------- archive page ---------- */
  function renderArchive() {
    const grid = $("#archive");
    if (!grid) return;
    const state = { q: "", pub: "all", decade: "all", sort: "new" };
    const q = $("#q"), sort = $("#sort"), out = $("#count");

    const params = new URLSearchParams(location.search);
    if (params.get("pub")) state.pub = params.get("pub");

    function setPressed(group, value) {
      $$(`[data-group="${group}"] button`).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.value === value)));
    }
    function draw() {
      const words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      let list = sales.filter((s) => {
        if (state.pub !== "all" && s.publisher !== state.pub) return false;
        if (state.decade !== "all" && String(Math.floor(s.year / 10) * 10) !== state.decade) return false;
        const hay = `${s.title} #${s.issue} ${s.issue} ${s.note} ${s.publisher} ${s.year} ${s.grade}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      });
      const by = {
        new: (a, b) => b.soldOn.localeCompare(a.soldOn),
        high: (a, b) => b.price - a.price,
        low: (a, b) => a.price - b.price,
        year: (a, b) => a.year - b.year || a.title.localeCompare(b.title),
      }[state.sort];
      list.sort(by);
      grid.innerHTML = list.length
        ? list.map(cardHTML).join("")
        : `<div class="empty"><h3>No sales match that</h3><p>Try fewer words, or switch the publisher and decade back to All.</p></div>`;
      grid.classList.toggle("grid", list.length > 0);
      const total = list.reduce((n, s) => n + s.price, 0);
      out.textContent = `${list.length} ${list.length === 1 ? "book" : "books"} · ${money(total)}`;
      sampleNote(list, $("#archive-note"));
    }
    $$("[data-group] button").forEach((b) => b.addEventListener("click", () => {
      state[b.closest("[data-group]").dataset.group] = b.dataset.value;
      setPressed(b.closest("[data-group]").dataset.group, b.dataset.value);
      draw();
    }));
    q.addEventListener("input", () => { state.q = q.value; draw(); });
    sort.addEventListener("change", () => { state.sort = sort.value; draw(); });
    setPressed("pub", state.pub);
    setPressed("decade", state.decade);
    draw();
  }

  /* ---------- grading guide ---------- */
  const GRADES = [
    ["1.0", "FR", "Fair", "Heavy wear and possibly small pieces missing, but the story is all there. A reader copy for keys that are otherwise out of reach."],
    ["2.0", "GD", "Good", "Well read: creases, spine roll, rounded corners and small tears. Complete and still holds together."],
    ["3.0", "GD/VG", "Good/Very Good", "Between Good and Very Good: obvious wear, but cleaner and flatter than a Good copy."],
    ["4.0", "VG", "Very Good", "Read but cared for: visible creases and spine stress, reduced gloss, cover still attached. The sweet spot for vintage keys."],
    ["6.0", "FN", "Fine", "An above-average copy. Minor wear and a few stress lines at the spine, colors still bright."],
    ["8.0", "VF", "Very Fine", "Sharp and attractive with light wear only. Hard to find for books from the '60s."],
    ["9.4", "NM", "Near Mint", "Looks almost new to the naked eye; flaws are tiny. Rare for anything printed before 1975."],
    ["9.8", "NM/M", "Near Mint/Mint", "Nearly perfect. Vanishingly rare for this era and priced accordingly."],
  ];
  function renderScale() {
    const scale = $("#scale"), detail = $("#grade-detail");
    if (!scale || !detail) return;
    scale.innerHTML = GRADES.map(([n, abbr], i) => `<button type="button" aria-pressed="${i === 3}" data-i="${i}"><b>${n}</b><span>${abbr}</span></button>`).join("");
    const show = (i) => {
      const [n, abbr, name, text] = GRADES[i];
      detail.innerHTML = `<h3>${n} ${abbr}</h3><p><strong>${name}.</strong> ${text}</p>`;
      $$("button", scale).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.i === String(i))));
    };
    scale.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) show(Number(b.dataset.i)); });
    show(3);
  }

  /* ---------- contact form (opens the visitor's own email app) ---------- */
  function wireForm(settings) {
    const form = $("#contact-form");
    if (!form) return;
    const status = $("#form-status");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const name = String(d.get("name") || "").trim();
      const books = String(d.get("books") || "").trim();
      if (!name || !books) { status.textContent = "Add your name and the books you're asking about, then send again."; return; }
      const to = (settings.contactEmail || "").trim();
      if (!to) { status.textContent = "Our email address is being set up. Please check back soon."; return; }
      const intent = d.get("intent") || "Sell";
      const subject = `${intent}: ${books.split("\n")[0].slice(0, 60)}`;
      const body = [`Name: ${name}`, `Phone: ${d.get("phone") || "-"}`, `I want to: ${intent}`, "", "Books:", books, "", String(d.get("message") || "")].join("\n");
      location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = "Your email app should open with the message filled in. Press send there.";
    });
    $$("[data-email]").forEach((a) => {
      if (settings.contactEmail) { a.href = "mailto:" + settings.contactEmail; a.textContent = settings.contactEmail; }
      else a.closest("[data-email-wrap]")?.setAttribute("hidden", "");
    });
  }

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  renderScale();
  Promise.all([
    fetch("data/sold.json", { cache: "no-cache" }).then((r) => r.json()),
    fetch("data/settings.json", { cache: "no-cache" }).then((r) => r.json()).catch(() => ({})),
  ]).then(([data, settings]) => {
    sales = (data.sales || []).filter((s) => s && s.id && s.price);
    renderHome();
    renderArchive();
    wireForm(settings || {});
  }).catch(() => {
    $$("#recent, #archive").forEach((el) => { el.innerHTML = '<div class="empty"><h3>Sales list didn\'t load</h3><p>Refresh the page to try again.</p></div>'; });
    wireForm({});
  });
})();
