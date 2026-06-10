# SciCalc Pro — 面向理工科的在线科学计算平台

🔬 一个为工程、物理、数学专业学生设计的综合科学计算网页应用。

## ✨ 功能

- 🧮 **科学计算器** — 支持三角函数、对数、指数、阶乘、模运算，含33个理工常数参考
- 📈 **函数绘图** — 交互式2D函数可视化，支持多函数叠加、悬停坐标跟踪、12种预设函数
- 📐 **矩阵运算** — 加法、减法、乘法、转置、行列式、逆矩阵
- ⚖️ **单位转换** — 涵盖11个类别（长度、质量、时间、温度、面积、体积、速度、压强、能量、功率、角度）
- 🌓 **深色/浅色主题** — 自动检测系统偏好，手动切换
- ⌨️ **键盘支持** — 计算器支持全键盘操作
- 📱 **响应式设计** — 适配桌面和移动端

## 🚀 快速开始

### 本地运行

```bash
# 方式 1: Python
python -m http.server 8080

# 方式 2: Node.js
npx serve .

# 方式 3: 直接用浏览器打开
# 双击 index.html
```

访问 `http://localhost:8080`

### 部署到 GitHub Pages

```bash
# 1. 初始化仓库
git init
git add .
git commit -m "Initial commit: SciCalc Pro v1.0"

# 2. 在 GitHub 创建新仓库 (例如: scicalc-pro)

# 3. 推送
git remote add origin https://github.com/YOUR_USERNAME/scicalc-pro.git
git branch -M main
git push -u origin main

# 4. 在仓库 Settings → Pages 中启用:
#    Source: Deploy from a branch
#    Branch: main / (root)
#    保存后等待1-2分钟即可访问
```

## 🛠 技术栈

- 纯 HTML/CSS/JavaScript (无框架)
- [math.js v12](https://mathjs.org/) — 数学表达式引擎
- [Chart.js v4](https://www.chartjs.org/) — 函数图形渲染
- CSS 自定义属性 — 主题系统

## 📁 项目结构

```
├── index.html          # 主应用入口
├── css/
│   └── style.css       # 全局样式 + 主题
├── js/
│   ├── constants.js    # 物理/数学常数
│   ├── calculator.js   # 科学计算器引擎
│   ├── grapher.js      # 函数绘图模块
│   ├── matrix.js       # 矩阵运算模块
│   ├── converter.js    # 单位转换模块
│   └── app.js          # 主控制器
└── README.md
```

## 📄 许可

MIT License
