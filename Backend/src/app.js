const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()
app.use(express.json())
app.use(cookieParser())
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.includes(origin) || 
                          origin.endsWith(".vercel.app") || 
                          origin.startsWith("http://localhost:") || 
                          origin.startsWith("http://127.0.0.1:");
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error("CORS Policy Violation: Request from unauthorized origin"));
        }
    },
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