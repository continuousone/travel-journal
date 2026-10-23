import { useEffect, useState } from "react"
import Header from "./Header"
import EntryForm from "./EntryForm"
import { optimizedImage } from "../lib/cloudinary"

const KEY_STORAGE = "travel-journal-admin-key"

function loadKey() {
    try { return sessionStorage.getItem(KEY_STORAGE) || "" } catch { return "" }
}
function saveKey(key) {
    try {
        if (key) sessionStorage.setItem(KEY_STORAGE, key)
        else sessionStorage.removeItem(KEY_STORAGE)
    } catch { /* storage unavailable: key just won't be remembered */ }
}

async function api(path, { adminKey, method = "GET", body } = {}) {
    const res = await fetch(path, {
        method,
        headers: {
            ...(adminKey && { "x-admin-key": adminKey }),
            ...(body && { "content-type": "application/json" }),
        },
        body: body && JSON.stringify(body),
    })
    if (res.status === 204) return null
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
    return data
}

export default function Admin() {
    const [adminKey, setAdminKey] = useState("")
    const [keyInput, setKeyInput] = useState("")
    const [loginError, setLoginError] = useState("")
    const [checking, setChecking] = useState(true)
    const [uploadsEnabled, setUploadsEnabled] = useState(false)

    const [entries, setEntries] = useState([])
    const [editing, setEditing] = useState(null) // null | "new" | entry _id
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [message, setMessage] = useState("")

    async function tryKey(key) {
        setChecking(true)
        setLoginError("")
        try {
            const info = await api("/api/admin/check", { adminKey: key })
            setUploadsEnabled(info.uploads)
            setAdminKey(key)
            saveKey(key)
        } catch (err) {
            saveKey("")
            setLoginError(err.message.includes("admin key") ? "That key didn't work. Check it and try again." : err.message)
        } finally {
            setChecking(false)
        }
    }

    useEffect(() => {
        const stored = loadKey()
        if (stored) tryKey(stored)
        else setChecking(false)
    }, [])

    useEffect(() => {
        if (adminKey) refresh()
    }, [adminKey])

    async function refresh() {
        try {
            setEntries(await api("/api/entries"))
        } catch (err) {
            setMessage(err.message)
        }
    }

    async function handleSave(data) {
        if (editing === "new") {
            await api("/api/entries", { adminKey, method: "POST", body: data })
            setMessage(`Added “${data.title}”.`)
        } else {
            await api(`/api/entries/${editing}`, { adminKey, method: "PUT", body: data })
            setMessage(`Saved “${data.title}”.`)
        }
        setEditing(null)
        refresh()
    }

    async function handleDelete(entry) {
        try {
            await api(`/api/entries/${entry._id}`, { adminKey, method: "DELETE" })
            setMessage(`Deleted “${entry.title}”.`)
            setConfirmDelete(null)
            refresh()
        } catch (err) {
            setMessage(err.message)
        }
    }

    function logOut() {
        saveKey("")
        setAdminKey("")
        setKeyInput("")
        setEditing(null)
    }

    if (checking) {
        return (<><Header /><main className="container admin"><p className="status">Checking…</p></main></>)
    }

    if (!adminKey) {
        return (
            <>
                <Header />
                <main className="container admin">
                    <form
                        className="login"
                        onSubmit={(e) => { e.preventDefault(); tryKey(keyInput.trim()) }}
                    >
                        <h2>Edit your journal</h2>
                        <label>
                            Admin key
                            <input
                                type="password"
                                value={keyInput}
                                onChange={(e) => setKeyInput(e.target.value)}
                                autoFocus
                                required
                            />
                        </label>
                        <p className="hint">Find it in Render → your service → Environment → ADMIN_KEY.</p>
                        {loginError && <p className="form-error" role="alert">{loginError}</p>}
                        <button className="button" type="submit">Unlock</button>
                    </form>
                </main>
            </>
        )
    }

    return (
        <>
            <Header />
            <main className="container admin">
                <div className="admin-bar">
                    <h2>Edit your journal</h2>
                    <div className="admin-bar-actions">
                        <a href="/">View site</a>
                        <button className="link-button" onClick={logOut}>Lock</button>
                    </div>
                </div>

                {message && <p className="notice" role="status">{message}</p>}

                {editing === "new" ? (
                    <section className="admin-card">
                        <h3>New trip</h3>
                        <EntryForm
                            adminKey={adminKey}
                            uploadsEnabled={uploadsEnabled}
                            onSave={handleSave}
                            onCancel={() => setEditing(null)}
                        />
                    </section>
                ) : (
                    <button
                        className="button add-button"
                        onClick={() => { setEditing("new"); setMessage("") }}
                        disabled={editing !== null}
                    >
                        + Add a trip
                    </button>
                )}

                <ul className="admin-list">
                    {entries.map((entry) => (
                        <li key={entry._id} className="admin-card">
                            {editing === entry._id ? (
                                <>
                                    <h3>Editing {entry.title}</h3>
                                    <EntryForm
                                        initial={entry}
                                        adminKey={adminKey}
                                        uploadsEnabled={uploadsEnabled}
                                        onSave={handleSave}
                                        onCancel={() => setEditing(null)}
                                    />
                                </>
                            ) : (
                                <div className="admin-row">
                                    <img src={optimizedImage(entry.img.src, 160)} alt="" />
                                    <div className="admin-row-text">
                                        <strong>{entry.title}</strong>
                                        <span>{entry.country}{entry.dates && ` · ${entry.dates}`}</span>
                                    </div>
                                    {confirmDelete === entry._id ? (
                                        <div className="admin-row-actions">
                                            <span className="confirm-text">Delete this trip?</span>
                                            <button className="button danger" onClick={() => handleDelete(entry)}>Delete</button>
                                            <button className="button secondary" onClick={() => setConfirmDelete(null)}>Keep</button>
                                        </div>
                                    ) : (
                                        <div className="admin-row-actions">
                                            <button
                                                className="button secondary"
                                                onClick={() => { setEditing(entry._id); setMessage("") }}
                                                disabled={editing !== null}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="button secondary"
                                                onClick={() => setConfirmDelete(entry._id)}
                                                disabled={editing !== null}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </main>
        </>
    )
}
