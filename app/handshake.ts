import * as net from "node:net";

export function handshake(host : string, port: number) {
  const client = new net.Socket();

  client.connect(port, host, () => {
    console.log(`Connected to master ${host}:${port}`);

    client.write("*1\r\n$4\r\nPING\r\n");
  });

  client.on("data", (data) => {
    console.log(`Received from master: ${data.toString()}`);
    client.end();
  });
}