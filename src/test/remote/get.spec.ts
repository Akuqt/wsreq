import { httpRequest } from "./helper";

describe("WS REMOTE GET REQUEST", () => {
  test("should respond with msg.", async () => {
    const k = await httpRequest<object>("/api/ws", "test", "/api/get", "get");

    expect(k).toEqual({ msg: "from get" });
  });

  test("should fail with status code 404.", async () => {
    const k = await httpRequest<object>(
      "/api/ws",
      "test",
      "/api/no-get",
      "get"
    ).catch((e: Error) => {
      return {
        msg: e.message,
      };
    });

    expect(k).toEqual({ msg: "Request failed with status code 404" });
  });

  test("should fail with invalid ws event.", async () => {
    const k = await httpRequest<object>(
      "/api/ws",
      "no-test",
      "/api/get",
      "get"
    ).catch((e: Error) => {
      return {
        msg: e.message,
      };
    });

    expect(k).toEqual({ msg: "Invalid WS event." });
  });
});
