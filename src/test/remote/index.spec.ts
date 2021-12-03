import { wsrequest, uri } from "./helper";

const data = {
  msg: "test",
};

describe("WS REQUEST", () => {
  test("should be able to connect.", async () => {
    const [conn1, conn2] = await wsrequest(uri, {
      config: {
        path: "/api/ws",
      },
      clients: 2,
    });
    expect(conn1.connection.id).toBeDefined();
    expect(conn2.connection.id).toBeDefined();
    conn1.close();
    conn2.close();
  });
  test("should respond with msg.(EMIT - ON)", async () => {
    const [conn] = await wsrequest(uri, { config: { path: "/api/ws" } });
    const r = await conn.emit("ping", data).on<object>("pong");
    expect(r).toEqual(data);
    conn.close();
  });
  test("should respond with msg. (SEND)", async () => {
    const [conn] = await wsrequest(uri, { config: { path: "/api/ws" } });
    const r = await conn.send<object>(data);
    expect(r).toEqual(data);
    conn.close();
  });
  test("should respond with msg. (MULTIPLE)", async () => {
    const [conn] = await wsrequest(uri, { config: { path: "/api/ws" } });
    const r = await conn.multiple(async ({ http, ws }) => {
      const hget = await http.get<{ msg: string }>("/api/get/");
      const hpost = await http.post<{ msg: string }>("/api/post/", {
        body: { test: data.msg },
      });
      const hdelete = await http.delete<{ msg: string }>("/api/delete/", {
        body: { test: data.msg },
      });
      const hput = await http.put<{ msg: string }>("/api/put/", {
        body: { test: data.msg },
      });
      const wr = await ws.emit("ping", data).on<{ msg: string }>("pong");
      return {
        hget,
        hpost,
        hdelete,
        hput,
        wr,
      };
    });
    expect(r.wr).toEqual(data);
    expect(r.hget).toEqual({ msg: "from get" });
    expect(r.hpost).toEqual(data);
    expect(r.hdelete).toEqual(data);
    expect(r.hput).toEqual(data);
    conn.close();
  });
  test("should respond with invalid event error. (ON)", async () => {
    const [conn] = await wsrequest(uri, { config: { path: "/api/ws" } });
    const r = await conn.on<object>("no-pong").catch((e) => {
      return e.message;
    });
    expect(r).toEqual("Invalid WS event.");
    conn.close();
  });
});
