import { Router } from "express"
import mongoose from "mongoose"
import Entry from "../models/Entry.js"

const router = Router()

// Writes (create / update / delete) require the ADMIN_KEY in an
// `x-admin-key` header, so visitors to the public site can only read.
function requireAdmin(req, res, next) {
    const key = process.env.ADMIN_KEY
    if (!key) {
        return res.status(403).json({ error: "Writes are disabled: ADMIN_KEY is not set on the server" })
    }
    if (req.get("x-admin-key") !== key) {
        return res.status(401).json({ error: "Missing or invalid x-admin-key header" })
    }
    next()
}

function validId(req, res, next) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({ error: "Entry not found" })
    }
    next()
}

// GET /api/entries — all entries, oldest first
router.get("/", async (req, res, next) => {
    try {
        const entries = await Entry.find().sort({ createdAt: 1 })
        res.json(entries)
    } catch (err) {
        next(err)
    }
})

// GET /api/entries/:id
router.get("/:id", validId, async (req, res, next) => {
    try {
        const entry = await Entry.findById(req.params.id)
        if (!entry) return res.status(404).json({ error: "Entry not found" })
        res.json(entry)
    } catch (err) {
        next(err)
    }
})

// POST /api/entries
router.post("/", requireAdmin, async (req, res, next) => {
    try {
        const entry = await Entry.create(req.body)
        res.status(201).json(entry)
    } catch (err) {
        next(err)
    }
})

// PUT /api/entries/:id
router.put("/:id", requireAdmin, validId, async (req, res, next) => {
    try {
        const entry = await Entry.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: "after",
            runValidators: true,
        })
        if (!entry) return res.status(404).json({ error: "Entry not found" })
        res.json(entry)
    } catch (err) {
        next(err)
    }
})

// DELETE /api/entries/:id
router.delete("/:id", requireAdmin, validId, async (req, res, next) => {
    try {
        const entry = await Entry.findByIdAndDelete(req.params.id)
        if (!entry) return res.status(404).json({ error: "Entry not found" })
        res.status(204).end()
    } catch (err) {
        next(err)
    }
})

export default router
