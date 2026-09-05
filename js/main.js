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
  requestAnimationFrame(handleNavScroll);

  // --- Mobile menu toggle ---
  var hamburger = document.querySelector('.hamburger');
  var sidebar = document.querySelector('.mobile-sidebar');
  var overlay = document.querySelector('.sidebar-overlay');

  var scrollLockY = 0;

  function openMenu() {
    hamburger.classList.add('active');
    sidebar.classList.add('open');
    overlay.classList.add('active');
    scrollLockY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollLockY + 'px';
    document.body.style.width = '100%';
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollLockY);
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
    if (!link.classList.contains('mobile-solutions-toggle')) {
      link.addEventListener('click', closeMenu);
    }
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
  // Content is visible by default in CSS. JS hides it first, then
  // the observer reveals on scroll. If JS fails, content stays visible.
  var fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    // Hide elements so the scroll-reveal animation can play
    fadeElements.forEach(function (el) {
      el.classList.add('fade-hidden');
    });

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

    // Safety net: force visible after 2s if observer hasn't fired
    setTimeout(function () {
      fadeElements.forEach(function (el) {
        if (!el.classList.contains('visible')) {
          el.classList.add('visible');
        }
      });
    }, 2000);
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
