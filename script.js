(() => {
  "use strict";

  const links = Array.from(document.querySelectorAll('.nav nav a[href^="#"]'));
  const toggle = document.getElementById("menu-toggle");
  const pairs = [];

  links.forEach((link) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) pairs.push({ link, target });
  });

  function setActive(activeLink) {
    links.forEach((l) => l.removeAttribute("aria-current"));
    activeLink.setAttribute("aria-current", "true");
  }

  // Tandai menu sesuai bagian yang sedang tampil di tengah layar
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const match = pairs.find((p) => p.target === entry.target);
        if (match) setActive(match.link);
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  pairs.forEach((p) => observer.observe(p.target));

  // Di dasar halaman, bagian terakhir (Kontak) sulit mencapai tengah layar
  window.addEventListener(
    "scroll",
    () => {
      const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
      if (atBottom && pairs.length) setActive(pairs[pairs.length - 1].link);
    },
    { passive: true }
  );

  // Tutup menu HP setelah salah satu tautan diklik
  links.forEach((link) => {
    link.addEventListener("click", () => {
      if (toggle) toggle.checked = false;
    });
  });
})();