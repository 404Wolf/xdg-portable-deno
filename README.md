# XDG Portable for Deno

A cross-platform implementation of the
[XDG Base Directory Specification](https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html)
for Deno.

## Features

- Fully implements the XDG Base Directory Specification
- Cross-platform support (Linux, macOS, Windows)
- Type-safe API
- Zero dependencies beyond Deno standard library
- Comprehensive test suite

## Installation

```typescript
import xdg from "https://path-to-your-repo/mod.ts";
// Or if you want more control:
import { Adapt } from "https://path-to-your-repo/mod.ts";
```

## Usage

### Basic Usage

```typescript
import xdg from "./mod.ts";

console.log(`Cache directory: ${xdg.cache()}`);
console.log(`Config directory: ${xdg.config()}`);
console.log(`Data directory: ${xdg.data()}`);
console.log(`State directory: ${xdg.state()}`);
console.log(`Runtime directory: ${xdg.runtime()}`);

// Get search paths for config files
const configDirs = xdg.configDirs();
console.log("Places to look for configuration files:");
configDirs.forEach((dir) => console.log(` - ${dir}`));

// Get search paths for data files
const dataDirs = xdg.dataDirs();
console.log("Places to look for data files:");
dataDirs.forEach((dir) => console.log(` - ${dir}`));
```

## Permissions

This library requires the `--allow-env` permission to access environment
variables.

