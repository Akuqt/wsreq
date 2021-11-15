import { Bridge } from "./Bridge";
import { HTTPRequest } from "./HTTPRequest";

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
