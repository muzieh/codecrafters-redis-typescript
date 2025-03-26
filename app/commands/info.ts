import { createBulkString } from "../input-parser";

export function infoCommand(result: string[]): string {
  const subcommand = result[1].toUpperCase();
  const responseParts = [
    "role:master",
    "connected_slaves:0",
    "master_replid:8371b4fb1155b71f4a04d3e1bc3e18c4a990aeeb",
    "master_repl_offset:0",
    "second_repl_offset:-1",
    "repl_backlog_active:0",
    "repl_backlog_size:1048576",
    "repl_backlog_first_byte_offset:0",
    "repl_backlog_histlen:",
  ];

  if(subcommand === "REPLICATION") {
    return createBulkString(responseParts.join("\r\n"));
  }
  return `-ERR unknown subcommand\r\n`;
}