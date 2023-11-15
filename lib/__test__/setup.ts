/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { afterAll, afterEach, beforeAll } from "vitest";

// lib
import { mockServer } from "./mock-server.js";

/* -----------------------------------------------------------------------------
 * setup
 * -------------------------------------------------------------------------- */

beforeAll(() => {
  mockServer.listen();
});

afterEach(() => {
  mockServer.resetHandlers();
});

afterAll(() => {
  mockServer.close();
});
