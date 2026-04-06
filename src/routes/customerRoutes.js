import express from "express";
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from "../controllers/customerController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.route("/").post(createCustomer).get(getCustomers);
router.route("/:id").put(updateCustomer).delete(deleteCustomer);

export default router;
