import Websocket from "./websocket";
import express from "express";
import events from "./events";
import routes from "./routes";
import http from "http";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", routes);

const httpServer = http.createServer(app);

const socket = new Websocket(httpServer, {
  cors: { origin: "*" },
  path: "/api/ws",
});

socket.init(events);

export default httpServer;
