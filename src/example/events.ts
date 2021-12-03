import { EventStack } from "./websocket";

const stack = new EventStack();

stack.push("ping", function (data) {
  console.log(data);
  this.emit("pong", data);
});

stack.push("message", function (data) {
  console.log(data);
  this.emit("message", data);
});

export default stack;
