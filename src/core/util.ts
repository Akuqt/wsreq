import axios, { AxiosRequestHeaders, AxiosProxyConfig } from "axios";
import { ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { Server } from "http";

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
  maxContentLength?: number;
  withCredentials?: boolean;
  maxRedirects?: number;
  proxy?: AxiosProxyConfig;
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
 * Callback for multiple bridged requests.
 */
export type Callback<T> = (c: Controller) => Promise<T>;

/**
 * Websocket request options.
 */
export interface WsReqOptions {
  timeout?: number;
  clients?: number;
  config?: Partial<SocketOptions & ManagerOptions>;
}

/**
 * Transform from ws to http.
 * @param uri Uri to change.
 * @returns New uri.
 */
export const toHttp = (uri: string): string => {
  if (uri.startsWith("ws")) {
    return "http" + uri.slice(2, uri.length);
  }
  return uri;
};

/**
 * HTTP request maker.
 */
export class HTTPRequest {
  /**
   * HTTP request maker.
   * @param baseUrl HTTP server base url.
   */
  constructor(private baseUrl: string) {}

  /**
   * Makes a HTTP Request.
   * @param url Endpoint url.
   * @param method HTTP method.
   * @param opts Request Options.
   * @returns Data from success request.
   */
  private base<U = any>(url: string, method: Methods, opts?: Options<any>) {
    return new Promise<U>(async (resolve, reject) => {
      try {
        const r = await axios(this.baseUrl + url, {
          method,
          data: opts?.body,
          proxy: opts?.proxy,
          headers: opts?.headers,
          timeout: opts?.timeout,
          maxRedirects: opts?.maxRedirects,
          maxBodyLength: opts?.maxBodyLength,
          withCredentials: opts?.withCredentials,
          maxContentLength: opts?.maxContentLength,
        });

        resolve(r.data);
      } catch (error) {
        /* istanbul ignore next */
        reject(error);
      }
    });
  }

  /**
   * Makes a GET request.
   * @param url Endpoint url.
   * @param opts Request options.
   * @returns Data from success request.
   */
  public get<U = any>(url: string, opts?: Options<never>) {
    return this.base<U>(url, "get", opts);
  }
  /**
   * Makes a POST request.
   * @param url Endpoint url.
   * @param opts Request options.
   * @returns Data from success request.
   */
  public post<T = object, U = any>(url: string, opts?: Options<U>) {
    return this.base<T>(url, "post", opts);
  }
  /**
   * Makes a PUT request.
   * @param url Endpoint url.
   * @param opts Request options.
   * @returns Data from success request.
   */
  public put<T = object, U = any>(url: string, opts?: Options<U>) {
    return this.base<T>(url, "put", opts);
  }
  /**
   * Makes a DELETE request.
   * @param url Endpoint url.
   * @param opts Request options.
   * @returns Data from success request.
   */
  public delete<T = object, U = any>(url: string, opts?: Options<U>) {
    return this.base<T>(url, "delete", opts);
  }
}

export class Controller {
  /**
   * Controller to handle connections.
   * @param bridge Bridge to websocket methods.
   * @param req Bridge to HTTP methods.
   */
  constructor(private bridge: Bridge, private req: HTTPRequest) {}

  /**
   * @returns Bridge to websocket methods.
   */
  public get ws() {
    return this.bridge;
  }

  /**
   * @returns Bridge to HTTP methods.
   */
  public get http() {
    return this.req;
  }
}

/**
 * Bridge between connections.
 */
export class Bridge {
  private app: Server | undefined;

  /**
   * Bridge between connections.
   * @param url Base url to the server.
   * @param socket Websocket
   * @param timeout Time to wait for server answer.
   * @param app Http Server with websocket upgrade.
   */
  constructor(
    private url: string,
    private socket: Socket,
    private timeout: number,
    app?: Server
  ) {
    this.app = app;
  }

  public get connection() {
    return {
      id: this.socket.id,
      connected: this.socket.connected,
    };
  }

  /**
   * Adds a new event listener to the socket.
   * @param ev Event name.
   * @returns Data retrived from the event.
   */
  public on<T = any>(ev: string) {
    return new Promise<T>((resolve, reject) => {
      const time = setTimeout(() => {
        const err = new Error("Invalid WS event.");
        err.name = "Connection Error.";
        reject(err);
      }, this.timeout);
      this.socket.on(ev, (data: T) => {
        resolve(data);
        clearTimeout(time);
      });
    });
  }

  /**
   * Adds a new event listener to the socket and makes a http request to force the emit event in http server.
   * @param ev Event name.
   * @param opts HTTP request options.
   * @returns Data retrived from the event.
   * @note Use only if you want to test emits from APIs.
   */
  public onWithHttp<T = any, U = any>(ev: string, opts: OnOptions) {
    return new Promise<{ ws: T; http: U }>(async (resolve, reject) => {
      let http_res: any;
      const time = setTimeout(() => {
        clearTimeout(time);
        reject(new Error("Invalid WS event."));
      }, this.timeout);

      const time2 = setTimeout(async () => {
        try {
          const res_ = await axios(this.url + opts.url, {
            method: opts.method,
            data: opts.body,
            headers: opts.headers,
          });
          http_res = res_.data;
        } catch (error) {
          clearTimeout(time);
          reject(error);
        }
      }, this.timeout / 2);

      this.socket.on(ev, (data: T) => {
        clearTimeout(time2);
        clearTimeout(time);
        const res = { ws: data, http: http_res as U };
        resolve(res);
      });
    });
  }

  /**
   * Emits a new event to the websocket server.
   * @param ev Event name.
   * @param data Data to send.
   * @returns Bridge between on and emit socket methods.
   * @note Be sure to emit before add an event listener.
   */
  public emit<T = any>(ev: string, data?: T) {
    this.socket.emit(ev, data);
    return this;
  }

  /**
   * Emits and add the message event.
   * @param data Data to send.
   * @returns Any data from server.
   */
  public send<T = any>(data: any) {
    return new Promise<T>((resolve, reject) => {
      const time = setTimeout(
        /* istanbul ignore next */ () => {
          const err = new Error("Request timeout.");
          err.name = "Timeout Error.";
          clearTimeout(time);
          reject(err);
        },
        this.timeout
      );
      this.socket.on("message", (d) => {
        clearTimeout(time);
        resolve(d as T);
      });
      this.socket.send(data);
    });
  }

  /**
   * Allows to make multi-requests.
   * @param callback Gives access to the socket and http request modules.
   * @returns Data from callback or void if no return statement is present.
   */
  public multiple<T = any>(callback: Callback<T>) {
    return callback(new Controller(this, new HTTPRequest(this.url)));
  }

  /**
   * Close the connection.
   * @note If local, close the server.
   */
  public close(httpServer?: boolean) {
    if (this.app && !httpServer) {
      this.app.close();
    }
    this.socket.close();
  }
}
