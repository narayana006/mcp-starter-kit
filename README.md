# mcp-starter-kit

> Production-ready templates for building Model Context Protocol (MCP) servers in TypeScript and Python.

**Status:** 🚧 Early stage — design and roadmap published, implementation in progress. Stars, issues and ideas welcome.

## Why

Building an MCP server means re-solving the same boilerplate: transport, auth, tool schemas, tests, packaging.

## Planned features

- [ ] TypeScript and Python templates with example tools, resources and prompts
- [ ] stdio and streamable HTTP transports
- [ ] Auth patterns (API key, OAuth) and secrets handling
- [ ] Test harness that exercises tools without a client
- [ ] Dockerfile and publish-to-registry scripts
- [ ] Checklist for tool naming and descriptions that models use well

## Intended usage

```
npx create-mcp-server my-server --lang ts
```

_The interface above is the target design and may change._

## Roadmap

1. Core implementation of the first feature set
2. Examples and tests
3. CI and first tagged release
4. Docs and integrations

## Contributing

Contributions are welcome. Open an issue to discuss an idea or pick an unchecked item from the feature list.

## License

[MIT](LICENSE)
