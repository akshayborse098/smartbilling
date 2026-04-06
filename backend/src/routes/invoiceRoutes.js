import express from "express";
import {
  createInvoice,
  deleteInvoice,
  getInvoiceById,
  getInvoices,
  updateInvoice,
} from "../controllers/invoiceController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.route("/").post(createInvoice).get(getInvoices);
router.route("/:id").get(getInvoiceById).put(updateInvoice).delete(deleteInvoice);

export default router;
