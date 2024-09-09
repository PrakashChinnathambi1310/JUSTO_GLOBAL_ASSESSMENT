import express, { json } from "express";
import compression from "compression";
import appRoutes from "./routes/app.route.js";
import { initializeDbConnection } from "./database/db.js";
import { config } from "./config/app.config.js";
const app = express();

app.use(compression());
app.use(express.json());

app.use("/api/v1", appRoutes);

// Catch-all for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(config.PORT, async () => [await initializeDbConnection()]);
