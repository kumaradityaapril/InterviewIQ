const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")
const { authedRateLimiter } = require("../middlewares/rateLimiter.middleware")
const validate = require("../middlewares/validate.middleware")
const {
    generateReportSchema,
    startPracticeSchema,
    respondPracticeSchema,
    savePracticeSchema,
    tailorCustomResumeSchema,
    paramsIdSchema
} = require("../validation/schemas")

const interviewRouter = express.Router()

interviewRouter.use(authedRateLimiter)

interviewRouter.post("/",authMiddleware.authUser,upload,validate(generateReportSchema),interviewController.generateInterviewReportController)
interviewRouter.get("/",authMiddleware.authUser,interviewController.getUserReportsController)
interviewRouter.post("/practice/start",authMiddleware.authUser,validate(startPracticeSchema),interviewController.startPracticeSessionController)
interviewRouter.post("/practice/respond",authMiddleware.authUser,validate(respondPracticeSchema),interviewController.respondPracticeQuestionController)
interviewRouter.post("/practice/save",authMiddleware.authUser,validate(savePracticeSchema),interviewController.savePracticeSessionController)
interviewRouter.get("/practice/history",authMiddleware.authUser,interviewController.getPracticeSessionsController)
interviewRouter.get("/:id",authMiddleware.authUser,validate(paramsIdSchema),interviewController.getReportByIdController)
interviewRouter.get("/reports/:id/tailor",authMiddleware.authUser,validate(paramsIdSchema),interviewController.tailorResumeController)
interviewRouter.post("/resume/tailor-custom",authMiddleware.authUser,validate(tailorCustomResumeSchema),interviewController.tailorCustomResumeController)
interviewRouter.get("/reports/:id/parse-resume-to-form",authMiddleware.authUser,validate(paramsIdSchema),interviewController.parseResumeToFormController)

module.exports = interviewRouter
