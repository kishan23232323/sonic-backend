import { convertFiatUsdt } from "../controllers/conversion.controller.js";
import { Router } from "express";
const conversionRouter = Router();
conversionRouter.route("/fiat-usdt").get(convertFiatUsdt);

export default conversionRouter;
