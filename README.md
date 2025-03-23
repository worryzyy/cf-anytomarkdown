# AnyToMarkdown 文件转换服务

AnyToMarkdown 是一个功能强大的在线工具，可将各种文档格式（包括 Word 文档、PDF 文件、HTML 网页等）快速、准确地转换为 Markdown 格式。该服务基于 Cloudflare Workers 构建，提供高性能、低延迟的文件转换体验。

## 主要功能

- **多格式支持**：支持将 DOCX、PDF、HTML、TXT 等多种格式转换为 Markdown
- **URL 转换**：直接输入网址，自动抓取网页内容并转换为 Markdown
- **文件上传**：支持拖放或选择本地文件进行转换
- **格式保留**：最大程度保留原文档的格式，包括标题、列表、表格、图片等
- **实时预览**：转换完成后即时预览转换结果
- **导出下载**：轻松下载生成的 Markdown 文件

## 项目结构

AnyToMarkdown 采用单仓库多包结构 (monorepo)，分为以下主要组件：

- `packages/web`: 前端 React 应用，提供用户界面
- `packages/worker`: Cloudflare Worker 服务端，处理文件转换逻辑
- `packages/core`: 共享的核心转换库

## 快速开始

### 安装依赖

确保您已安装 Node.js (v18+)和 npm，然后运行：

```bash
npm install
```

### 开发环境

启动前端开发服务器：

```bash
npm run dev:web
```

启动 Worker 开发服务器：

```bash
npm run dev:worker
```

### 构建生产版本

构建整个项目：

```bash
npm run build
```

## 如何使用

### 通过文件上传转换

1. 访问 AnyToMarkdown 网站
2. 将文件拖放到指定区域或点击"选择文件"按钮
3. 上传完成后，系统会自动开始转换
4. 转换完成后，可以在预览区域查看 Markdown 内容
5. 点击"下载"按钮保存 Markdown 文件

### 通过 URL 转换

1. 访问 AnyToMarkdown 网站
2. 在 URL 输入框中输入要转换的网页地址
3. 点击"转换"按钮
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

### URL 转换 API

**请求**:

```
POST /api/convert-url
Content-Type: application/json

{
  "url": "https://example.com/page-to-convert"
}
```

**响应**:

```json
{
	"success": true,
	"result": {
		"name": "页面标题",
		"mimeType": "text/markdown",
		"format": "markdown",
		"tokens": 1234,
		"data": "# Markdown内容..."
	}
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
	"version": "1.0.0"
}
```

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
- **转换引擎**: Custom parsing libraries
