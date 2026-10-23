import { useEffect, useState } from "react"
import Header from "./components/Header"
import Entry from "./components/Entry"

export default function App() {
    const [entries, setEntries] = useState([])
    const [status, setStatus] = useState("loading") // loading | ready | error

    useEffect(() => {
        fetch("/api/entries")
            .then((res) => {
                if (!res.ok) throw new Error(`Request failed: ${res.status}`)
                return res.json()
            })
            .then((data) => {
                setEntries(data)
                setStatus("ready")
            })
            .catch((err) => {
                console.error(err)
                setStatus("error")
            })
    }, [])

    const entryElements = entries.map((entry) => {
        return (
            <Entry
                key={entry._id}
                {...entry}
            />
        )
    })

    return (
        <>
            <Header />
            <main className="container">
                {status === "loading" && <p className="status">Loading entries…</p>}
                {status === "error" && <p className="status">Couldn't load entries. Please try again later.</p>}
                {status === "ready" && entries.length === 0 && <p className="status">No entries yet.</p>}
                {entryElements}
            </main>
        </>
    )
}
