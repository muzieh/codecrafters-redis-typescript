import * as net from "net";

const server =net.createServer((socket) => {
  console.log('New connection')
  socket.on('data', (data) => {
    console.log('Received: ' + data.toString());
    socket.write('Hello, client!');
  })
})

server.listen(8085, () => {
  console.log("Server running at http://127.0.0.1:8080/");
})


const client = new net.Socket();
client.connect(8085, '127.0.0.1', () => {
  console.log('Connected to server');
  client.write('Hello, server!');
})


client.on('data', (data) => {
  console.log('Client Received: ' + data.toString());
  client.end();
})

setTimeout(() => {
  server.close();
}, 50000);
