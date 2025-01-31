import mongoose from "mongoose";

const Schema = mongoose.Schema;

const questionSchema = new Schema({
    kategorija: {
        type: String,
        default: "Trivija",
    },
    tezina: {
        type: String,
        enum: ["Lako", "Srednje", "Tesko"],
        default: "Srednje",
    },
    pitanje: {type: String},
    tacanOdg: {type: String},
    netacanOdg1: {type: String},
    netacanOdg2: {type: String},
    netacanOdg3: {type: String},
});

export default mongoose.model("Question", questionSchema);