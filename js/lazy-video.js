/* Defer below-the-fold looping videos. Each carries preload="none",
   muted/loop/playsinline, and data-lazy instead of autoplay; playback
   starts just before the video scrolls into view and pauses when it
   leaves, so page load never pays for footage nobody is looking at. */
(function () {
  var vids = document.querySelectorAll('video[data-lazy]');
  if (!vids.length) return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    // Show the poster / first frame, never animate.
    vids.forEach(function (v) { v.preload = 'metadata'; });
    return;
  }

  if (!('IntersectionObserver' in window)) {
    vids.forEach(function (v) {
      v.preload = 'metadata';
      v.play().catch(function () {});
    });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.play().catch(function () {});
      } else {
        e.target.pause();
      }
    });
  }, { rootMargin: '400px 0px' });

  vids.forEach(function (v) { io.observe(v); });
})();
