import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGO_URI as string);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}
