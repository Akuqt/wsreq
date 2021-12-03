import { Router } from "express";
import { index, someDelete, someGet, somePost, somePut } from "./controllers";

const router = Router();

router.get("/", index);

router.get("/get", someGet);

router.post("/post", somePost);

router.put("/put", somePut);

router.delete("/delete", someDelete);

export default router;
