/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// core
import { createRequire } from "module";
import { readFileSync } from "fs";

/* -----------------------------------------------------------------------------
 * require-fixture
 * -------------------------------------------------------------------------- */

const require = createRequire(import.meta.url);

/**
 * Get the contents of a json fixture synchronously.
 */
export function requireJsonFixture<T = unknown>(filename: string) {
  return require(`./__fixtures__/${filename}`) as T;
}

/**
 * Get the contents of a text fixture synchronously.
 */
export function requireTextFixture(filename: string) {
  return readFileSync(
    new URL(`./__fixtures__/${filename}`, import.meta.url),
  ).toString();
}
