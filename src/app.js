import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Serve Frontend Files
app.get("/", (req, res) => {
  res.sendFile(path.join(rootDir, "chay.html"));
});

app.get(["/chay", "/chay.html"], (req, res) => {
  res.sendFile(path.join(rootDir, "chay.html"));
});

app.get(["/login", "/login.html"], (req, res) => {
  res.sendFile(path.join(rootDir, "login.html"));
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/products", productRoutes);
app.use("/api/purchases", purchaseRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
