// ============================================================
// SmartHome IoT — 数据存储层 (内存 + localStorage)
// ============================================================

class DataStore {
  constructor() {
    this.history = [];       // { timestamp, data: { roomId: { sensor: val } } }
    this.maxHistory = 200;
    this.deviceStates = {};  // { deviceId: true/false }
    this.thresholds = {};
    this.alerts = [];        // { time, room, type, value, thresholdId }

    this._load();
    this._initDefaults();
  }

  _initDefaults() {
    // Device states — default all ON
    ALL_DEVICES.forEach(d => {
      if (!(d.id in this.deviceStates)) {
        this.deviceStates[d.id] = true;
      }
    });

    // Thresholds
    Object.entries(DEFAULT_THRESHOLDS).forEach(([key, def]) => {
      if (!(key in this.thresholds)) {
        this.thresholds[key] = def.value;
      }
    });
  }

  addDataPoint(data) {
    const point = { timestamp: Date.now(), data: JSON.parse(JSON.stringify(data)) };
    this.history.push(point);
    if (this.history.length > this.maxHistory) this.history.shift();
  }

  getRecentHistory(seconds) {
    const cutoff = Date.now() - seconds * 1000;
    return this.history.filter(p => p.timestamp >= cutoff);
  }

  getLatestData() {
    if (this.history.length === 0) return null;
    return this.history[this.history.length - 1].data;
  }

  getSensorSeries(roomId, sensor, seconds) {
    const cutoff = Date.now() - seconds * 1000;
    return this.history
      .filter(p => p.timestamp >= cutoff)
      .map(p => ({
        time: p.timestamp,
        value: p.data[roomId] ? p.data[roomId][sensor] : null,
      }))
      .filter(p => p.value !== null && p.value !== undefined);
  }

  // Device
  toggleDevice(deviceId) {
    this.deviceStates[deviceId] = !this.deviceStates[deviceId];
    this._save();
    return this.deviceStates[deviceId];
  }
  getDeviceState(deviceId) {
    return this.deviceStates[deviceId] !== undefined ? this.deviceStates[deviceId] : true;
  }
  getRoomDeviceCounts(roomId) {
    const devices = ALL_DEVICES.filter(d => d.room === roomId);
    const on = devices.filter(d => this.getDeviceState(d.id)).length;
    return { total: devices.length, on, off: devices.length - on };
  }

  // Thresholds
  setThreshold(key, value) {
    this.thresholds[key] = value;
    this._save();
  }
  getThreshold(key) {
    return this.thresholds[key];
  }

  // Alerts
  addAlert(room, type, value, thresholdId) {
    const alert = {
      time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      fullTime: Date.now(),
      room, type, value, thresholdId,
    };
    this.alerts.unshift(alert);
    if (this.alerts.length > 100) this.alerts.pop();
    this._save();
    return alert;
  }
  getAlerts() { return this.alerts; }
  clearAlerts() { this.alerts = []; this._save(); }

  // Persistence
  _save() {
    try {
      const data = {
        deviceStates: this.deviceStates,
        thresholds: this.thresholds,
        alerts: this.alerts,
      };
      localStorage.setItem('smarthome-iot', JSON.stringify(data));
    } catch (e) { /* silent */ }
  }
  _load() {
    try {
      const raw = localStorage.getItem('smarthome-iot');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.deviceStates) this.deviceStates = data.deviceStates;
        if (data.thresholds) this.thresholds = data.thresholds;
        if (data.alerts) this.alerts = data.alerts;
      }
    } catch (e) { /* silent */ }
  }
}

let store;
