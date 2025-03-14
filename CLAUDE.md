# Development Guidelines for Scaling Service

## Prompts to help implementing

Prompt 1:

```
As a Node.js expert, create an image scaling service with the following structure:

### Core Requirements
- Node.js v22 with Express and TypeScript (already inlcude in node v22)
- Complete development setup:
  - .nvmrc and .npmrc configuration
  - ESLint and Prettier for code formatting
  - use strict type checking
  - Knip for detecting unused code
  - Jest for testing

### API Design
- Schema-first approach using OpenAPI
- Single API endpoint that:
  - Accepts image uploads (max 20MB)
  - Takes optional parameters: width (number) and quality (1-100)
  - Processes images using Sharp
  - Returns WebP format only
  - No authentication required
  - No rate limiting needed
  - No caching implementation

### Engineering Practices
- Centralized error handling with appropriate HTTP status codes
- Input validation with detailed error messages
- Performance optimizations for large images
- Structured logging for requests and errors
- Comprehensive unit and integration tests
- Health check and monitoring endpoints
- Docker configuration for deployment
- Clear API documentation with examples

### Implementation Instructions
1. First analyze the architecture and explain your planned approach
2. Explain each building-step ahead
3. Ensure after each stage, that there a working artifact. Check if the implementation is still working, run lint, run typecheck, run tests, run knip
4. Ask to proceed after each build-step

```
