import { Router } from "express";
import { createSellOrder, getFiatPairs, createBuyOrder, confirmSellOrder, confirmBuyOrder, getPendingOrders, adminApproveOrder, adminRejectOrder, getAllOrders, findAllOrdersByUser, findOrdersbyuseridforAdmin } from "../controllers/p2p.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const p2pRouter = Router();

p2pRouter.get("/get-list",getFiatPairs);
p2pRouter.post("/sell",authMiddleware,createSellOrder);
p2pRouter.post("/buy",authMiddleware,createBuyOrder);
p2pRouter.patch("/confirm-sell/:orderId",authMiddleware,upload.single("proof"),confirmSellOrder);
p2pRouter.patch("/confirm-buy/:orderId",authMiddleware,upload.single("proof"),confirmBuyOrder);
p2pRouter.get("/my-orders",authMiddleware,findAllOrdersByUser);

// Admin Routes
p2pRouter.get("/admin/orders",authMiddleware,authorizeRoles("admin"),getPendingOrders);
p2pRouter.patch("/admin/approve/:orderId",authMiddleware,authorizeRoles("admin"),adminApproveOrder);
p2pRouter.patch("/admin/reject/:orderId",authMiddleware,authorizeRoles("admin"),adminRejectOrder);
p2pRouter.get("/admin/all-orders",authMiddleware,authorizeRoles("admin"),getAllOrders);
p2pRouter.get("/admin/user-orders/:userId",authMiddleware,authorizeRoles("admin"),findOrdersbyuseridforAdmin);


export default p2pRouter;