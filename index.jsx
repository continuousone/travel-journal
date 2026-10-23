import {createRoot} from "react-dom/client"
import App from "./App"
import Admin from "./components/Admin"
import "./index.css"

const isAdmin = window.location.pathname.replace(/\/+$/, "") === "/admin"

const root = createRoot(document.getElementById("root"))
root.render(isAdmin ? <Admin /> : <App />)
