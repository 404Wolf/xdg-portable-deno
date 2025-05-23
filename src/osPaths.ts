/** `OSPaths` (API) Determine common OS/platform paths (home, temp, ...) */
interface OSPaths {
  /** Create an `OSPaths` object (a preceding `new` is optional). */
  (): OSPaths;

  /** Returns the path string of the user's home directory (or `undefined` if the user's home directory is not resolvable). */
  home(): string | undefined;

  /** Returns the path string of the system's default directory for temporary files. */
  temp(): string;
}

// Define Deno adapter type
interface Adapter {
  env: {
    get(key: string): string | undefined;
  };
  os: {
    homedir?: () => string | undefined;
    tmpdir?: () => string | undefined;
  };
  path: {
    join(...paths: string[]): string;
    normalize(path: string): string;
  };
  process: {
    platform: string;
  };
}

function isEmpty(s: string | null | undefined): boolean {
  return !s; // reminder: JS "falsey" == [undefined, null, NaN, 0, '', false]
}

function Adapt(adapter_: Adapter): { readonly OSPaths: OSPaths } {
  const { env, os, path } = adapter_;

  const isWinOS = /^win/i.test(adapter_.process.platform);

  function normalizePath(path_: string | undefined): string | undefined {
    return path_
      ? adapter_.path.normalize(adapter_.path.join(path_, "."))
      : void 0;
  }

  function home() {
    const posix = () =>
      normalizePath(
        (typeof os.homedir === "function" ? os.homedir() : void 0) ||
          env.get("HOME"),
      );

    const windows = () => {
      const priorityList = [
        typeof os.homedir === "function" ? os.homedir() : void 0,
        env.get("USERPROFILE"),
        env.get("HOME"),
        env.get("HOMEDRIVE") || env.get("HOMEPATH")
          ? path.join(env.get("HOMEDRIVE") || "", env.get("HOMEPATH") || "")
          : void 0,
      ];
      return normalizePath(priorityList.find((v) => !isEmpty(v)));
    };

    return isWinOS ? windows() : posix();
  }

  function temp() {
    function joinPathToBase(
      base: string | undefined,
      segments: readonly string[],
    ) {
      return base ? path.join(base, ...segments) : void 0;
    }

    function posix() {
      const fallback = "/tmp"; // or '/var/tmp'
      const priorityList = [
        typeof os.tmpdir === "function" ? os.tmpdir() : void 0,
        env.get("TMPDIR"),
        env.get("TEMP"),
        env.get("TMP"),
      ];
      return normalizePath(priorityList.find((v) => !isEmpty(v))) || fallback;
    }

    function windows() {
      const fallback = "C:\\Temp"; // or 'C:\\Windows\\Temp'
      const priorityListLazy = [
        typeof os.tmpdir === "function" ? os.tmpdir : () => void 0,
        () => env.get("TEMP"),
        () => env.get("TMP"),
        () => joinPathToBase(env.get("LOCALAPPDATA"), ["Temp"]),
        () => joinPathToBase(home(), ["AppData", "Local", "Temp"]),
        () => joinPathToBase(env.get("ALLUSERSPROFILE"), ["Temp"]),
        () => joinPathToBase(env.get("SystemRoot"), ["Temp"]),
        () => joinPathToBase(env.get("windir"), ["Temp"]),
        () => joinPathToBase(env.get("SystemDrive"), ["\\", "Temp"]),
      ];
      const v = priorityListLazy.find((v) => v && !isEmpty(v()));
      return (v && normalizePath(v())) || fallback;
    }

    return isWinOS ? windows() : posix();
  }

  class OSPaths_ {
    constructor() {
      function OSPaths(): OSPaths {
        return new OSPaths_() as OSPaths;
      }

      OSPaths.home = home;
      OSPaths.temp = temp;

      return OSPaths;
    }
  }

  return { OSPaths: new OSPaths_() as OSPaths };
}

export type { OSPaths };
export { Adapt };
