import { Server } from "http";
import { toHttp } from "./util";
import { Bridge } from "./Bridge";
import { io } from "socket.io-client";

/**
 * Inits the connection.
 */
export class Init {
  private path: string = "/";
  private timeout: number = 3000;

  /**
   * Inits the connection.
   * @param path Root for websocket server, default: '/'.
   * @param timeout Time to wait for server answer.
   * @note Min timeout is 3000 ms, so beware of test timeouts.
   */
  constructor(path?: string, timeout?: number) {
    path && (this.path = path === "" ? "/" : path);
    timeout && (this.timeout = timeout < 3000 ? 3000 : timeout);
  }

  /**
   * Inits the socket.
   * @param uri Uri to remote server with websocket upgrade.
   * @param app Http Server with websocket upgrade.
   * @returns Bridge to websocket methods.
   */
  private base(uri: string, app?: Server) {
    const socket = io(uri, {
      path: this.path,
    });

    return new Promise<Bridge>((resolve, reject) => {
      socket.on("connect", () => {
        const bridge = new Bridge(toHttp(uri), socket, this.timeout, app);
        resolve(bridge);
      });

      socket.on("connect_error", (e) => {
        if (app) {
          app.close();
        }
        socket.close();
        e.message = "Invalid WS connection.";
        reject(e);
      });
    });
  }

  /**
   * Makes a request using websockets.
   * @param app Http Server with websocket upgrade.
   * @param port Port for the http server.
   * @returns Bridge to websocket methods.
   */
  public local(app: Server, port: number = 45000) {
    const uri = `http://localhost:${port}`;

    return new Promise<Bridge>((res, rej) => {
      app.listen(port, async () => {
        const r = await this.base(uri, app).catch((e) => {
          rej(e);
          return new Bridge("", null as any, 0);
        });
        res(r);
      });

      app.on("error", (e: any) => {
        app.close();
        if (e.code === "EADDRINUSE") {
          const newPort = port + Math.floor(Math.random() * 1000);
          app.listen(newPort);
        } else {
          rej(e);
        }
      });
    });
  }

  /**
   * Makes a remote request using websockets.
   * @param uri Uri to remote server with websocket upgrade.
   * @returns Bridge to websocket methods.
   */
  public remote(uri: string) {
    return this.base(uri);
  }
}
