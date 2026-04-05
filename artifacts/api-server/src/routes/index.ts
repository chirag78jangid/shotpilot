import { Router, type IRouter } from "express";
import healthRouter from "./health";
import shotpilotRouter from "./shotpilot";
import openaiRouter from "./openai/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use(shotpilotRouter);
router.use(openaiRouter);

export default router;
