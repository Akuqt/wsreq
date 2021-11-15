import { wsrequest, uri } from "./helper";

const data = {
  msg: "test",
};

describe("WS REMOTE REQUEST", () => {
  test("should be able to connect.", async () => {
    const res = await wsrequest({ path: "/api/ws" }).remote(uri);
    expect(res.connection.connected).toEqual(true);
    expect(res.connection.id).toBeDefined();
    res.close();
  });

  test("should respond with msg.", async () => {
    const res = await wsrequest({ path: "/api/ws" }).remote(uri);
    res.emit("ping", data);
    const r = await res.on<object>("pong");
    expect(r).toEqual(data);
    res.close();
  });

  test("should respond with msg. (multiple)", async () => {
    const res = await wsrequest({ path: "/api/ws" }).remote(uri);
    const r = await res.multiple(async ({ http, ws }) => {
      const hr = await http.get<{ msg: string }>("/api/");
      ws.emit("ping", data);
      const wr = await ws.on<{ msg: string }>("pong");

      return {
        hr,
        wr,
      };
    });
    expect(r.wr).toEqual(data);
    expect(r.hr).toEqual({ msg: "Hello" });
    res.close();
  });

  test("should fail with invalid ws connection.", async () => {
    const res = await wsrequest({ path: "/api/no-ws" })
      .remote(uri)
      .catch((e: Error) => {
        return {
          msg: e.message,
        };
      });
    expect(res).toEqual({ msg: "Invalid WS connection." });
  });
});
