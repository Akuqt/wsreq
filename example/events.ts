import { EventStack } from "./websocket";

const stack = new EventStack();

stack.push("ping", function (data) {
  this.emit("pong", data);
});

export default stack;
