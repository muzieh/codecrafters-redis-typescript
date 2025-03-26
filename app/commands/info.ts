import { createBulkString } from "../input-parser";
import type { Params } from "../main.ts";

export function infoCommand(result: string[], params: Params): string {
  const subcommand = result[1].toUpperCase();
  const role = params && params.replicaof ? "slave" : "master"

  const responseParts = [
    `role:${role}`,
    "connected_slaves:0",
    `master_replid:${params.master_replid}"`,
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