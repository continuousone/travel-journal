// Protects write routes: the request must send the ADMIN_KEY in an
// `x-admin-key` header. If ADMIN_KEY isn't set, writes are disabled.
export default function requireAdmin(req, res, next) {
    const key = process.env.ADMIN_KEY
    if (!key) {
        return res.status(403).json({ error: "Writes are disabled: ADMIN_KEY is not set on the server" })
    }
    if (req.get("x-admin-key") !== key) {
        return res.status(401).json({ error: "Missing or invalid admin key" })
    }
    next()
}
