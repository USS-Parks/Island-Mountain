/* ============================================================
   Island Mountain -- Chart.js Visualizations
   Cost donut, margin waterfall, revenue projections, market comparison
   ============================================================ */

(function () {
  'use strict';

  // --- Color constants ---
  var green = '#10b981';
  var greenDeep = '#059669';
  var indigo = '#6366f1';
  var amber = '#f59e0b';
  var red = '#ef4444';
  var purple = '#8b5cf6';
  var textMuted = '#94a3b8';
  var textLight = '#f1f5f9';
  var gridColor = 'rgba(148, 163, 184, 0.1)';

  // Chart.js defaults
  Chart.defaults.color = textMuted;
  Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.padding = 16;

  // --- 1. Cost Breakdown Donut ---
  var donutEl = document.getElementById('costDonut');
  if (donutEl) {
    var donutCtx = donutEl.getContext('2d');

    // Center text plugin
    var centerTextPlugin = {
      id: 'centerText',
      afterDraw: function (chart) {
        var width = chart.width;
        var height = chart.height;
        var ctx = chart.ctx;
        ctx.save();
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.fillStyle = textLight;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$41,850', width / 2, height / 2 - 10);
        ctx.font = '13px Inter, sans-serif';
        ctx.fillStyle = textMuted;
        ctx.fillText('Total Cost', width / 2, height / 2 + 14);
        ctx.restore();
      }
    };

    new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Hardware ($31,500)', 'Labor ($1,700)', 'Shipping ($2,000)', 'Warranty Reserve ($6,300)', 'Packaging ($350)'],
        datasets: [{
          data: [31500, 1700, 2000, 6300, 350],
          backgroundColor: [green, indigo, amber, red, purple],
          borderColor: 'transparent',
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        cutout: '65%',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 12 }, padding: 14 }
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: textLight,
            bodyColor: textMuted,
            borderColor: 'rgba(148,163,184,0.2)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function (ctx) {
                var pct = ((ctx.raw / 41850) * 100).toFixed(1);
                return ' ' + ctx.label + ' (' + pct + '%)';
              }
            }
          }
        }
      },
      plugins: [centerTextPlugin]
    });
  }

  // --- 2. Margin Waterfall ---
  var waterfallEl = document.getElementById('marginWaterfall');
  if (waterfallEl) {
    var wCtx = waterfallEl.getContext('2d');

    // Floating bar waterfall
    var labels = ['BOM', 'Labor', 'Shipping', 'Warranty', 'Packaging', 'Total Cost', 'Sale Price', 'Gross Profit'];
    var values = [31500, 1700, 2000, 6300, 350, null, 65000, null];

    // Calculate running totals for the waterfall
    var running = 0;
    var lows = [];
    var highs = [];
    var bgColors = [];

    for (var i = 0; i < values.length; i++) {
      if (labels[i] === 'Total Cost') {
        lows.push(0);
        highs.push(41850);
        bgColors.push(amber);
      } else if (labels[i] === 'Sale Price') {
        lows.push(0);
        highs.push(65000);
        bgColors.push(green);
      } else if (labels[i] === 'Gross Profit') {
        lows.push(41850);
        highs.push(65000);
        bgColors.push(indigo);
      } else {
        var prevRunning = running;
        running += values[i];
        lows.push(prevRunning);
        highs.push(running);
        bgColors.push(red);
      }
    }

    new Chart(wCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Base',
            data: lows,
            backgroundColor: 'transparent',
            borderWidth: 0,
            barPercentage: 0.6
          },
          {
            label: 'Value',
            data: highs.map(function (h, idx) { return h - lows[idx]; }),
            backgroundColor: bgColors,
            borderWidth: 0,
            borderRadius: 4,
            barPercentage: 0.6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { font: { size: 11 } }
          },
          y: {
            stacked: true,
            grid: { color: gridColor },
            ticks: {
              callback: function (val) { return '$' + (val / 1000).toFixed(0) + 'K'; },
              font: { size: 11 }
            },
            max: 70000
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: textLight,
            bodyColor: textMuted,
            borderColor: 'rgba(148,163,184,0.2)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function (ctx) {
                if (ctx.datasetIndex === 0) return '';
                var actual = ctx.raw;
                return ' $' + actual.toLocaleString();
              }
            },
            filter: function (item) { return item.datasetIndex === 1; }
          }
        }
      }
    });
  }

  // --- 3. Annual Revenue Projection ---
  var revenueEl = document.getElementById('revenueProjection');
  if (revenueEl) {
    var rCtx = revenueEl.getContext('2d');

    new Chart(rCtx, {
      type: 'line',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
          {
            label: 'Conservative (4 units)',
            data: [65000, 130000, 195000, 260000],
            borderColor: green,
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: green,
            borderWidth: 2
          },
          {
            label: 'Moderate (8 units)',
            data: [130000, 260000, 390000, 520000],
            borderColor: indigo,
            backgroundColor: 'rgba(99, 102, 241, 0.06)',
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: indigo,
            borderWidth: 2
          },
          {
            label: 'Aggressive (14 units)',
            data: [227500, 455000, 682500, 910000],
            borderColor: amber,
            backgroundColor: 'rgba(245, 158, 11, 0.05)',
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: amber,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { font: { size: 12 } }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              callback: function (val) { return '$' + (val / 1000).toFixed(0) + 'K'; },
              font: { size: 11 }
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 12 }, padding: 16 }
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: textLight,
            bodyColor: textMuted,
            borderColor: 'rgba(148,163,184,0.2)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function (ctx) {
                return ' ' + ctx.dataset.label + ': $' + ctx.raw.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  // --- 4. Market Comparison ---
  var marketEl = document.getElementById('marketComparison');
  if (marketEl) {
    var mCtx = marketEl.getContext('2d');

    new Chart(mCtx, {
      type: 'bar',
      data: {
        labels: ['Island Mountain\nStarter', 'Lambda Labs\nSingle H100', 'Puget Systems\nAI Workstation', 'Dell Enterprise\nCustom Config'],
        datasets: [{
          data: [65000, 60000, 45000, 80000],
          backgroundColor: [green, '#64748b', '#64748b', '#64748b'],
          borderRadius: 6,
          barPercentage: 0.55
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
              callback: function (val) { return '$' + (val / 1000).toFixed(0) + 'K'; },
              font: { size: 11 }
            },
            max: 90000
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: textLight,
            bodyColor: textMuted,
            borderColor: 'rgba(148,163,184,0.2)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function (ctx) {
                var suffix = ctx.raw === 80000 ? '+' : '';
                return ' $' + ctx.raw.toLocaleString() + suffix;
              }
            }
          }
        }
      }
    });
  }

})();
