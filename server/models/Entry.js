import mongoose from "mongoose"

const entrySchema = new mongoose.Schema(
    {
        img: {
            src: { type: String, required: true, trim: true },
            alt: { type: String, default: "", trim: true },
        },
        title: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
        googleMapsLink: { type: String, default: "", trim: true },
        dates: { type: String, default: "", trim: true },
        text: { type: String, default: "", trim: true },
    },
    { timestamps: true }
)

export default mongoose.model("Entry", entrySchema)
