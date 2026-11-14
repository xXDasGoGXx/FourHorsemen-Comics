/* Four Horsemen Comics site script: mobile menu, Key of the Day (data/keys.json), grading scale
   (learn.html) and the contact form (POST /api/contact, emailed to admin@ by fourhorsemen-contact). */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- mobile menu ---------- */
  const menuBtn = $(".menu-btn"), nav = $(".nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => menuBtn.setAttribute("aria-expanded", String(nav.classList.toggle("open"))));
    $$("a", nav).forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }));
  }

  /* ---------- Key of the Day: one entry per calendar day, in list order ---------- */
  function keyOfTheDay() {
    const box = $("#kotd");
    if (!box) return;
    fetch("data/keys.json", { cache: "no-cache" })
      .then((r) => { if (!r.ok) throw new Error("keys"); return r.json(); })
      .then((d) => {
        const keys = (d.keys || []).filter((k) => k && k.title && k.issue && k.why);
        if (!keys.length) return;
        const now = new Date();
        const dayNo = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
        const k = keys[dayNo % keys.length];
        $("#kotd-title").innerHTML = `${esc(k.title)} <span>#${esc(k.issue)}</span>`;
        $("#kotd-meta").textContent = [k.publisher, k.year].filter(Boolean).join(", ");
        $("#kotd-why").textContent = k.why;
        $("#kotd-date").textContent = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
      })
      .catch(() => { /* the built-in example stays */ });
  }

  /* ---------- grading scale (learn.html) ---------- */
  const GRADES = [
    ["1.0", "FR", "Fair", "Heavy wear and possibly small pieces missing, but the story is all there. A reader copy, often the only affordable way into a big key."],
    ["2.0", "GD", "Good", "Well read: creases, spine roll, rounded corners and small tears. Complete and still holds together."],
    ["3.0", "GD/VG", "Good/Very Good", "Between Good and Very Good: obvious wear, but cleaner and flatter than a Good copy."],
    ["4.0", "VG", "Very Good", "Read but cared for: visible creases and spine stress, less gloss, cover still attached. A common grade for vintage keys."],
    ["6.0", "FN", "Fine", "An above-average copy. Minor wear and a few stress lines at the spine, colors still bright."],
    ["8.0", "VF", "Very Fine", "Sharp and attractive with light wear only. Hard to find for books from the '60s."],
    ["9.4", "NM", "Near Mint", "Looks almost new to the naked eye; flaws are tiny. Rare for anything printed before the mid-'70s."],
    ["9.8", "NM/M", "Near Mint/Mint", "Nearly perfect. Vanishingly rare for older books, and priced to match."],
  ];
  function renderScale() {
    const scale = $("#scale"), detail = $("#grade-detail");
    if (!scale || !detail) return;
    scale.innerHTML = GRADES.map(([n, abbr], i) => `<button type="button" aria-pressed="${i === 3}" data-i="${i}"><b>${n}</b><span>${abbr}</span></button>`).join("");
    const show = (i) => {
      const [n, abbr, name, text] = GRADES[i];
      detail.innerHTML = `<h3>${n} ${abbr} <span>${name}</span></h3><p>${text}</p>`;
      $$("button", scale).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.i === String(i))));
    };
    scale.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) show(Number(b.dataset.i)); });
    show(3);
  }

  /* ---------- contact form ---------- */
  function wireForm() {
    const form = $("#contact-form");
    if (!form) return;
    const status = $("#form-status");
    const button = form.querySelector('button[type="submit"]');
    const to = "admin@fourhorsemencomics.net";
    const opened = Date.now();
    const say = (msg, kind) => { status.textContent = msg; status.className = "form-status" + (kind ? " " + kind : ""); };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const v = (k) => String(d.get(k) || "").trim();
      const body = { name: v("name"), email: v("email"), phone: v("phone"), intent: v("intent") || "Sell", books: v("books"), message: v("message"), website: v("website"), t: opened };
      if (!body.name || !body.books) { say("Add your name and a few words about the books, then send again.", "err"); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) { say("Add your email so Matthew can write back.", "err"); return; }
      button.disabled = true; say("Sending...");
      fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then((r) => r.json().catch(() => ({})).then((j) => ({ ok: r.ok && j.ok, j })))
        .then(({ ok, j }) => {
          if (ok) { form.reset(); say("Sent! Matthew will get back to you soon.", "ok"); }
          else say(j.error || "That didn't go through. Please call, text or email " + to + ".", "err");
        })
        .catch(() => say("That didn't go through. Please call, text or email " + to + ".", "err"))
        .finally(() => { button.disabled = false; });
    });
  }

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  keyOfTheDay();
  renderScale();
  wireForm();
})();
