// ============================================================
// SmartHome IoT — 传感器模拟数据引擎
// ============================================================

class Simulator {
  constructor() {
    this.interval = null;
    this.tickCount = 0;
    // Per-room current sensor values (for smooth drift)
    this.state = {};
    ROOMS.forEach(r => {
      this.state[r.id] = {};
      r.sensors.forEach(s => {
        this.state[r.id][s] = r.sensorBase[s] || 0;
      });
    });
  }

  start() {
    this._tick();
    this.interval = setInterval(() => this._tick(), 2000);
  }

  stop() {
    if (this.interval) { clearInterval(this.interval); this.interval = null; }
  }

  _tick() {
    this.tickCount++;
    const data = {};

    ROOMS.forEach(room => {
      data[room.id] = {};
      room.sensors.forEach(sensor => {
        const base = room.sensorBase[sensor] || 0;
        const noise = room.sensorNoise[sensor] || 1;
        // Smooth drift: random walk around baseline
        let val = this.state[room.id][sensor];
        val += (Math.random() - 0.5) * noise * 2;

        // Day/night light simulation
        if (sensor === 'light') {
          const hour = new Date().getHours();
          const dayFactor = (hour >= 7 && hour <= 19) ? 1 : 0.2;
          val = base * dayFactor + (Math.random() - 0.5) * noise * 2;
        }

        // Kitchen smoke: occasional spike
        if (sensor === 'smoke' && room.id === 'kitchen') {
          if (Math.random() < 0.03) val += 300 + Math.random() * 200; // 3% chance spike
          val = Math.max(0, val * 0.9 + base * 0.1); // decay back to baseline
        }

        // Clamp to reasonable ranges
        const info = SENSOR_INFO[sensor];
        if (info && info.range) {
          val = Math.max(info.range[0], Math.min(info.range[1], val));
        }

        val = parseFloat(val.toFixed(1));
        this.state[room.id][sensor] = val;
        data[room.id][sensor] = val;
      });
    });

    // Push to store
    if (typeof store !== 'undefined' && store) {
      store.addDataPoint(data);
    }
  }

  /** Get last known value */
  getValue(roomId, sensor) {
    if (this.state[roomId] && this.state[roomId][sensor] !== undefined) {
      return this.state[roomId][sensor];
    }
    const room = ROOMS.find(r => r.id === roomId);
    return room ? (room.sensorBase[sensor] || 0) : 0;
  }
}

let simulator;
