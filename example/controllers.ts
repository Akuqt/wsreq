import { Request, Response } from "express";
import Websocket from "./websocket";

export const index = (_req: Request, res: Response) => {
  res.json({
    msg: "Hello",
  });
};

export const someGet = (_req: Request, res: Response) => {
  Websocket.emit("test", { msg: "from get" });
  res.end();
};

export const somePost = (req: Request, res: Response) => {
  const { test } = req.body;
  Websocket.emit("test", { msg: test });
  res.end();
};

export const somePut = (req: Request, res: Response) => {
  const { test } = req.body;
  Websocket.emit("test", { msg: test });
  res.end();
};

export const someDelete = (req: Request, res: Response) => {
  const { test } = req.body;
  Websocket.emit("test", { msg: test });
  res.end();
};
