import express from "express";
import {
  createPurchase,
  deletePurchase,
  getPurchases,
} from "../controllers/purchaseController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/").post(createPurchase).get(getPurchases);
router.route("/:id").delete(deletePurchase);

export default router;
