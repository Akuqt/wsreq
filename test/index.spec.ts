import { wsreq, app } from "./helper";

const data = {
  msg: "test",
};

describe("WS REQUEST", () => {
  test("should respond with msg.", async () => {
    const res_ = await wsreq(app, "/api/ws");
    res_.emit("ping", data);
    const res = await res_.on<object>("pong").catch((e: Error) => {
      console.log(e.message);
      return { msg: e.message };
    });
    expect(res).toEqual(data);
  });

  test("should fail with invalid ws connection.", async () => {
    const res = await wsreq(app, "/api/no-ws").catch((e: Error) => {
      return {
        msg: e.message,
      };
    });
    expect(res).toEqual({ msg: "Invalid WS connection." });
  });
});
