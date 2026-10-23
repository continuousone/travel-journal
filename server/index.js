import "dotenv/config"
import express from "express"
import mongoose from "mongoose"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { connectDB, seedIfEmpty } from "./db.js"
import entriesRouter from "./routes/entries.js"
import adminRouter from "./routes/admin.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, "..", "dist")
const PORT = process.env.PORT || 3001

const app = express()
app.use(express.json())

app.get("/api/health", (req, res) => {
    res.json({ ok: true, db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" })
})

app.use("/api/entries", entriesRouter)
app.use("/api/admin", adminRouter)

app.use("/api", (req, res) => {
    res.status(404).json({ error: "Not found" })
})

// In production, Express also serves the built React app from /dist
if (process.env.NODE_ENV === "production") {
    app.use(express.static(distDir))
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(distDir, "index.html"))
    })
}

app.use((err, req, res, next) => {
    if (err.name === "ValidationError") {
        return res.status(400).json({ error: err.message })
    }
    console.error(err)
    res.status(500).json({ error: "Server error" })
})

try {
    await connectDB()
    await seedIfEmpty()
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
} catch (err) {
    console.error("Failed to start server:", err.message)
    process.exit(1)
}
