const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")
const { authedRateLimiter } = require("../middlewares/rateLimiter.middleware")

const interviewRouter = express.Router()

interviewRouter.use(authedRateLimiter)

interviewRouter.post("/",authMiddleware.authUser,upload.single("resume"),interviewController.generateInterviewReportController)
interviewRouter.get("/",authMiddleware.authUser,interviewController.getUserReportsController)
interviewRouter.post("/practice/start",authMiddleware.authUser,interviewController.startPracticeSessionController)
interviewRouter.post("/practice/respond",authMiddleware.authUser,interviewController.respondPracticeQuestionController)
interviewRouter.post("/practice/save",authMiddleware.authUser,interviewController.savePracticeSessionController)
interviewRouter.get("/practice/history",authMiddleware.authUser,interviewController.getPracticeSessionsController)
interviewRouter.get("/:id",authMiddleware.authUser,interviewController.getReportByIdController)
interviewRouter.get("/reports/:id/tailor",authMiddleware.authUser,interviewController.tailorResumeController)
interviewRouter.post("/resume/tailor-custom",authMiddleware.authUser,interviewController.tailorCustomResumeController)
interviewRouter.get("/reports/:id/parse-resume-to-form",authMiddleware.authUser,interviewController.parseResumeToFormController)

module.exports = interviewRouter
