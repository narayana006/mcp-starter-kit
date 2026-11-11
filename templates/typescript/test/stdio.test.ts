/**
 * End-to-end tests: start the built server as a child process and talk to it
 * over stdio with the SDK's own client, exactly as a real MCP client would.
 * `npm test` builds first, so dist/index.js is always current.
 */
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const serverEntry = fileURLToPath(new URL("../dist/index.js", import.meta.url));

function textOf(result: Record<string, unknown>): string {
  const blocks = (result.content ?? []) as Array<{ type: string; text?: string }>;
  return blocks.map((block) => block.text ?? "").join("\n");
}

describe("server over stdio", () => {
  const client = new Client({ name: "test-client", version: "0.0.0" });

  beforeAll(async () => {
    await client.connect(
      new StdioClientTransport({ command: process.execPath, args: [serverEntry], stderr: "ignore" }),
    );
  });

  afterAll(async () => {
    await client.close();
  });

  it("identifies itself during initialization", () => {
    expect(client.getServerVersion()).toMatchObject({ name: "my-mcp-server", version: "0.1.0" });
  });

  it("lists both tools with JSON Schema for their inputs", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual(["days_between", "slugify"]);
    const slugifyTool = tools.find((tool) => tool.name === "slugify");
    expect(slugifyTool?.inputSchema.required).toEqual(["text"]);
    expect(slugifyTool?.description).toMatch(/URL slug/);
  });

  it("calls slugify and applies the default max_length", async () => {
    const result = await client.callTool({ name: "slugify", arguments: { text: "Hello, MCP World!" } });
    expect(result.isError).toBeFalsy();
    expect(textOf(result)).toBe("hello-mcp-world");
  });

  it("returns structured content from days_between", async () => {
    const result = await client.callTool({
      name: "days_between",
      arguments: { start: "2025-01-01", end: "2025-01-31" },
    });
    expect(result.structuredContent).toEqual({ days: 30, weeks: 4, remaining_days: 2 });
  });

  it("rejects arguments that fail schema validation", async () => {
    const outcome = await client
      .callTool({ name: "slugify", arguments: { text: "ok", max_length: 0 } })
      .then(
        (result) => ({ failed: result.isError === true, message: textOf(result) }),
        (error: Error) => ({ failed: true, message: error.message }),
      );
    expect(outcome.failed).toBe(true);
    expect(outcome.message).toMatch(/max_length/);
  });

  it("reports a wrongly formatted date as a validation failure", async () => {
    const outcome = await client
      .callTool({ name: "days_between", arguments: { start: "01/02/2025", end: "2025-03-01" } })
      .then(
        (result) => ({ failed: result.isError === true, message: textOf(result) }),
        (error: Error) => ({ failed: true, message: error.message }),
      );
    expect(outcome.failed).toBe(true);
    expect(outcome.message).toMatch(/YYYY-MM-DD/);
  });

  it("returns a readable tool error for input the schema cannot catch", async () => {
    const result = await client.callTool({
      name: "days_between",
      arguments: { start: "2025-02-30", end: "2025-03-01" },
    });
    expect(result.isError).toBe(true);
    expect(textOf(result)).toMatch(/not a real calendar date/);
  });

  it("serves the server-info resource", async () => {
    const { contents } = await client.readResource({ uri: "info://server" });
    const first = contents[0] as { text: string };
    expect(JSON.parse(first.text)).toMatchObject({ name: "my-mcp-server", tools: ["slugify", "days_between"] });
  });

  it("renders the plan_release prompt with its arguments", async () => {
    const { prompts } = await client.listPrompts();
    expect(prompts.map((prompt) => prompt.name)).toEqual(["plan_release"]);
    const prompt = await client.getPrompt({
      name: "plan_release",
      arguments: { name: "Spring cleanup", target_date: "2025-04-01" },
    });
    const content = prompt.messages[0]?.content as { text: string };
    expect(content.text).toContain('"Spring cleanup"');
    expect(content.text).toContain("2025-04-01");
  });
});
