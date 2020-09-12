# socket-zen

A Nodejs + Express + WS framework for websockets.

Just connect to the server,
send data in an object that looks like:

example:

```ts
import express from "express";
import SocketServer from "./SocketServer";

const server = express().listen(7000);

const socketServer = new SocketServer()
  .on("", (connection, request) => {
    connection.send(200, "Hit the blank end point");
  })
  .on("/", (connection, request) => {
    connection.send(200, "Hit the / endpoint");
  })
  .catch((connection, request) => {
    connection.send(404, "Url not found");
  })
  .initSocket(server);
```
