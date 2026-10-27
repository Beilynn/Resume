# Beilynn · 交互式个人简历

一份基于原生 HTML / CSS / JavaScript 的交互式个人简历，以封面主图为界面，点击四个板块卡片弹出对应详情弹窗（个人介绍、校园经历、GitHub 项目、荣誉技能），无构建依赖，开箱即用。

## 技术栈

- 原生 HTML5 / CSS3 / Vanilla JavaScript
- 响应式布局（桌面悬停切换 + 移动端点按 / 长按查看）
- 无框架、无第三方运行时依赖

## 目录结构

```
doubao/
├── Beilynn简历.html      # 入口页面，浏览器双击即可打开
├── css/style.css         # 全部视觉样式
├── js/main.js            # 交互逻辑（热区、状态切换、弹窗渲染）
├── data/resume-data.js   # 文案与图片 / 热区配置（改内容只改这里）
└── img/                  # 封面图、状态图与弹窗头像
```

## 本地运行

直接双击 `Beilynn简历.html` 用浏览器打开即可；也可使用任意静态服务器托管，例如：

```bash
python -m http.server 8000
# 访问 http://localhost:8000/
```

## 内容维护

- 简历文案、联系方式、项目与荣誉：修改 `data/resume-data.js`
- 板块热区位置：修改各板块 `hotspot` 的百分比坐标
- 封面与状态图：替换 `img/` 下对应图片

## 在线访问

GitHub Pages 或 Netlify / Vercel 等静态托管平台直接发布本目录即可。
