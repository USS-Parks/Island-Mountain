(function () {
  'use strict';

  var careersRoot = document.querySelector('[data-careers-root]');
  if (!careersRoot) return;

  var heroForm = document.getElementById('career-hero-search');
  var heroInput = document.getElementById('career-hero-query');
  var searchInput = document.getElementById('career-search');
  var departmentSelect = document.getElementById('career-department');
  var locationSelect = document.getElementById('career-location');
  var resultCount = document.getElementById('career-result-count');
  var emptyState = document.getElementById('career-empty-state');
  var resetButtons = document.querySelectorAll('[data-career-reset]');
  var chips = document.querySelectorAll('[data-career-chip]');
  var roles = Array.prototype.slice.call(document.querySelectorAll('[data-career-role]'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('[data-career-group]'));
  var successBanner = document.getElementById('career-success-banner');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function syncChips() {
    var selected = departmentSelect.value;
    Array.prototype.forEach.call(chips, function (chip) {
      chip.setAttribute('aria-pressed', chip.getAttribute('data-career-chip') === selected ? 'true' : 'false');
    });
  }

  function updateQueryString() {
    if (!window.history || !window.URLSearchParams) return;
    var params = new URLSearchParams(window.location.search);
    var query = searchInput.value.trim();
    var department = departmentSelect.value;
    var location = locationSelect.value;

    query ? params.set('q', query) : params.delete('q');
    department ? params.set('department', department) : params.delete('department');
    location ? params.set('location', location) : params.delete('location');
    params.delete('applied');

    var next = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + '#open-positions';
    window.history.replaceState(null, '', next);
  }

  function filterRoles(shouldUpdateUrl) {
    var query = normalize(searchInput.value);
    var department = departmentSelect.value;
    var location = locationSelect.value;
    var visible = 0;

    roles.forEach(function (role) {
      var matchesQuery = !query || normalize(role.getAttribute('data-search')).indexOf(query) !== -1;
      var matchesDepartment = !department || role.getAttribute('data-department') === department;
      var matchesLocation = !location || role.getAttribute('data-location') === location;
      var show = matchesQuery && matchesDepartment && matchesLocation;
      role.hidden = !show;
      if (show) visible += 1;
    });

    groups.forEach(function (group) {
      var hasVisibleRole = group.querySelector('[data-career-role]:not([hidden])');
      group.hidden = !hasVisibleRole;
    });

    resultCount.textContent = visible + (visible === 1 ? ' open position' : ' open positions');
    emptyState.hidden = visible !== 0;
    syncChips();
    if (shouldUpdateUrl) updateQueryString();
  }

  function resetFilters() {
    searchInput.value = '';
    heroInput.value = '';
    departmentSelect.value = '';
    locationSelect.value = '';
    filterRoles(true);
    searchInput.focus();
  }

  function applyInitialState() {
    if (!window.URLSearchParams) return;
    var params = new URLSearchParams(window.location.search);
    searchInput.value = params.get('q') || '';
    heroInput.value = searchInput.value;
    departmentSelect.value = params.get('department') || '';
    locationSelect.value = params.get('location') || '';

    var applied = params.get('applied');
    if (applied && successBanner) {
      successBanner.hidden = false;
      successBanner.focus();
    }
  }

  heroForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchInput.value = heroInput.value;
    filterRoles(true);
    document.getElementById('open-positions').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  searchInput.addEventListener('input', function () {
    heroInput.value = searchInput.value;
    filterRoles(true);
  });
  departmentSelect.addEventListener('change', function () { filterRoles(true); });
  locationSelect.addEventListener('change', function () { filterRoles(true); });

  Array.prototype.forEach.call(chips, function (chip) {
    chip.addEventListener('click', function () {
      departmentSelect.value = chip.getAttribute('data-career-chip');
      filterRoles(true);
      document.getElementById('open-positions').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  Array.prototype.forEach.call(resetButtons, function (button) {
    button.addEventListener('click', resetFilters);
  });

  applyInitialState();
  filterRoles(false);
})();
