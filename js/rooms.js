// ============================================================
// SmartHome IoT — 房间与设备配置数据
// ============================================================

const ROOMS = [
  {
    id: 'living',
    name: '客厅',
    icon: '🛋️',
    sensors: ['temperature', 'humidity', 'light'],
    devices: [
      { id: 'living-light', name: '主灯', icon: '💡', room: 'living' },
      { id: 'living-ac', name: '空调', icon: '❄️', room: 'living' },
      { id: 'living-curtain', name: '窗帘', icon: '🪟', room: 'living' },
    ],
    sensorBase: { temperature: 24, humidity: 55, light: 400 },
    sensorNoise: { temperature: 0.5, humidity: 2, light: 40 },
  },
  {
    id: 'bedroom',
    name: '卧室',
    icon: '🛏️',
    sensors: ['temperature', 'humidity', 'light'],
    devices: [
      { id: 'bedroom-light', name: '主灯', icon: '💡', room: 'bedroom' },
      { id: 'bedroom-ac', name: '空调', icon: '❄️', room: 'bedroom' },
      { id: 'bedroom-curtain', name: '窗帘', icon: '🪟', room: 'bedroom' },
    ],
    sensorBase: { temperature: 23, humidity: 52, light: 200 },
    sensorNoise: { temperature: 0.4, humidity: 1.5, light: 25 },
  },
  {
    id: 'kitchen',
    name: '厨房',
    icon: '🍳',
    sensors: ['temperature', 'humidity', 'smoke'],
    devices: [
      { id: 'kitchen-light', name: '灯', icon: '💡', room: 'kitchen' },
      { id: 'kitchen-fan', name: '排气扇', icon: '🌀', room: 'kitchen' },
    ],
    sensorBase: { temperature: 26, humidity: 60, smoke: 120 },
    sensorNoise: { temperature: 0.6, humidity: 3, smoke: 15 },
  },
  {
    id: 'bathroom',
    name: '卫生间',
    icon: '🚿',
    sensors: ['temperature', 'humidity'],
    devices: [
      { id: 'bathroom-light', name: '灯', icon: '💡', room: 'bathroom' },
      { id: 'bathroom-fan', name: '排风扇', icon: '🌀', room: 'bathroom' },
    ],
    sensorBase: { temperature: 25, humidity: 70 },
    sensorNoise: { temperature: 0.3, humidity: 2.5 },
  },
];

// All unique device list (for global state)
const ALL_DEVICES = ROOMS.flatMap(r => r.devices);

// Sensor display info
const SENSOR_INFO = {
  temperature: { name: '温度', unit: '°C', icon: '🌡️', range: [15, 40] },
  humidity:    { name: '湿度', unit: '%',  icon: '💧', range: [20, 100] },
  light:       { name: '光照', unit: 'lux',icon: '☀️', range: [0, 1200] },
  smoke:       { name: '烟雾', unit: 'ppm',icon: '💨', range: [0, 800] },
};

// Default alert thresholds
const DEFAULT_THRESHOLDS = {
  tempHigh:    { label: '高温告警', sensor: 'temperature', condition: '>', value: 32, unit: '°C' },
  tempLow:     { label: '低温告警', sensor: 'temperature', condition: '<', value: 10, unit: '°C' },
  humidityHigh:{ label: '高湿告警', sensor: 'humidity',    condition: '>', value: 85, unit: '%' },
  smokeHigh:   { label: '烟雾告警', sensor: 'smoke',        condition: '>', value: 500, unit: 'ppm' },
};
