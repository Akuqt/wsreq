[![Version npm](https://img.shields.io/npm/v/wsreq.svg?logo=npm)](https://www.npmjs.com/package/wsreq) ![NPM](https://img.shields.io/npm/l/wsreq)

# WsReq

Websocket testing made easy, even with weird emits. ;)

# About

The motivation with this module is to provide a high-level abstraction for testing Websocket endpoints.

# Getting Started

Install WsReq as a module and save it in your package.json file as a development dependency:

```shell
npm i -D wsreq
```

or

```shell
yarn add -D wsreq
```

Once you installed, it can now be referenced by simply calling `require('wsreq');`

# Example:

You may pass the websocket path to wsrequest and a `http.Server` to the local function.

It will bound the server to a ephemeral port so you don't need to keep track of ports.

WsReq works with any test framework, here are some examples with jest:

Connection status.

```js
const { wsrequest } = require("wsreq");
const app = require("../your/path");

test("should be able to connect.", async () => {
  const con = await wsrequest({ path: "/ws/path" }).local(app);
  expect(con.connection.connected).toEqual(true);
  expect(con.connection.id).toBeDefined();
  con.close();
});
```

Response from emit event in the server.

```js
test("should respond with msg.", async () => {
  const con = await wsrequest({ path: "/ws/path" }).local(app);
  con.emit("ping", data);
  const res = await con.on("pong");
  expect(res).toEqual(data);
  con.close();
});
```

Response from http server emit event.

```js
test("should respond with msg (using http). ", async () => {
  // method: "get" | "post" | "put" | "delete";
  const con = await wsrequest({ path }).local(app);
  const res = await con.onWithHttp("ws-event", {
    url: "/http/server/url",
    method: "post",
    body: { ...someData },
    headers: { ...someHeaders },
  });
  expect(res).toEquals({ ...compareData });
  con.close();
});
```

Invalid http server endpoint url.

```js
test("should fail with status code 404.", async () => {
  // method: "get" | "post" | "put" | "delete";
  const con = await wsrequest({ path }).local(app);
  const res = await con
    .onWithHttp("ws-event", {
      url: "/invalid/http/server/url",
      method: "get",
      headers: { ...someHeaders },
    })
    .catch((e: Error) => {
      return {
        msg: e.message,
      };
    });
  expect(res).toEquals({ msg: "Request failed with status code 404" });
  con.close();
});
```

Invalid websocket connection or path.

```js
test("should fail with invalid ws connection.", async () => {
  const res = await wsrequest({ path: "/invalid/ws/path" })
    .local(app)
    .catch((e: Error) => {
      return {
        msg: e.message,
      };
    });
  expect(res).toEqual({ msg: "Invalid WS connection." });
  con.close();
});
```

Invalid websocket event name.

```js
test("should fail with invalid ws event.", async () => {
  const con = await wsrequest({ path: "/ws/path" }).local(app);
  con.emit("ping", data);
  const res = await con.on("no-pong").catch((e: Error) => {
    return {
      msg: e.message,
    };
  });
  expect(res).toEquals({ msg: "Invalid WS event." });
  con.close();
});
```

- If you wanna test a remote server, you should use the remote function instead of local and pass the `uri` as a parameter.

Remote connection status.

```js
const { wsrequest } = require("wsreq");
const uri = "http://example.com";

test("should be able to connect.", async () => {
  const con = await wsrequest({ path: "/ws/path" }).remote(uri);
  expect(con.connection.connected).toEqual(true);
  expect(con.connection.id).toBeDefined();
  con.close();
});
```

Everything else works just the same.

# API

## .emit(name, data)

- Emits a new event to the websocket server.

## .on(name)

- Adds a new event listener to the socket.

## .onWithHttp(name, options)

- Adds a new event listener to the socket and makes a http request to force the emit event in `http server`.
- Use only if you want to test emits from APIs.

## .multiple(callback)

```ts
async ({ http, ws }) => Promise<data>
```

- Allows to make multi-requests.
- Gives you access to the socket and http request modules.
- Returns data from callback or void if no return statement is present.

## .connection

- Gives you access to the socket id and connection status.

## .close()

- Close the connection.
- If local, close the server too.

# Notes

I just wrote it because I need it. ;)

Inspired by [SuperTest](https://github.com/visionmedia/supertest).

# Licence

MIT
