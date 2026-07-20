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

const firstQuestionSchema = {
    type: "OBJECT",
    properties: {
        question: {
            type: "STRING",
            description: "The first interview question to ask the candidate based on their profile and the job description."
        }
    },
    required: ["question"]
};

const evaluationResponseSchema = {
    type: "OBJECT",
    properties: {
        score: {
            type: "INTEGER",
            description: "The score out of 100 evaluating the quality, technical accuracy, and completeness of the candidate's response."
        },
        feedback: {
            type: "STRING",
            description: "Detailed, constructive feedback on the response, highlighting strengths and specific areas of improvement."
        },
        matchedKeywords: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "Key technical terms, skills, or professional concepts that the candidate successfully mentioned."
        },
        nextQuestion: {
            type: "STRING",
            description: "The next highly relevant follow-up question to ask the candidate, or null/empty if the interview is finished."
        },
        isFinished: {
            type: "BOOLEAN",
            description: "True if the session has reached 3-4 questions or should conclude based on candidate replies, false otherwise."
        }
    },
    required: ["score", "feedback", "matchedKeywords", "nextQuestion", "isFinished"]
};

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

async function generateFirstQuestion({ resume, selfdescription, jobdescription }) {
    const prompt = `You are a professional interviewer starting a technical or behavioral interview for this position.
    Job Description: ${jobdescription}
    Candidate Resume: ${resume}
    Candidate Self Description: ${selfdescription}
    
    Generate the first highly relevant, professional interview question to ask the candidate. The question should be conversational, specific, and challenge their experience.
    `;

    const keys = getApiKeys();
    if (keys.length > 0) {
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            try {
                const aiInstance = new GoogleGenAI({ apiKey: key });
                const response = await aiInstance.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: firstQuestionSchema
                    }
                });
                return JSON.parse(response.text);
            } catch (err) {
                console.error(`Gemini generateFirstQuestion failed on key ${i}:`, err.message || err);
            }
        }
    }
    
    return {
        question: "Can you start by describing your core experience with full-stack development, and how you typically design RESTful APIs?"
    };
}

async function evaluateResponseAndNextQuestion({
    resume,
    selfdescription,
    jobdescription,
    currentQuestion,
    candidateAnswer,
    history
}) {
    const historyText = history
        ? history.map(h => `${h.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${h.content}`).join("\n")
        : "";

    const prompt = `You are an expert technical recruiter conducting an interview for this candidate.
    Job Description: ${jobdescription}
    Candidate Resume: ${resume}
    Candidate Self Description: ${selfdescription}
    
    Here is the interview history so far:
    ${historyText}
    
    Current Question: ${currentQuestion}
    Candidate's Response: ${candidateAnswer}
    
    Evaluate the response. Grade it on:
    - Technical correctness & accuracy.
    - Relevance to the question.
    - Answering structure (e.g. STAR method).
    
    Generate the next follow-up question. If this is the 3rd or 4th question in the interview history, set isFinished to true and nextQuestion to null.
    `;

    const keys = getApiKeys();
    if (keys.length > 0) {
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            try {
                const aiInstance = new GoogleGenAI({ apiKey: key });
                const response = await aiInstance.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: evaluationResponseSchema
                    }
                });
                return JSON.parse(response.text);
            } catch (err) {
                console.error(`Gemini evaluateResponseAndNextQuestion failed on key ${i}:`, err.message || err);
            }
        }
    }

    const mockWordCount = candidateAnswer.split(/\s+/).length;
    return {
        score: mockWordCount > 20 ? 80 : 50,
        feedback: "API services are offline. Mock Evaluation: Your response was received. Try adding more concrete technical examples to describe your workflow.",
        matchedKeywords: ["React", "JavaScript"],
        nextQuestion: "Can you detail a complex problem you resolved in your last role?",
        isFinished: history && history.length >= 6
    };
}

module.exports = {
    generateInterviewReport,
    generateFirstQuestion,
    evaluateResponseAndNextQuestion
};