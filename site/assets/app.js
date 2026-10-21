/* Four Horsemen Comics site script: drawn covers, the price guide (data/market.json), the owner's
   own sales (data/sold.json, shown only when it has entries), grading guide and contact form. */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "$" + Math.round(Number(n)).toLocaleString("en-US");
  const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
  const dayFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  const month = (iso) => monthFmt.format(new Date(iso + "T12:00:00Z"));
  const day = (iso) => dayFmt.format(new Date(iso + "T12:00:00Z"));

  /* ---------- mobile menu ---------- */
  const menuBtn = $(".menu-btn"), nav = $(".nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => menuBtn.setAttribute("aria-expanded", String(nav.classList.toggle("open"))));
    $$("a", nav).forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }));
  }

  /* ---------- the logo slams in once ---------- */
  $$("[data-slam]").forEach((el) => {
    el.classList.add("loading");
    el.addEventListener("animationend", () => el.classList.remove("loading"), { once: true });
  });

  /* ---------- drawn covers (no publisher artwork) ---------- */
  const PAIRS = [
    ["var(--blue)", "var(--red)"], ["var(--yellow)", "var(--blue)"], ["var(--red)", "var(--yellow)"],
    ["var(--orange)", "var(--blue)"], ["var(--blue)", "var(--yellow)"], ["var(--red)", "var(--orange)"],
  ];
  const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  function coverPrice(b) { // newsstand price printed on the cover, by year
    const y = b.year;
    if (y <= 1961) return "10¢";
    if (y <= 1968) return "12¢";
    if (y <= 1971) return "15¢";
    if (y <= 1973) return "20¢";
    if (y <= 1975) return "25¢";
    if (y <= 1977) return "30¢";
    return "35¢";
  }
  function burst(b) {
    const n = b.note || "";
    if (/^(Origin and )?first (full |Silver Age )?appearances?/i.test(n)) return "1st app!";
    if (/^Second appearance/i.test(n)) return "2nd app!";
    if (/^Death/i.test(n)) return "Death issue!";
    if (b.issue === "1") return "#1 issue!";
    return "";
  }
  function coverHTML(b) {
    const [c1, c2] = PAIRS[hash(b.id) % PAIRS.length];
    const bt = burst(b);
    const bStyle = c2 === "var(--yellow)" || c1 === "var(--yellow)" ? ' style="background:#fff"' : "";
    return `<div class="cover${b.graded ? " slabbed" : ""}" style="--c1:${c1};--c2:${c2}" aria-hidden="true">
      ${b.graded ? `<div class="cv-slab"><span>CGC</span><span>${esc(Number(b.gradeNumber).toFixed(1))}</span></div>` : ""}
      <div class="cv-top"><div class="cv-box">${esc(b.publisher)}<b>${esc(coverPrice(b))}</b><i>${esc(b.year)}</i></div><div class="cv-title">${esc(b.title)}</div></div>
      ${bt ? `<div class="cv-burst"${bStyle}>${esc(bt)}</div>` : ""}
      <div class="cv-num">#${esc(b.issue)}</div>
      ${b.photo ? `<img class="photo" src="${esc(b.photo)}" alt="" loading="lazy">` : ""}
    </div>`;
  }
  const gradeText = (b) => `${b.graded ? "CGC" : "Raw"} ${b.grade} ${Number(b.gradeNumber).toFixed(1)}`;
  const when = (b) => b.soldOn || b.lastSale;

  function cardHTML(b, kind) {
    const label = kind === "sold" ? `Sold ${month(when(b))}` : `${b.sales && b.sales.length > 1 ? `Avg of ${b.sales.length} sales` : "Sold"}, ${month(when(b))}`;
    return `<button class="card" type="button" data-kind="${kind}" data-id="${esc(b.id)}" aria-label="${esc(`${b.title} #${b.issue}, ${gradeText(b)}: ${money(b.price)}`)}">
      ${coverHTML(b)}
      <div class="card-meta"><span class="t">${esc(b.title)} #${esc(b.issue)}</span><span class="p">${money(b.price)}</span>
      <span class="g">${esc(gradeText(b))}<br>${esc(label)}</span></div>
    </button>`;
  }

  /* ---------- detail dialog ---------- */
  const data = { market: [], sold: [] };
  const dialog = $("dialog.detail");
  function openDetail(kind, id) {
    const b = data[kind].find((x) => x.id === id);
    if (!b || !dialog) return;
    const sales = (b.sales || []).map((s) => `${money(s.price)} on ${day(s.date)}`).join("<br>");
    $(".detail-body", dialog).innerHTML = `
      ${coverHTML(b)}
      <div>
        <h2 class="pow pow-dark">${esc(b.title)} #${esc(b.issue)}</h2>
        <p>${esc(b.note)}</p>
        <div class="detail-price">${money(b.price)}</div>
        <p class="detail-sub">${kind === "sold" ? "Sold by Four Horsemen Comics" : (b.sales && b.sales.length > 1 ? `Average of ${b.sales.length} recent sales` : "Recent auction sale")}</p>
        <dl>
          <dt>Grade</dt><dd>${esc(gradeText(b))}</dd>
          <dt>Published</dt><dd>${esc(b.publisher)}, ${esc(b.year)}</dd>
          ${kind === "sold" ? `<dt>Sold</dt><dd>${esc(day(b.soldOn))}</dd>` : `<dt>Sales</dt><dd>${sales}</dd>
          <dt>Source</dt><dd><a href="${esc(b.sourceUrl)}" target="_blank" rel="noopener">${esc(b.source)}</a></dd>`}
        </dl>
        <p style="margin-top:18px"><a class="btn red small" href="./#contact">Have one? Ask us</a></p>
      </div>`;
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
  }
  if (dialog) {
    $(".detail-close", dialog).addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  }
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".card[data-id]");
    if (card) openDetail(card.dataset.kind, card.dataset.id);
  });

  /* ---------- home page ---------- */
  function renderHome() {
    const strip = $("#market-strip");
    if (strip) {
      // a spread of keys: highest first, then a mix
      const sorted = [...data.market].sort((a, b) => b.price - a.price);
      const pick = sorted.filter((_, i) => i % 5 === 0).slice(0, 10);
      strip.innerHTML = pick.map((b) => cardHTML(b, "market")).join("");
    }
    const cnt = $("#market-count");
    if (cnt) cnt.textContent = String(data.market.length);
    const sc = $("#strip-cover");
    if (sc) {
      const b = data.market.find((x) => x.id === "asm129") || data.market[0];
      if (b) sc.innerHTML = coverHTML(b);
    }
    const soldSec = $("#sold-by-us");
    if (soldSec && data.sold.length) {
      soldSec.hidden = false;
      $("#sold-strip").innerHTML = [...data.sold].sort((a, b) => b.soldOn.localeCompare(a.soldOn)).map((b) => cardHTML(b, "sold")).join("");
    }
  }

  /* ---------- price guide page ---------- */
  function renderGuide() {
    const grid = $("#guide");
    if (!grid) return;
    const state = { q: "", pub: "all", decade: "all", sort: "high" };
    const q = $("#q"), sort = $("#sort"), out = $("#count");
    const setPressed = (group, value) => $$(`[data-group="${group}"] button`).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.value === value)));
    function draw() {
      const words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      const list = data.market.filter((b) => {
        if (state.pub !== "all" && b.publisher !== state.pub) return false;
        if (state.decade !== "all" && String(Math.floor(b.year / 10) * 10) !== state.decade) return false;
        const hay = `${b.title} #${b.issue} ${b.issue} ${b.note} ${b.publisher} ${b.year} ${b.grade}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      }).sort({
        high: (a, b) => b.price - a.price,
        low: (a, b) => a.price - b.price,
        year: (a, b) => a.year - b.year || a.title.localeCompare(b.title),
        new: (a, b) => when(b).localeCompare(when(a)),
      }[state.sort]);
      grid.innerHTML = list.length
        ? list.map((b) => cardHTML(b, "market")).join("")
        : `<div class="empty"><h3>No books match that</h3><p>Try fewer words, or set the publisher and decade back to All.</p></div>`;
      grid.classList.toggle("grid", list.length > 0);
      out.textContent = `${list.length} ${list.length === 1 ? "book" : "books"}`;
    }
    $$("[data-group] button").forEach((b) => b.addEventListener("click", () => {
      const g = b.closest("[data-group]").dataset.group;
      state[g] = b.dataset.value; setPressed(g, b.dataset.value); draw();
    }));
    q.addEventListener("input", () => { state.q = q.value; draw(); });
    sort.addEventListener("change", () => { state.sort = sort.value; draw(); });
    draw();
  }

  /* ---------- grading guide ---------- */
  const GRADES = [
    ["1.0", "FR", "Fair", "Heavy wear and possibly small pieces missing, but the story is all there. A reader copy for keys that are otherwise out of reach."],
    ["2.0", "GD", "Good", "Well read: creases, spine roll, rounded corners and small tears. Complete and still holds together."],
    ["3.0", "GD/VG", "Good/Very Good", "Between Good and Very Good: obvious wear, but cleaner and flatter than a Good copy."],
    ["4.0", "VG", "Very Good", "Read but cared for: visible creases and spine stress, reduced gloss, cover still attached. The sweet spot for many vintage keys."],
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
    const to = (settings.contactEmail || "").trim();
    $$("[data-email]").forEach((a) => { if (to) { a.href = "mailto:" + to; a.textContent = to; } });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const name = String(d.get("name") || "").trim();
      const books = String(d.get("books") || "").trim();
      if (!name || !books) { status.textContent = "Add your name and a few words about the books, then send again."; return; }
      if (!to) { status.textContent = "Our email address isn't set up yet. Please check back soon."; return; }
      const intent = d.get("intent") || "Sell";
      const subject = `${intent}: ${books.split("\n")[0].slice(0, 60)}`;
      const body = [`Name: ${name}`, `Phone: ${d.get("phone") || "-"}`, `I want to: ${intent}`, "", "Books:", books, "", String(d.get("message") || "")].join("\n");
      location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = "Your email app should open with the message filled in. Press send there.";
    });
  }

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  renderScale();

  const get = (u) => fetch(u, { cache: "no-cache" }).then((r) => { if (!r.ok) throw new Error(u); return r.json(); });
  Promise.all([get("data/market.json"), get("data/sold.json").catch(() => ({ sales: [] })), get("data/settings.json").catch(() => ({}))])
    .then(([market, sold, settings]) => {
      data.market = (market.books || []).filter((b) => b && b.id && b.price);
      data.sold = (sold.sales || []).filter((b) => b && b.id && b.price && b.soldOn && !b.sample);
      renderHome(); renderGuide(); wireForm(settings || {});
    })
    .catch(() => {
      $$("#market-strip, #guide").forEach((el) => { el.innerHTML = '<div class="empty"><h3>The price list didn\'t load</h3><p>Refresh the page to try again.</p></div>'; });
      wireForm({ contactEmail: "admin@fourhorsemencomics.net" });
    });
})();
