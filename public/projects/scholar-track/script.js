/* Scholar Track showcase interactions. No dependencies. */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Reveal on scroll */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* Hero stage: parallax tilt following the pointer */
  const stage = document.querySelector("[data-tilt-stage]");
  if (stage && !reduce) {
    const shots = [...stage.querySelectorAll(".shot")];
    const base = {
      "shot-center": (x, y) => `translateX(-50%) rotateX(${8 - y * 6}deg) rotateY(${x * 6}deg)`,
      "shot-left": (x, y) => `rotateY(${28 + x * 8}deg) rotateX(${4 - y * 5}deg) translateZ(-120px) translateX(${x * 14}px)`,
      "shot-right": (x, y) => `rotateY(${-28 + x * 8}deg) rotateX(${4 - y * 5}deg) translateZ(-120px) translateX(${x * 14}px)`,
    };
    let raf = 0;
    let target = { x: 0, y: 0 };
    const apply = () => {
      shots.forEach((s) => {
        const kind = [...s.classList].find((c) => base[c]);
        const depth = parseFloat(s.dataset.depth || "1");
        s.style.transform = base[kind](target.x * depth, target.y * depth);
      });
      raf = 0;
    };
    const onMove = (e) => {
      const r = stage.getBoundingClientRect();
      target = { x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 };
      stage.classList.add("is-moving");
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      stage.classList.remove("is-moving");
      target = { x: 0, y: 0 };
      if (!raf) raf = requestAnimationFrame(apply);
    };
    document.querySelector(".hero").addEventListener("pointermove", onMove);
    document.querySelector(".hero").addEventListener("pointerleave", onLeave);
  }

  /* Card / device tilt on hover */
  if (!reduce) {
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      const isDevice = el.classList.contains("device");
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        const amp = isDevice ? 6 : 8;
        el.style.transform = `perspective(1400px) rotateY(${x * amp}deg) rotateX(${-y * amp}deg) scale(1.01)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* Marquee: duplicate content so the loop is seamless */
  const track = document.querySelector("[data-marquee]");
  if (track) {
    track.innerHTML += track.innerHTML;
  }

  /* Light / dark compare slider */
  const compare = document.querySelector("[data-compare]");
  if (compare) {
    const range = compare.querySelector(".compare-range");
    const set = (v) => compare.style.setProperty("--pos", `${v}%`);
    range.addEventListener("input", () => set(range.value));
    set(range.value);
    // gentle idle sweep until the visitor interacts
    if (!reduce) {
      let t = 0;
      let idle = true;
      const sweep = () => {
        if (!idle) return;
        t += 0.008;
        const v = 50 + Math.sin(t) * 22;
        range.value = v;
        set(v);
        requestAnimationFrame(sweep);
      };
      range.addEventListener("pointerdown", () => (idle = false), { once: true });
      range.addEventListener("focus", () => (idle = false), { once: true });
      requestAnimationFrame(sweep);
    }
  }

  /* Phone screens: scroll distance depends on each image height */
  document.querySelectorAll(".phone-screen.scroller img").forEach((img) => {
    const setDistance = () => {
      const screen = img.parentElement;
      const d = Math.max(0, img.offsetHeight - screen.clientHeight);
      img.style.setProperty("--d", `${d}px`);
    };
    img.complete ? setDistance() : img.addEventListener("load", setDistance);
    window.addEventListener("resize", setDistance);
  });
  const style = document.createElement("style");
  style.textContent = `@keyframes phoneScroll { from { transform: translateY(0); } to { transform: translateY(calc(-1 * var(--d, 0px))); } }`;
  document.head.appendChild(style);

  /* Lightbox */
  const gallery = document.querySelector("[data-gallery]");
  const lb = document.querySelector("[data-lightbox]");
  if (gallery && lb) {
    const items = [...gallery.querySelectorAll(".g-item")];
    const img = lb.querySelector("img");
    const cap = lb.querySelector("figcaption");
    let i = 0;
    const show = (n) => {
      i = (n + items.length) % items.length;
      const a = items[i];
      img.src = a.getAttribute("href");
      img.alt = a.querySelector("img").alt;
      cap.textContent = `${a.querySelector("span").textContent} · ${i + 1} / ${items.length}`;
    };
    const open = (n) => {
      show(n);
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      lb.querySelector(".lb-close").focus();
    };
    const close = () => {
      lb.hidden = true;
      document.body.style.overflow = "";
    };
    items.forEach((a, n) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        open(n);
      })
    );
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", () => show(i - 1));
    lb.querySelector(".lb-next").addEventListener("click", () => show(i + 1));
    lb.addEventListener("click", (e) => e.target === lb && close());
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(i - 1);
      if (e.key === "ArrowRight") show(i + 1);
    });
  }
})();
