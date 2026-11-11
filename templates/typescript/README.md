# my-mcp-server

A Model Context Protocol (MCP) server in TypeScript, generated from
[mcp-starter-kit](https://github.com/narayana006/mcp-starter-kit). It serves two example tools,
one resource and one prompt over stdio.

## Run it

Requires Node.js 22.12 or newer.

```bash
npm install
npm test                    # type-check, build, unit tests, stdio end-to-end tests
node examples/client.mjs    # start the server and call its tools from a small client
```

## Layout

| Path | What lives there |
| --- | --- |
| `src/tools.ts` | Tool logic and zod input schemas. No MCP imports, easy to unit-test. |
| `src/server.ts` | `createServer()`: registers tools, the resource and the prompt. |
| `src/index.ts` | stdio entry point (`dist/index.js` after build). |
| `test/tools.test.ts` | Unit tests for the tool logic. |
| `test/stdio.test.ts` | Starts `dist/index.js` and drives it with the SDK client over stdio. |
| `examples/client.mjs` | A 30-line client you can copy when scripting against the server. |

## Add your own tool

1. In `src/tools.ts`, export a zod shape for the input and a plain function that does the work.
   Throw `ToolInputError` for problems the caller can fix.
2. In `src/server.ts`, call `server.registerTool(name, { description, inputSchema }, handler)`
   and wrap the body in `guarded(...)`.
3. Add a case to `test/stdio.test.ts` that calls the tool through the client.

The SDK validates every call against `inputSchema` before your handler runs, and the same schema
is published to clients as JSON Schema, so constraints and `.describe()` texts matter.

## Connect a client

Any MCP-compatible client that launches stdio servers needs a command and its arguments. Most use
a JSON entry shaped like this (the file location and top-level key depend on the client):

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/my-server/dist/index.js"]
    }
  }
}
```

stdout is reserved for protocol messages. Log with `console.error`, never `console.log`.
