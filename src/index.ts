import { Init } from "./core";
import { WsReqOptions } from "./core/util";
import { Server as HTTPServer } from "http";

/**
 * Makes a request using websockets.
 * @param opts Define connection options.
 * @returns Bridge to websocket methods.
 */
export const wsrequest = (server: string | HTTPServer, opts?: WsReqOptions) => {
  if (typeof server === "string")
    return new Init(opts?.config, opts?.timeout, opts?.clients).remote(server);
  return new Init(opts?.config, opts?.timeout, opts?.clients).local(server);
};
