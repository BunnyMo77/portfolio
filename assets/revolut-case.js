(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const observer = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    }
  }, { threshold: .12 });
  document.querySelectorAll('.report-card,.problem-grid,.design-grid,.asset-card,.wire-grid,.hifi-content,.motion-grid,.frame-grid').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });
})();
