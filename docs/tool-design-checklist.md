# Tool design checklist

A model picks a tool from its name, description and input schema alone. Run through this list for
every tool before you ship it. The example tools in both templates follow it.

## Name

- [ ] `snake_case`, starts with a verb or names the result: `search_orders`, `days_between`.
- [ ] Says what it does without the server name; clients often add their own prefix.
- [ ] No two tools on the server could be confused for each other. If they could, merge them or
      make the difference part of the name.

## Description

- [ ] First sentence states what the tool does and returns.
- [ ] Second sentence states when to use it (and, if needed, when not to).
- [ ] Mentions units, time zones, formats and limits that affect the result.
- [ ] Free of internal jargon the calling model has never seen.

## Input schema

- [ ] Every parameter has a description with an example or format.
- [ ] Constraints are in the schema (min/max, length, pattern, enum), not only in prose, so bad
      calls fail before your code runs.
- [ ] Optional parameters have defaults, and the default is stated in the description.
- [ ] Prefer a few flat, typed parameters over one free-form string or a deep object.

## Results and errors

- [ ] Return only what the caller needs; large payloads cost context. Paginate or summarise.
- [ ] Return structured content with an output schema when the result is data.
- [ ] Problems the caller can fix come back as a tool error with a message that says what to
      change ("start is not a real calendar date: 2025-02-30"), not a stack trace.
- [ ] Unexpected failures do not leak secrets, file paths or connection strings.

## Behaviour

- [ ] Annotations are set honestly: read-only, idempotent, destructive, open-world.
- [ ] Anything that writes or deletes is a separate tool from anything that only reads.
- [ ] Nothing is written to stdout except protocol messages (stdio transport).
- [ ] There is an end-to-end test that calls the tool through a real client, including one
      invalid call.
