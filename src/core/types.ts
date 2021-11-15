import { AxiosRequestHeaders } from "axios";
import { HTTPRequest } from "./HTTPRequest";
import { Bridge } from "./Bridge";

/**
 * HTTP methods.
 */
export type Methods = "get" | "post" | "put" | "delete";

/**
 * HTTP request options.
 */
export interface Options<T> {
  headers?: AxiosRequestHeaders;
  body?: T extends object ? T : object;
  timeout?: number;
  maxBodyLength?: number;
  withCredentials?: boolean;
}

/**
 * HTTP options for bridged request.
 */
export interface OnOptions {
  url: string;
  method: Methods;
  headers?: AxiosRequestHeaders;
  body?: object;
}

/**
 * Controller type
 */
export interface Controller {
  ws: Bridge;
  http: HTTPRequest;
}

/**
 * Callback for multiple bridged requests.
 */
export type Callback<T> = (c: Controller) => Promise<T>;
