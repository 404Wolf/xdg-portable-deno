import { DELIMITER, join, normalize } from "@std/path";
import { Adapt as AdaptOSPaths, type OSPaths } from "./osPaths.ts";

// XDG references
// # ref: <https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html> @@ <https://archive.is/aAhtw>
// # ref: <https://specifications.freedesktop.org/basedir-spec/latest/ar01s03.html> @@ <https://archive.is/7N0TN>
// # ref: <https://wiki.archlinux.org/index.php/XDG_Base_Directory> @@ <https://archive.is/VdO9n>
// # ref: <https://wiki.debian.org/XDGBaseDirectorySpecification#state> @@ <http://archive.is/pahId>
// # ref: <https://ploum.net/207-modify-your-application-to-use-xdg-folders> @@ <https://archive.is/f43Gk>

/** `XDG` (API) Determine XDG Base Directory paths (OS/platform portable). */
interface XDG {
  /** Returns the directory path for user-specific non-essential (ie, cached) data files. */
  cache(): string;

  /** Returns the directory path for user-specific configuration files.	*/
  config(): string;

  /** Returns directory path for user-specific data files. */
  data(): string;

  /**	Returns the directory path for user-specific non-essential runtime files (such as sockets, named pipes, etc); may be `undefined`. */
  runtime(): string | undefined;

  /** Returns the directory path for user-specific state files (non-essential and more volatile than configuration files). */
  state(): string;

  /** Returns a preference-ordered array of base directory paths to search for configuration files (includes `.config()` directory as first entry). */
  configDirs(): readonly string[];

  /** Returns a preference-ordered array of base directory paths to search for data files (includes `.data()` directory as first entry). */
  dataDirs(): readonly string[];
}

function Adapt(): { readonly XDG: XDG } {
  const isMacOS = /darwin$/i.test(Deno.build.target);
  const isWinOS = /win/i.test(Deno.build.target);

  // Create Deno adapter
  const denoAdapter = {
    env: {
      get: (key: string) => Deno.env.get(key),
    },
    os: {
      homedir: () => Deno.env.get("HOME") || "",
      tmpdir: () => Deno.env.get("TMPDIR") || "",
    },
    path: {
      join,
      normalize,
    },
    process: {
      platform: Deno.build.os,
    },
  };

  const { OSPaths } = AdaptOSPaths(denoAdapter);
  const osPaths: OSPaths = OSPaths();

  function baseDir() {
    return osPaths.home() || osPaths.temp();
  }

  function valOrPath(val: string | undefined, pathSegments: readonly string[]) {
    return val || join(...pathSegments);
  }

  const linux = () => {
    const cache = () =>
      valOrPath(Deno.env.get("XDG_CACHE_HOME"), [baseDir(), ".cache"]);
    const config = () =>
      valOrPath(Deno.env.get("XDG_CONFIG_HOME"), [baseDir(), ".config"]);
    const data = () =>
      valOrPath(Deno.env.get("XDG_DATA_HOME"), [baseDir(), ".local", "share"]);
    const runtime = () => Deno.env.get("XDG_RUNTIME_DIR") || void 0;
    const state = () =>
      valOrPath(Deno.env.get("XDG_STATE_HOME"), [baseDir(), ".local", "state"]);

    return { cache, config, data, runtime, state };
  };

  const macos = () => {
    const cache = () =>
      valOrPath(Deno.env.get("XDG_CACHE_HOME"), [
        baseDir(),
        "Library",
        "Caches",
      ]);
    const config = () =>
      valOrPath(Deno.env.get("XDG_CONFIG_HOME"), [
        baseDir(),
        "Library",
        "Preferences",
      ]);
    const data = () =>
      valOrPath(Deno.env.get("XDG_DATA_HOME"), [
        baseDir(),
        "Library",
        "Application Support",
      ]);
    const runtime = () => Deno.env.get("XDG_RUNTIME_DIR") || void 0;
    const state = () =>
      valOrPath(Deno.env.get("XDG_STATE_HOME"), [
        baseDir(),
        "Library",
        "State",
      ]);

    return { cache, config, data, runtime, state };
  };

  const windows = () => {
    // # ref: <https://www.thewindowsclub.com/local-localnow-roaming-folders-windows-10> @@ <http://archive.is/tDEPl>
    // Locations for cache/config/data/state are invented (Windows doesn't have a popular convention)

    function appData() {
      // ".../AppData/Roaming" contains data which may follow user between machines
      return valOrPath(Deno.env.get("APPDATA"), [
        baseDir(),
        "AppData",
        "Roaming",
      ]);
    }
    function localAppData() {
      // ".../AppData/Local" contains local-machine-only user data
      return valOrPath(Deno.env.get("LOCALAPPDATA"), [
        baseDir(),
        "AppData",
        "Local",
      ]);
    }

    const cache = () =>
      valOrPath(Deno.env.get("XDG_CACHE_HOME"), [localAppData(), "xdg.cache"]);
    const config = () =>
      valOrPath(Deno.env.get("XDG_CONFIG_HOME"), [appData(), "xdg.config"]);
    const data = () =>
      valOrPath(Deno.env.get("XDG_DATA_HOME"), [appData(), "xdg.data"]);
    const runtime = () => Deno.env.get("XDG_RUNTIME_DIR") || void 0;
    const state = () =>
      valOrPath(Deno.env.get("XDG_STATE_HOME"), [localAppData(), "xdg.state"]);

    return { cache, config, data, runtime, state };
  };

  class XDG_ {
    constructor() {
      function XDG(): XDG {
        return new XDG_() as XDG;
      }

      const extension = isMacOS ? macos() : isWinOS ? windows() : linux();

      XDG.cache = extension.cache;
      XDG.config = extension.config;
      XDG.data = extension.data;
      XDG.runtime = extension.runtime;
      XDG.state = extension.state;

      XDG.configDirs = function configDirs() {
        const pathList = Deno.env.get("XDG_CONFIG_DIRS");
        return [
          extension.config(),
          ...(pathList ? pathList.split(DELIMITER) : []),
        ];
      };

      XDG.dataDirs = function dataDirs() {
        const pathList = Deno.env.get("XDG_DATA_DIRS");
        return [
          extension.data(),
          ...(pathList ? pathList.split(DELIMITER) : []),
        ];
      };

      return XDG;
    }
  }
  return { XDG: new XDG_() as XDG };
}

export type { XDG };
export { Adapt };
