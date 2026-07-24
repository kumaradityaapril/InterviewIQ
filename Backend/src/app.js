const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))



const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.use("/api/auth", authRouter)
app.use("/api/interview",interviewRouter)

app.use((err, req, res, next) => {
    console.error("Global Catch - Unhandled Exception:", err);
    res.status(err.statusCode || 500).json({
        message: "An unexpected error occurred on the server. Please try again later."
    });
});

module.exports = app