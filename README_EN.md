<div align="center">
<h1 style="margin: 30px 0 30px; font-weight: bold;">SpaceMV-CoAI-Wp/Wc-Frontend: Industrial Planet Operations AI Agent Vue Frontend</h1>
<a href="./LICENSE"><img src="https://img.shields.io/github/license/mashape/apistatus.svg" alt="License"></a> <a href="https://github.com/tianxunweixiao/SpaceMV-CoAI-WpWc-Frontend"><img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="Maintenance"></a> <a href="https://github.com/vitejs/vite/actions/workflows/ci.yml"><img src="https://github.com/vitejs/vite/actions/workflows/ci.yml/badge.svg?branch=main" alt="build status"></a>
</div>
<div align="center">
<a href="./README.md"><strong>简体中文</strong></a> | <a href="./README_EN.md"><strong>English</strong></a>
</div>
&nbsp;&nbsp;
<div align="center">
<img width="800" height="450" alt="SpaceMV-CoAI-WpWc-Frontend" src="./public/spacemv_coo.png" />
</div>

[SpaceMV-CoAI-Wp/Wc](https://github.com/tianxunweixiao/SpaceMV-CoAI) is an Industrial Planet Operations AI Agent developed by Chengdu Tianxun Microsatellite Technology Co., Ltd., integrating SpaceMV-CoAI-Wp (Enterprise Official Website) content management, one-stop self-media creation (SpaceMV-CoAI-Wc) and publishing, and operational data analysis (SpaceMV-CoAI-Wc). It aims to solve the problems faced by enterprise content operations, such as time-consuming multi-platform content distribution, scattered operational data that is difficult to insight into, and complex and inefficient content review processes.

[SpaceMV-CoAI-Wp/Wc](https://github.com/tianxunweixiao/SpaceMV-CoAI) serves as the enterprise operation content hub, featuring SpaceMV-CoAI-Wp (Enterprise Official Website) layout customization, quick article content update and publishing functions (SpaceMV-CoAI-Wc). It can complete self-media creation and multi-platform distribution in one stop, with review mechanisms to ensure content security, and can provide support for operational decision-making through multi-dimensional data analysis, helping to efficiently carry out brand operations.

`SpaceMV-CoAI-Wp/Wc-Frontend` serves as the core frontend component of the platform, responsible for SpaceMV-CoAI-Wp (Enterprise Official Website) content visual editing, unified self-media content creation and orchestration (SpaceMV-CoAI-Wc), and multi-dimensional display of operational data (SpaceMV-CoAI-Wc).

## **Table of Contents**

* [Core Modules](#core-modules)
* [Technical Architecture](#technical-architecture)
* [Features](#features)
* [Quick Start](#quick-start)
* [Contribution Guide](#contribution-guide)
* [License](#license)
* [Contact](#contact)
* [To-Do List](#to-do-list)

## Core Modules
~~~
SpaceMV-CoAI-Frontend 
├── Core Framework Layer
│   ├── Route Management        // Responsible for page route configuration and permission control
│   ├── State Management        // Manage application global state using Pinia/Vuex
│   ├── Layout System        // Provide page layout structure, including sidebar, navigation bar, etc.
│   └── Tool Library          // Provide common tool functions, such as request encapsulation, date processing, etc.
├── Business Module Layer
│   ├── Content Management Module    // Responsible for SpaceMV-CoAI-Wp (Corporate Official Website) content management, including company information, homepage content, product information, etc.
│   ├── Article Management Module    // Responsible for article creation, editing, publishing, review and other processes
│   ├── Material Management Module    // Responsible for uploading and managing image-text materials and permanent materials
│   ├── System Management Module    // Responsible for user, role, permission, menu and other system configurations
├── Component Layer
│   ├── Common Components        // Reusable basic components, such as breadcrumb, pagination, upload, etc.
│   ├── Business Components        // Business-related dedicated components, such as editor, preview dialog, etc.
│   └── Layout Components        // Page layout related components, such as sidebar, tabs, etc.
├── API Interface Layer
│   ├── Content Management Interface    // Interact with backend content management services
│   ├── Article Management Interface    // Interact with backend article management services
│   ├── Material Management Interface    // Interact with backend material management services
│   └── System Management Interface    // Interact with backend system management services
└── Resource Layer
    ├── Static Resources        // Static files such as images, icons, styles, etc.
    └── Configuration Files        // Environment configuration, system settings, etc.
~~~

## Technical Architecture

### Project Foundation

The system management module of this project is developed based on the master branch of [RuoYi-Cloud-Vue3](https://gitcode.com/yangzongzhuan/RuoYi-Cloud-Vue3), with customized functional development on its basis to meet the specific needs of the Industrial Planet Operations AI Agent.

The editor of the article editor module is based on the dev-1.5.0 branch of [UEditor Rich Text Editor](https://github.com/fex-team/ueditor), which provides powerful rich text editing functions and supports various formats of content editing and typesetting.

### Directory Structure

SpaceMV-CoAI-Wp/Wc-Frontend/  
├── bin/                      # Build and run scripts  
│   ├── build.bat             # Build script  
│   ├── package.bat           # Package script  
│   └── run-web.bat           # Run script  
│  
├── html/                     # HTML related files  
│   └── ie.html               # IE browser compatibility page  
│  
├── public/                   # Public resources  
│   ├── ueditor/              # Rich text editor  
│   ├── favicon.ico           # Website icon  
│   └── login-background.jpg  # Login background image  
│  
├── src/                      # Source code directory  
│   ├── api/                  # API interfaces  
│   │   ├── article/          # Article management interfaces  
│   │   ├── content/          # Content management interfaces  
│   │   ├── material/         # Material management interfaces  
│   │   └── system/           # System management interfaces  
│   │  
│   ├── assets/               # Static resources  
│   │   ├── icons/            # Icon resources  
│   │   ├── images/           # Image resources  
│   │   ├── logo/             # Logo resources  
│   │   └── styles/           # Style files  
│   │  
│   ├── components/           # Common components  
│   │   ├── Breadcrumb/       # Breadcrumb component  
│   │   ├── Editor/           # Editor component  
│   │   ├── FileUpload/       # File upload component  
│   │   └── SvgIcon/          # SVG icon component  
│   │  
│   ├── directive/            # Custom directives  
│   │   ├── common/           # Common directives  
│   │   └── permission/       # Permission directives  
│   │  
│   ├── layout/               # Layout components  
│   │   └── components/       # Layout subcomponents  
│   │  
│   ├── plugins/              # Plugins  
│   ├── router/               # Route configuration  
│   ├── store/                # State management  
│   │   └── modules/          # State management modules  
│   │  
│   ├── utils/                # Tool functions  
│   │   └── generator/        # Code generator  
│   │  
│   ├── views/                # Page views  
│   │   ├── article/          # Article management pages  
│   │   ├── content/          # Content management pages  
│   │   ├── dashboard/        # Dashboard pages  
│   │   ├── material/         # Material management pages  
│   │   └── system/           # System management pages  
│   │  
│   ├── App.vue               # Root component  
│   ├── main.js               # Entry file  
│   ├── permission.js         # Permission management  
│   └── settings.js           # System settings  
│  
├── .env                      # Environment configuration  
├── .env.development          # Development environment configuration  
├── .env.production           # Production environment configuration  
├── .gitignore                # Git ignore file  
├── LICENSE                   # License file  
├── README.md                 # Project description  
├── index.html                # Entry HTML  
└── package.json              # Project dependencies

### Technology Stack

| Domain | Technology Selection | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **Vue 3** | Progressive JavaScript framework |
| | **Vite** | Fast frontend build tool |
| | **Vue Router** | Official router manager |
| | **Pinia** | Lightweight state management library |
| **UI Component Library** | **Element Plus** | Component library based on Vue 3 |
| **Style** | **SCSS/Sass** | CSS preprocessor |
| | **CSS Variables** | Theme variable management |
| **Network Request** | **Axios** | Promise-based HTTP client |
| **Build Tool** | **Vite** | Fast frontend build tool |
| | **ESLint** | Code quality checking tool |
| | **Prettier** | Code formatting tool |
| **Environment Management** | **dotenv** | Environment variable management |

### Data Flow

graph TD  
    A[User Operation] ---|Trigger Event| B[Vue Component]  
    B ---|Call API| C[API Interface Layer]  
    C ---|Send Request| D[Backend Service]  
    D ---|Return Data| C  
    C ---|Response Data| B  
    B ---|Update State| E[Pinia State Management]  
    E ---|State Change| B  
    B ---|Render Page| F[User Interface]

## Features

### 1. System Management Module

* **Menu Management**: Support menu creation, editing, permission control and other functions.
* **Department Management**: Support department hierarchy management.
* **Position Management**: Support position creation, editing, allocation and other functions.
* **User Management**: Support user CRUD, role assignment, password reset and other functions.
* **Role Management**: Support role creation, permission allocation, user association and other functions.
* **Dictionary Management**: Support management of various dictionary data in the system, such as predefined enumeration values like gender, status, etc.


### 2. Content Management Module (SpaceMV-CoAI-Wp)

* **Company Information**: Manage company basic information and display content.
* **Homepage Content**: Manage website homepage display content.
* **Product Management**: Manage company product information and display.
* **Top Button**: Manage website top button configuration.


### 3. Article Management Module (SpaceMV-CoAI-Wc)

* **Article List**: Manage all article lists and statuses.  
* **Article Editing**: Support rich text editor for easy article content editing.  

### 4. Material Management Module (SpaceMV-CoAI-Wc)

* **Image-Text Materials**: Manage image-text combined material content.  
* **Permanent Materials**: Manage reusable permanent materials.  
* **Material Upload**: Support multiple format material uploads.  

## Quick Start

### Prerequisites

* **Node.js** (v16.0 or higher)  
* **npm** or **yarn** package manager  
* **Git** version control tool

### 1. Environment Preparation
```bash
# Clone the repository  
git clone https://github.com/tianxunweixiao/SpaceMV-CoAI-WpWc-Frontend.git   
cd SpaceMV-CoAI-WpWc-Frontend

# Install dependencies  
npm install
# or use yarn  
yarn install
```
### 2. Environment Variable Configuration
```ini
The project already includes the following environment configuration files:

- .env                # Basic environment configuration
- .env.development    # Development environment configuration
- .env.production     # Production environment configuration

To modify the configuration, edit the corresponding environment configuration file.
```
### 3. Start Development Server
```bash
# Start development server  
npm run dev
# or use yarn  
yarn dev
```

After the development server starts, you can access `http://localhost:5173` through the browser to view the project.

### 4. Build Version

#### 4.1 Build Production Version
```bash
# Build production version  
npm run build
# or use yarn  
yarn build
```

After the build is completed, the production version files will be generated in the `dist` directory. Place the built dist package into the ruoyi-ui/dist-console directory of the code project.

#### 4.2 Build Development Version
```bash
# Build development version  
npm run build:dev
# or use yarn  
yarn build:dev
```

After the build is completed, the development version files will be generated in the `dist` directory. Place the built dist package into the ruoyi-ui/dist-console directory of the code project.

## Contribution Guide

We warmly welcome community developers to participate in the construction of the SpaceMV-CoAI-Wp/Wc-Frontend project! If you have any improvement suggestions or find bugs, please follow the following process:

1. **Fork this repository**: Click the Fork button in the upper right corner to copy the project to your GitHub account.  
2. **Create a branch**: Cut a new branch from the main branch for development.  
   git checkout -b feature/AmazingFeature  
3. **Commit changes**: Ensure code style consistency and write clear Commit Messages.  
   git commit -m 'feat: Add some AmazingFeature'  
4. **Push branch**:  
   git push origin feature/AmazingFeature  
5. **Submit Pull Request**: Initiate a PR on GitHub and describe your changes in detail.

**Development Suggestions**:

* **Code Style**: Follow the project's code style specifications to ensure code readability.
* **Component Design**: When developing new components, ensure component reusability and maintainability.
* **API Calls**: When adding new API calls, follow the existing modular organization method.
* **Style Management**: Use SCSS variables and mixins to ensure style consistency and maintainability.
* **Testing**: Add appropriate test cases for new features to ensure code quality.

## License

This project is licensed under the MIT License. 

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

## Contact

For any questions, suggestions or business cooperation needs, please contact the project maintenance team.

* **Email**: code@spacemv.com  
* **Issues**: [GitHub Issues](https://github.com/tianxunweixiao/SpaceMV-CoAI-WpWc-Frontend/issues)

For more information, you can follow the company's WeChat official account:

<img width="106" height="106" alt="image" src="https://github.com/user-attachments/assets/69a02ad0-422c-422a-bf5f-9b7890cf31ab" />


## 5. To-Do List

<table>
  <tr>
    <th style="width: 150px;">Process/Category</th>
    <th style="width: 180px;">Feature Milestone</th>
    <th style="width: 450px;">Core Content</th>
    <th style="width: 120px; white-space: nowrap;">Estimated Release Time</th>
  </tr>
  <tr>
    <td>Production</td>
    <td>Interactive Data Report Embedded Tweets</td>
    <td>Support editing and publishing self-media tweets with embedded interactive data reports, realizing one-click generation of data visualization content</td>
    <td>Early April 2026</td>
  </tr>
  <tr>
    <td>Production</td>
    <td>Official Website Layout Plug-in</td>
    <td>Realize complete customization of official website layout, supporting plug-in import, editable and customizable page layout/style + content</td>
    <td>May 2026</td>
  </tr>
  <tr>
    <td>Monitoring (Traffic Monitoring/Anti-tampering Security Monitoring)</td>
    <td>Monitoring Tool/Agent</td>
    <td>Provide traffic monitoring, page anti-tampering and other security capabilities in the form of tools/agents, real-time collection and analysis of traffic behavior, verification of page integrity, and automatic triggering of alerts when anomalies are detected</td>
    <td>To be determined</td>
  </tr>
  <tr>
    <td>Statistics</td>
    <td>Data Dashboard</td>
    <td>Support official website browsing data dashboard and self-media tweet traffic data analysis, visitor data analysis</td>
    <td>February 2026</td>
  </tr>
  <tr>
    <td>Analysis (Diagnosis)</td>
    <td>Content Analysis Tool/Agent</td>
    <td>Based on content and operation data, in the form of tools/agents, provide functions such as automatic analysis of article dissemination laws, user interaction attribution, and positioning of high-value content features, providing data basis for content strategy optimization</td>
    <td>To be determined</td>
  </tr>
  <tr>
    <td>Feedback (Quality/Performance Evaluation)</td>
    <td>Quality/Performance Evaluation Tool/Agent</td>
    <td>In the form of tools/agents, provide evaluation of article quality (originality, compliance, communication power, etc.), and generate quantitative performance scores based on publication volume, interaction volume, conversion effect and other data for operations personnel, providing data support for content optimization and personnel evaluation</td>
    <td>To be determined</td>
  </tr>
  <tr>
    <td>Ecology</td>
    <td>Xiaohongshu Deep Integration</td>
    <td>Support Xiaohongshu platform integration and data dashboard analysis, fully covering mainstream self-media platforms</td>
    <td>March 2026</td>
  </tr>
</table>