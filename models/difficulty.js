import mongoose from "mongoose";

const Schema = mongoose.Schema;

const difficultySchema = new Schema({
    tezinaPitanja: {
        type: String,
        required: true,
        unique: true
    }
});
 
export default mongoose.model("Difficulty", difficultySchema);