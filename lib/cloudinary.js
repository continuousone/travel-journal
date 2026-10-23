const MAX_BYTES = 10 * 1024 * 1024 // Cloudinary free plan: 10 MB per image

// Uploads a photo straight from the browser to Cloudinary, using a
// one-time signature from our server. Returns the image's https URL.
export async function uploadPhoto(file, adminKey) {
    if (!file.type.startsWith("image/")) {
        throw new Error("Please choose an image file.")
    }
    if (file.size > MAX_BYTES) {
        throw new Error("That photo is over 10 MB. Please choose a smaller one.")
    }

    const sigRes = await fetch("/api/admin/upload-signature", {
        headers: { "x-admin-key": adminKey },
    })
    const sig = await sigRes.json()
    if (!sigRes.ok) throw new Error(sig.error || "Couldn't start the upload.")

    const form = new FormData()
    form.append("file", file)
    form.append("api_key", sig.apiKey)
    form.append("timestamp", sig.timestamp)
    form.append("signature", sig.signature)
    form.append("folder", sig.folder)

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
        method: "POST",
        body: form,
    })
    const result = await uploadRes.json()
    if (!uploadRes.ok) throw new Error(result.error?.message || "Upload failed.")
    return result.secure_url
}

// For Cloudinary images, ask for a resized, auto-compressed version.
// Other image URLs are returned unchanged.
export function optimizedImage(url, width) {
    if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url
    return url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`)
}
