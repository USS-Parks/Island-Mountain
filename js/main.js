/* ============================================================
   Island Mountain -- Main JavaScript
   Navbar, mobile menu, scroll effects, Intersection Observer,
   Full-page particle system with scroll-based color shifting
   ============================================================ */

(function () {
  'use strict';

  // --- Navbar scroll effect ---
  var navbar = document.querySelector('.navbar');
  function handleNavScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // --- Mobile menu toggle ---
  var hamburger = document.querySelector('.hamburger');
  var sidebar = document.querySelector('.mobile-sidebar');
  var overlay = document.querySelector('.sidebar-overlay');

  function openMenu() {
    hamburger.classList.add('active');
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      if (sidebar.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }

  var sidebarLinks = document.querySelectorAll('.mobile-sidebar a');
  sidebarLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // --- Active nav link highlighting ---
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  var navAllLinks = document.querySelectorAll('.nav-links a, .mobile-sidebar a');
  navAllLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // --- Intersection Observer for fade-in-on-scroll ---
  var fadeElements = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    fadeElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // --- Full-page drifting particles ---
  // Fixed canvas covers viewport. Particles shift from light blue
  // (on warm sunset background) to amber (on deep blue background)
  // based on scroll position. No connection lines -- just lazy drifting dots.

  var canvas = document.getElementById('particles-canvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var scrollRatio = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      var count = Math.floor((canvas.width * canvas.height) / 22000);
      count = Math.min(count, 120); // cap for performance
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.6 + 0.4,
          dx: (Math.random() - 0.5) * 0.15,   // very slow drift
          dy: (Math.random() - 0.5) * 0.15,
          baseOpacity: Math.random() * 0.45 + 0.1,
          twinkleSpeed: Math.random() * 0.002 + 0.001,
          twinklePhase: Math.random() * Math.PI * 2
        });
      }
    }

    // Update scroll ratio on scroll (throttled via passive listener)
    function updateScrollRatio() {
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollRatio = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
    }
    window.addEventListener('scroll', updateScrollRatio, { passive: true });
    updateScrollRatio();

    function draw(time) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Color blend: light blue rgb(136,200,232) -> amber rgb(245,158,11)
      var r = Math.round(136 + (245 - 136) * scrollRatio);
      var g = Math.round(200 + (158 - 200) * scrollRatio);
      var b = Math.round(232 + (11 - 232) * scrollRatio);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        // Twinkle: gentle sine oscillation
        var twinkle = Math.sin(time * p.twinkleSpeed + p.twinklePhase) * 0.3 + 0.7;
        var opacity = p.baseOpacity * twinkle;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
        ctx.fill();

        // Move
        p.x += p.dx;
        p.y += p.dy;

        // Wrap around edges
        if (p.x < -2) p.x = canvas.width + 2;
        if (p.x > canvas.width + 2) p.x = -2;
        if (p.y < -2) p.y = canvas.height + 2;
        if (p.y > canvas.height + 2) p.y = -2;
      }

      requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    requestAnimationFrame(draw);

    window.addEventListener('resize', function () {
      resize();
      createParticles();
    });
  }

  // --- Hero photo scroll fade ---
  // Fixed background image fades out as user scrolls past the first few sections,
  // revealing the html gradient beneath. Cards scroll through the image.
  var heroPhoto = document.querySelector('.hero-photo');
  if (heroPhoto) {
    function updateHeroPhotoOpacity() {
      var fadeStart = 100;    // start fading after 100px scroll
      var fadeEnd = 800;      // fully invisible by 800px scroll
      var scrollY = window.scrollY;
      if (scrollY <= fadeStart) {
        heroPhoto.style.opacity = '1';
      } else if (scrollY >= fadeEnd) {
        heroPhoto.style.opacity = '0';
      } else {
        heroPhoto.style.opacity = String(1 - (scrollY - fadeStart) / (fadeEnd - fadeStart));
      }
    }
    window.addEventListener('scroll', updateHeroPhotoOpacity, { passive: true });
    updateHeroPhotoOpacity();
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
