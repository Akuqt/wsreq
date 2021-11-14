# WsReq

Websocket testing made easy. Even with weird emits. ;)

# About

The motivation with this module is to provide a high-level abstraction for testing Websockets endpoints.

# Getting Started

Install WsReq as an npm module and save it to your package.json file as a development dependency:

```shell
npm i -D wsreq
```

or

```shell
yarn add -D wsreq
```

Once installed it can now be referenced by simply calling require('wsreq');

# Example:

You may pass and http.Server to wsreq and the websocket pass.
It will bound the server to a ephemeral port so you need to keep track of ports.

WsReq works with any test framework, here are some examples with jest:

Response from emit event in the server.

```js
const wsreq = require("wsreq");
const app = require("../your/path");

test("should respond with msg.", async () => {
  const res_ = await wsreq(app, "/ws/path");
  res_.emit("ping", data);
  const res = await res_.on("pong");
  expect(res).toEqual(data);
});
```

Response from http server emit event.

```js
test("should respond with msg (using http). ", async () => {
  // method: "get" | "post" | "put" | "delete";
  const res_ = await wsreq(app, path);
  const res = await res_.onWithHttp("ws-event", {
    url: "/http/server/url",
    method: "post",
    body: { ...someData },
    headers: { ...someHeaders },
  });
  expect(res).toEquals({ ...compareData });
});
```

Invalid http server url.

```js
test("should fail with status code 404.", async () => {
  // method: "get" | "post" | "put" | "delete";
  const res_ = await wsreq(app, path);
  const res = await res_
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
});
```

Invalid websocket connection or path.

```js
test("should fail with invalid ws connection.", async () => {
  const res = await wsreq(app, "/invalid/ws/path").catch((e: Error) => {
    return {
      msg: e.message,
    };
  });
  expect(res).toEqual({ msg: "Invalid WS connection." });
});
```

Invalid websocket event name.

```js
test("should fail with invalid ws event.", async () => {
  const res_ = await wsreq(app, "/ws/path");
  res_.emit("ping", data);
  const res = await res_.on("no-pong").catch((e: Error) => {
    return {
      msg: e.message,
    };
  });
  expect(res).toEquals({ msg: "Invalid WS event." });
});
```

# API

## .emit(name, data)

Emits a new event to the websocket server.

## .on(name)

Adds a new event listener to the socket.

## .onWithHttp(name, options)

Adds a new event listener to the socket and makes a http request to force the emit event in http server. Use only if you want to test emits from APIs.

# Notes

I just wrote it because I needed it. ;)

Inspired in [SuperTest](https://github.com/visionmedia/supertest).

# Licence

MIT
