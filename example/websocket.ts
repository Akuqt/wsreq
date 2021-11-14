import { Server as WebSocketServer, Socket, ServerOptions } from "socket.io";
import { Server } from "http";

type EventCallback = (this: Socket, data?: object) => void;

interface Params {
  ev: string;
  callback: EventCallback;
}

export class EventStack {
  private evs: Params[];

  constructor() {
    this.evs = [];
  }

  /**
   * @description Add a new event handler to the Socket Event stack.
   * @note Don't use arrow funtions if you wanna have access to the socket (this).
   * @param name Name of the event
   * @param callback Callback for the event
   */
  public push(name: string, callback: EventCallback) {
    if (name === "") throw new Error("The event needs a name.");
    else this.evs.push({ callback, ev: name });
  }

  /**
   * @returns The event stack.
   */
  public get events() {
    return this.evs;
  }
}

export default class WebSocket {
  private io: WebSocketServer;
  static socket: Socket;
  static id: string;
  constructor(httpServer: Server, opts: Partial<ServerOptions>) {
    this.io = new WebSocketServer(httpServer, opts);
  }

  /**
   * Inits the web socket connection.
   *
   * @param eventStack Stack of events to start with.
   */
  public init(eventStack?: EventStack) {
    this.io.on("connection", (socket) => {
      WebSocket.socket = socket;
      WebSocket.id = socket.id;
      if (eventStack) {
        if (eventStack.events.length > 0)
          for (const ev of eventStack.events) {
            socket.on(ev.ev, ev.callback);
          }
        else throw new Error("Event stack need at least one event");
      }
    });
  }

  /**
   * Emits a new event.
   * @param ev Event name
   * @param data Data to send
   */
  public static emit(ev: string, data?: any) {
    if (WebSocket.socket) {
      WebSocket.socket.emit(ev, data);
    }
  }

  /**
   * Adds a event listener.
   * @param ev Event name.
   * @param callback Callback for the event.
   */
  public static on(ev: string, callback: EventCallback) {
    if (WebSocket.socket) {
      WebSocket.socket.on(ev, callback);
    }
  }
}
