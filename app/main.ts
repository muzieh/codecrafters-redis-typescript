import * as net from "net";
import { inputParser } from "./input-parser";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
function log(s: string) {
  process.stdout.write(`log: ${s}\n`);
}

function escapeNewLines(input: string): string | undefined {
  return input.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
}

// Uncomment this block to pass the first stage
const server: net.Server = net.createServer((connection: net.Socket) => {
  const sessionId = Math.random().toString(36);
  console.log(`somebody connected`);
  connection.on("data", (data: Uint8Array) => {
    const input = Buffer.from(data).toString("utf-8");
    log(`DATA: ${escapeNewLines(input)}`);

    log(`SESSION: ${sessionId}`);
    const result = inputParser(input);
    const command = result[0];
    if(command === "ECHO") {
      connection.write(`+${result[1]}\r\n`);
    } else if(command === "PING") {
      connection.write(`+PONG\r\n`)
    } else if(command === "SET") {
      connection.write(`+OK\r\n`)
    } else if (command === "GET") {
      connection.write(`+OK\r\n`)
    } else {
      connection.write(`-ERR unknown command\r\n`);
    }
  })
});

server.listen(6379, "127.0.0.1");

