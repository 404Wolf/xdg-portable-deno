import { Adapt } from "../src/XDG.ts";
import { assertEquals, assertExists } from "@std/assert";

Deno.test("XDG paths are correctly initialized", () => {
  const { XDG } = Adapt();
  const xdg = XDG;

  // Verify paths exist and are strings
  assertExists(xdg.cache());
  assertExists(xdg.config());
  assertExists(xdg.data());
  assertExists(xdg.state());

  // Verify arrays are populated
  assertEquals(xdg.configDirs().length > 0, true);
  assertEquals(xdg.dataDirs().length > 0, true);

  // Verify first configDir matches config() result
  assertEquals(xdg.configDirs()[0], xdg.config());

  // Verify first dataDir matches data() result
  assertEquals(xdg.dataDirs()[0], xdg.data());
});

Deno.test("XDG respects environment variables", async (t) => {
  // Save original environment
  const originalEnv = {
    XDG_CACHE_HOME: Deno.env.get("XDG_CACHE_HOME"),
    XDG_CONFIG_HOME: Deno.env.get("XDG_CONFIG_HOME"),
    XDG_DATA_HOME: Deno.env.get("XDG_DATA_HOME"),
    XDG_STATE_HOME: Deno.env.get("XDG_STATE_HOME"),
    XDG_RUNTIME_DIR: Deno.env.get("XDG_RUNTIME_DIR"),
  };

  // Test with custom paths
  await t.step("custom environment paths", () => {
    // Set custom environment variables
    Deno.env.set("XDG_CACHE_HOME", "/custom/cache");
    Deno.env.set("XDG_CONFIG_HOME", "/custom/config");
    Deno.env.set("XDG_DATA_HOME", "/custom/data");
    Deno.env.set("XDG_STATE_HOME", "/custom/state");
    Deno.env.set("XDG_RUNTIME_DIR", "/custom/runtime");

    const { XDG } = Adapt();
    const xdg = XDG;

    // Verify paths match custom environment
    assertEquals(xdg.cache(), "/custom/cache");
    assertEquals(xdg.config(), "/custom/config");
    assertEquals(xdg.data(), "/custom/data");
    assertEquals(xdg.state(), "/custom/state");
    assertEquals(xdg.runtime(), "/custom/runtime");

    // Verify first entries in dirs match custom paths
    assertEquals(xdg.configDirs()[0], "/custom/config");
    assertEquals(xdg.dataDirs()[0], "/custom/data");
  });

  // Restore original environment
  await t.step("cleanup", () => {
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) {
        Deno.env.delete(key);
      } else {
        Deno.env.set(key, value);
      }
    }
  });
});

Deno.test("XDG handles different OS platforms appropriately", () => {
  const { XDG } = Adapt();
  const xdg = XDG;

  // This is a simple verification that paths are set correctly
  // Real OS detection is mocked in the adapter

  const paths = {
    cache: xdg.cache(),
    config: xdg.config(),
    data: xdg.data(),
    state: xdg.state(),
  };

  // All paths should be non-empty strings
  for (const path of Object.values(paths)) {
    assertExists(path);
    assertEquals(typeof path, "string");
    assertEquals(path.length > 0, true);
  }
});
