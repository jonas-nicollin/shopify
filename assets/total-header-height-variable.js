(() => {
  const SELECTOR = '.shopify-section-group-header-group';
  const VARIABLE_NAME = '--total-header-height';

  let ticking = false;

  function isVisibleInViewport(el) {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();

    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.top < window.innerHeight
    );
  }

  function updateTotalHeaderHeight() {
    const headerSections = document.querySelectorAll(SELECTOR);

    const totalHeight = Array.from(headerSections).reduce((total, el) => {
      if (!isVisibleInViewport(el)) return total;

      return total + el.getBoundingClientRect().height;
    }, 0);

    // Avoid feeding our own style write back into the MutationObserver every frame.
    const value = `${Math.round(totalHeight)}px`;
    if (document.documentElement.style.getPropertyValue(VARIABLE_NAME) !== value) {
      document.documentElement.style.setProperty(VARIABLE_NAME, value);
    }

    ticking = false;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateTotalHeaderHeight);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', requestUpdate, { once: true });
  } else {
    requestUpdate();
  }
  window.addEventListener('load', requestUpdate);
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('scroll', requestUpdate, { passive: true });

  const observer = new MutationObserver(requestUpdate);

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style'],
  });
})();
