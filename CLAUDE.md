# Development Guidelines for Scaling Service

## Code Style Guidelines
- **Schema-First**: Use a schema-first approach with Open-API to document the API
- **Formatting**: Use Prettier with 2-space indentation
- **Imports**: Group imports by external/internal, alphabetize within groups
- **Types**: Use TypeScript with strict typing, avoid `any` where possible
- **Naming**:
  - camelCase for variables and functions
  - PascalCase for classes and components
  - UPPER_SNAKE_CASE for constants
- **Error Handling**: Use try/catch blocks for async operations, provide informative error messages
- **Documentation**: JSDoc comments for public APIs, inline comments for complex logic

## Prompts to help implementing

Prompt 1:

```
As a wordlcass software engineer, known in node, help me to create:

- node service (version 22) with express and typescript (included in node 22)
- add the complete node-setup (including nvmrc, .npmrc, linting, prettier)
- use a schema-first approach with Open-API
- write the code as simple as possible (focusing on readabiliy for a junior engineer)
- add 1 API which accepts an image and has the optional parameter "width" and "quality". this API then scales the images with the help of depedency sharp and returns the downscaled imag in webp (only expert in webp)

Before implemeting, reason about the project-architecture and ask unclear questions.
After each stage test, if the implementation is working.
```