import express from "express";
import { getProfile, login, register } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/login", (req, res) => {
  // Convert query params to body for GET requests
  req.body = { email: req.query.email, password: req.query.password };
  return login(req, res);
});
router.get("/profile", authMiddleware, getProfile);

export default router;
