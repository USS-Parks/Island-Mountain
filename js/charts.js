/* ============================================================
   Island Mountain -- Chart.js Visualizations (Investor Page)
   Data sourced from Island-Mountain-Financial-Model.xlsx (May 2026)
   Copper/Amber palette.
   ============================================================ */

(function () {
  'use strict';

  var copper     = '#f59e0b';
  var copperDeep = '#d97706';
  var copperDark = '#b45309';
  var amber      = '#fbbf24';
  var slate      = '#94a3b8';
  var slateDark  = '#64748b';
  var slateLight = '#cbd5e1';
  var red        = '#ef4444';
  var green      = '#22c55e';
  var textMuted  = '#94a3b8';
  var textLight  = '#f1f5f9';
  var gridColor  = 'rgba(148, 163, 184, 0.1)';

  Chart.defaults.color = textMuted;
  Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.padding = 16;

  var tooltipDefaults = {
    backgroundColor: '#1e293b',
    titleColor: textLight,
    bodyColor: textMuted,
    borderColor: 'rgba(148,163,184,0.2)',
    borderWidth: 1,
    padding: 12
  };

  // ---------------------------------------------------------------
  // 1. COGS Breakdown Donut
  //    Source: BOM - Starter Rack sheet, mid-market column
  // ---------------------------------------------------------------
  var cogsEl = document.getElementById('cogsDonut');
  if (cogsEl) {
    var cogsCtx = cogsEl.getContext('2d');

    var centerPlugin = {
      id: 'centerText',
      afterDraw: function (chart) {
        var w = chart.width, h = chart.height, ctx = chart.ctx;
        ctx.save();
        ctx.font = 'bold 18px Inter, sans-serif';
        ctx.fillStyle = textLight;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$84,278', w / 2, h / 2 - 10);
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = textMuted;
        ctx.fillText('Total COGS', w / 2, h / 2 + 12);
        ctx.restore();
      }
    };

    new Chart(cogsCtx, {
      type: 'doughnut',
      data: {
        labels: [
          'GPUs ($66,000)',
          'Chassis ($7,987)',
          'RAM ($4,000)',
          'CPU ($1,375)',
          'Storage ($1,391)',
          'PSU ($475)',
          'Labor/Testing ($2,000)',
          'Other ($1,050)'
        ],
        datasets: [{
          data: [66000, 7987, 4000, 1375, 1391, 475, 2000, 1050],
          backgroundColor: [copper, slateDark, slate, '#475569', '#334155', copperDark, copperDeep, '#1e293b'],
          borderColor: '#0f172a',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        cutout: '62%',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 11 }, padding: 10 }
          },
          tooltip: Object.assign({}, tooltipDefaults, {
            callbacks: {
              label: function (ctx) {
                var pct = ((ctx.raw / 84278) * 100).toFixed(1);
                return ' ' + ctx.label + ' (' + pct + '%)';
              }
            }
          })
        }
      },
      plugins: [centerPlugin]
    });
  }

  // ---------------------------------------------------------------
  // 2. Margin Sensitivity Line Chart
  //    X: per-GPU cost from $35K down to $20K
  //    Y: gross margin % at $80K selling price
  //    COGS = (gpuCost * 2) + $18,278 non-GPU costs
  // ---------------------------------------------------------------
  var marginEl = document.getElementById('marginSensitivity');
  if (marginEl) {
    var mCtx = marginEl.getContext('2d');
    var sellingPrice = 80000;
    var nonGpuCogs = 18278; // $84,278 total - $66,000 GPUs
    var gpuPrices = [];
    var margins = [];
    for (var g = 35000; g >= 20000; g -= 1000) {
      gpuPrices.push('$' + (g / 1000) + 'K');
      var totalCogs = (g * 2) + nonGpuCogs;
      var margin = ((sellingPrice - totalCogs) / sellingPrice) * 100;
      margins.push(Math.round(margin * 10) / 10);
    }

    // Find zero-crossing index for annotation
    var zeroIdx = -1;
    for (var z = 0; z < margins.length - 1; z++) {
      if (margins[z] <= 0 && margins[z + 1] > 0) { zeroIdx = z + 1; break; }
    }

    var pointColors = margins.map(function (m) { return m >= 0 ? green : red; });
    var bgColors = margins.map(function (m) { return m >= 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.08)'; });

    new Chart(mCtx, {
      type: 'line',
      data: {
        labels: gpuPrices,
        datasets: [{
          label: 'Gross Margin %',
          data: margins,
          borderColor: copper,
          backgroundColor: 'rgba(245,158,11,0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: pointColors,
          pointBorderColor: pointColors,
          borderWidth: 2.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          x: {
            title: { display: true, text: 'Per-GPU Sourcing Cost', color: textMuted, font: { size: 12 } },
            grid: { color: gridColor },
            ticks: { font: { size: 11 } }
          },
          y: {
            title: { display: true, text: 'Gross Margin %', color: textMuted, font: { size: 12 } },
            grid: { color: gridColor },
            ticks: {
              callback: function (val) { return val + '%'; },
              font: { size: 11 }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: Object.assign({}, tooltipDefaults, {
            callbacks: {
              label: function (ctx) {
                return ' Margin: ' + ctx.raw + '%';
              },
              afterLabel: function (ctx) {
                var idx = ctx.dataIndex;
                var gpuCost = 35000 - (idx * 1000);
                var totalCogs = (gpuCost * 2) + nonGpuCogs;
                var profit = sellingPrice - totalCogs;
                return ' COGS: $' + totalCogs.toLocaleString() + ' | Profit: $' + profit.toLocaleString();
              }
            }
          }),
          annotation: undefined // placeholder; annotations handled by plugin below
        }
      },
      plugins: [{
        id: 'zeroLine',
        afterDraw: function (chart) {
          var yScale = chart.scales.y;
          var xScale = chart.scales.x;
          if (yScale && typeof yScale.getPixelForValue === 'function') {
            var yZero = yScale.getPixelForValue(0);
            var ctx = chart.ctx;
            ctx.save();
            ctx.strokeStyle = 'rgba(239,68,68,0.5)';
            ctx.lineWidth = 1;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(xScale.left, yZero);
            ctx.lineTo(xScale.right, yZero);
            ctx.stroke();

            // Market avg annotation ($30.5K = index 4.5 from left)
            var mktIdx = 4.5; // $30.5K between $31K(idx4) and $30K(idx5)
            var mktX = xScale.getPixelForValue(4) + (xScale.getPixelForValue(5) - xScale.getPixelForValue(4)) * 0.5;
            ctx.strokeStyle = 'rgba(148,163,184,0.6)';
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(mktX, yScale.top);
            ctx.lineTo(mktX, yScale.bottom);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.font = '11px Inter, sans-serif';
            ctx.fillStyle = textMuted;
            ctx.textAlign = 'center';
            ctx.fillText('Market Avg $30.5K', mktX, yScale.top - 6);

            // Target bulk annotation ($25K = index 10)
            var tgtX = xScale.getPixelForValue(10);
            ctx.strokeStyle = 'rgba(34,197,94,0.6)';
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(tgtX, yScale.top);
            ctx.lineTo(tgtX, yScale.bottom);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = green;
            ctx.fillText('Target Bulk $25K', tgtX, yScale.top - 6);

            ctx.restore();
          }
        }
      }]
    });
  }

  // ---------------------------------------------------------------
  // 3. Use of Funds Horizontal Bar
  //    Source: Investment Model sheet
  // ---------------------------------------------------------------
  var fundsEl = document.getElementById('useOfFunds');
  if (fundsEl) {
    var fCtx = fundsEl.getContext('2d');

    new Chart(fCtx, {
      type: 'bar',
      data: {
        labels: [
          'Operating Runway',
          'GPU Inventory',
          'Marketing & Sales',
          'Working Capital',
          'Lamprey MAI Eng.',
          'Non-GPU Components',
          'Facility Setup',
          'Legal & Incorp.'
        ],
        datasets: [{
          data: [280000, 198000, 80000, 62000, 50000, 45000, 25000, 10000],
          backgroundColor: [slateDark, copper, '#334155', '#475569', copperDeep, slate, copperDark, '#1e293b'],
          borderRadius: 4,
          barPercentage: 0.7
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: {
              callback: function (val) { return '$' + (val / 1000) + 'K'; },
              font: { size: 11 }
            },
            max: 300000
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: Object.assign({}, tooltipDefaults, {
            callbacks: {
              label: function (ctx) {
                var pct = ((ctx.raw / 750000) * 100).toFixed(1);
                return ' $' + ctx.raw.toLocaleString() + ' (' + pct + '%)';
              }
            }
          })
        }
      }
    });
  }

  // ---------------------------------------------------------------
  // 4. Revenue Projections Grouped Bar (3 scenarios x 2 years)
  //    Source: P&L Projections sheet
  // ---------------------------------------------------------------
  var revEl = document.getElementById('revenueProjections');
  if (revEl) {
    var rCtx = revEl.getContext('2d');

    new Chart(rCtx, {
      type: 'bar',
      data: {
        labels: ['Conservative', 'Moderate', 'Aggressive'],
        datasets: [
          {
            label: 'Year 1 Revenue',
            data: [225000, 480000, 820000],
            backgroundColor: copperDeep,
            borderRadius: 4,
            barPercentage: 0.7
          },
          {
            label: 'Year 2 Revenue',
            data: [624000, 1200000, 1968000],
            backgroundColor: copper,
            borderRadius: 4,
            barPercentage: 0.7
          },
          {
            label: 'Annual Operating Costs',
            data: [360000, 360000, 360000],
            backgroundColor: 'rgba(239,68,68,0.5)',
            borderRadius: 4,
            barPercentage: 0.7,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 12 } }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              callback: function (val) {
                if (val >= 1000000) return '$' + (val / 1000000).toFixed(1) + 'M';
                return '$' + (val / 1000) + 'K';
              },
              font: { size: 11 }
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 12 }, padding: 16 }
          },
          tooltip: Object.assign({}, tooltipDefaults, {
            callbacks: {
              label: function (ctx) {
                return ' ' + ctx.dataset.label + ': $' + ctx.raw.toLocaleString();
              }
            }
          })
        }
      }
    });
  }

})();
