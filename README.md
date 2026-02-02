<div align="center">
<h1 style="margin: 30px 0 30px; font-weight: bold;">SpaceMV-CoAI-Wp/Wc-Frontend: 产业星球运营智能体Vue前端</h1>
<a href="./LICENSE"><img src="https://img.shields.io/github/license/mashape/apistatus.svg" alt="License"></a> <a href="https://github.com/tianxunweixiao/SpaceMV-CoAI-WpWc-Frontend"><img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="Maintenance"></a> <a href="https://github.com/vitejs/vite/actions/workflows/ci.yml"><img src="https://github.com/vitejs/vite/actions/workflows/ci.yml/badge.svg?branch=main" alt="build status"></a>
</div>
<div align="center">
<a href="./README.md"><strong>简体中文</strong></a> | <a href="./README_EN.md"><strong>English</strong></a>
</div>
&nbsp;&nbsp;
<div align="center">
<img width="800" height="450" alt="SpaceMV-CoAI-WpWc-Frontend" src="./public/spacemv_coo.png" />
</div>

[SpaceMV-CoAI-Wp/Wc](https://github.com/tianxunweixiao/SpaceMV-CoAI)是由成都天巡微小卫星科技有限责任公司研发的一款集SpaceMV-CoAI-Wp（企业官网）内容管理、自媒体一站式创作（SpaceMV-CoAI-Wc）发布、运营数据分析（SpaceMV-CoAI-Wc）于一体的产业星球运营智能体，旨在解决企业内容运营面临的多平台内容分发耗时耗力、运营数据分散难以洞察、内容审核流程复杂低效的问题。

[SpaceMV-CoAI-Wp/Wc](https://github.com/tianxunweixiao/SpaceMV-CoAI)作为企业运营内容中枢，具备SpaceMV-CoAI-Wp（企业官网）版面定制、文章内容快速更新发布功能（SpaceMV-CoAI-Wc），可一站式完成自媒体创作与多平台分发，且有审核机制保障内容安全，还能通过多维数据分析，为运营决策提供支撑，助力高效开展品牌运营。

`SpaceMV-CoAI-Wp/Wc-Frontend`作为平台的核心前端组件，承担SpaceMV-CoAI-Wp（企业官网）内容可视化编辑、自媒体内容统一创作编排(SpaceMV-CoAI-Wc)、运营数据多维度展示（SpaceMV-CoAI-Wc）等关键职能。

## **目录**

* [核心模块](#核心模块)
* [技术架构](#技术架构)
* [功能特性](#功能特性)
* [快速开始](#快速开始)
* [贡献指南](#贡献指南)
* [许可证](#许可证)
* [联系方式](#联系方式)
* [待办事项](#待办事项)

## 核心模块
~~~
SpaceMV-CoAI-Wp/Wc-Frontend 
├── 核心框架层
│   ├── 路由管理        // 负责页面路由配置和权限控制
│   ├── 状态管理        // 管理应用全局状态，使用 Pinia/Vuex
│   ├── 布局系统        // 提供页面布局结构，包括侧边栏、导航栏等
│   └── 工具库          // 提供通用工具函数，如请求封装、日期处理等
├── 业务模块层
│   ├── 内容管理模块    // 负责SpaceMV-CoAI-Wp（企业官网）内容管理，包括公司信息、主页内容、产品信息等
│   ├── 文章管理模块    // 负责文章的创建、编辑、发布、审核等流程
│   ├── 素材管理模块    // 负责图文素材、永久素材的上传和管理
│   ├── 系统管理模块    // 负责用户、角色、权限、菜单等系统配置
├── 组件层
│   ├── 公共组件        // 可复用的基础组件，如面包屑、分页、上传等
│   ├── 业务组件        // 与业务相关的专用组件，如编辑器、预览对话框等
│   └── 布局组件        // 页面布局相关组件，如侧边栏、标签页等
├── API 接口层
│   ├── 内容管理接口    // 与后端内容管理服务交互
│   ├── 文章管理接口    // 与后端文章管理服务交互
│   ├── 素材管理接口    // 与后端素材管理服务交互
│   └── 系统管理接口    // 与后端系统管理服务交互
└── 资源层
    ├── 静态资源        // 图片、图标、样式等静态文件
    └── 配置文件        // 环境配置、系统设置等
~~~

## 技术架构

### 项目基础

本项目的系统管理模块基于 [RuoYi-Cloud-Vue3](https://gitcode.com/yangzongzhuan/RuoYi-Cloud-Vue3)的master分支开发，并在其基础上进行了定制化功能开发，以满足产业星球运营智能体的特定需求。

文章管理模块的编辑器基于 [UEditor 富文本编辑器](https://github.com/fex-team/ueditor)的dev-1.5.0分支开发，其提供了强大的富文本编辑功能，支持多种格式的内容编辑和排版。

### 目录结构

SpaceMV-CoAI-Frontend/  
├── bin/                      \# 构建和运行脚本  
│   ├── build.bat             \# 构建脚本  
│   ├── package.bat           \# 打包脚本  
│   └── run-web.bat           \# 运行脚本  
│  
├── html/                     \# HTML 相关文件  
│   └── ie.html               \# IE 浏览器兼容页面  
│  
├── public/                   \# 公共资源  
│   ├── ueditor/              \# 富文本编辑器  
│   ├── favicon.ico           \# 网站图标  
│   └── login-background.jpg  \# 登录背景图  
│  
├── src/                      \# 源代码目录  
│   ├── api/                  \# API 接口  
│   │   ├── article/          \# 文章管理接口  
│   │   ├── content/          \# 内容管理接口  
│   │   ├── material/         \# 素材管理接口  
│   │   └── system/           \# 系统管理接口  
│   │  
│   ├── assets/               \# 静态资源  
│   │   ├── icons/            \# 图标资源  
│   │   ├── images/           \# 图片资源  
│   │   ├── logo/             \# Logo 资源  
│   │   └── styles/           \# 样式文件  
│   │  
│   ├── components/           \# 公共组件  
│   │   ├── Breadcrumb/       \# 面包屑组件  
│   │   ├── Editor/           \# 编辑器组件  
│   │   ├── FileUpload/       \# 文件上传组件  
│   │   └── SvgIcon/          \# SVG 图标组件  
│   │  
│   ├── directive/            \# 自定义指令  
│   │   ├── common/           \# 通用指令  
│   │   └── permission/       \# 权限指令  
│   │  
│   ├── layout/               \# 布局组件  
│   │   └── components/       \# 布局子组件  
│   │  
│   ├── plugins/              \# 插件  
│   ├── router/               \# 路由配置  
│   ├── store/                \# 状态管理  
│   │   └── modules/          \# 状态管理模块  
│   │  
│   ├── utils/                \# 工具函数  
│   │   └── generator/        \# 代码生成器  
│   │  
│   ├── views/                \# 页面视图  
│   │   ├── article/          \# 文章管理页面  
│   │   ├── content/          \# 内容管理页面  
│   │   ├── dashboard/        \# 仪表盘页面  
│   │   ├── material/         \# 素材管理页面  
│   │   └── system/           \# 系统管理页面  
│   │  
│   ├── App.vue               \# 根组件  
│   ├── main.js               \# 入口文件  
│   ├── permission.js         \# 权限管理  
│   └── settings.js           \# 系统设置  
│  
├── .env                      \# 环境配置  
├── .env.development          \# 开发环境配置  
├── .env.production           \# 生产环境配置  
├── .gitignore                \# Git 忽略文件  
├── LICENSE                   \# 许可证文件  
├── README.md                 \# 项目说明  
├── index.html                \# 入口 HTML  
└── package.json              \# 项目依赖

### 技术栈

| 领域 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **前端框架** | **Vue 3** | 渐进式 JavaScript 框架 |
| | **Vite** | 快速的前端构建工具 |
| | **Vue Router** | 官方路由管理器 |
| | **Pinia** | 轻量级状态管理库 |
| **UI 组件库** | **Element Plus** | 基于 Vue 3 的组件库 |
| **样式** | **SCSS/Sass** | CSS 预处理器 |
| | **CSS Variables** | 主题变量管理 |
| **网络请求** | **Axios** | 基于 Promise 的 HTTP 客户端 |
| **构建工具** | **Vite** | 快速的前端构建工具 |
| | **ESLint** | 代码质量检查工具 |
| | **Prettier** | 代码格式化工具 |
| **环境管理** | **dotenv** | 环境变量管理 |

### 数据流向

graph TD  
    A\[用户操作\] \-\-\>|触发事件| B\[Vue 组件\]  
    B \-\-\>|调用 API| C\[API 接口层\]  
    C \-\-\>|发送请求| D\[后端服务\]  
    D \-\-\>|返回数据| C  
    C \-\-\>|响应数据| B  
    B \-\-\>|更新状态| E\[Pinia 状态管理\]  
    E \-\-\>|状态变化| B  
    B \-\-\>|渲染页面| F\[用户界面\]

## 功能特性

### 1. 系统管理模块

* **菜单管理**: 支持菜单的创建、编辑、权限控制等功能。
* **部门管理**: 支持部门的层级结构管理。
* **岗位管理**: 支持岗位的创建、编辑、分配等功能。
* **用户管理**: 支持用户的增删改查、角色分配、密码重置等功能。
* **角色管理**: 支持角色的创建、权限分配、用户关联等功能。
* **字典管理**: 支持系统中各种字典数据的管理，如性别、状态等预定义枚举值。


### 2. 内容管理模块(SpaceMV-CoAI-Wp)

* **公司信息**: 管理公司的基本信息和展示内容。
* **主页内容**: 管理网站主页的展示内容。
* **产品管理**: 管理公司产品的信息和展示。
* **顶部按钮**: 管理网站顶部按钮的配置。


### 3. 文章管理模块(SpaceMV-CoAI-Wc)

* **文章列表**: 管理所有文章的列表和状态。  
* **文章编辑**: 支持富文本编辑器，方便文章内容的编辑。  

### 4. 素材管理模块（SpaceMV-CoAI-Wc）

* **图文素材**: 管理图文结合的素材内容。  
* **永久素材**: 管理可重复使用的永久素材。  
* **素材上传**: 支持多种格式的素材上传。  

## 快速开始

### 前置条件

* **Node.js** (v16.0 或更高版本)  
* **npm** 或 **yarn** 包管理器  
* **Git** 版本控制工具

### 1. 环境准备
```bash
# 克隆仓库  
git clone https://github.com/tianxunweixiao/SpaceMV-CoAI-WpWc-Frontend.git  
cd SpaceMV-CoAI-WpWc-Frontend

# 安装依赖  
npm install
# 或使用 yarn  
yarn install
```
### 2. 环境变量配置
```ini
项目已包含以下环境配置文件：

- .env                # 基础环境配置
- .env.development    # 开发环境配置
- .env.production     # 生产环境配置

如需修改配置，编辑对应环境的配置文件即可。
```
### 3. 启动开发服务器
```bash
# 启动开发服务器  
npm run dev
# 或使用 yarn  
yarn dev
```

开发服务器启动后，可通过浏览器访问 `http://localhost:5173` 查看项目。

### 4. 构建版本

#### 4.1 构建生产版本
```bash
# 构建生产版本  
npm run build
# 或使用 yarn  
yarn build
```

构建完成后，生产版本的文件会生成在 `dist` 目录中， 并将构建的dist包放到代码工程中ruoyi-ui/dist-console目录下。

#### 4.2 构建开发版本
```bash
# 构建开发版本  
npm run build:dev
# 或使用 yarn  
yarn build:dev
```

构建完成后，开发版本的文件会生成在 `dist` 目录中， 并将构建的dist包放到代码工程中ruoyi-ui/dist-console目录下。

## 贡献指南

我们非常欢迎社区开发者参与 SpaceMV-CoAI-Wp/Wc-Frontend 前端项目的建设！如果您有任何改进建议或发现了 Bug，请遵循以下流程：

1. **Fork 本仓库**：点击右上角的 Fork 按钮将项目复制到您的 GitHub 账户。  
2. **创建分支**：从 main 分支切出一个新分支用于开发。  
   git checkout -b feature/AmazingFeature  
3. **提交更改**：确保代码风格统一，并撰写清晰的 Commit Message。  
   git commit -m 'feat: Add some AmazingFeature'  
4. **推送分支**：  
   git push origin feature/AmazingFeature  
5. **提交 Pull Request**：在 GitHub 上发起 PR，并详细描述您的更改内容。

**开发建议**：

* **代码风格**：遵循项目的代码风格规范，确保代码可读性。
* **组件设计**：开发新组件时，确保组件的复用性和可维护性。
* **API 调用**：添加新 API 调用时，遵循现有的模块化组织方式。
* **样式管理**：使用 SCSS 变量和混合器，确保样式的一致性和可维护性。
* **测试**：为新功能添加适当的测试用例，确保代码质量。

## 许可证

本项目采用 MIT 许可证。

Copyright (c) 2018 RuoYi
Copyright (c) 2013 ueditor
Copyright (c) 2026 成都天巡微小卫星科技有限责任公司

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## 联系方式

如有任何问题、建议或商务合作需求，请联系项目维护团队。

* **Email**: code@spacemv.com  
* **Issues**: [GitHub Issues](https://github.com/tianxunweixiao/SpaceMV-CoAI-WpWc-Frontend/issues)

更多信息可关注公司微信公众号：

<img width="106" height="106" alt="image" src="https://github.com/user-attachments/assets/69a02ad0-422c-422a-bf5f-9b7890cf31ab" />


## 5. 待办事项

<table>
  <tr>
    <th style="width: 150px;">流程/类别</th>
    <th style="width: 180px;">功能里程碑</th>
    <th style="width: 450px;">核心内容</th>
    <th style="width: 120px; white-space: nowrap;">预计发布时间</th>
  </tr>
  <tr>
    <td>生产</td>
    <td>可交互数据报表嵌入推文</td>
    <td>支持编辑和发布可嵌入交互式数据报表的自媒体推文，实现数据可视化内容一键生成</td>
    <td>2026年4月上旬</td>
  </tr>
  <tr>
    <td>生产</td>
    <td>官网版面插件化</td>
    <td>实现官网版面布局的完全可定制化，支持插件导入、页面布局/样式+内容的可编辑可定制</td>
    <td>2026年5月</td>
  </tr>
  <tr>
    <td>监测 （流量监测/防篡改等安全监测）</td>
    <td>监测工具/Agent</td>
    <td>以工具/Agent形式提供流量监测、页面防篡改等安全能力，可实时采集并分析流量行为、校验页面完整性，发现异常时自动触发告警</td>
    <td>待定</td>
  </tr>
  <tr>
    <td>统计</td>
    <td>数据看板</td>
    <td>支持官网浏览数据看板和自媒体推文流量数据分析、看客数据分析</td>
    <td>2026年2月</td>
  </tr>
  <tr>
    <td>分析（诊断）</td>
    <td>内容分析工具/Agent</td>
    <td>基于内容与运营数据，以工具/Agent形式，提供自动分析文章传播规律、用户互动归因，定位高价值内容特征等功能，为内容策略优化提供数据依据</td>
    <td>待定</td>
  </tr>
  <tr>
    <td>反馈（质量/绩效评价）</td>
    <td>质量/绩效评价工具/Agent</td>
    <td>以工具/Agent形式，提供评估文章质量（原创度、合规性、传播力等），并针对运营人员生成基于发布量、互动量、转化效果等数据的量化绩效评分，为内容优化与人员评估提供数据支撑</td>
    <td>待定</td>
  </tr>
  <tr>
    <td>生态</td>
    <td>小红书深度集成</td>
    <td>支持小红书平台集成及数据看板分析，全面覆盖主流自媒体平台</td>
    <td>2026年3月</td>
  </tr>
</table>
