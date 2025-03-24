# AnyToMarkdown Document Conversion Service

_English | [简体中文](./README.zh-CN.md)_

AnyToMarkdown is a powerful online tool that quickly and accurately converts various document formats (including Word documents, PDF files, HTML pages, etc.) to Markdown format. The service is built on Cloudflare Workers, providing high-performance, low-latency file conversion experience.

## Key Features

- **Multi-format Support**: Convert PDF, HTML, TXT and other formats to Markdown (DOCX format is not supported)
- **File Upload**: Support drag-and-drop or file selection for conversion
- **Format Preservation**: Maintains original document formatting including headings, lists, tables, images, etc.
- **Real-time Preview**: Instantly preview conversion results
- **Export & Download**: Easily download generated Markdown files

## Project Structure

AnyToMarkdown uses a monorepo structure with the following main components:

- `packages/web`: Frontend React application providing the user interface
- `packages/worker`: Cloudflare Worker backend handling file conversion logic

## Prerequisites

Before using AnyToMarkdown, you need:

1. A [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. [Node.js](https://nodejs.org/) v18 or higher
3. [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/anytomarkdown.git
cd anytomarkdown
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

#### Worker Configuration

1. In the `packages/worker` directory, copy the example configuration file:

```bash
cp packages/worker/wrangler.example.toml packages/worker/wrangler.toml
```

2. Edit the `packages/worker/wrangler.toml` file, adding your Cloudflare account ID:

```toml
# Add your Cloudflare account ID here
account_id = "your_account_id_here"  # Replace with your actual account ID
```

You can find your account ID in the [Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/workers).

#### Frontend Configuration

1. In the `packages/web` directory, copy the example environment file:

```bash
cp packages/web/.env.example packages/web/.env.local
```

2. Edit the `.env.local` file according to your needs:
   - Use local Worker URL for development
   - Use deployed Worker URL for production

### 4. Development Environment

Start the frontend development server:

```bash
npm run dev:web
```

Start the Worker development server:

```bash
npm run dev:worker
```

Or start both simultaneously:

```bash
npm run dev
```

### 5. Build and Deploy

#### Build the Project

```bash
npm run build
```

#### Deploy the Worker

After configuring your `wrangler.toml` file, run:

```bash
npm run deploy:worker
```

#### Complete Deployment

Build and deploy the entire project:

```bash
npm run deploy
```

## How to Use

### Converting Files via Upload

1. Visit the AnyToMarkdown website
2. Drag and drop files to the designated area or click "Choose File"
3. After uploading, the system will automatically begin conversion
4. Once complete, preview the Markdown content in the preview area
5. Click "Download" to save the Markdown file

## API Documentation

AnyToMarkdown provides RESTful APIs allowing developers to integrate conversion functionality into their applications:

### File Conversion API

**Request**:

```
POST /api/convert
Content-Type: multipart/form-data

File field name: file
```

**Response**:

```json
{
  "success": true,
  "result": {
    "name": "filename",
    "mimeType": "text/markdown",
    "format": "markdown",
    "tokens": 1234,
    "data": "# Markdown content..."
  }
}
```

### Batch File Conversion API

**Request**:

```
POST /api/batch-convert
Content-Type: multipart/form-data

File field names: file1, file2, ...
```

**Response**:

```json
{
  "success": true,
  "results": [
    {
      "name": "filename1",
      "mimeType": "text/markdown",
      "format": "markdown",
      "tokens": 1234,
      "data": "# Markdown content..."
    },
    {
      "name": "filename2",
      "mimeType": "text/markdown",
      "format": "markdown",
      "tokens": 5678,
      "data": "# Another Markdown content..."
    }
  ]
}
```

### Service Status API

**Request**:

```
GET /api/status
```

**Response**:

```json
{
  "success": true,
  "status": "online",
  "service": "anytomarkdown",
  "version": "1.0.0"
}
```

## Technical Implementation

### Frontend Implementation

The frontend is built with React + TypeScript + Tailwind CSS, with key components including:

- `FileUpload`: Handles file upload and drag-and-drop functionality
- `MarkdownOutput`: Previews and downloads conversion results
- `Notification`: Displays operation prompts and error messages

### Backend Implementation

The backend is based on Cloudflare Workers, utilizing Cloudflare AI's document conversion capabilities:

- Supports single-file and batch file processing
- Complete error handling and status checking

### Core Features

- Document parsing and format handling
- Image processing and embedding
- Table and list format preservation
- Link and reference handling

## Markdown Conversion Implementation

Our Markdown conversion process is designed to preserve the original document's structure while providing clean, well-formatted Markdown output:

### Conversion Process

1. **Document Upload**: Files are uploaded through the frontend interface
2. **Backend Processing**: Cloudflare Workers receives the file and processes it using Cloudflare AI services
3. **Format Handling**: Various input formats (PDF, HTML, TXT) are processed differently to ensure optimal conversion
4. **Markdown Generation**: The conversion engine transforms the content to standard Markdown syntax
5. **Post-processing**: Special handling for formatting issues, including:
   - Header formatting (ensuring proper spacing after # symbols)
   - Line break preservation (adding trailing spaces for proper breaks)
   - Table formatting with enhanced styling
   - Code block syntax highlighting

### Frontend Rendering

The converted Markdown is rendered in the browser using:

- **markdown-it**: Core rendering engine
- **highlight.js**: Code syntax highlighting
- **Custom enhancements**: Table styling, link handling, and other formatting improvements

### Limitations

- DOCX format is not currently supported
- Maximum file size is limited by Cloudflare Workers restrictions
- Complex formatting in PDF files may not be perfectly preserved

### Beta Stage Notice

Please note that the Markdown conversion feature is currently in beta. As a result, the conversion results may not be ideal. We encourage you to stay tuned for future updates and improvements.

## Troubleshooting

### 1. Worker Deployment Failure

Ensure you've correctly set up your Cloudflare account ID and have permissions to deploy Workers. You may need to run:

```bash
npx wrangler login
```

### 2. AI Conversion Service Unavailable

Ensure your Cloudflare account has AI features enabled. You can check this in the Cloudflare Dashboard.

### 3. File Size Limitations

Cloudflare Workers have request size limitations. For large files, consider splitting them or using alternative services.

## Contributing

We welcome community contributions! If you'd like to contribute to AnyToMarkdown, please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Cloudflare Workers, TypeScript
- **Conversion Engine**: Cloudflare AI
