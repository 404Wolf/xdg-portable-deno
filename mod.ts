/**
 * XDG Portable for Deno
 *
 * A cross-platform Deno implementation of the XDG Base Directory Specification
 * See: https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
 */

export { Adapt } from "./src/XDG.ts";
export type { XDG } from "./src/XDG.ts";
export type { OSPaths } from "./src/osPaths.ts";

import { Adapt, type XDG } from "./src/XDG.ts";
export default Adapt() as XDG;
