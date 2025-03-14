import { Express } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project root directory
const projectRoot = path.resolve(__dirname, '../../');

/**
 * Load the OpenAPI specification from the YAML file
 */
const loadOpenApiSpec = () => {
  const openapiPath = path.join(projectRoot, 'openapi', 'openapi.yaml');
  const openapiYaml = fs.readFileSync(openapiPath, 'utf8');
  return YAML.parse(openapiYaml);
};

/**
 * Set up Swagger UI for the OpenAPI specification
 */
export const setupSwaggerUi = (app: Express) => {
  const openapiSpec = loadOpenApiSpec();

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openapiSpec, {
      explorer: true,
      customSiteTitle: 'Image Scaling Service API',
    }),
  );
};
