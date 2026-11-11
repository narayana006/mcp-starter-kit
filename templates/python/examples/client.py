"""Minimal MCP client: starts the server over stdio, lists its tools and calls
each one. Run `pip install -e .` first, then `python examples/client.py`."""

import asyncio
import json
import sys

from mcp import Client, StdioServerParameters


async def main() -> None:
    server = StdioServerParameters(command=sys.executable, args=["-m", "my_mcp_server"])
    async with Client(server) as client:
        tools = (await client.list_tools()).tools
        print("tools:", ", ".join(tool.name for tool in tools))

        slug = await client.call_tool("slugify", {"text": "Hello, MCP World!"})
        print("slugify:", slug.content[0].text)

        days = await client.call_tool("days_between", {"start": "2025-01-01", "end": "2025-01-31"})
        print("days_between:", json.dumps(days.structured_content))

        bad = await client.call_tool("slugify", {"text": "ok", "max_length": 0})
        message = bad.content[0].text.splitlines()
        print("invalid input:", " | ".join(line.strip() for line in message[:3]) if bad.is_error else "accepted")


if __name__ == "__main__":
    asyncio.run(main())
