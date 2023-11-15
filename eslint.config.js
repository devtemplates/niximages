/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { eslintPresetTypescript } from "@devtemplates/eslint-preset-typescript";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

/* -----------------------------------------------------------------------------
 * eslint
 * -------------------------------------------------------------------------- */

export default [
  ...eslintPresetTypescript({ ignores: ["dist/**/*", "docs/**/*"] }),
  eslintPluginPrettierRecommended,
];
