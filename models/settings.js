import mongoose from "mongoose";

const Schema = mongoose.Schema;

const settingSchema = new Schema({
    brojPitanja: {
        type: Number,
        required: true,
        default: 10,
    },
    vremeSekunde: {
        type: Number,
        required: true,
        default: 15,
    },
    poeni: {
        prvi: {
            type: Number,
            required: true,
            default: 10,
        },
        drugi: {
            type: Number,
            required: true,
            default: 8,
        },
        treci: {
            type: Number,
            required: true,
            default: 6,
        },
        cetvrti: {
            type: Number,
            required: true,
            default: 5,
        },
        netacan: {
            type: Number,
            required: true,
            default: -1,
        },
    },
    kategorije: [
        {
            type: String,
            required: true,
        }
    ],
});
 
export default mongoose.model("Setting", settingSchema);