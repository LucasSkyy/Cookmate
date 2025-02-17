window.addEventListener('load', () => {
  const hasVisited = sessionStorage.getItem('hasVisited');
  const loader = document.querySelector('.loader-wrapper');

  if (!hasVisited) {
    // First visit - show loading animation
    sessionStorage.setItem('hasVisited', 'true');
    setTimeout(() => {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }, 1000);
  } else {
    // Return visit - hide loader immediately
    loader.style.display = 'none';
  }
});
