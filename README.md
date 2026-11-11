# mcp-starter-kit

Tested starting points for building Model Context Protocol (MCP) servers in TypeScript and Python.

**Status: first working version.** Both templates run today over stdio with two example tools, a
resource, a prompt, schema-based input validation and end-to-end tests. Streamable HTTP, auth
patterns, Docker packaging and a generator CLI from the original plan are not built yet; see the
[checklist](#feature-checklist).

## Why

Every new MCP server starts with the same chores: wire up a transport, declare tool schemas, work
out how validation errors reach the caller, and find a way to test the thing without clicking
around in a chat client. These templates have that done, using the official SDKs
([`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk) and
[`mcp`](https://pypi.org/project/mcp/)), so you start by replacing two example tools with your own.

## Quick start: TypeScript

Requires Node.js 22.12 or newer.

```bash
npx degit narayana006/mcp-starter-kit/templates/typescript my-server
cd my-server
npm install
npm test
node examples/client.mjs
```

`npm test` type-checks, builds and runs 15 tests. The example client starts the built server as a
child process, lists its tools and calls them:

```text
tools: slugify, days_between
slugify: hello-mcp-world
days_between: {"days":30,"weeks":4,"remaining_days":2}
invalid input: MCP error -32602: Input validation error: Invalid arguments for tool slugify: Too small: expected number to be >=1 at max_length
```

## Quick start: Python

Requires Python 3.10 or newer.

```bash
npx degit narayana006/mcp-starter-kit/templates/python my-server
cd my-server
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
pytest
python examples/client.py
```

`pytest` runs 16 tests. The example client prints the following (the first line is the server's
own log on stderr):

```text
Tool 'slugify' rejected arguments: ['max_length']
tools: slugify, days_between
slugify: hello-mcp-world
days_between: {"days": 30, "weeks": 4, "remaining_days": 2}
invalid input: Error executing tool slugify: 1 validation error for slugifyArguments | max_length | Input should be greater than or equal to 1 [type=greater_than_equal, input_value=0, input_type=int]
```

No Node.js? Clone the repository and copy `templates/python` instead of using `degit`.

## What each template contains

| | TypeScript | Python |
| --- | --- | --- |
| SDK | `@modelcontextprotocol/sdk` 1.x, `zod` 4 | `mcp` 2.x (`MCPServer`) |
| Tools | `slugify`, `days_between` | `slugify`, `days_between` |
| Resource | `info://server` | `info://server` |
| Prompt | `plan_release` | `plan_release` |
| Validation | zod shapes passed as `inputSchema` | `Annotated[..., Field(...)]` parameters |
| Unit tests | `test/tools.test.ts` (vitest) | `tests/test_tools.py` (pytest) |
| End-to-end tests | `test/stdio.test.ts` | `tests/test_stdio.py` |
| Example client | `examples/client.mjs` | `examples/client.py` |

The two templates behave the same on purpose, so you can compare the SDKs side by side.

### Input validation, two layers

1. **Schema.** Types, ranges, lengths and patterns are declared once and published to clients as
   JSON Schema. The SDK rejects a call that does not match before your code runs. Example:
   `slugify` with `max_length: 0`.
2. **Tool logic.** Checks a schema cannot express raise a dedicated error (`ToolInputError` in
   TypeScript, `ToolError` in Python) and come back as a tool result with `isError` set and a
   message the calling model can act on. Example: `days_between` with `start: "2025-02-30"`
   returns `start is not a real calendar date: 2025-02-30`.

### Tests that use a real client

The end-to-end tests do not call handler functions directly. They start the server as a
subprocess and talk to it over stdio with the client class from the same official SDK: initialize,
list tools, call tools with valid and invalid arguments, read the resource, render the prompt.
If the server writes stray output to stdout or registers a broken schema, these tests fail.

## Connecting a client

Any MCP-compatible client that can launch a stdio server needs only the command to run:
`node /absolute/path/to/my-server/dist/index.js` for TypeScript, or the `my-mcp-server` script
from your virtual environment for Python. Each template's README shows the JSON entry most
clients use.

## Writing tools that models use well

[docs/tool-design-checklist.md](docs/tool-design-checklist.md) is a short checklist for names,
descriptions, schemas, errors and annotations. The example tools follow it.

## Feature checklist

- [x] TypeScript and Python templates with example tools, a resource and a prompt
- [x] stdio transport
- [x] Schema-based input validation with readable tool errors
- [x] Tests that drive the server over stdio with the official SDK client, plus CI for both templates
- [x] Checklist for tool naming and descriptions that models use well
- [ ] Streamable HTTP transport
- [ ] Auth patterns (API key, OAuth) and secrets handling
- [ ] Dockerfile and publish-to-registry scripts
- [ ] Generator CLI that renames the project for you

## Limitations

- stdio only. Nothing here listens on a network port, and there is no authentication.
- The server name `my-mcp-server` is hard-coded in a few places (`package.json` or
  `pyproject.toml`, the server module, the tests). Rename it by search and replace.
- Dependency ranges follow the SDK versions the templates were tested with (`mcp` 2.x,
  `@modelcontextprotocol/sdk` 1.x). A new major version of either SDK may need changes.
- The TypeScript end-to-end tests need a build first; `npm test` does that for you, running
  `npx vitest` on its own does not.
- The example tools are deliberately trivial. They show the wiring, not a real integration.

## Contributing

Issues and pull requests are welcome, especially for the unticked items above. Keep the two
templates equivalent: a change to one should come with the matching change to the other, and CI
(`.github/workflows/ci.yml`) must pass for both.

## Author

Built and maintained by [Narayana Vemburaj](https://github.com/narayana006).

## License

[MIT](LICENSE)
