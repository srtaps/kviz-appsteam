import mongoose from "mongoose";

const Schema = mongoose.Schema;

const contestantSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    points: {
        type: Number,
        default: 0,
    },
    date: {
        type: String, 
        default: () => new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
    },
});

export default mongoose.model("Contestant", contestantSchema);