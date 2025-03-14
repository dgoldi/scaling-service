# Image Scaling Service

A high-performance service for scaling and converting images to WebP format built with Node.js, Express, and TypeScript.

## Features

- Accepts image uploads (max 20MB)
- Resizes images to specified width
- Converts all images to WebP format with customizable quality
- RESTful API with OpenAPI specification
- Performance optimized for large images
- Docker support for easy deployment

## Prerequisites

- Node.js v22 or higher
- npm v10 or higher

## Installation

### Using npm

```bash
# Clone the repository
git clone https://github.com/yourusername/scaling-svc.git
cd scaling-svc

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

### Using Docker

```bash
# Clone the repository
git clone https://github.com/yourusername/scaling-svc.git
cd scaling-svc

# Build and start the Docker container
docker-compose up -d
```

## Development

```bash
# Run in development mode with hot reloading
npm run dev

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Run tests
npm run test

# Check for unused dependencies
npm run knip
```

## API Documentation

The API documentation is available at `/api-docs` when the server is running.

### Endpoints

#### `GET /health`

Health check endpoint that returns the service status.

**Response**:

```json
{
  "status": "ok",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "uptime": 3600
}
```

#### `POST /images/scale`

Upload and scale an image.

**Request Parameters**:

- `image` (required): The image file to upload (form-data)
- `width` (optional): The desired width in pixels (1-10000)
- `quality` (optional): The WebP quality (1-100, default: 80)

**Example Request**:

```bash
curl -X POST http://localhost:3000/images/scale \
  -F "image=@path/to/image.jpg" \
  -F "width=800" \
  -F "quality=85"
```

**Response**: The processed WebP image

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment ('development' or 'production')
- `LOG_LEVEL`: Logging level (default: 'info')
- `MAX_FILE_SIZE`: Maximum file size in bytes (default: 20MB)

## License

MIT License
