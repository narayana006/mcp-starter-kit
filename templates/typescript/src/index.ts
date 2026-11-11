#!/usr/bin/env node
/**
 * stdio entry point. stdout carries protocol messages only, so all logging
 * must go to stderr (console.error), never console.log.
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SERVER_NAME, SERVER_VERSION, createServer } from "./server.js";

const server = createServer();
await server.connect(new StdioServerTransport());
console.error(`${SERVER_NAME} ${SERVER_VERSION} listening on stdio`);
