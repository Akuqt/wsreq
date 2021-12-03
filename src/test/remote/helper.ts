import { wsrequest } from "../..";
import { Methods } from "../../core/util";

const uri = "wss://api.aku-mi.xyz";

export const httpRequest = async <T = object>(
  path: string,
  event: string,
  url: string,
  method: Methods,
  body?: object
) => {
  return new Promise<T>(async (resolve, reject) => {
    const [conn] = await wsrequest(uri, {
      config: {
        path,
      },
    });
    try {
      const { ws } = await conn.onWithHttp<T>(event, {
        url,
        method,
        body,
      });
      conn.close();
      resolve(ws);
    } catch (e) {
      conn.close();
      reject(e);
    }
  });
};

export { wsrequest, uri };
