[![Version npm](https://img.shields.io/npm/v/wsreq.svg?logo=npm)](https://www.npmjs.com/package/wsreq) ![NPM](https://img.shields.io/npm/l/wsreq) [![test workflow](https://github.com/Aku-mi/wsreq/actions/workflows/test.yml/badge.svg)](https://github.com/Akuqt/wsreq/actions/workflows/test.yml) [![build workflow](https://github.com/Aku-mi/wsreq/actions/workflows/build.yml/badge.svg)](https://github.com/Akuqt/wsreq/actions/workflows/build.yml) [![Coverage Status](https://coveralls.io/repos/github/Aku-mi/wsreq/badge.svg)](https://coveralls.io/github/Aku-mi/wsreq)

# WsReq

Socket.io endpoints testing made easy.

# About

The motivation with this module is to provide a high-level abstraction for testing Websocket endpoints.

# Getting Started

Install WsReq as a development dependency:

```shell
npm i -D wsreq
```

or

```shell
yarn add -D wsreq
```

Once you installed, it can now be referenced by simply calling `require('wsreq')` or using import statements.

When you call the wsrequest function it returns an array with all the websocket connections requested in the options.

# Example:

You may pass a reference of the `http.Server` or an URI to the wsrequest function.

If you pass a `http.Server` It will bound the server to a ephemeral port so you don't need to keep track of ports.

WsReq works with any test framework, here are some examples with jest:

- Connection status.

```js
import { wsrequest } from "wsreq";
import app from "../server/path";

test("should be able to connect.", async () => {
  const [conn] = await wsrequest(app, { config: { path: "/ws/path" } });
  expect(conn.connection.connected).toEqual(true);
  expect(conn.connection.id).toBeDefined();
  conn.close();
});
```

- Response from emit event in the server.

```js
test("should respond with msg.", async () => {
  const [conn] = await wsrequest(app, { config: { path } });
  const res = await conn.emit("ping", data).on("pong");
  expect(res).toEqual(data);
  conn.close();
});
```

- Response from http server emit event.

```js
test("should respond with msg (using http). ", async () => {
  // method: "get" | "post" | "put" | "delete";
  const [conn] = await wsrequest(app, { config: { path } });
  const { ws: ws_response, http: http_response } = await conn.onWithHttp(
    "ws-event",
    {
      url: "/endpoint/url",
      method: "post",
      body: { ...someData },
      headers: { ...someHeaders },
    }
  );
  expect(ws_response).toEquals({ ...compareData1 });
  expect(http_response).toEquals({ ...compareData2 });
  conn.close();
});
```

- Response from on message event.

```js
test("should respond with msg. (SEND)", async () => {
  const [conn] = await wsrequest(app, { config: { path } });
  const r = await conn.send(data);
  expect(r).toEqual(someData);
  conn.close();
});
```

- Using multiple requests.

```js
test("should respond with msg. (MULTIPLE)", async () => {
  const [conn] = await wsrequest(app, { config: { path: "/ws/path" } });
  const r = await conn.multiple(async ({ http, ws }) => {
    const hget = await http.get("/get/");
    const hpost = await http.post("/post/", {
      body: { ...data },
    });
    const hdelete = await http.delete("/delete/", {
      body: { ...data },
    });
    const hput = await http.put("/put/", {
      body: { ...data },
    });
    const wr = await ws.emit("ping", data).on("pong");
    return {
      hget,
      hpost,
      hdelete,
      hput,
      wr,
    };
  });
  expect(r.wr).toEqual(someData);
  expect(r.hget).toEqual(someData);
  expect(r.hpost).toEqual(someData);
  expect(r.hdelete).toEqual(someData);
  expect(r.hput).toEqual(someData);
  conn.close();
});
```

- Using multiple clients.

```js
test("should respond with msg.", async () => {
  const [conn1, conn2] = await wsrequest(app, { clients: 2, config: { path } });
  const res1 = await conn1.emit("ping", data).on("pong");
  const res2 = await conn2.emit("ping", data).on("pong");
  expect(res1).toEqual(data);
  expect(res2).toEqual(data);
  conn2.close();
  conn2.close();
});
```

- Invalid http server endpoint url.

```js
test("should fail with status code 404.", async () => {
  // method: "get" | "post" | "put" | "delete";
  const [conn] = await wsrequest(app, { config: { path } });
  const res = await conn
    .onWithHttp("ws-event", {
      url: "/invalid/endpoint/url",
      method: "get",
      headers: { ...someHeaders },
    })
    .catch((e: Error) => {
      return {
        msg: e.message,
      };
    });
  expect(res).toEquals({ msg: "Request failed with status code 404" });
  conn.close();
});
```

- Invalid websocket event name.

```js
test("should fail with invalid ws event.", async () => {
  const [conn] = await wsrequest(app, { config: { path } });
  conn.emit("ping", data);
  const res = await conn.on("no-pong").catch((e: Error) => {
    return {
      msg: e.message,
    };
  });
  expect(res).toEquals({ msg: "Invalid WS event." });
  con.close();
});
```

If you wanna test a remote server, you should use the remote function instead of local and pass the `uri` as a parameter.

- Remote connection status.

```js
const { wsrequest } = require("wsreq");
const uri = "http://example.com";

test("should be able to connect.", async () => {
  const [conn] = await wsrequest(uri, { config: { path: "/ws/path" } });
  expect(conn.connection.connected).toEqual(true);
  expect(conn.connection.id).toBeDefined();
  conn.close();
});
```

Everything else works just the same.

# Options

## timeout

- Set a new request timeout.
- Default to 3000 ms.

## clients

- Set the number of client connections to the websocket server.
- Default to 1.

## config

- Set the connection configuration of the websocket client.
- See more in Socket.io client [docs](https://socket.io/docs/v4/client-options/).

# API

## .emit( name, data )

- Emits a new event to the websocket server.

## .on( name )

- Adds a new event listener to the socket.

## .onWithHttp( name, options )

- Adds a new event listener to the socket and makes a http request to force the emit event in `http server`.
- Use only if you want to test emits from APIs.

## .multiple( callback )

```ts
async ({ http, ws }) => Promise<data>
```

- Allows to make multi-requests.
- Gives you access to the socket and http request modules.
- Returns data from callback or void if no return statement is present.

## .connection

- Gives you access to the socket id and connection status.

## .close( httpServer? )

- Close the connection.
- If `httpServer` is set to `true`, it closes the `http.Server` too (local only).
- `httpServer` is set to true for default, change if you only need to close the websocket.

# Notes

I just wrote it because I need it. ;)

Inspired by [SuperTest](https://github.com/visionmedia/supertest).

# Licence

MIT
