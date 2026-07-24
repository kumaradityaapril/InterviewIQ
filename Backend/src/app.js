const express = require("express")
const cookieParser = require("cookie-parser")

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
        "http://localhost:5173",
        process.env.FRONTEND_URL
    ].filter(Boolean);
    
    const isAllowed = !origin || 
                      allowedOrigins.includes(origin) || 
                      origin.endsWith(".vercel.app") || 
                      origin.startsWith("http://localhost:") || 
                      origin.startsWith("http://127.0.0.1:");
                      
    if (isAllowed) {
        res.setHeader("Access-Control-Allow-Origin", origin || "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie");
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
});



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