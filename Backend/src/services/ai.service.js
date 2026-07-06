const {GoogleGenAI} = require("@google/genai")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
})

const interviewReportSchema = {
    type: "OBJECT",
    properties: {
        matchScore: {
            type: "INTEGER",
            description: "The match score between the candidate's profile and the job description varies from 0 to 100"
        },
        technicalQuestions: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    question: { type: "STRING", description: "The technical question can be asked in the interview" },
                    intention: { type: "STRING", description: "The intention of interviewer behind asking this question" },
                    answer: { type: "STRING", description: "How to answer this question" }
                },
                required: ["question", "intention", "answer"]
            },
            description: "Technical questions that can be asked in the interview along with intention and how to answer them"
        },
        behavioralQuestions: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    question: { type: "STRING", description: "The behavioral question can be asked in the interview" },
                    intention: { type: "STRING", description: "The intention of interviewer behind asking this question" },
                    answer: { type: "STRING", description: "How to answer this question" }
                },
                required: ["question", "intention", "answer"]
            },
            description: "Behavioral questions that can be asked in the interview"
        },
        skillGaps: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    skill: { type: "STRING", description: "The skill which the candidate is lacking" },
                    severity: { type: "STRING", enum: ["low", "medium", "high"], description: "The severity of the skill gap" }
                },
                required: ["skill", "severity"]
            },
            description: "List of skill gaps in the candidate's profile along with their severity"
        },
        preparationPlan: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    day: { type: "INTEGER", description: "The day for which the preparation is planned" },
                    focus: { type: "STRING", description: "The focus area for which the preparation is planned" },
                    tasks: {
                        type: "ARRAY",
                        items: { type: "STRING" },
                        description: "The tasks to be completed for the preparation"
                    }
                },
                required: ["day", "focus", "tasks"]
            },
            description: "The preparation plan for the candidate"
        }
    },
    required: ["matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"]
}

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
            responseSchema: interviewReportSchema
        }
    })

    console.log("AI Response Text:", response.text)
    return JSON.parse(response.text)
}

module.exports = generateInterviewReport