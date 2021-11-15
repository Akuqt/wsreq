import axios, { AxiosError } from "axios";
import { Callback, OnOptions } from "./types";
import { HTTPRequest } from "./HTTPRequest";
import { Controller } from "./Controller";
import { Server } from "http";
import { Socket } from "socket.io-client";

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
      id: this.socket.io,
      connected: this.socket.connected,
    };
  }

  /**
   * Adds a new event listener to the socket.
   * @param ev Event name.
   * @returns Data retrived from the event.
   */
  public on<T>(ev: string) {
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
  public onWithHttp<T>(ev: string, opts: OnOptions) {
    return new Promise<T>(async (resolve, reject) => {
      const time = setTimeout(() => {
        const err = new Error("Invalid WS event.");
        err.name = "Connection Error.";
        reject(err);
      }, this.timeout);

      const time2 = setTimeout(async () => {
        await axios(this.url + opts.url, {
          method: opts.method,
          data: opts.body,
          headers: opts.headers,
        }).catch((e: AxiosError) => {
          clearTimeout(time);
          const err = new Error();
          err.message = e.message;
          err.name = e.name;
          reject(err);
        });
      }, this.timeout / 2);

      this.socket.on(ev, (data: T) => {
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
   * @note Be sure to emit before add an event listener.
   */
  public emit<T = any>(ev: string, data?: T) {
    this.socket.emit(ev, data);
    return this;
  }

  public send<T>(data: any) {
    return new Promise<T>((resolve, reject) => {
      const time = setTimeout(() => {
        const err = new Error("Request timeout.");
        err.name = "Timeout Error.";
        reject(err);
      }, this.timeout);
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
  public async multiple<T>(callback: Callback<T>) {
    return await callback(new Controller(this, new HTTPRequest(this.url)));
  }

  /**
   * Close the connection.
   * @note If local, close the server.
   */
  public close() {
    if (this.app) {
      this.app.close();
    }
    this.socket.close();
  }
}
