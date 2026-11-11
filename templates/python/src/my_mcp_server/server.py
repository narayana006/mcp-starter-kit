"""MCP server definition: tools, one resource and one prompt.

Input validation is declared in the type annotations. The SDK turns them into
the JSON Schema that clients see and rejects calls that do not match before
the function runs.

stdout carries protocol messages only when running over stdio, so log to
stderr (the ``logging`` module does this by default), never ``print``.
"""

from __future__ import annotations

import json
from typing import Annotated

from mcp.server.mcpserver import MCPServer
from mcp.server.mcpserver.exceptions import ToolError
from mcp.types import ToolAnnotations
from pydantic import Field

from my_mcp_server import __version__, tools

SERVER_NAME = "my-mcp-server"

server = MCPServer(SERVER_NAME, version=__version__)

READ_ONLY = ToolAnnotations(read_only_hint=True, idempotent_hint=True, open_world_hint=False)

IsoDate = Annotated[
    str,
    Field(pattern=r"^\d{4}-\d{2}-\d{2}$", description="A date in YYYY-MM-DD format"),
]


@server.tool(
    title="Slugify text",
    description=(
        "Convert a title or phrase into a lowercase, hyphen-separated URL slug. "
        "Use it when you need a safe identifier for a URL path or file name."
    ),
    annotations=READ_ONLY,
)
def slugify(
    text: Annotated[
        str,
        Field(min_length=1, max_length=500, description="Text to turn into a URL slug, 1 to 500 characters"),
    ],
    max_length: Annotated[
        int, Field(ge=1, le=200, description="Maximum length of the slug (default 60)")
    ] = 60,
) -> str:
    try:
        return tools.slugify(text, max_length)
    except ValueError as error:
        raise ToolError(str(error)) from error


@server.tool(
    title="Days between two dates",
    description=(
        "Count the whole days from a start date to an end date (both YYYY-MM-DD). "
        "The result is negative when the end date is earlier than the start date."
    ),
    annotations=READ_ONLY,
)
def days_between(start: IsoDate, end: IsoDate) -> tools.DaysBetween:
    try:
        return tools.days_between(start, end)
    except ValueError as error:
        raise ToolError(str(error)) from error


@server.resource(
    "info://server",
    name="server-info",
    title="Server information",
    description="Name, version and tool list of this server",
    mime_type="application/json",
)
def server_info() -> str:
    return json.dumps(
        {"name": SERVER_NAME, "version": __version__, "tools": ["slugify", "days_between"]}
    )


@server.prompt(title="Plan a release")
def plan_release(name: str, target_date: str) -> str:
    """Ask for a release plan that uses the days_between and slugify tools."""
    return (
        f'Plan the release "{name}" targeted for {target_date}. '
        "Use days_between to work out how much time is left from today, "
        "and slugify to propose a branch name for it."
    )


def main() -> None:
    """Console-script entry point: serve over stdio."""
    server.run("stdio")


if __name__ == "__main__":
    main()
