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

// Get standard XDG paths
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

### Advanced Usage

If you need more control, you can create your own instance:

```typescript
import { Adapt } from "./mod.ts";

// Create a new XDG instance
const { XDG } = Adapt();
const xdg = XDG;

// Now use it as before
console.log(`Cache directory: ${xdg.cache()}`);
```

## Permissions

This library requires the `--allow-env` permission to access environment
variables.

## Platform-Specific Behavior

### Linux

- Uses standard XDG paths: `~/.cache`, `~/.config`, `~/.local/share`, etc.
- Respects environment variables: `XDG_CACHE_HOME`, `XDG_CONFIG_HOME`, etc.

### macOS

- Adapts XDG to macOS conventions: `~/Library/Caches`, `~/Library/Preferences`,
  etc.
- Still respects XDG environment variables if set

### Windows

- Adapts XDG to Windows conventions using `%APPDATA%` and `%LOCALAPPDATA%`
- Creates XDG-like structure within Windows standard directories
- Still respects XDG environment variables if set

## API Reference

### `xdg.cache(): string`

Returns the directory path for user-specific non-essential (i.e., cached) data
files.

### `xdg.config(): string`

Returns the directory path for user-specific configuration files.

### `xdg.data(): string`

Returns the directory path for user-specific data files.

### `xdg.runtime(): string | undefined`

Returns the directory path for user-specific non-essential runtime files (such
as sockets, named pipes, etc). May be undefined.

### `xdg.state(): string`

Returns the directory path for user-specific state files (non-essential and more
volatile than configuration files).

### `xdg.configDirs(): readonly string[]`

Returns a preference-ordered array of base directory paths to search for
configuration files (includes `.config()` directory as first entry).

### `xdg.dataDirs(): readonly string[]`

Returns a preference-ordered array of base directory paths to search for data
files (includes `.data()` directory as first entry).

## License

MIT
