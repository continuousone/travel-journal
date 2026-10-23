import mongoose from "mongoose"
import Entry from "./models/Entry.js"
import seedData from "./seedData.js"

export async function connectDB() {
    const uri = process.env.MONGODB_URI
    if (!uri) {
        throw new Error("MONGODB_URI is not set. Copy .env.example to .env and add your connection string.")
    }
    await mongoose.connect(uri)
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`)
}

// Insert the starter entries only if the collection is empty.
export async function seedIfEmpty() {
    const count = await Entry.countDocuments()
    if (count === 0) {
        await Entry.insertMany(seedData)
        console.log(`Seeded ${seedData.length} starter entries`)
    }
}
