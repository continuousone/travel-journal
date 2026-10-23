import { Router } from "express"
import { v2 as cloudinary } from "cloudinary"
import requireAdmin from "../middleware/requireAdmin.js"

const router = Router()
router.use(requireAdmin)

const UPLOAD_FOLDER = "travel-journal"

function cloudinaryConfig() {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return null
    return {
        cloudName: CLOUDINARY_CLOUD_NAME,
        apiKey: CLOUDINARY_API_KEY,
        apiSecret: CLOUDINARY_API_SECRET,
    }
}

// GET /api/admin/check — lets the admin page verify the key and
// find out whether photo uploads are configured.
router.get("/check", (req, res) => {
    res.json({ ok: true, uploads: Boolean(cloudinaryConfig()) })
})

// GET /api/admin/upload-signature — signs a one-time upload so the browser
// can send a photo straight to Cloudinary without exposing the API secret.
router.get("/upload-signature", (req, res) => {
    const config = cloudinaryConfig()
    if (!config) {
        return res.status(503).json({
            error: "Photo uploads aren't set up: add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET on the server",
        })
    }
    const timestamp = Math.round(Date.now() / 1000)
    const paramsToSign = { folder: UPLOAD_FOLDER, timestamp }
    const signature = cloudinary.utils.api_sign_request(paramsToSign, config.apiSecret)
    res.json({
        cloudName: config.cloudName,
        apiKey: config.apiKey,
        folder: UPLOAD_FOLDER,
        timestamp,
        signature,
    })
})

export default router
