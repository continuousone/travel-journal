// Usage:
//   npm run seed           -> adds starter entries only if the database is empty
//   npm run seed -- --reset -> deletes ALL entries, then re-adds the starter entries
import "dotenv/config"
import mongoose from "mongoose"
import { connectDB, seedIfEmpty } from "./db.js"
import Entry from "./models/Entry.js"

const reset = process.argv.includes("--reset")

try {
    await connectDB()
    if (reset) {
        const { deletedCount } = await Entry.deleteMany({})
        console.log(`Deleted ${deletedCount} entries`)
    }
    await seedIfEmpty()
    console.log(`Database now has ${await Entry.countDocuments()} entries`)
} catch (err) {
    console.error(err.message)
    process.exitCode = 1
} finally {
    await mongoose.disconnect()
}
