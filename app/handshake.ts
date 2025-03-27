import * as net from "node:net";
import type { Params } from "./main.ts";
import { createArray } from "./input-parser";

export function handshake(host : string, port: number, params: Params): void {
  const client = new net.Socket();

  let step = 0;
  client.connect(port, host, () => {
    console.log(`Connected to master ${host}:${port}`);

    step = 1;
    client.write("*1\r\n$4\r\nPING\r\n");
  });

  client.on("data", (data) => {
    const response = data.toString();
    console.log(`Got response from master in step ${step} response: ${response}`);
    if(step === 1 && response === "+PONG\r\n") {
      const repl2 = createArray(["REPLCONF", "listening-port", `${params.port}`]);
      console.log(`Sending to Master: ${repl2} \n`);
      step = 2;
      client.write(repl2)
      return;
    } else if (step === 2 && response === "+OK\r\n") {
      const repl2 = createArray(["REPLCONF", "capa", "psync2"]);
      console.log(`Sending to Master: ${repl2} \n`);
      step = 3;
      client.write(repl2)
      return;
    } else {
      client.end();
    }
  });
}