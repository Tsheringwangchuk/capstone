// server.js (or index.js)

const dotenv = require('dotenv');
dotenv.config();

const express = require("express");
const cors = require("cors");
const app = express();      // ← if you haven’t already created an Express instance inside app.js, do it here
const prisma = require("./lib/prisma");

// ① Enable JSON parsing
app.use(express.json());

// ② Enable CORS for your React frontend
//    – If you only want to allow http://localhost:3000, do:
// app.use(cors({ origin: "http://localhost:3000" }));
//
//    – If you don’t care about restricting origins in development, you can allow everything:
// app.use(cors());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ③ Register your routes (for example, registrationDetails)
const registrationRoutes = require("./routes/registrationRoutes");
app.use("/api/v1/registrationDetails", registrationRoutes);

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connection successful");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

const port = process.env.PORT || 4001;

async function startServer() {
  await testConnection();

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}...`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
