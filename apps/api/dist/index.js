import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import riskEventsRoutes from "./routes/risk-events";
import transfersRoutes from "./routes/transfers";
import savingsRoutes from "./routes/savings";
import cryptoRoutes from "./routes/crypto";
import businessRoutes from "./routes/business";
const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.get("/health", (_, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.use("/api/auth", authRoutes);
app.use("/api/risk-events", riskEventsRoutes);
app.use("/api/transfers", transfersRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/crypto", cryptoRoutes);
app.use("/api/business", businessRoutes);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});
