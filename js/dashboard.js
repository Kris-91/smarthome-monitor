// ============================================================
// SmartHome IoT — 仪表盘首页
// ============================================================

class Dashboard {
  constructor() {
    this.refreshTimer = null;
    this.init();
  }

  init() {
    this.renderRoomGrid();
    this.update();
    this.refreshTimer = setInterval(() => this.update(), 2000);
  }

  renderRoomGrid() {
    const grid = document.getElementById('roomGrid');
    const overview = document.getElementById('overviewCards');
    if (!grid || !overview) return;

    // Overview cards
    overview.innerHTML = `
      <div class="ov-card"><div class="ov-value" id="ovAvgTemp">--</div><div class="ov-label">🌡️ 平均温度</div></div>
      <div class="ov-card"><div class="ov-value" id="ovMaxTemp">--</div><div class="ov-label">🔥 最高温度</div></div>
      <div class="ov-card"><div class="ov-value" id="ovDeviceOn">--</div><div class="ov-label">🔌 设备在线</div></div>
      <div class="ov-card danger"><div class="ov-value" id="ovActiveAlerts">0</div><div class="ov-label">⚠️ 活跃告警</div></div>
    `;

    // Room cards
    grid.innerHTML = ROOMS.map(room => {
      const sensorItems = room.sensors.map(s => {
        const info = SENSOR_INFO[s];
        return `<div class="sensor-item">
          <span>${info.icon} ${info.name}</span>
          <span><span class="sensor-val" id="val-${room.id}-${s}">--</span><span class="sensor-unit">${info.unit}</span></span>
        </div>`;
      }).join('');

      return `<div class="room-card" id="roomCard-${room.id}">
        <div class="room-header">${room.icon} ${room.name}</div>
        <div class="sensor-row">${sensorItems}</div>
        <div class="device-summary" id="devSum-${room.id}"></div>
      </div>`;
    }).join('');
  }

  update() {
    const data = store.getLatestData();
    if (!data) return;

    let temps = [];
    let maxTemp = -Infinity;
    let totalDevOn = 0;

    ROOMS.forEach(room => {
      const roomData = data[room.id];
      if (!roomData) return;

      // Update sensor values
      room.sensors.forEach(s => {
        const el = document.getElementById(`val-${room.id}-${s}`);
        if (el && roomData[s] !== undefined) {
          const v = roomData[s];
          el.textContent = v;
          el.className = 'sensor-val';
          // Color based on thresholds
          if (s === 'temperature') {
            if (v > (store.getThreshold('tempHigh') || 32)) el.classList.add('danger');
            else if (v < (store.getThreshold('tempLow') || 10)) el.classList.add('danger');
            else if (v > (store.getThreshold('tempHigh') || 32) * 0.85) el.classList.add('warn');
          }
          if (s === 'humidity' && v > (store.getThreshold('humidityHigh') || 85)) {
            el.classList.add('danger');
          }
          if (s === 'smoke' && v > (store.getThreshold('smokeHigh') || 500)) {
            el.classList.add('danger');
          }
        }
      });

      if (roomData.temperature !== undefined) {
        temps.push(roomData.temperature);
        if (roomData.temperature > maxTemp) maxTemp = roomData.temperature;
      }

      // Device summary
      const counts = store.getRoomDeviceCounts(room.id);
      totalDevOn += counts.on;
      const devSum = document.getElementById(`devSum-${room.id}`);
      if (devSum) {
        devSum.innerHTML = `
          <span><span class="dev-dot on"></span> ${counts.on} 开启</span>
          <span><span class="dev-dot off"></span> ${counts.off} 关闭</span>
        `;
      }
    });

    // Overview
    if (temps.length > 0) {
      const avg = parseFloat((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1));
      document.getElementById('ovAvgTemp').textContent = avg + '°C';
      document.getElementById('ovMaxTemp').textContent = maxTemp.toFixed(1) + '°C';
    }
    document.getElementById('ovDeviceOn').textContent = totalDevOn + '/' + ALL_DEVICES.length;
    document.getElementById('ovActiveAlerts').textContent = store.getAlerts().length;

    // Mini alert list
    this.updateMiniAlerts();
  }

  updateMiniAlerts() {
    const list = document.getElementById('alertListMini');
    if (!list) return;
    const alerts = store.getAlerts().slice(0, 3);
    if (alerts.length === 0) {
      list.innerHTML = '<span style="color:var(--text-muted)">暂无告警 ✅</span>';
      return;
    }
    list.innerHTML = alerts.map(a => {
      const cls = (a.type === '烟雾告警') ? '' : 'warn';
      return `<div class="alert-item-mini ${cls}">
        <span>[${a.time}] ${a.room} ${a.type}</span>
        <span>${a.value}</span>
      </div>`;
    }).join('');
  }

  destroy() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }
}

let dashboard;
