# Website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

## Requirements

- Node.js version >= 20

## Installation

```bash
npm install
```

## Local Development

```bash
npm run start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Project Structure

```
.
├── src/
│   ├── components/     # Visualization Iframe components
│   └── ...
├── static/
│   ├── pages/         # Visualization HTML files
│   └── ...
├── docs/              # Documentation files
├── blog/              # Blog posts
└── ...
```

## Key Directories

- `src/components`: Contains visualization Iframe components
- `static/pages`: Contains visualization HTML files
