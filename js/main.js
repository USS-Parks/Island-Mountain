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

  // --- Mobile Solutions accordion ---
  var solToggle = document.querySelector('.mobile-solutions-toggle');
  if (solToggle) {
    solToggle.addEventListener('click', function (e) {
      e.preventDefault();
      this.classList.toggle('open');
      var links = document.querySelector('.mobile-solutions-links');
      if (links) links.classList.toggle('open');
    });
  }

  // --- Prevent default on desktop dropdown toggle ---
  var dropdownToggle = document.querySelector('.nav-dropdown-toggle');
  if (dropdownToggle) {
    dropdownToggle.addEventListener('click', function (e) {
      e.preventDefault();
    });
  }

  // --- Active nav link highlighting ---
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  var navAllLinks = document.querySelectorAll('.nav-links a, .mobile-sidebar a');
  navAllLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Highlight Solutions toggle when a dropdown child is active
  var dropdownActiveItem = document.querySelector('.nav-dropdown-menu a.active');
  if (dropdownActiveItem) {
    var parentDropdown = dropdownActiveItem.closest('.nav-dropdown');
    if (parentDropdown) {
      var toggle = parentDropdown.querySelector('.nav-dropdown-toggle');
      if (toggle) toggle.classList.add('active');
    }
  }

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

  // --- Lazy stars ---
  // Fixed canvas above all content. Stars drift slowly, twinkle,
  // and shift from cool white-blue to warm amber as you scroll.
  // ~15% are "bright stars" with soft glow halos.

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
      // Denser field: ~1 star per 8000px², capped at 250
      var count = Math.floor((canvas.width * canvas.height) / 8000);
      count = Math.min(count, 250);
      for (var i = 0; i < count; i++) {
        // ~15% chance of a bright star
        var isBright = Math.random() < 0.15;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: isBright
            ? Math.random() * 2.0 + 2.0    // bright: 2.0 - 4.0
            : Math.random() * 1.4 + 0.5,   // normal: 0.5 - 1.9
          dx: (Math.random() - 0.5) * 0.12,
          dy: (Math.random() - 0.5) * 0.12,
          baseOpacity: isBright
            ? Math.random() * 0.35 + 0.55   // bright: 0.55 - 0.90
            : Math.random() * 0.4 + 0.15,   // normal: 0.15 - 0.55
          twinkleSpeed: Math.random() * 0.003 + 0.001,
          twinklePhase: Math.random() * Math.PI * 2,
          bright: isBright
        });
      }
    }

    function updateScrollRatio() {
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollRatio = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
    }
    window.addEventListener('scroll', updateScrollRatio, { passive: true });
    updateScrollRatio();

    function draw(time) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Color blend: cool white-blue rgb(180,210,240) -> warm amber rgb(245,178,50)
      var cr = Math.round(180 + (245 - 180) * scrollRatio);
      var cg = Math.round(210 + (178 - 210) * scrollRatio);
      var cb = Math.round(240 + (50 - 240) * scrollRatio);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        // Twinkle oscillation -- brighter stars pulse more dramatically
        var amp = p.bright ? 0.45 : 0.3;
        var twinkle = Math.sin(time * p.twinkleSpeed + p.twinklePhase) * amp + (1 - amp);
        var opacity = p.baseOpacity * twinkle;

        // Bright stars get a soft glow halo
        if (p.bright) {
          var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
          grad.addColorStop(0, 'rgba(' + cr + ',' + cg + ',' + cb + ',' + (opacity * 0.6) + ')');
          grad.addColorStop(0.4, 'rgba(' + cr + ',' + cg + ',' + cb + ',' + (opacity * 0.2) + ')');
          grad.addColorStop(1, 'rgba(' + cr + ',' + cg + ',' + cb + ',0)');
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + cr + ',' + cg + ',' + cb + ',' + opacity + ')';
        ctx.fill();

        // Drift
        p.x += p.dx;
        p.y += p.dy;

        // Wrap edges
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;
        if (p.y < -5) p.y = canvas.height + 5;
        if (p.y > canvas.height + 5) p.y = -5;
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
