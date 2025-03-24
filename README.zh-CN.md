# AnyToMarkdown 文件转换服务

_[English](./README.md) | 简体中文_

AnyToMarkdown 是一个功能强大的在线工具，可将各种文档格式（包括 PDF 文件、图像、HTML 网页等）快速、准确地转换为 Markdown 格式。该服务基于 Cloudflare Workers AI 构建，提供高性能、低延迟的文件转换体验。

**在线演示**： [https://cf-anytomarkdown.vercel.app/](https://cf-anytomarkdown.vercel.app/)

## 主要功能

- **多格式支持**：支持将 PDF、HTML、图像等多种格式转换为 Markdown
- **文件上传**：支持拖放或选择本地文件进行转换
- **格式保留**：最大程度保留原文档的格式，包括标题、列表、表格、图片等
- **实时预览**：转换完成后即时预览转换结果
- **导出下载**：轻松下载生成的 Markdown 文件
- **批量处理**：同时转换多个文件

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
npm run install:all
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
ENVIRONMENT=development
CORS_ALLOWED_ORIGINS=http://localhost:5173
MAX_FILE_SIZE=10485760  # 10MB in bytes
ENABLE_DEBUG=true
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

   - 在 Vercel 项目设置中将 `VITE_API_BASE_URL` 设置为您的已部署 Worker URL。

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

### 批量转换文件

1. 默认启用多文件选择功能
2. 拖放多个文件或选择多个文件
3. 系统将同时转换所有文件
4. 查看转换后的文件列表，点击任意文件进行预览

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

### 核心功能

AnyToMarkdown 利用 Cloudflare Workers AI 的 toMarkdown 转换功能，支持多种文档格式：

- **PDF 文档**：将 PDF 文件转换为 Markdown 同时保留结构
- **图像**：使用 AI 描述图像内容并转换为有意义的 Markdown 文本
- **HTML 文档**：将 HTML 页面转换为简洁的 Markdown
- **XML 文档**：将 XML 数据转换为 Markdown 格式
- **电子表格**：处理各种电子表格格式（Excel、CSV 等）

## 支持的文件格式

AnyToMarkdown 支持以下文件格式：

- PDF 文档 (.pdf)
- 图像 (.jpeg, .jpg, .png, .webp, .svg)
- HTML 文档 (.html)
- XML 文档 (.xml)
- Microsoft Office 电子表格 (.xlsx, .xlsm, .xlsb, .xls)
- OpenDocument 电子表格 (.ods)
- CSV 文件 (.csv)
- Apple Numbers 文件 (.numbers)

## 测试

为方便测试，我们在 `packages/web/public` 目录中包含了示例测试文件：

- example.html：包含各种元素的示例 HTML 文件

您可以使用这些文件测试转换功能。

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
- **转换引擎**: Cloudflare Workers AI

## 限制与已知问题

### 文件大小限制

- **最大文件大小**：每个文件 5MB
- **AI 处理限制**：Cloudflare Workers AI 有内部处理限制，即使文件大小在限制范围内，复杂文件也可能导致错误
- **错误处理**：应用程序包含对超大文件和服务不可用情况的适当错误处理

### 支持的文件格式

可以转换为 Markdown 的文件包括：

- PDF 文档 (.pdf)
- 图像 (.jpeg, .jpg, .png, .webp, .svg)
- HTML 文档 (.html)
- XML 文档 (.xml)
- Microsoft Office 电子表格 (.xlsx, .xlsm, .xlsb, .xls)
- OpenDocument 电子表格 (.ods)
- CSV 文件 (.csv)
- Apple Numbers 文件 (.numbers)

### 常见错误

#### AiError: 3006: Request is too large

**说明**：请求数据大小超过了 Workers AI 服务的限制。

**可能的原因**：

- 上传的文件超出了允许的大小限制
- 对于文本模型，限制通常在 1MB 左右
- 对于图像处理模型，限制在 20MB 左右
- 对于文档转换任务，可能有特定的大小限制

**解决方案**：

- 减小上传文件的大小或压缩文件
- 对于大型文档，尝试将文件分割成多个小块分别处理
- 对于图像，可以先压缩或降低分辨率
- 限制应用允许的最大文件上传大小（建议限制在 5MB 以内）

#### BadInput 错误

**说明**：输入数据超出了模型的上下文窗口大小。

**解决方案**：

- 减少输入的文本长度或令牌数量
- 压缩或简化输入内容

#### 性能相关错误

当使用函数调用等高级功能时，性能可能会成为问题。以下是一些提高性能的建议：

- 缩短提示词（减少输入处理时间）
- 减少提供的工具数量
- 向最终用户流式传输响应（最小化交互时间）
- 对于大型文件处理，考虑使用异步任务处理

#### Worker 上传错误

**错误代码**：10021（超出上传大小限制）

**说明**：一个 Worker 在 Paid 计划上压缩后的大小最多可达 10 MB，在 Free 计划上最多可达 3 MB。

**解决方案**：

- 移除不必要的依赖
- 使用 Workers KV、D1 数据库或 R2 存储配置文件、静态资产和二进制数据
- 将功能拆分为多个 Workers，使用 Service bindings 连接

**错误代码**：10021（脚本启动超过 CPU 时间限制）

**说明**：在 Worker 的顶级作用域中执行的工作超过了启动时间限制（400ms）的 CPU 时间。

**解决方案**：

- 避免在全局作用域中执行昂贵的初始化工作
- 在构建时或 Worker 的处理程序被调用时执行初始化工作
- 使用 Chrome DevTools 分析 Worker 的性能问题

#### AnyToMarkdown 特定的文档转换问题

- **复杂文档结构丢失**：某些高级格式可能在转换为 Markdown 时丢失，这是 Markdown 格式自身的限制
- **表格渲染问题**：复杂表格（如合并单元格）可能无法完美保留
- **图像处理**：图像会被 AI 模型分析并转换为描述性文本，但可能无法捕捉所有视觉细节

更多详细信息，请参考以下资源：

- [Cloudflare Workers AI 错误文档](https://developers.cloudflare.com/workers-ai/workers-ai-errors/)
- [Cloudflare Workers 错误和异常](https://developers.cloudflare.com/workers/observability/errors/)
- [Workers AI 限制](https://developers.cloudflare.com/workers-ai/platform/limits/)
