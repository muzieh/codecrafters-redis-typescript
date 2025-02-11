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

function createBulkString(value: string | undefined): string {
  if (value === undefined) {
    return `$-1\r\n`;
  }

  const len = value.length;
  return `$${len}\r\n${value}\r\n`;
}

type StoreItem<T> = {
  expired: Date | undefined;
  data: T;
}

type Store<T> = {
  [key: string]: StoreItem<T>;
}


const store: Store<string> = {};

// Uncomment this block to pass the first stage
const server: net.Server = net.createServer((connection: net.Socket) => {
  const sessionId = Math.random().toString(36);

  console.log(`somebody connected`);
  connection.on("data", (data: Uint8Array) => {
    const input = Buffer.from(data).toString("utf-8");
    log(`DATA: ${escapeNewLines(input)}`);

    log(`SESSION: ${sessionId}`);
    const result = inputParser(input);
    const command = result[0].toUpperCase();
    log(`COMMAND: ${command}`);
    if(command === "ECHO") {
      log(`${result[1]}`);
      connection.write(`+${result[1]}\r\n`);
    } else if(command === "PING") {
      connection.write(`+PONG\r\n`)
    } else if(command === "SET") {
      connection.write(`+OK\r\n`)
      const key = result[1];
      const data = result[2];
      let expired: Date | undefined = undefined;
      if(result[3] && result[3] === 'px') {
        expired = new Date(Date.now() + parseInt(result[4], 10));
      }
      store[key] = {
        data: result[2],
        expired,
      };

    } else if (command === "GET") {
      const value = store[result[1]];
      if(value.expired && value.expired > new Date()) {
        connection.write(createBulkString(value.data));
      } else {
        connection.write(createBulkString(undefined));
      }
    } else {
      connection.write(`-ERR unknown command\r\n`);
    }
  })
});

server.listen(6379, "127.0.0.1");

