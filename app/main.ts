import * as net from "net";
import { inputParser } from "./input-parser";
import {
  getCommand,
  pingCommand,
  setCommand,
  echoCommand,
  configGetCommand ,
} from "./commands";
import * as path from "node:path";
import * as fs from "node:fs";
import { readFromFile } from "./store";
import { keysCommand } from "./commands/keys.ts";

function log(s: string) {
  process.stdout.write(`log: ${s}\n`);
}

export type Params = {
  [key: string]: string;
}


function getParams(argv: string[]): Params  {
  if (!argv || argv.length == 0) {
    return {};
  }

  return argv.reduce((p: Params, c, i, arr) => {
    if (c.startsWith("--")) {
      const key = c.slice(2);
      const value = arr[i + 1];
      if (value && !value.startsWith("--")) {
        p[key] = value;
      }
    }
    return p;
  }, {} as Params);

}

const params = getParams(process.argv);
console.log('Params ' + params)

function escapeNewLines(input: string): string | undefined {
  return input.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
}

type StoreItem<T> = {
  expires: Date | undefined;
  data: T;
}

export type Store<T> = {
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
    const inputTokens = inputParser(input);
    const command = inputTokens[0].toUpperCase();
    log(`COMMAND: ${command}`);

    if(command === "ECHO") {
      connection.write(echoCommand(inputTokens));
    } else if(command === "PING") {
      connection.write(pingCommand())
    } else if(command === "SET") {
      connection.write(setCommand(inputTokens, store));
    } else if (command === "GET") {
      connection.write(getCommand(inputTokens, store));
    } else if(command === "CONFIG") {
      connection.write(configGetCommand(inputTokens, params))
    } else if(command === "KEYS") {
      connection.write(keysCommand(inputTokens, store));
    }
    else {
      connection.write(`-ERR unknown command\r\n`);
    }
  })
});

async function start() {
  console.log('..starting');
  if(params.dir && params.dbfilename) {
    const dbFilePath = path.join(params.dir, params.dbfilename);
    console.log(`...reading db from: ${dbFilePath}`);
    await readFromFile(dbFilePath, store);
  }
  server.listen(6379, "127.0.0.1");
}


await start();


