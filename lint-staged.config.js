/* -----------------------------------------------------------------------------
 * lint-staged config
 * -------------------------------------------------------------------------- */

export default {
  "**/*.(ts|js)?(x)": ["npx prettier --write", "npx eslint"],
  // NOTE: We intentionally do not pass the files to tsc because we want to
  // ensure that the entire project compiles.
  "**/*.ts?(x)": () => "npx tsc --noEmit",
};
