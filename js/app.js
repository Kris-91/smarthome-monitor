// ============================================================
// SmartHome IoT — 主应用控制器
// ============================================================

class App {
  constructor() {
    this.currentTab = 'dashboard';
    this.clockTimer = null;
    this.init();
  }

  init() {
    // Init data layer
    store = new DataStore();

    // Init modules
    simulator = new Simulator();
    dashboard = new Dashboard();
    monitor = new Monitor();
    control = new Control();
    alertEngine = new AlertEngine();

    // Start simulation
    simulator.start();

    // Hook simulator data → alert engine
    this._alertHook = setInterval(() => {
      const data = store.getLatestData();
      if (data) alertEngine.check(data);
    }, 2000);

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });

    // Clock
    this.updateClock();
    this.clockTimer = setInterval(() => this.updateClock(), 1000);

    // Pause simulation when tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        simulator.stop();
      } else {
        simulator.start();
      }
    });
  }

  switchTab(tab) {
    // Deactivate old
    if (this.currentTab === 'monitor') monitor.deactivate();

    this.currentTab = tab;

    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === 'panel-' + tab);
    });

    // Activate new tab-specific logic
    if (tab === 'monitor') monitor.activate();
    if (tab === 'alerts') alertEngine.activate();
    if (tab === 'control') control.refreshAll();
  }

  updateClock() {
    const el = document.getElementById('liveClock');
    if (el) {
      el.textContent = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    }
  }
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
