import express from "express";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  bulkSyncProducts,
} from "../controllers/productController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/").post(createProduct).get(getProducts);
router.route("/sync").post(bulkSyncProducts);
router.route("/:id").put(updateProduct).delete(deleteProduct);

export default router;
