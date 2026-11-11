# my-mcp-server

A Model Context Protocol (MCP) server in Python, generated from
[mcp-starter-kit](https://github.com/narayana006/mcp-starter-kit). It serves two example tools,
one resource and one prompt over stdio.

## Run it

Requires Python 3.10 or newer.

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
pytest                        # unit tests plus stdio end-to-end tests
python examples/client.py     # start the server and call its tools from a small client
```

`pip install` also puts a `my-mcp-server` command on your PATH that serves over stdio.

## Layout

| Path | What lives there |
| --- | --- |
| `src/my_mcp_server/tools.py` | Tool logic. No MCP imports, easy to unit-test. |
| `src/my_mcp_server/server.py` | The server: tools, the resource, the prompt and `main()`. |
| `tests/test_tools.py` | Unit tests for the tool logic. |
| `tests/test_stdio.py` | Starts the server as a subprocess and drives it with the SDK client. |
| `examples/client.py` | A 30-line client you can copy when scripting against the server. |

## Add your own tool

1. In `tools.py`, write a plain function. Raise `ValueError` for problems the caller can fix.
2. In `server.py`, add a function decorated with `@server.tool(...)`. Declare constraints with
   `Annotated[..., Field(...)]`; convert `ValueError` into `ToolError` so the message reaches
   the caller.
3. Add a case to `tests/test_stdio.py` that calls the tool through the client.

The SDK builds the JSON Schema that clients see from the type annotations and rejects calls that
do not match before your function runs.

## Connect a client

Any MCP-compatible client that launches stdio servers needs a command and its arguments. Most use
a JSON entry shaped like this (the file location and top-level key depend on the client):

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "/absolute/path/to/my-server/.venv/bin/my-mcp-server"
    }
  }
}
```

stdout is reserved for protocol messages. Use the `logging` module (it writes to stderr), never
`print`. The server logs rejected calls to stderr, which is why the example client shows a
`Tool 'slugify' rejected arguments` line.
