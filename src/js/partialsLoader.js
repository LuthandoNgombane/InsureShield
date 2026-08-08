/**
 * partialLoader.js
 * Injects HTML partials directly at build time using Vite raw imports.
 */

import headerHtml from '../partials/header.html?raw';
import footerHtml from '../partials/footer.html?raw';

export function loadPartials() {
  const headerContainer = document.querySelector(".app-header");
  const footerContainer = document.querySelector(".app-footer");

  if (headerContainer) {
    headerContainer.innerHTML = headerHtml;
  }

  if (footerContainer) {
    footerContainer.innerHTML = footerHtml;
  }

  highlightActiveNav();
}

function highlightActiveNav() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll(".main-nav .nav-link");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    
    if (href === currentPath || (currentPath.includes("/policies/") && href.includes("/policies/"))) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}