// Minimal MCP client: starts the built server over stdio, lists its tools and
// calls each one. Run `npm run build` first, then `node examples/client.mjs`.
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const serverEntry = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const client = new Client({ name: "example-client", version: "0.1.0" });
await client.connect(
  new StdioClientTransport({ command: process.execPath, args: [serverEntry], stderr: "ignore" }),
);

const { tools } = await client.listTools();
console.log("tools:", tools.map((tool) => tool.name).join(", "));

const slug = await client.callTool({ name: "slugify", arguments: { text: "Hello, MCP World!" } });
console.log("slugify:", slug.content[0].text);

const days = await client.callTool({
  name: "days_between",
  arguments: { start: "2025-01-01", end: "2025-01-31" },
});
console.log("days_between:", JSON.stringify(days.structuredContent));

const bad = await client.callTool({ name: "slugify", arguments: { text: "ok", max_length: 0 } });
console.log("invalid input:", bad.isError ? bad.content[0].text : "unexpectedly accepted");

await client.close();
