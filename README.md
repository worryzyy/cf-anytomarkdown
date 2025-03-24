# AnyToMarkdown Document Conversion Service

_English | [简体中文](./README.zh-CN.md)_

AnyToMarkdown is a powerful online tool that quickly and accurately converts various document formats (including PDF files, images, HTML pages, etc.) to Markdown format. The service is built on Cloudflare Workers AI, providing high-performance, low-latency file conversion experience.

**Live Demo**: [https://cf-anytomarkdown.vercel.app/](https://cf-anytomarkdown.vercel.app/)

## Key Features

- **Multi-format Support**: Convert PDF, HTML, images, and other formats to Markdown
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

3. Create a `.dev.vars` file in the `packages/worker` directory for local development environment variables:

```bash
# Example .dev.vars file
ENVIRONMENT=development
CORS_ALLOWED_ORIGINS=http://localhost:5173
MAX_FILE_SIZE=10485760  # 10MB in bytes
ENABLE_DEBUG=true
```

The `.dev.vars` file is used to store environment variables for local development.

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

#### Deploy Frontend to Vercel

To deploy the frontend to Vercel, follow these steps:

1. **Install Vercel CLI** (optional):

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Deploy the Frontend**:
   Navigate to the `packages/web` directory and run:

   ```bash
   vercel
   ```

4. **Configure Environment Variables**:

   - Set the `VITE_API_BASE_URL` to your deployed Worker URL in the Vercel project settings.

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

### Core Features

AnyToMarkdown utilizes Cloudflare Workers AI's toMarkdown conversion functionality, supporting various document formats:

- **PDF Documents**: Converts PDF files to Markdown while preserving structure
- **Images**: Uses AI to describe image content and convert to meaningful Markdown text
- **HTML Documents**: Transforms HTML pages into clean Markdown
- **XML Documents**: Converts XML data to Markdown format
- **Spreadsheets**: Handles various spreadsheet formats (Excel, CSV, etc.)

## Supported File Formats

AnyToMarkdown supports the following file formats:

- PDF Documents (.pdf)
- Images (.jpeg, .jpg, .png, .webp, .svg)
- HTML Documents (.html)
- XML Documents (.xml)
- Microsoft Office Spreadsheets (.xlsx, .xlsm, .xlsb, .xls)
- OpenDocument Spreadsheets (.ods)
- CSV Files (.csv)
- Apple Numbers Files (.numbers)

## Limitations and Known Issues

### File Size Limitations

- **Maximum File Size**: 5MB per file
- **AI Processing Limits**: Cloudflare Workers AI has internal processing limits that may result in errors for complex files even below the size limit
- **Error Handling**: The application includes proper error handling for oversized files and service unavailability

### Beta Status

**Note**: The Markdown Conversion feature in Cloudflare Workers AI is currently in **Beta stage**. This means:

- The conversion quality may not be perfect in all cases
- Complex formatting might be lost during conversion
- Results may vary depending on the input document complexity
- The service is subject to changes and improvements by Cloudflare

We recommend reviewing and possibly editing the converted Markdown for critical documents.

### Common Errors

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
- **Conversion Engine**: Cloudflare Workers AI

---
