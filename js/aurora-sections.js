/* ============================================================
   Island Mountain - aurora scroll sections
   Loads after hero-cinematic.js.
   Plays the Sovereign Stack video only while it is on screen -
   below-fold autoplay is unreliable, so this makes it deterministic.
   ============================================================ */
;(function () {
  var stackVid = document.querySelector('.au-stackvid')
  if (!stackVid) return
  new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var pr = stackVid.play()
          if (pr && pr.catch) pr.catch(function () {})
        } else {
          stackVid.pause()
        }
      })
    },
    { threshold: 0.3 }
  ).observe(stackVid)
})()
