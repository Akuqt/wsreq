import { Init } from "./Init";

/**
 * Websocket request options.
 */
interface WsReqOptions {
  path?: string;
  timeout?: number;
}

/**
 * Makes a request using websockets.
 * @param opts Define path and timeout.
 * @returns Controller to stablish a new connection.
 */
export const wsrequest = (opts?: WsReqOptions) => {
  return new Init(opts?.path, opts?.timeout);
};
