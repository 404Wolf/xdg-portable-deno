/**
 * XDG Portable for Deno
 *
 * A cross-platform Deno implementation of the XDG Base Directory Specification
 * See: https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
 */

export { Adapt } from "./src/XDG.ts";
export type { XDG } from "./src/XDG.ts";
export type { OSPaths } from "./src/osPaths.ts";

// Default export for convenience
import { Adapt } from "./src/XDG.ts";
const { XDG } = Adapt();
export default XDG;
