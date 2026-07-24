# Technical Setup & Installation Guide

This document outlines the environment configuration, package dependencies, local registry setup, and model requirements to run the profiling suite.

---

## 1. Tech Stack & Global Dependencies
Before initializing the project, ensure the following core tools are installed on your Windows host:
*   **Node.js**: `v20.x` or higher (LTS recommended)
*   **Package Manager**: `npm` (included with Node.js)
*   **Runtime Environment**: TypeScript (`^7.0.2` or compatible TS compiler)
*   **Local LLM Engine**: [Ollama](https://ollama.com/) (installed and running locally on port `11434`)
*   **System Shell**: PowerShell 5.1 / Core (required for WMI/CIM monitoring scripts in Experiment 3)

---

## 2. Local Package Management & Registry Troubleshooting

The project contains a customized `package.json` utilizing a TypeScript execution layer and HTTP clients for LLM interaction:


## 3.Verdaccio Local Registry vs. Public NPM
If your environment is configured to use a local proxy cache (like Verdaccio on http://localhost:4873/) and it is not currently running, you will encounter ECONNREFUSED errors during installation.

To resolve this, choose one of the following methods:

Method A: Redirect to the Official NPM Registry (Recommended if Verdaccio is idle)


### Temporarily override registry for a single installation:
npm install --registry=https://registry.npmjs.org/

### Or permanently set registry back to official registry:
npm config set registry https://registry.npmjs.org/
Method B: Start the Local Verdaccio Instance


### Run the local registry server (ensure it is installed globally)
npx verdaccio

## 3. Project Configuration (config.ts)
Create a local configuration file at backend/test/config.ts to manage endpoints and model selection:


config.ts

 The local API endpoint for Ollama generation tasks
```export const OLLAMA_API = 'http://localhost:11434/api/generate';```

 Primary low-resource model selected for green profiling benchmarks (0.92 GB footprint)
```export const TEST_MODEL = 'qwen2.5:1.5b'; ```

 Alternative baseline model for coding tasks:
 ```export const TEST_MODEL = 'qwen2.5-coder:3b'; ```

## 4. Local LLM Inventory & System Verification
The benchmark suite expects the target models to be loaded locally on disk. Ensure your local Ollama registry matches the tested profiles. You can verify available models by running:

```
ollama ls

Expected Local Baseline Inventory:
┌─────────┬────────────────────┬────────┬─────────────────────────────────────┐
│ (index) │ name               │ sizeGB │ modifiedAt                          │
├─────────┼────────────────────┼────────┼─────────────────────────────────────┤
│ 0       │ 'mistral:7b'       │ '4.07' │ '2026-07-23T04:14:38.9167101+03:30' │
│ 1       │ 'qwen2.5-coder:7b' │ '4.36' │ '2026-07-23T04:13:05.6882352+03:30' │
│ 2       │ 'qwen2.5:1.5b'     │ '0.92' │ '2026-07-23T04:12:17.7458343+03:30' │
└─────────┴────────────────────┴────────┴─────────────────────────────────────┘
```
Pulling required models for the suite:
```
# Pull the default profiling model (Qwen 1.5B)
ollama pull qwen2.5:1.5b

# Pull the coding-specific model
ollama pull qwen2.5-coder:7b
```

## 5. How to Run the Experiments
To run the TypeScript benchmarks, execute them using your preferred TypeScript runner (such as ts-node or compile via tsc):

```
cd project && npm install

+ Install ts-node globally if needed
npm install -g ts-node

+ npx  ts-node filename.ts

or npx tsc filename.ts/ filename.js

```


