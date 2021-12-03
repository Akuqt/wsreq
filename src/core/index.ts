import { io, SocketOptions, ManagerOptions } from "socket.io-client";
import { toHttp, Bridge } from "./util";
import { Server } from "http";

/**
 * Inits the connection.
 */
export class Init {
  private opts: Partial<SocketOptions & ManagerOptions> = {
    path: "/",
  };
  private timeout: number = 3000;
  private clients: number = 1;

  /**
   * Inits the connection.
   * @param path Root for websocket server, default: '/'.
   * @param timeout Time to wait for server answer.
   * @note Min timeout is 3000 ms, so beware of test timeouts.
   */
  constructor(
    opts?: Partial<SocketOptions & ManagerOptions>,
    timeout?: number,
    clients?: number
  ) {
    opts && opts?.path !== ""
      ? (this.opts = opts)
      : (this.opts = { ...opts, path: "/" });
    timeout && (this.timeout = timeout < 3000 ? 3000 : timeout);
    clients && (this.clients = clients > 0 ? clients : 1);
  }

  /**
   * Creates multiple websocket clients.
   * @param uri Websocket server URI
   * @param app HTTP Server
   * @returns All the clients requested
   */
  private async iterate(uri: string, app?: Server) {
    const bridges = Array<Bridge>(this.clients);

    for (let i = 0; i < this.clients; i++) {
      const r = await this.base(uri, app);
      bridges[i] = r;
    }
    return bridges;
  }

  /**
   * Inits the socket.
   * @param uri Uri to remote server with websocket upgrade.
   * @param app Http Server with websocket upgrade.
   * @returns Bridge to websocket methods.
   */
  private base(uri: string, app?: Server) {
    const socket = io(uri, this.opts);

    return new Promise<Bridge>((resolve, reject) => {
      socket.on("connect", () => {
        const bridge = new Bridge(toHttp(uri), socket, this.timeout, app);
        resolve(bridge);
      });
      /* istanbul ignore next */
      socket.on("connect_error", (e) => {
        if (app) {
          app.close();
        }
        socket.close();
        e.message = "Invalid WS connection, check your connection or path.";
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

    return new Promise<Bridge[]>((res, rej) => {
      app.listen(port, async () => {
        const bridges = await this.iterate(uri, app);
        res(bridges);
      });
      /* istanbul ignore next */
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
    return this.iterate(uri);
  }
}
