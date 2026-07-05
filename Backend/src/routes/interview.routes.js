const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")

const interviewRouter = express.Router()

interviewRouter.post("/",authMiddleware.authUser)


module.exports = interviewRouter