/**
 * partialLoader.js
 * Asynchronously fetches HTML partials and injects them into the DOM.
 */

export async function loadPartials() {
  const headerContainer = document.querySelector(".app-header");
  const footerContainer = document.querySelector(".app-footer");

  try {
    // Fetch partials concurrently
    const [headerResponse, footerResponse] = await Promise.all([
      fetch("/src/partials/header.html"),
      fetch("/src/partials/footer.html")
    ]);

    if (headerContainer && headerResponse.ok) {
      headerContainer.innerHTML = await headerResponse.text();
    }

    if (footerContainer && footerResponse.ok) {
      footerContainer.innerHTML = await footerResponse.text();
    }

    // Highlight active nav link based on URL route
    highlightActiveNav();
  } catch (error) {
    console.error("Failed to load layout partials:", error);
  }
}

function highlightActiveNav() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll(".main-nav .nav-link");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    
    // Check if link matches current path
    if (href === currentPath || (currentPath.includes("/policies/") && href.includes("/policies/"))) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}