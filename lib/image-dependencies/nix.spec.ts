/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { describe, expect, test } from "vitest";
import { http, HttpResponse } from "msw";

// lib
import { requireJsonFixture } from "../__test__/require-fixture.js";
import { mockServer } from "../__test__/mock-server.js";
import { type GithubTag } from "../data-sources/github.js";
import { getLatestNixVersion } from "./nix.js";

/* -----------------------------------------------------------------------------
 * constants
 * -------------------------------------------------------------------------- */

const nixTags = requireJsonFixture<GithubTag[]>("/github-nix-tags.json");

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe("getLatestNixVersion", () => {
  test("Should get latest version of nix", async () => {
    mockServer.use(
      http.get("https://api.github.com/repos/NixOS/nix/tags", () =>
        HttpResponse.json(nixTags),
      ),
    );

    expect(await getLatestNixVersion()).toEqual("2.24.6");
  });
});
