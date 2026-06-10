// ============================================================
// SmartHome IoT — 告警引擎 + 阈值管理
// ============================================================

class AlertEngine {
  constructor() {
    this.lastCheck = {};
    this.cooldownMs = 10000;
    this._audioCtx = null;
    this.init();
  }

  init() {
    this.renderThresholds();
    this.bindEvents();
  }

  renderThresholds() {
    const grid = document.getElementById('thresholdGrid');
    if (!grid) return;

    grid.innerHTML = Object.entries(DEFAULT_THRESHOLDS).map(([key, def]) => `
      <div class="threshold-item">
        <label>${def.label}</label>
        <input type="number" id="th-${key}" value="${store.getThreshold(key) ?? def.value}" step="1">
        <span class="th-unit">${def.unit}</span>
      </div>
    `).join('');
  }

  bindEvents() {
    // Threshold changes
    Object.keys(DEFAULT_THRESHOLDS).forEach(key => {
      const input = document.getElementById(`th-${key}`);
      if (input) {
        input.addEventListener('change', () => {
          const val = parseFloat(input.value);
          if (!isNaN(val)) store.setThreshold(key, val);
        });
      }
    });

    // Alert filter
    const filter = document.getElementById('alertFilter');
    if (filter) filter.addEventListener('change', () => this.renderAlertTable());

    // Clear alerts
    const clearBtn = document.getElementById('clearAlertsBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        store.clearAlerts();
        this.renderAlertTable();
        this.updateBadge();
      });
    }

    // Bell click → switch to alerts tab
    const bell = document.getElementById('alertBell');
    if (bell) {
      bell.addEventListener('click', () => {
        if (window.app) window.app.switchTab('alerts');
      });
    }
  }

  /** Check all rooms against thresholds — called every data tick */
  check(data) {
    let newAlerts = 0;

    ROOMS.forEach(room => {
      const roomData = data[room.id];
      if (!roomData) return;

      Object.entries(DEFAULT_THRESHOLDS).forEach(([key, def]) => {
        const val = roomData[def.sensor];
        if (val === undefined) return; // Sensor not in this room
        const th = store.getThreshold(key);

        let triggered = false;
        if (def.condition === '>') triggered = val > th;
        if (def.condition === '<') triggered = val < th;

        if (triggered) {
          const checkKey = `${room.id}-${key}`;
          const now = Date.now();
          if (!this.lastCheck[checkKey] || now - this.lastCheck[checkKey] > this.cooldownMs) {
            this.lastCheck[checkKey] = now;
            store.addAlert(room.name, def.label, `${val}${def.unit}`, `阈值: ${th}${def.unit}`);
            newAlerts++;
          }
        }
      });
    });

    if (newAlerts > 0) {
      this.animateBell();
      this.playSound();
    }
    this.updateBadge();
  }

  animateBell() {
    const bell = document.getElementById('alertBell');
    if (!bell) return;
    bell.classList.add('active');
    setTimeout(() => bell.classList.remove('active'), 600);
  }

  updateBadge() {
    const badge = document.getElementById('alertBadge');
    if (badge) {
      const count = store.getAlerts().length;
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  playSound() {
    const toggle = document.getElementById('soundToggle');
    if (!toggle || !toggle.checked) return;
    try {
      if (!this._audioCtx) {
        this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = this._audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square'; osc.frequency.value = 880;
      gain.gain.value = 0.05;
      osc.start(); osc.stop(ctx.currentTime + 0.15);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    } catch (e) { /* audio not supported */ }
  }

  renderAlertTable() {
    const tbody = document.getElementById('alertTableBody');
    if (!tbody) return;
    let alerts = store.getAlerts();

    // Apply filter
    const filter = document.getElementById('alertFilter');
    if (filter && filter.value !== 'all') {
      alerts = alerts.filter(a => a.type === filter.value);
    }

    if (alerts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">暂无告警记录 ✅</td></tr>';
      return;
    }
    tbody.innerHTML = alerts.map(a => {
      const rowClass = a.type === '烟雾告警' ? 'alert-row-critical' : 'alert-row-warn';
      return `<tr class="${rowClass}">
        <td>${a.time}</td>
        <td>${a.room}</td>
        <td>${a.type}</td>
        <td>${a.value}</td>
        <td>${a.thresholdId}</td>
      </tr>`;
    }).join('');
  }

  /** Called when alerts tab is activated */
  activate() {
    this.renderAlertTable();
  }
}

let alertEngine;
