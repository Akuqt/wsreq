import { httpRequest } from "./helper";

const body = {
  test: "from put",
};

describe("WS REMOTE PUT REQUEST", () => {
  test("should respond with msg.", async () => {
    const k = await httpRequest<object>(
      "/api/ws",
      "test",
      "/api/put",
      "put",
      body
    ).catch((e: Error) => {
      return {
        msg: e.message,
      };
    });

    expect(k).toEqual({
      msg: body.test,
    });
  });

  test("should fail with status code 404.", async () => {
    const k = await httpRequest<object>(
      "/api/ws",
      "test",
      "/api/no-put",
      "put",
      body
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
      "/api/put",
      "put",
      body
    ).catch((e: Error) => {
      return {
        msg: e.message,
      };
    });

    expect(k).toEqual({ msg: "Invalid WS event." });
  });
});
