const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}))



const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.get("/", (req, res) => {
    res.json({
        status: "healthy",
        service: "InterviewIQ API Server",
        message: "API routes are operational at /api/auth and /api/interview"
    });
});

app.use("/api/auth", authRouter)
app.use("/api/interview",interviewRouter)

app.use((err, req, res, next) => {
    console.error("Global Catch - Unhandled Exception:", err);
    res.status(err.statusCode || 500).json({
        message: "An unexpected error occurred on the server. Please try again later."
    });
});

module.exports = app