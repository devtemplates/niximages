/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

/* -----------------------------------------------------------------------------
 * vite config
 * -------------------------------------------------------------------------- */

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    dir: "lib",
    setupFiles: ["./lib/__test__/setup.ts"],
    coverage: { provider: "v8" },
  },
});
