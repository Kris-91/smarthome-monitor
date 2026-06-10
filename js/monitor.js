// ============================================================
// SmartHome IoT — 数据监控（多房间对比 + 阈值参考线）
// ============================================================

class Monitor {
  constructor() {
    this.chart = null;
    this.chartBuilt = false;
    this.refreshTimer = null;
    this.compareMode = false;
    this.init();
  }

  init() {
    const roomSelect = document.getElementById('monitorRoom');
    const metricSelect = document.getElementById('monitorMetric');
    const rangeSelect = document.getElementById('monitorRange');

    if (roomSelect) {
      roomSelect.innerHTML =
        `<option value="__all__">🏠 全屋对比</option>` +
        ROOMS.map(r => `<option value="${r.id}">${r.icon} ${r.name}</option>`).join('');
      roomSelect.addEventListener('change', () => this.rebuildChart());
    }
    if (metricSelect) metricSelect.addEventListener('change', () => this.rebuildChart());
    if (rangeSelect) rangeSelect.addEventListener('change', () => this.rebuildChart());
  }

  activate() {
    if (!this.chartBuilt) {
      this.buildChart();
      this.chartBuilt = true;
    } else {
      this.rebuildChart();
    }
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.refreshTimer = setInterval(() => this.updateChart(), 2000);
  }

  deactivate() {
    if (this.refreshTimer) { clearInterval(this.refreshTimer); this.refreshTimer = null; }
  }

  buildChart() {
    const ctx = document.getElementById('sensorChart');
    if (!ctx) return;
    if (typeof Chart === 'undefined') {
      document.getElementById('chartFallback').style.display = 'block';
      return;
    }

    const roomId = document.getElementById('monitorRoom').value;
    const metric = document.getElementById('monitorMetric').value;
    const info = { icon: '', name: metric, unit: '', ...(SENSOR_INFO[metric] || {}) };
    const range = parseInt(document.getElementById('monitorRange').value);

    this.compareMode = (roomId === '__all__');
    const gridColor = '#1e3a5f44';
    const textColor = '#94a3b8';

    let datasets;

    if (this.compareMode) {
      // Multi-room comparison
      const colors = ['#38bdf8', '#4ade80', '#fbbf24', '#f87171'];
      datasets = ROOMS.map((room, i) => {
        const series = store.getSensorSeries(room.id, metric, range);
        return {
          label: `${room.icon} ${room.name}`,
          data: series.map(p => p.value),
          borderColor: colors[i % colors.length],
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
          fill: false,
        };
      });
    } else {
      // Single room
      const series = store.getSensorSeries(roomId, metric, range);
      datasets = [{
        label: `${info.icon} ${info.name} (${info.unit})`,
        data: series.map(p => p.value),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56,189,248,0.08)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        fill: true,
      }];

      // Add threshold reference lines for this metric
      this._addThresholdLines(datasets, metric, series.length);
    }

    // Build uniform labels — find a room that has the selected sensor
    const labelRoom = this.compareMode
      ? (ROOMS.find(r => r.sensors.includes(metric)) || ROOMS[0])
      : { id: roomId };
    const firstSeries = store.getSensorSeries(labelRoom.id, metric, range);
    const labels = firstSeries.map(p => {
      const d = new Date(p.time);
      return d.toLocaleTimeString('zh-CN', { hour12: false });
    });

    this.chart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 200 },
        plugins: {
          legend: { labels: { color: textColor, usePointStyle: true } },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} ${info.unit}`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: textColor, maxTicksLimit: 10, font: { size: 10 } },
            grid: { color: gridColor },
          },
          y: {
            ticks: { color: textColor, font: { size: 10 } },
            grid: { color: gridColor },
            title: { display: true, text: info.unit, color: textColor },
          },
        },
      },
    });
  }

  _addThresholdLines(datasets, metric, pointCount) {
    const lines = [];
    if (metric === 'temperature') {
      lines.push({ val: store.getThreshold('tempHigh') || 32, label: '高温线', color: '#f87171' });
      lines.push({ val: store.getThreshold('tempLow') || 10, label: '低温线', color: '#60a5fa' });
    } else if (metric === 'humidity') {
      lines.push({ val: store.getThreshold('humidityHigh') || 85, label: '高湿线', color: '#f87171' });
    } else if (metric === 'smoke') {
      lines.push({ val: store.getThreshold('smokeHigh') || 500, label: '烟雾线', color: '#f87171' });
    }
    lines.forEach(line => {
      datasets.push({
        label: `⚠ ${line.label} (${line.val})`,
        data: Array(pointCount || 60).fill(line.val),
        borderColor: line.color,
        borderWidth: 1.5,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
      });
    });
  }

  rebuildChart() {
    if (this.chart) { this.chart.destroy(); this.chart = null; }
    this.chartBuilt = false;
    this.buildChart();
    this.chartBuilt = true;
  }

  updateChart() {
    if (!this.chart) return;
    const roomId = document.getElementById('monitorRoom').value;
    const metric = document.getElementById('monitorMetric').value;
    const range = parseInt(document.getElementById('monitorRange').value);
    const info = { icon: '', name: metric, unit: '', ...(SENSOR_INFO[metric] || {}) };

    if (this.compareMode) {
      const labelRoom = ROOMS.find(r => r.sensors.includes(metric)) || ROOMS[0];
      const firstSeries = store.getSensorSeries(labelRoom.id, metric, range);
      this.chart.data.labels = firstSeries.map(p =>
        new Date(p.time).toLocaleTimeString('zh-CN', { hour12: false }));

      ROOMS.forEach((room, i) => {
        const series = store.getSensorSeries(room.id, metric, range);
        if (this.chart.data.datasets[i]) {
          this.chart.data.datasets[i].data = series.map(p => p.value);
        }
      });
    } else {
      const series = store.getSensorSeries(roomId, metric, range);
      this.chart.data.labels = series.map(p =>
        new Date(p.time).toLocaleTimeString('zh-CN', { hour12: false }));
      this.chart.data.datasets[0].data = series.map(p => p.value);
    }
    this.chart.update('none');
  }

  destroy() {
    this.deactivate();
    if (this.chart) { this.chart.destroy(); this.chart = null; }
  }
}

let monitor;
