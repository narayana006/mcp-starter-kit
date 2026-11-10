# mcp-starter-kit

Production-ready templates for building Model Context Protocol (MCP) servers in TypeScript and Python.

> **Project status: planning. There is no working code in this repository yet.**
> This README describes what the project will do. Nothing below can be installed or run today.
> Features are ticked off in the checklist as they are built.

## What it is

A project templates and a generator.

**The problem it solves:** Building an MCP server means re-solving the same boilerplate: transport, auth, tool schemas, tests, packaging.

## Who it is for

Developers who want to expose their own API, database or tool to AI agents through the Model Context Protocol (MCP).

## How it will work

1. You generate a new server project from a TypeScript or Python template.
2. You replace the example tools with your own; transport, auth, tests and packaging are already wired up.
3. You run the included tests, build the Docker image and publish the server.

## Planned features

Unticked items are not built yet.

- [ ] TypeScript and Python templates with example tools, resources and prompts
- [ ] stdio and streamable HTTP transports
- [ ] Auth patterns (API key, OAuth) and secrets handling
- [ ] Test harness that exercises tools without a client
- [ ] Dockerfile and publish-to-registry scripts
- [ ] Checklist for tool naming and descriptions that models use well

## Planned usage

This is the intended interface, shown so you can judge the design. **It does not work yet**, and names may change before the first release.

```bash
npx degit narayana006/mcp-starter-kit/templates/typescript my-server
```

## Contributing

Feedback on the design is the most useful contribution right now. Open an issue to suggest a feature, question an approach or describe your use case. Code contributions are welcome once the first version lands.

## License

[MIT](LICENSE)
