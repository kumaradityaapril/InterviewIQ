const {GoogleGenAI} = require("@google/genai")
const {z} = require("zod")
const {zodToJsonSchema} = require("zod-to-json-schema")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
})



const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100).describe("The match score between the candidate's profile and the job description varies from 0 to 100"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interview behind asking this question"),
        answer: z.string().describe("How to answer this question,what points to cover,what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with intention and how to answer them"),

    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question can be asked in the interview"),
        intention: z.string().describe("The intention of interview behind asking this question"),
        answer: z.string().describe("How to answer this question,what points to cover,what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along"),

    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low","medium","high"]).describe("The severity of the skill gap")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),

    preparationPlan: z.array(z.object({
        day: z.number().describe("The day for which the preparation is planed"),
        focus: z.string().describe("The focus area for which the preparation is planed"),
        tasks: z.array(z.string()).describe("The tasks to be completed for the preparation")
    })).describe("The preparation plan for the candidate")


})

async function generateInterviewReport({ resume,selfdescription,jobdescription }){

    const prompt = `Generate an interview report for a candidate with the following details:
    Resume: ${resume}
    SelfDescription: ${selfdescription}
    Job Description: ${jobdescription}
    `

    const response = await ai.models.generateContent({
        model:"gemini-2.5-flash",
        contents:prompt,
        config:{
            responseMimeType:"application/json",
            responseJsonSchema: zodToJsonSchema(interviewReportSchema)
        }
    })

    return JSON.parse(response.text)
}

module.exports = generateInterviewReport