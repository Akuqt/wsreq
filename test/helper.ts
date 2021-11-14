import { wsrequest } from "../src";
import { Methods } from "../src/core";
import app from "../example/app";

export const httpRequest = async <T = object>(
  path: string,
  event: string,
  url: string,
  method: Methods,
  body?: object
) => {
  return new Promise<T>(async (resolve, reject) => {
    const res = await wsrequest(app, path);
    const res2 = await res
      .onWithHttp<T>(event, {
        url,
        method,
        body,
      })
      .catch((e: Error) => {
        reject(e);
      });

    resolve(res2 as T);
  });
};

export { wsrequest, app };
