#!/usr/bin/env node
import { addMemory, ensureStore, loadIndex, renderMemory, searchMemory, syncAntigravity, syncOpencode } from "./index.js";

const [command, ...args] = process.argv.slice(2); const directory = process.cwd();
function usage(): never { console.error("Usage: memory-bridge <add|search|list|sync|status> [...]"); process.exit(2); }
try {
  if (command === "add") { const positional = args.filter((arg) => !arg.startsWith("--")); const tagIndex = args.indexOf("--tag"); const text = positional.pop(); if (!text) usage(); const tags = tagIndex >= 0 ? args.slice(tagIndex + 1).filter((tag) => !tag.startsWith("--")) : []; const entry = addMemory(directory, text, tags); console.log(`Added ${entry.id}`); }
  else if (command === "search") { const query = args.filter((arg) => !arg.startsWith("--")).join(" "); if (!query) usage(); for (const entry of searchMemory(directory, query)) console.log(`${entry.id} | ${entry.tags.join(", ") || "untagged"} | ${entry.summary}`); }
  else if (command === "list") { for (const entry of loadIndex(directory).entries) console.log(`${entry.id} | ${entry.tags.join(", ") || "untagged"} | ${entry.summary}`); }
  else if (command === "sync" && args[0] === "--to" && args[1] === "antigravity") console.log(`Synced ${syncAntigravity(directory)}`);
  else if (command === "sync" && args[0] === "--to" && args[1] === "opencode") console.log(`Synced ${syncOpencode(directory)}`);
  else if (command === "status") console.log(renderMemory(directory));
  else usage();
} catch (error) { console.error(`memory-bridge: ${error instanceof Error ? error.message : String(error)}`); process.exit(1); }
