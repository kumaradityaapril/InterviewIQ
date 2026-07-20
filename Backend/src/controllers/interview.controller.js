const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateFirstQuestion, evaluateResponseAndNextQuestion } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")
const practiceSessionModel = require("../models/practiceSession.model")

async function generateInterviewReportController(req,res){
    try {
        const resumeFile = req.file
        if (!resumeFile) {
            return res.status(400).json({ message: "Resume file is required" })
        }

        // Use PDFParse class constructor to parse PDF text
        const parser = new pdfParse.PDFParse({ data: resumeFile.buffer })
        const parsedPdf = await parser.getText()
        const resumeContent = parsedPdf.text

        const { selfdescription, jobdescription } = req.body

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent,
            selfdescription,
            jobdescription
        })

        // Map keys to match the Mongoose schema: jobDescription and selfDescription
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent,
            selfDescription: selfdescription,
            jobDescription: jobdescription,
            ...interviewReportByAi
        })

        res.status(201).json({
            message:"Interview Report generated successfully",
            interviewReport
        })
    } catch (error) {
        console.error("Error in generateInterviewReportController:", error)
        const statusCode = error.statusCode || 500
        res.status(statusCode).json({
            message: error.message || "Failed to generate interview report"
        })
    }
}



async function getUserReportsController(req,res){
    try {
        const reports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 })
        res.status(200).json({ reports })
    } catch (error) {
        console.error("Error in getUserReportsController:", error)
        res.status(500).json({
            message: error.message || "Failed to fetch user reports"
        })
    }
}

async function getReportByIdController(req,res){
    try {
        const report = await interviewReportModel.findOne({ _id: req.params.id, user: req.user.id })
        if (!report) {
            return res.status(404).json({ message: "Report not found" })
        }
        res.status(200).json({ report })
    } catch (error) {
        console.error("Error in getReportByIdController:", error)
        res.status(500).json({
            message: error.message || "Failed to fetch report details"
        })
    }
}

async function startPracticeSessionController(req, res) {
    try {
        const { reportId } = req.body;
        let report = null;
        if (reportId) {
            report = await interviewReportModel.findOne({ _id: reportId, user: req.user.id });
        } else {
            report = await interviewReportModel.findOne({ user: req.user.id }).sort({ createdAt: -1 });
        }

        if (!report) {
            return res.status(400).json({ message: "No report context found. Please generate an interview report first." });
        }

        const firstQuestionData = await generateFirstQuestion({
            resume: report.resume,
            selfdescription: report.selfDescription,
            jobdescription: report.jobDescription
        });

        res.status(200).json({
            question: firstQuestionData.question,
            context: {
                reportId: report._id,
                resume: report.resume,
                jobdescription: report.jobDescription,
                selfdescription: report.selfDescription
            }
        });
    } catch (error) {
        console.error("Error in startPracticeSessionController:", error);
        res.status(500).json({ message: error.message || "Failed to start practice session" });
    }
}

async function respondPracticeQuestionController(req, res) {
    try {
        const { reportId, currentQuestion, candidateAnswer, history, resume, jobdescription, selfdescription } = req.body;

        let contextResume = resume;
        let contextJD = jobdescription;
        let contextSelfDesc = selfdescription;

        if (!contextResume && reportId) {
            const report = await interviewReportModel.findOne({ _id: reportId, user: req.user.id });
            if (report) {
                contextResume = report.resume;
                contextJD = report.jobDescription;
                contextSelfDesc = report.selfDescription;
            }
        }

        if (!contextResume) {
            return res.status(400).json({ message: "No report context found." });
        }

        const evaluationData = await evaluateResponseAndNextQuestion({
            resume: contextResume,
            jobdescription: contextJD,
            selfdescription: contextSelfDesc,
            currentQuestion,
            candidateAnswer,
            history
        });

        res.status(200).json(evaluationData);
    } catch (error) {
        console.error("Error in respondPracticeQuestionController:", error);
        res.status(500).json({ message: error.message || "Failed to evaluate response" });
    }
}

async function savePracticeSessionController(req, res) {
    try {
        const { reportId, scorecard, overallScore } = req.body;

        if (!scorecard || scorecard.length === 0) {
            return res.status(400).json({ message: "No scorecard data provided." });
        }

        const formattedQuestions = scorecard.map(item => ({
            question: item.question,
            userAnswer: item.response || "",
            score: item.score || 0,
            feedback: item.feedback || "",
            matchedKeywords: item.keywords || []
        }));

        const newSession = new practiceSessionModel({
            user: req.user.id,
            report: reportId || null,
            overallScore: overallScore || 0,
            questions: formattedQuestions
        });

        await newSession.save();
        res.status(201).json({ message: "Practice session saved successfully", session: newSession });
    } catch (error) {
        console.error("Error in savePracticeSessionController:", error);
        res.status(500).json({ message: error.message || "Failed to save practice session" });
    }
}

async function getPracticeSessionsController(req, res) {
    try {
        const sessions = await practiceSessionModel.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate("report");
        res.status(200).json({ sessions });
    } catch (error) {
        console.error("Error in getPracticeSessionsController:", error);
        res.status(500).json({ message: error.message || "Failed to fetch practice sessions" });
    }
}

module.exports = {
    generateInterviewReportController,
    getUserReportsController,
    getReportByIdController,
    startPracticeSessionController,
    respondPracticeQuestionController,
    savePracticeSessionController,
    getPracticeSessionsController
}