const pdfParse = require("pdf-parse")
const generateInterviewReport = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

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

module.exports = {
    generateInterviewReportController,
    getUserReportsController,
    getReportByIdController
}