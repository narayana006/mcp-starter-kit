/**
 * Builds the MCP server: tools, one resource and one prompt.
 * No transport is chosen here, so the same server can be connected to stdio
 * (see index.ts) or to an in-memory transport in tests.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import {
  ToolInputError,
  daysBetween,
  daysBetweenInput,
  daysBetweenOutput,
  slugify,
  slugifyInput,
} from "./tools.js";

export const SERVER_NAME = "my-mcp-server";
export const SERVER_VERSION = "0.1.0";

/**
 * Runs a tool body and turns expected input problems into an error result the
 * calling model can read and correct. Unexpected errors are rethrown so the
 * SDK reports them.
 */
function guarded(run: () => CallToolResult): CallToolResult {
  try {
    return run();
  } catch (error) {
    if (error instanceof ToolInputError) {
      return { isError: true, content: [{ type: "text", text: error.message }] };
    }
    throw error;
  }
}

export function createServer(): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });

  server.registerTool(
    "slugify",
    {
      title: "Slugify text",
      description:
        "Convert a title or phrase into a lowercase, hyphen-separated URL slug. " +
        "Use it when you need a safe identifier for a URL path or file name.",
      inputSchema: slugifyInput,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    ({ text, max_length }) =>
      guarded(() => ({ content: [{ type: "text", text: slugify(text, max_length) }] })),
  );

  server.registerTool(
    "days_between",
    {
      title: "Days between two dates",
      description:
        "Count the whole days from a start date to an end date (both YYYY-MM-DD, UTC). " +
        "The result is negative when the end date is earlier than the start date.",
      inputSchema: daysBetweenInput,
      outputSchema: daysBetweenOutput,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    ({ start, end }) =>
      guarded(() => {
        const result = daysBetween(start, end);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
          structuredContent: result,
        };
      }),
  );

  server.registerResource(
    "server-info",
    "info://server",
    {
      title: "Server information",
      description: "Name, version and tool list of this server",
      mimeType: "application/json",
    },
    (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify({
            name: SERVER_NAME,
            version: SERVER_VERSION,
            tools: ["slugify", "days_between"],
          }),
        },
      ],
    }),
  );

  server.registerPrompt(
    "plan_release",
    {
      title: "Plan a release",
      description: "Ask for a release plan that uses the days_between and slugify tools",
      argsSchema: {
        name: z.string().min(1).describe("Release name, for example 'Spring cleanup'"),
        target_date: z.string().describe("Target release date, YYYY-MM-DD"),
      },
    },
    ({ name, target_date }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text:
              `Plan the release "${name}" targeted for ${target_date}. ` +
              "Use days_between to work out how much time is left from today, " +
              "and slugify to propose a branch name for it.",
          },
        },
      ],
    }),
  );

  return server;
}
