const {GoogleGenAI} = require("@google/genai")

function getApiKeys() {
    const keys = [];
    if (process.env.GOOGLE_API_KEY) {
        keys.push(process.env.GOOGLE_API_KEY.trim());
    }
    if (process.env.GOOGLE_API_KEY_FALLBACK) {
        keys.push(...process.env.GOOGLE_API_KEY_FALLBACK.split(",").map(k => k.trim()).filter(Boolean));
    }
    if (process.env.GOOGLE_API_KEYS) {
        keys.push(...process.env.GOOGLE_API_KEYS.split(",").map(k => k.trim()).filter(Boolean));
    }
    return [...new Set(keys)];
}

function maskKey(key) {
    if (!key) return "undefined";
    if (key.length <= 8) return "***";
    return key.substring(0, 4) + "..." + key.substring(key.length - 4);
}

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

    const keys = getApiKeys();
    let lastError = null;

    if (keys.length > 0) {
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            try {
                console.log(`Attempting report generation with API Key [${i + 1}/${keys.length}]: ${maskKey(key)}`);
                const aiInstance = new GoogleGenAI({ apiKey: key });

                const response = await aiInstance.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: interviewReportSchema
                    }
                });

                console.log("AI Response generated successfully using Gemini API.");
                const result = JSON.parse(response.text);
                return {
                    ...result,
                    isMock: false
                };
            } catch (err) {
                console.error(`Gemini API key [${maskKey(key)}] failed:`, err.message || err);
                lastError = err;
                // Fall through to next iteration
            }
        }
    } else {
        console.warn("No Gemini API keys configured in environment variables.");
    }

    const mockFallbackEnabled = process.env.MOCK_FALLBACK !== "false";
    if (mockFallbackEnabled) {
        console.warn("All Gemini API keys failed or none provided. Falling back to dynamic Mock service.");
        const generateMockReport = require("./mock.service");
        return generateMockReport({ resume, selfdescription, jobdescription });
    }

    const error = new Error("Gemini AI API service is temporarily unavailable (all keys exhausted/expired).");
    error.name = "AiServiceUnavailableError";
    error.statusCode = 503;
    throw error;
}

module.exports = generateInterviewReport