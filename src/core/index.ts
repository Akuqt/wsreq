import axios, { AxiosError, AxiosRequestHeaders } from "axios";
import { io, Socket } from "socket.io-client";
import { Server } from "http";

export type Methods = "get" | "post" | "put" | "delete";

interface Options {
  url: string;
  method: Methods;
  header?: AxiosRequestHeaders;
  body?: object;
}

/**
 * Bridge between on and emit event socket method.
 */
class Bridge {
  constructor(
    private socket: Socket,
    private app: Server,
    private timeout: number
  ) {}

  /**
   * Close the connection.
   */
  private close() {
    this.app.close();
    this.socket.close();
  }

  /**
   * Adds a new event listener to the socket.
   * @param ev Event name.
   * @returns Data retrived from the event.
   */
  public on<T>(ev: string) {
    return new Promise<T>((resolve, reject) => {
      const time = setTimeout(() => {
        this.close();
        const err = new Error("Invalid WS event.");
        err.name = "Connection Error.";
        reject(err);
      }, this.timeout);
      this.socket.on(ev, (data: T) => {
        this.close();
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
  public onWithHttp<T>(ev: string, opts: Options) {
    return new Promise<T>(async (resolve, reject) => {
      const time = setTimeout(() => {
        this.close();
        const err = new Error("Invalid WS event.");
        err.name = "Connection Error.";
        reject(err);
      }, this.timeout);

      const time2 = setTimeout(async () => {
        await axios("http://localhost:45000" + opts.url, {
          method: opts.method,
          data: opts.body,
          headers: opts.header,
        }).catch((e: AxiosError) => {
          this.close();
          clearTimeout(time);
          const err = new Error();
          err.message = e.message;
          err.name = e.name;
          reject(err);
        });
      }, this.timeout / 2);

      this.socket.on(ev, (data: T) => {
        this.close();
        resolve(data);
        clearTimeout(time2);
        clearTimeout(time);
      });
    });
  }

  /**
   * Emits a new event to the websocket server.
   * @param ev Event name.
   * @param data Data to send.
   * @returns Bridge between on and emit socket methods.
   * @note Be sure to emit before add a event listener.
   */
  public emit(ev: string, data: any) {
    this.socket.emit(ev, data);
    return new Bridge(this.socket, this.app, this.timeout);
  }
}

/**
 * Makes a request using websockets.
 * @param app Http Server with websocket upgrade.
 * @param path Root for websocket server.
 * @param timeout Time to wait for server answer.
 * @param port Port for the http server.
 * @returns Bridge between on and emit socket methods.
 * @note Min timeout is 3000 ms. Beware of test timeouts and Default port is 45000.
 */
export const wsreq = (
  app: Server,
  path: string,
  timeout: number = 3000,
  port: number = 45000
) => {
  app.listen(port);
  const socket = io(`http://localhost:${port}`, {
    path,
  });

  return new Promise<Bridge>((resolve, reject) => {
    socket.on("connect", () => {
      resolve(new Bridge(socket, app, timeout > 3000 ? timeout : 3000));
    });

    socket.on("connect_error", (e) => {
      app.close();
      socket.close();
      e.message = "Invalid WS connection.";
      reject(e);
    });
  });
};
