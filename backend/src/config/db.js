import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = !!conn.connections[0].readyState;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // In serverless, we don't necessarily want to exit the process, 
    // but for now, we'll keep it consistent with the existing logic 
    // or better yet, just throw the error for the handler to catch.
    throw error;
  }
};

export default connectDB;
