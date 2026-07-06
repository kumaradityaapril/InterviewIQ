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
        res.status(500).json({
            message: error.message || "Failed to generate interview report"
        })
    }
}



module.exports = {generateInterviewReportController}