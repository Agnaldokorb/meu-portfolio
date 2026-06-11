const nav = document.querySelector(".menu-fixo");
const menuToggle = document.querySelector(".menu-toggle");
const links = document.querySelectorAll(".menu-fixo a");

function normalizePath(pathname) {
  const normalizedPath = decodeURIComponent(pathname)
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/\/index\.html$/i, "/")
    .replace(/\/$/, "");

  return normalizedPath || "/";
}

function updateActiveLink() {
  const currentPath = normalizePath(window.location.pathname);

  links.forEach((link) => {
    const linkPath = normalizePath(
      new URL(link.href, window.location.href).pathname,
    );
    const isActive = linkPath === currentPath;

    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

if (nav) {
  const shrikAt = 30;
  const desktopBreakpoint = 768;

  function closeMenu() {
    nav.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Abrir menu");
  }

  function toggleMenu() {
    const isOpen = nav.classList.toggle("menu-open");
    menuToggle?.setAttribute("aria-expanded", isOpen.toString());
    menuToggle?.setAttribute(
      "aria-label",
      isOpen ? "Fechar menu" : "Abrir menu",
    );
  }

  window.addEventListener("scroll", updateMenuState, { passive: true });
  menuToggle?.addEventListener("click", toggleMenu);
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > desktopBreakpoint) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
    }
  });

  updateMenuState();

  function updateMenuState() {
    if (window.scrollY > shrikAt) {
      nav.classList.add("shrink");
    } else {
      nav.classList.remove("shrink");
    }
  }
}

updateActiveLink();
