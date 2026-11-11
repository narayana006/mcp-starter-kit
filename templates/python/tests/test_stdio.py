"""End-to-end tests: start the server as a subprocess and talk to it over
stdio with the SDK's own client, exactly as a real MCP client would."""

import json
import sys

import pytest
from mcp import Client, StdioServerParameters

pytestmark = pytest.mark.anyio

SERVER = StdioServerParameters(command=sys.executable, args=["-m", "my_mcp_server"])


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    async with Client(SERVER) as connected:
        yield connected


def text_of(result) -> str:
    return "\n".join(block.text for block in result.content if block.type == "text")


async def test_server_identifies_itself(client):
    assert client.server_info.name == "my-mcp-server"
    assert client.server_info.version == "0.1.0"


async def test_lists_both_tools_with_input_schemas(client):
    tools = {tool.name: tool for tool in (await client.list_tools()).tools}
    assert sorted(tools) == ["days_between", "slugify"]
    schema = tools["slugify"].input_schema
    assert schema["required"] == ["text"]
    assert schema["properties"]["max_length"]["minimum"] == 1
    assert "URL slug" in tools["slugify"].description


async def test_slugify_applies_default_max_length(client):
    result = await client.call_tool("slugify", {"text": "Hello, MCP World!"})
    assert not result.is_error
    assert text_of(result) == "hello-mcp-world"


async def test_days_between_returns_structured_content(client):
    result = await client.call_tool("days_between", {"start": "2025-01-01", "end": "2025-01-31"})
    assert result.structured_content == {"days": 30, "weeks": 4, "remaining_days": 2}


async def test_out_of_range_argument_is_rejected(client):
    result = await client.call_tool("slugify", {"text": "ok", "max_length": 0})
    assert result.is_error
    assert "max_length" in text_of(result)


async def test_missing_required_argument_is_rejected(client):
    result = await client.call_tool("days_between", {"start": "2025-01-01"})
    assert result.is_error
    assert "end" in text_of(result)


async def test_wrongly_formatted_date_is_rejected(client):
    result = await client.call_tool("days_between", {"start": "01/02/2025", "end": "2025-03-01"})
    assert result.is_error
    assert "start" in text_of(result)


async def test_impossible_date_returns_readable_tool_error(client):
    result = await client.call_tool("days_between", {"start": "2025-02-30", "end": "2025-03-01"})
    assert result.is_error
    assert "not a real calendar date" in text_of(result)


async def test_reads_server_info_resource(client):
    result = await client.read_resource("info://server")
    info = json.loads(result.contents[0].text)
    assert info["name"] == "my-mcp-server"
    assert info["tools"] == ["slugify", "days_between"]


async def test_renders_plan_release_prompt(client):
    assert [prompt.name for prompt in (await client.list_prompts()).prompts] == ["plan_release"]
    prompt = await client.get_prompt(
        "plan_release", {"name": "Spring cleanup", "target_date": "2025-04-01"}
    )
    text = prompt.messages[0].content.text
    assert '"Spring cleanup"' in text
    assert "2025-04-01" in text
