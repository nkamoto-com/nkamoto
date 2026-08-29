import assert from "node:assert/strict";
import { test } from "node:test";

import { renderQr } from "../src/index.js";

test("QR renderer returns terminal output", async () => {
  const qr = await renderQr("nkamoto test");

  assert.equal(typeof qr, "string");
  assert.ok(qr.length > 0);
  assert.match(qr, /[\u2588\u2580\u2584]/);
});
