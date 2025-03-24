# AnyToMarkdown 文件转换服务

_[English](./README.md) | 简体中文_

AnyToMarkdown 是一个功能强大的在线工具，可将各种文档格式（包括 Word 文档、PDF 文件、HTML 网页等）快速、准确地转换为 Markdown 格式。该服务基于 Cloudflare Workers 构建，提供高性能、低延迟的文件转换体验。

**在线演示**： [https://cf-anytomarkdown.vercel.app/](https://cf-anytomarkdown.vercel.app/)

## 主要功能

- **多格式支持**：支持将 PDF、HTML、TXT 等多种格式转换为 Markdown（不支持 DOCX 格式）
- **文件上传**：支持拖放或选择本地文件进行转换
- **格式保留**：最大程度保留原文档的格式，包括标题、列表、表格、图片等
- **实时预览**：转换完成后即时预览转换结果
- **导出下载**：轻松下载生成的 Markdown 文件

## 项目结构

AnyToMarkdown 采用单仓库多包结构 (monorepo)，分为以下主要组件：

- `packages/web`: 前端 React 应用，提供用户界面
- `packages/worker`: Cloudflare Worker 服务端，处理文件转换逻辑

## 前提条件

在开始使用 AnyToMarkdown 之前，您需要：

1. 一个 [Cloudflare 账户](https://dash.cloudflare.com/sign-up)
2. [Node.js](https://nodejs.org/) v18 或更高版本
3. [npm](https://www.npmjs.com/) 或 [yarn](https://yarnpkg.com/)

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/yourusername/anytomarkdown.git
cd anytomarkdown
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境

#### 配置 Worker 服务

1. 在 `packages/worker` 目录中，复制示例配置文件：

```bash
cp packages/worker/wrangler.example.toml packages/worker/wrangler.toml
```

2. 编辑 `packages/worker/wrangler.toml` 文件，填入您的 Cloudflare 账户 ID：

```toml
# 你需要在这里添加自己的Cloudflare账户ID
account_id = "your_account_id_here"  # 替换为您的账户ID
```

3. 在 `packages/worker` 目录中创建 `.dev.vars` 文件，用于本地开发环境变量：

```bash
# .dev.vars 文件示例
API_KEY=your_api_key_here
ENVIRONMENT=development

# 其他示例：
# CORS_ALLOWED_ORIGINS=http://localhost:5173,https://your-production-domain.com
# MAX_FILE_SIZE=10485760  # 10MB in bytes
# ENABLE_DEBUG=true
# CUSTOM_HEADERS={"X-Custom-Header": "value"}
```

`.dev.vars` 文件用于存储本地开发环境的环境变量。

您可以在 [Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/workers) 找到您的账户 ID。

#### 配置前端应用

1. 在 `packages/web` 目录中，复制示例环境文件：

```bash
cp packages/web/.env.example packages/web/.env.local
```

2. 根据您的需求编辑 `.env.local` 文件：
   - 开发环境使用本地 Worker URL
   - 生产环境使用已部署的 Worker URL

### 4. 开发环境

启动前端开发服务器：

```bash
npm run dev:web
```

启动 Worker 开发服务器：

```bash
npm run dev:worker
```

或者同时启动两者：

```bash
npm run dev
```

### 5. 构建与部署

#### 构建项目

```bash
npm run build
```

#### 部署 Worker

确保您已配置好 `wrangler.toml` 文件后，运行：

```bash
npm run deploy:worker
```

#### 部署前端到 Vercel

要将前端部署到 Vercel，请按照以下步骤操作：

1. **安装 Vercel CLI**（可选）：

   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**：

   ```bash
   vercel login
   ```

3. **部署前端**：
   进入 `packages/web` 目录并运行：

   ```bash
   vercel
   ```

4. **配置环境变量**：
   - 在 Vercel 项目设置中将 `API_BASE_URL` 设置为您的已部署 Worker URL。

#### 完整部署

构建并部署整个项目：

```bash
npm run deploy
```

## 如何使用

### 通过文件上传转换

1. 访问 AnyToMarkdown 网站
2. 将文件拖放到指定区域或点击"选择文件"按钮
3. 上传完成后，系统会自动开始转换
4. 转换完成后，可以在预览区域查看 Markdown 内容
5. 点击"下载"按钮保存 Markdown 文件

## API 使用说明

AnyToMarkdown 提供了 RESTful API，允许开发者在自己的应用中集成转换功能：

### 文件转换 API

**请求**:

```
POST /api/convert
Content-Type: multipart/form-data

文件字段名: file
```

**响应**:

```json
{
  "success": true,
  "result": {
    "name": "文件名",
    "mimeType": "text/markdown",
    "format": "markdown",
    "tokens": 1234,
    "data": "# Markdown内容..."
  }
}
```

### 批量文件转换 API

**请求**:

```
POST /api/batch-convert
Content-Type: multipart/form-data

文件字段名: file1, file2, ...
```

**响应**:

```json
{
  "success": true,
  "results": [
    {
      "name": "文件1名",
      "mimeType": "text/markdown",
      "format": "markdown",
      "tokens": 1234,
      "data": "# Markdown内容..."
    },
    {
      "name": "文件2名",
      "mimeType": "text/markdown",
      "format": "markdown",
      "tokens": 5678,
      "data": "# 另一个Markdown内容..."
    }
  ]
}
```

### 服务状态检查 API

**请求**:

```
GET /api/status
```

**响应**:

```json
{
  "success": true,
  "status": "online",
  "service": "anytomarkdown",
  "version": "1.0.0"
}
```

## 技术实现说明

### 前端实现

前端使用 React + TypeScript + Tailwind CSS 构建，主要组件包括：

- `FileUpload`: 处理文件上传及拖放功能
- `MarkdownOutput`: 预览和下载转换结果
- `Notification`: 显示操作提示和错误信息

### 后端实现

后端基于 Cloudflare Workers，使用 Cloudflare AI 的文档转换功能：

- 支持单文件和批量文件处理
- 完整的错误处理和状态检查

### 核心功能

- 文档解析和格式处理
- 图像处理和嵌入
- 表格和列表格式保持
- 链接和引用处理

## Markdown 转换实现

我们的 Markdown 转换过程旨在保留原始文档的结构，同时提供干净、格式良好的 Markdown 输出：

### 转换流程

1. **文档上传**：通过前端界面上传文件
2. **后端处理**：Cloudflare Workers 接收文件并使用 Cloudflare AI 服务进行处理
3. **格式处理**：不同的输入格式（PDF、HTML、TXT）被不同地处理以确保最佳转换效果
4. **Markdown 生成**：转换引擎将内容转换为标准 Markdown 语法
5. **后处理**：对格式问题进行特殊处理，包括：
   - 标题格式（确保#符号后有适当的空格）
   - 换行符保留（添加尾随空格以确保正确换行）
   - 带有增强样式的表格格式
   - 代码块语法高亮

### 前端渲染

转换后的 Markdown 在浏览器中使用以下技术渲染：

- **markdown-it**：核心渲染引擎
- **highlight.js**：代码语法高亮
- **自定义增强**：表格样式、链接处理和其他格式改进

### 限制

- 目前不支持 DOCX 格式
- 最大文件大小受 Cloudflare Workers 限制
- PDF 文件中的复杂格式可能无法完美保留

### Beta 阶段说明

请注意，Markdown 转换功能目前处于 beta 阶段。因此，转换效果可能不够理想。我们鼓励您关注后续的更新和改进。

## 常见问题

### 1. Worker 部署失败

确保您已正确设置 Cloudflare 账户 ID，并且有权限部署 Workers。您可能需要运行：

```bash
npx wrangler login
```

### 2. AI 转换服务不可用

确保您的 Cloudflare 账户已启用 AI 功能。您可以在 Cloudflare Dashboard 中检查。

### 3. 文件大小限制

Cloudflare Workers 有请求大小限制。如果您需要转换大文件，建议将其分割或使用其他服务。

## 贡献指南

我们欢迎社区贡献！如果您想为 AnyToMarkdown 做出贡献，请遵循以下步骤：

1. Fork 仓库
2. 创建您的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m '添加了一些惊人的功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个 Pull Request

## 许可证

本项目基于 MIT 许可证 - 查看 LICENSE 文件了解详情。

## 技术栈

- **前端**: React, TypeScript, Tailwind CSS, Vite
- **后端**: Cloudflare Workers, TypeScript
- **转换引擎**: Cloudflare AI
