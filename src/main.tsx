import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { DataService } from "./lib/data-service";

// Initialize database if available
DataService.initializeDatabase().catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);
