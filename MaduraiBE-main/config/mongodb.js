import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MongoDBurl =process.env.MONGO_URL

const connectDB = async () => {
    try {
        const connectedDB = await mongoose.connect(
        `${MongoDBurl}`
        );
        console.log(`DB is Connected to ${connectedDB.connection.port}`);
      } catch (error) {
        console.log("DB is not connected");
        process.exit(1);
      }
};

export default connectDB;