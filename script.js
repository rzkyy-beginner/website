(() => {
  "use strict";

  // Tandai bahwa script berjalan: baru setelah ini animasi "muncul" aktif di CSS
  document.documentElement.classList.add("js");

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const safe = (fn) => { try { fn(); } catch (err) { console.error(err); } };

  // Pengaman: jika observer gagal, tampilkan semua setelah 4 detik
  setTimeout(() => {
    $$(".box").forEach((b) => b.classList.add("in"));
    $$(".term").forEach((t) => t.classList.add("play"));
  }, 4000);

  // ===== Navigasi aktif =====
  safe(() => {
    const links = $$('.nav nav a[href^="#"]');
    const toggle = $("#menu-toggle");
    const pairs = [];
    links.forEach((link) => {
      const target = $(link.getAttribute("href"));
      if (target) pairs.push({ link, target });
    });

    /** @param {HTMLAnchorElement} activeLink */
    const setActive = (activeLink) => {
      links.forEach((l) => l.removeAttribute("aria-current"));
      activeLink.setAttribute("aria-current", "true");
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const m = pairs.find((p) => p.target === e.target);
        if (m) setActive(m.link);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    pairs.forEach((p) => io.observe(p.target));
    if (pairs.length) setActive(pairs[0].link);

    window.addEventListener("scroll", () => {
      const bottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
      if (bottom && pairs.length) setActive(pairs[pairs.length - 1].link);
    }, { passive: true });

    links.forEach((l) => l.addEventListener("click", () => { if (toggle) toggle.checked = false; }));
  });

  // ===== Kotak muncul saat di-scroll, terminal mulai mengetik =====
  safe(() => {
    const boxes = $$(".box");
    if (!("IntersectionObserver" in window)) {
      boxes.forEach((b) => b.classList.add("in"));
      $$(".term").forEach((t) => t.classList.add("play"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        const term = $(".term", e.target);
        if (term) term.classList.add("play");
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });
    boxes.forEach((b) => io.observe(b));
  });

  // ===== Cahaya mengikuti kursor =====
  safe(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    document.addEventListener("pointermove", (e) => {
      const box = e.target instanceof Element ? e.target.closest(".box") : null;
      if (!box) return;
      const r = box.getBoundingClientRect();
      box.style.setProperty("--mx", e.clientX - r.left + "px");
      box.style.setProperty("--my", e.clientY - r.top + "px");
    }, { passive: true });
  });

  // ===== Role berganti otomatis =====
  safe(() => {
    const el = $(".role[data-roles]");
    if (!el) return;
    const roles = (el.dataset.roles || "").split("|").map((r) => r.trim()).filter(Boolean);
    if (roles.length < 2 || reduce) return;
    let i = 0, timer = null;
    const next = () => {
      el.classList.add("is-out");
      setTimeout(() => {
        i = (i + 1) % roles.length;
        el.textContent = roles[i];
        el.classList.remove("is-out");
      }, 400);
    };
    const start = () => { if (!timer) timer = setInterval(next, 3000); };
    const stop = () => { clearInterval(timer); timer = null; };
    start();
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    el.addEventListener("mouseenter", stop);
    el.addEventListener("mouseleave", start);
  });

  // ===== Gauge acak seperti game assistant =====
  safe(() => {
    const state = $$(".ring[data-live]").map((ring) => {
      const val = $(".val", ring);
      const to = Number(ring.dataset.to) || 50;
      ring.style.setProperty("--to", to);
      return { ring, val, now: to };
    });
    if (!state.length || reduce) return;

    const tween = (s, to) => {
      const from = s.now, t0 = performance.now();
      const step = (t) => {
        const k = Math.min((t - t0) / 1200, 1);
        s.val.textContent = Math.round(from + (to - from) * k);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      s.now = to;
    };

    setInterval(() => {
      if (document.hidden) return;
      state.forEach((s) => {
        if (!s.ring.offsetParent) return; // tab Bahasa sedang tersembunyi
        const next = Math.max(6, Math.min(99, Math.round(s.now + Math.random() * 50 - 25)));
        s.ring.style.setProperty("--to", next);
        tween(s, next);
      });
    }, 1800);
  });

  // ===== Equalizer acak =====
  safe(() => {
    const viz = $(".viz");
    if (!viz) return;
    const bars = [];
    for (let i = 0; i < 32; i++) {
      const b = document.createElement("i");
      viz.appendChild(b);
      bars.push(b);
    }
    let t = 0, visible = false;
    const draw = () => {
      t += 0.18;
      bars.forEach((b, i) => {
        const wave = 0.55 + 0.35 * Math.sin(t + i * 0.45);
        const v = Math.min(1, Math.max(0.08, wave * (0.45 + Math.random() * 0.75)));
        b.style.setProperty("--h", v.toFixed(2));
      });
    };
    draw();
    if (reduce) return;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(viz);
    setInterval(() => { if (visible && !document.hidden) draw(); }, 140);
  });
})();