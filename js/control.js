// ============================================================
// SmartHome IoT — 设备控制面板（含总控+场景）
// ============================================================

class Control {
  constructor() {
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    const container = document.getElementById('devicePanels');
    if (!container) return;

    // Master control bar
    const masterHTML = `
      <div class="master-control">
        <button class="master-btn on" id="masterAllOn">🔆 全屋开启</button>
        <button class="master-btn off" id="masterAllOff">🌑 全屋关闭</button>
        <button class="master-btn scene" id="sceneHome">🏠 居家模式</button>
        <button class="master-btn scene" id="sceneAway">🚪 离家模式</button>
        <button class="master-btn scene" id="sceneSleep">🌙 睡眠模式</button>
      </div>
    `;

    // Room device panels
    const roomHTML = ROOMS.map(room => {
      const deviceSwitches = room.devices.map(dev => `
        <div class="dev-switch" data-device="${dev.id}" id="devSwitch-${dev.id}">
          <div class="switch-knob" id="knob-${dev.id}">${dev.icon}</div>
          <div class="switch-label">${dev.name}</div>
        </div>
      `).join('');

      return `<div class="device-card">
        <div class="dev-header">${room.icon} ${room.name}</div>
        <div class="device-grid">${deviceSwitches}</div>
      </div>`;
    }).join('');

    container.innerHTML = masterHTML + '<div class="device-card-grid">' + roomHTML + '</div>';

    // Bind device clicks
    this.refreshAll();
    container.querySelectorAll('.dev-switch').forEach(el => {
      el.addEventListener('click', () => {
        const deviceId = el.dataset.device;
        const newState = store.toggleDevice(deviceId);
        this.updateSwitch(deviceId, newState);
      });
    });

    // Master controls
    document.getElementById('masterAllOn')?.addEventListener('click', () => this.setAll(true));
    document.getElementById('masterAllOff')?.addEventListener('click', () => this.setAll(false));
    document.getElementById('sceneHome')?.addEventListener('click', () => this.sceneHome());
    document.getElementById('sceneAway')?.addEventListener('click', () => this.sceneAway());
    document.getElementById('sceneSleep')?.addEventListener('click', () => this.sceneSleep());
  }

  setAll(state) {
    ALL_DEVICES.forEach(dev => {
      store.deviceStates[dev.id] = state;
      this.updateSwitch(dev.id, state);
    });
    store._save();
  }

  sceneHome() {
    // All ON
    this.setAll(true);
  }

  sceneAway() {
    // All OFF
    this.setAll(false);
  }

  sceneSleep() {
    // Bedroom light ON (dim), others OFF, curtains closed
    ALL_DEVICES.forEach(dev => {
      const on = (
        dev.id === 'bedroom-light' ||
        dev.id === 'bathroom-light'
      );
      store.deviceStates[dev.id] = on;
      this.updateSwitch(dev.id, on);
    });
    store._save();
  }

  refreshAll() {
    ALL_DEVICES.forEach(dev => {
      this.updateSwitch(dev.id, store.getDeviceState(dev.id));
    });
  }

  updateSwitch(deviceId, state) {
    const knob = document.getElementById(`knob-${deviceId}`);
    if (knob) {
      knob.className = 'switch-knob' + (state ? ' on' : '');
    }
  }
}

let control;
