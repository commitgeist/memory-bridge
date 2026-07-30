import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { addMemory, loadIndex, searchMemory, syncAntigravity } from "../dist/index.js";

test("creates readable versioned store and searches by text or tag", () => {
  const directory = mkdtempSync(join(tmpdir(), "memory-bridge-"));
  const entry = addMemory(directory, "Service has no NAT and uses public IP.", ["infra", "network"]);
  assert.equal(loadIndex(directory).entries[0].id, entry.id);
  assert.equal(searchMemory(directory, "NAT").length, 1);
  assert.equal(searchMemory(directory, "infra network").length, 1);
});

test("rejects duplicate memory rather than overwriting silently", () => {
  const directory = mkdtempSync(join(tmpdir(), "memory-bridge-"));
  addMemory(directory, "Use us-east-1 for this client.", ["aws"]);
  assert.throws(() => addMemory(directory, "Use us-east-1 for this client.", ["aws"]), /Duplicate/);
});

test("projects neutral memory into Antigravity input", () => {
  const directory = mkdtempSync(join(tmpdir(), "memory-bridge-"));
  addMemory(directory, "Terraform providers need pinned versions.", ["terraform"]);
  const output = syncAntigravity(directory);
  assert.equal(output, ".gemini/memory-bridge.md");
  assert.match(readFileSync(join(directory, output), "utf8"), /Terraform providers need pinned versions/);
});
