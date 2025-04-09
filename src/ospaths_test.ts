import { join, normalize } from "@std/path";
import { Adapt } from "../src/osPaths.ts";
import { assertEquals, assertExists } from "@std/assert";

// Mock adapter for testing
function createMockAdapter(
  platform: string,
  homeDir?: string,
  tmpDir?: string,
) {
  return {
    env: {
      get: (key: string): string | undefined => {
        switch (key) {
          case "HOME":
            return homeDir;
          case "TMPDIR":
            return tmpDir;
          default:
            return undefined;
        }
      },
    },
    os: {
      homedir: () => homeDir,
      tmpdir: () => tmpDir,
    },
    path: {
      join,
      normalize,
    },
    process: {
      platform,
    },
  };
}

Deno.test("OSPaths correctly identifies home directory", async (t) => {
  await t.step("Linux home directory", () => {
    const mockAdapter = createMockAdapter("linux", "/home/testuser");
    const { OSPaths } = Adapt(mockAdapter);
    const osPaths = OSPaths();

    assertEquals(osPaths.home(), "/home/testuser");
  });

  await t.step("Windows home directory", () => {
    const mockAdapter = createMockAdapter("win32", "C:\\Users\\testuser");
    const { OSPaths } = Adapt(mockAdapter);
    const osPaths = OSPaths();

    assertEquals(osPaths.home(), "C:\\Users\\testuser");
  });

  await t.step("MacOS home directory", () => {
    const mockAdapter = createMockAdapter("darwin", "/Users/testuser");
    const { OSPaths } = Adapt(mockAdapter);
    const osPaths = OSPaths();

    assertEquals(osPaths.home(), "/Users/testuser");
  });
});

Deno.test("OSPaths correctly identifies temp directory", async (t) => {
  await t.step("Linux temp directory", () => {
    const mockAdapter = createMockAdapter("linux", "/home/testuser", "/tmp");
    const { OSPaths } = Adapt(mockAdapter);
    const osPaths = OSPaths();

    assertEquals(osPaths.temp(), "/tmp");
  });

  await t.step("Windows temp directory", () => {
    const mockAdapter = createMockAdapter(
      "win32",
      "C:\\Users\\testuser",
      "C:\\Temp",
    );
    const { OSPaths } = Adapt(mockAdapter);
    const osPaths = OSPaths();

    assertEquals(osPaths.temp(), "C:\\Temp");
  });

  await t.step("MacOS temp directory", () => {
    const mockAdapter = createMockAdapter(
      "darwin",
      "/Users/testuser",
      "/private/tmp",
    );
    const { OSPaths } = Adapt(mockAdapter);
    const osPaths = OSPaths();

    assertEquals(osPaths.temp(), "/private/tmp");
  });
});

Deno.test("OSPaths handles missing home directory", () => {
  const mockAdapter = createMockAdapter("linux", undefined, "/tmp");
  const { OSPaths } = Adapt(mockAdapter);
  const osPaths = OSPaths();

  assertEquals(osPaths.home(), undefined);
  assertEquals(osPaths.temp(), "/tmp");
});

Deno.test("OSPaths handles missing temp directory", () => {
  // Even with undefined temp, it should return fallback
  const mockAdapter = createMockAdapter("linux", "/home/testuser", undefined);
  const { OSPaths } = Adapt(mockAdapter);
  const osPaths = OSPaths();

  assertEquals(osPaths.home(), "/home/testuser");
  assertExists(osPaths.temp());
});
