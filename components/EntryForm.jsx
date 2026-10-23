import { useState } from "react"
import { uploadPhoto, optimizedImage } from "../lib/cloudinary"

const blank = {
    title: "",
    country: "",
    dates: "",
    googleMapsLink: "",
    text: "",
    img: { src: "", alt: "" },
}

export default function EntryForm({ initial, adminKey, uploadsEnabled, onSave, onCancel }) {
    const [form, setForm] = useState(() => ({
        ...blank,
        ...initial,
        img: { ...blank.img, ...initial?.img },
    }))
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    function updateImg(field, value) {
        setForm((prev) => ({ ...prev, img: { ...prev.img, [field]: value } }))
    }

    async function handlePhoto(e) {
        const file = e.target.files?.[0]
        if (!file) return
        setError("")
        setUploading(true)
        try {
            const url = await uploadPhoto(file, adminKey)
            updateImg("src", url)
        } catch (err) {
            setError(err.message)
        } finally {
            setUploading(false)
            e.target.value = ""
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.img.src) {
            setError("Please add a photo.")
            return
        }
        setError("")
        setSaving(true)
        try {
            await onSave({
                title: form.title,
                country: form.country,
                dates: form.dates,
                googleMapsLink: form.googleMapsLink,
                text: form.text,
                img: { src: form.img.src, alt: form.img.alt || form.title },
            })
        } catch (err) {
            setError(err.message)
            setSaving(false)
        }
    }

    return (
        <form className="entry-form" onSubmit={handleSubmit}>
            <div className="photo-field">
                <div className="photo-preview">
                    {form.img.src
                        ? <img src={optimizedImage(form.img.src, 400)} alt="" />
                        : <span>No photo yet</span>}
                </div>
                <div className="photo-controls">
                    {uploadsEnabled ? (
                        <label className="button secondary">
                            {uploading ? "Uploading…" : form.img.src ? "Replace photo" : "Upload photo"}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhoto}
                                disabled={uploading}
                                hidden
                            />
                        </label>
                    ) : (
                        <p className="hint">Photo uploads aren't set up yet. Paste an image link below.</p>
                    )}
                    <label>
                        Image link
                        <input
                            type="url"
                            value={form.img.src}
                            onChange={(e) => updateImg("src", e.target.value)}
                            placeholder="https://…"
                        />
                    </label>
                    <label>
                        Photo description <span className="optional">(for screen readers)</span>
                        <input
                            value={form.img.alt}
                            onChange={(e) => updateImg("alt", e.target.value)}
                            placeholder="e.g. Mount Fuji at sunrise"
                        />
                    </label>
                </div>
            </div>

            <div className="field-row">
                <label>
                    Place
                    <input required value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Mount Fuji" />
                </label>
                <label>
                    Country
                    <input required value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="Japan" />
                </label>
            </div>

            <label>
                Dates
                <input value={form.dates} onChange={(e) => update("dates", e.target.value)} placeholder="12 Jan, 2021 - 24 Jan, 2021" />
            </label>

            <label>
                Google Maps link
                <input type="url" value={form.googleMapsLink} onChange={(e) => update("googleMapsLink", e.target.value)} placeholder="https://maps.app.goo.gl/…" />
            </label>

            <label>
                Description
                <textarea rows={4} value={form.text} onChange={(e) => update("text", e.target.value)} />
            </label>

            {error && <p className="form-error" role="alert">{error}</p>}

            <div className="form-actions">
                <button type="submit" className="button" disabled={saving || uploading}>
                    {saving ? "Saving…" : initial ? "Save changes" : "Add trip"}
                </button>
                <button type="button" className="button secondary" onClick={onCancel} disabled={saving}>
                    Cancel
                </button>
            </div>
        </form>
    )
}
