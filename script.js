(() => {
  "use strict";

  const links = Array.from(document.querySelectorAll('.nav nav a[href^="#"]'));
  const toggle = document.getElementById("menu-toggle");
  const pairs = [];
  links.forEach((link) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) pairs.push({ link, target });
  });

  /** @param {HTMLAnchorElement} activeLink */
  function setActive(activeLink) {
    links.forEach((l) => l.removeAttribute("aria-current"));
    activeLink.setAttribute("aria-current", "true");
  }

  // Menu aktif mengikuti bagian yang sedang dilihat
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const m = pairs.find((p) => p.target === e.target);
      if (m) setActive(m.link);
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  pairs.forEach((p) => navObserver.observe(p.target));
  if (pairs.length) setActive(pairs[0].link);

  window.addEventListener("scroll", () => {
    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
    if (atBottom && pairs.length) setActive(pairs[pairs.length - 1].link);
  }, { passive: true });

  links.forEach((l) => l.addEventListener("click", () => { if (toggle) toggle.checked = false; }));

  // Kotak muncul saat di-scroll; terminal mulai mengetik saat terlihat
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      const term = e.target.querySelector(".term");
      if (term) term.classList.add("play");
      revealObserver.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".box").forEach((b) => revealObserver.observe(b));

  // Cahaya mengikuti kursor di dalam kotak
  if (window.matchMedia("(hover: hover)").matches) {
    document.addEventListener("pointermove", (e) => {
      const box = e.target instanceof Element ? e.target.closest(".box") : null;
      if (!box) return;
      const r = box.getBoundingClientRect();
      box.style.setProperty("--mx", e.clientX - r.left + "px");
      box.style.setProperty("--my", e.clientY - r.top + "px");
    }, { passive: true });
  }

  // Role berganti otomatis
  const roleEl = document.querySelector(".role[data-roles]");
  if (roleEl) {
    const roles = (roleEl.dataset.roles || "").split("|").map((r) => r.trim()).filter(Boolean);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const INTERVAL = 3000, FADE = 400;
    let index = 0, timer = null;

    const nextRole = () => {
      roleEl.classList.add("is-out");
      setTimeout(() => {
        index = (index + 1) % roles.length;
        roleEl.textContent = roles[index];
        roleEl.classList.remove("is-out");
      }, FADE);
    };
    const start = () => { if (!timer && roles.length > 1 && !reduce) timer = setInterval(nextRole, INTERVAL); };
    const stop = () => { clearInterval(timer); timer = null; };

    if (roles.length) roleEl.textContent = roles[0];
    start();
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    roleEl.addEventListener("mouseenter", stop);
    roleEl.addEventListener("mouseleave", start);
  }
})();