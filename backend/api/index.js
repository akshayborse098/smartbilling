import app from "../src/app.js";
import connectDB from "../src/config/db.js";

// Vercel serverless entry point
export default async function handler(req, res) {
  try {
    // Ensure DB connection is established before handling the request
    await connectDB();
    
    // Pass control to the Express application
    return app(req, res);
  } catch (error) {
    console.error("Critical server error during cold start:", error);
    res.status(500).json({ 
      message: "An internal server error occurred during connection.",
      error: error.message || "Unknown error"
    });
  }
}
