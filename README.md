# socket-zen

A Nodejs + WS framework for websockets.

Just connect to the server under the ws://exampleurl:
and send data from the front end like:

```js
const ws = new Websocket("ws://exampleurl");

ws.onopen = () => {
  ws.send(
    JSON.stringify({
      url: "/ping",
      data: "", // any valid json,
      // any other attributes can be added
    })
  );
};
```

Example With base "http" package.

```ts
import http from "http";
import Zenjs from "socket-zenjs";

const server = http.createServer((req, res) => {}).listen(8080);

const socketServer = new Zenjs()
  .onConnection((connection) => {
    console.info("connection made! " + connection.uuid);
  })
  .on("/ping", (connection, req) => {
    connection.send(200, "pong");
  })
  .catch((connection, req) => {
    connection.send(404, `Url of "${req.url}" not found`);
  })
  .initSocket(server);
```

Example with the "express" package

```ts
import express from "express";
import Zenjs from "socket-zenjs";
import apiRouter from "./routers/apiRouter";

const app = express();

const server = app.listen(8080);

const socketServer = new Zenjs()
  // a use will be run for every socket message recieved by the server
  .use((connection, req, stop) => {
    if (req.authentication !== "") {
      connection.send(400, "Missing authentication for authenticated route");
      connection.close();
      stop();
    }
  })
  // will be used to check for a ?help query paramater
  .use('', (connection, req, stop) => {
    if (req.query.help !== undefined) {
      connection.send(200, `
        Routes:
          *: requires a 'authentication' field on the message object
            ex:
              {authentication
                url: string:
                data: any;
                authentication: string;
              }

          /api:
            /users: returns a list of users
      `);
    }
  })
  .addRouter(apiRouter);
  .initSocket(server);

... // In "./routers/apiRouter"
import Zenjs from "socket-zenjs";
const users = ['user1', 'user2'];

const apiRouter = ZenJs.Router('/api'); // Routes take one paramater, the base url

apiRouter
  .use((connection, req) => console.info('api router hit'));
  .on('/users', (connection, req) => connection.send(200, users))
  //.useRouter(any other router, which will use the base '/api' that this router has as well)
```
