import serveConfig from "./config/config";
import express from "express";
import pingRoute from "./routes/ping";
import courtsRoute from "./routes/courts";
import timeSlotsRoute from "./routes/timeSlots";
import bookingsRoute from "./routes/bookings";
import authRoute from "./routes/auth";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Routes
app.use("/api/check/v1", pingRoute);
app.use("/api/courts", courtsRoute);
app.use("/api/timeslots", timeSlotsRoute);
app.use("/api/bookings", bookingsRoute);
app.use("/api/auth", authRoute);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

export default app;
