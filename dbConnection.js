import mongoose from "mongoose";

const connectDB = async (mongoDB) => {
    try {
        await mongoose.connect(mongoDB);
        console.log("MongoDB connected");
    } catch (err) {
        console.error("Failed to connect to MongoDB");
        console.error(err.message);
        // process.exit(1);
    }
};

export default connectDB;