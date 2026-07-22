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

const tailoredResumeSchema = {
    type: "OBJECT",
    properties: {
        fullName: {
            type: "STRING",
            description: "The full name of the candidate, parsed from their original resume."
        },
        title: {
            type: "STRING",
            description: "A tailored professional headline/title matching the target job (e.g. Senior Full Stack Engineer)."
        },
        contact: {
            type: "OBJECT",
            properties: {
                email: { type: "STRING" },
                phone: { type: "STRING" },
                location: { type: "STRING" },
                github: { type: "STRING" },
                linkedin: { type: "STRING" }
            },
            required: ["email"]
        },
        summary: {
            type: "STRING",
            description: "A professional summary (3-4 sentences) optimized for the job description, highlighting matching qualifications."
        },
        skills: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "Categorized skills (e.g. Languages: JavaScript, Python; Frameworks: React, Node) ordered by relevance to the job description."
        },
        experience: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    role: { type: "STRING" },
                    company: { type: "STRING" },
                    duration: { type: "STRING" },
                    bulletPoints: {
                        type: "ARRAY",
                        items: { type: "STRING" },
                        description: "Bullet points describing responsibilities and achievements, rewritten with strong action verbs and keyword optimized for the JD."
                    }
                },
                required: ["role", "company", "duration", "bulletPoints"]
            },
            description: "Work history items tailored to map to the target role's duties."
        },
        projects: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    name: { type: "STRING" },
                    technologies: { type: "STRING" },
                    bulletPoints: { type: "ARRAY", items: { type: "STRING" } }
                },
                required: ["name", "technologies", "bulletPoints"]
            }
        },
        education: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    degree: { type: "STRING" },
                    institution: { type: "STRING" },
                    year: { type: "STRING" }
                },
                required: ["degree", "institution"]
            }
        },
        certifications: {
            type: "ARRAY",
            items: { type: "STRING" }
        },
        achievements: {
            type: "ARRAY",
            items: { type: "STRING" }
        }
    },
    required: ["fullName", "title", "contact", "summary", "skills", "experience", "projects", "education", "certifications", "achievements"]
};

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

async function generateTailoredResume({ resume, jobdescription }) {
    const prompt = `You are an elite executive resume writer. Tailor the candidate's original resume details so they perfectly align with the target job description.
    Original Resume Content:
    ${resume}
    
    Target Job Description:
    ${jobdescription}
    
    Instructions:
    1. Budget the resume content strictly so it fits on a single A4 page. Limit the summary to max 2-3 sentences, experience history to the most relevant 2-3 roles, and restrict experience items to a maximum of 3 highly impactful bullet points.
    2. Keep the candidate's core accomplishments but rewrite summaries and experience bullets to emphasize matching technical/soft skills required by the job description.
    3. Use strong, action-oriented industry verbs (e.g. Architected, Engineered, Spearheaded, Optimized) and specify metrics/quantifications where present in the original resume.
    4. Categorize the skills list and order it by what is most critical for the job description.
    5. Map all parsed experiences and education carefully. Ensure none are lost.
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
                        responseSchema: tailoredResumeSchema
                    }
                });

                console.log("Tailored resume generated successfully using Gemini API.");
                return JSON.parse(response.text);
            } catch (err) {
                console.error(`Gemini API key [${maskKey(key)}] failed during resume tailoring:`, err.message || err);
            }
        }
    }

    console.warn("All Gemini API keys failed or none provided. Falling back to dynamic Mock resume.");
    return {
        fullName: "Candidate Name",
        title: "Software Engineer",
        contact: {
            email: "candidate@example.com",
            phone: "+1 (555) 019-2834",
            location: "San Francisco, CA",
            github: "github.com/candidate",
            linkedin: "linkedin.com/in/candidate"
        },
        summary: "High-performing and results-driven Software Engineer with extensive experience designing, building, and optimizing modern web applications. Expert in aligning technical deliverables with business goals to meet target job requirements.",
        skills: [
            "Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3, SQL",
            "Frameworks: React.js, Node.js, Express.js, Tailwind CSS",
            "Databases & Tools: MongoDB, PostgreSQL, Git, Docker, Jest"
        ],
        experience: [
            {
                role: "Senior Software Engineer",
                company: "Tech Solutions Inc.",
                duration: "2022 - Present",
                bulletPoints: [
                    "Spearheaded the migration of legacy frontend systems to React, increasing application performance by 35% and improving codebase maintainability.",
                    "Collaborated with cross-functional product teams to design scalable backend APIs using Node.js and Express, supporting 10k+ daily active users.",
                    "Implemented unit and integration tests using Jest and Supertest, boosting overall project code coverage from 60% to 88%."
                ]
            },
            {
                role: "Software Developer",
                company: "Innovate Web Corp",
                duration: "2020 - 2022",
                bulletPoints: [
                    "Designed and maintained responsive web interfaces utilizing HTML5, CSS3, and styled-components, improving mobile user retention by 20%.",
                    "Optimized database queries in MongoDB and PostgreSQL, reducing service latency by 120ms and accelerating page loads."
                ]
            }
        ],
        projects: [
            {
                name: "E-Commerce Microservices",
                technologies: "Node.js, Express, MongoDB, Docker",
                bulletPoints: [
                    "Architected robust, containerized microservice APIs supporting checkout operations, scaling customer throughput by 40%.",
                    "Integrated Stripe payment gateway and secure JWT token-based cookie validation protocols."
                ]
            }
        ],
        education: [
            {
                degree: "Bachelor of Science in Computer Science",
                institution: "State University",
                year: "2016 - 2020"
            }
        ],
        certifications: [
            "AWS Certified Solutions Architect",
            "Google Professional Cloud Developer"
        ],
        achievements: [
            "First Place winner in regional Hackathon out of 100+ competing developers",
            "Maintained 99.9% uptime SLA for primary client SaaS platform"
        ]
    };
}

async function generateCustomTailoredResume(formBody) {
    const prompt = `You are an elite executive resume writer. Take the candidate's custom input details and target job description, then generate a tailored LaTeX-styled resume JSON.
    
    Target Job Description:
    ${formBody.jobDescription}
    
    Candidate Custom Inputs:
    - Full Name: ${formBody.fullName}
    - Proposed Title: ${formBody.title}
    - Contact: ${JSON.stringify(formBody.contact)}
    - Summary (original): ${formBody.summary || 'None'}
    - Key Skills (original): ${JSON.stringify(formBody.skills || [])}
    - Experiences (original): ${JSON.stringify(formBody.experience || [])}
    - Projects (original): ${JSON.stringify(formBody.projects || [])}
    - Education (original): ${JSON.stringify(formBody.education || [])}
    - Certifications (original): ${JSON.stringify(formBody.certifications || [])}
    - Achievements (original): ${JSON.stringify(formBody.achievements || [])}
    
    Instructions:
    1. Budget the resume content strictly so it fits on a single A4 page. Limit the summary to max 2-3 sentences. Limit experiences to the most relevant 2-3 items, and restrict each to a max of 3 highly impactful bullet points. Limit projects to the most relevant 2 items with 2 bullet points each.
    2. Rewrite professional summaries, experience bullets, and project descriptions to integrate key skills and terminology matching the target Job Description. Use strong action verbs.
    3. Categorize the skills list and order it by critical relevance to the target job description.
    4. Return the response in strict JSON matching the schema. If any lists like projects, certifications, or achievements are empty, return them as empty arrays [].
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
                        responseSchema: tailoredResumeSchema
                    }
                });

                console.log("Custom tailored resume generated successfully using Gemini API.");
                return JSON.parse(response.text);
            } catch (err) {
                console.error(`Gemini API key [${maskKey(key)}] failed during custom resume tailoring:`, err.message || err);
            }
        }
    }

    console.warn("All Gemini API keys failed or none provided. Returning Mock tailored resume based on form inputs.");
    return {
        fullName: formBody.fullName || "Candidate Name",
        title: formBody.title || "Software Engineer",
        contact: formBody.contact || { email: "candidate@example.com", phone: "", location: "", github: "", linkedin: "" },
        summary: formBody.summary || "Results-oriented professional with specialized experience in modern software engineering.",
        skills: formBody.skills && formBody.skills.length > 0 ? formBody.skills : ["JavaScript", "React", "Node.js"],
        experience: formBody.experience && formBody.experience.length > 0 ? formBody.experience : [],
        projects: formBody.projects && formBody.projects.length > 0 ? formBody.projects : [],
        education: formBody.education && formBody.education.length > 0 ? formBody.education : [],
        certifications: formBody.certifications || [],
        achievements: formBody.achievements || []
    };
}

async function parseResumeToForm({ resume }) {
    const prompt = `You are an expert ATS data parser. Extract the structured details from the following raw resume text.
    Raw Resume Text:
    ${resume}
    
    Instructions:
    1. Extract the candidate's name, email, phone, location, LinkedIn, and GitHub links.
    2. Extract their skills and group/format them into categories (e.g., Languages: Javascript; Frameworks: React).
    3. Extract their work experience history (role, company, date range, bullet achievements).
    4. Extract their projects (name, tech stack, descriptions).
    5. Extract their education, certifications, and achievements.
    6. Return the data strictly in the requested JSON schema. If any section like projects or certifications is missing from the raw resume, return an empty array [] for those fields.
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
                        responseSchema: tailoredResumeSchema
                    }
                });

                console.log("Resume parsed to form successfully using Gemini.");
                return JSON.parse(response.text);
            } catch (err) {
                console.error(`Gemini parser key [${maskKey(key)}] failed:`, err.message || err);
            }
        }
    }

    console.warn("All Gemini API keys failed or none provided. Returning Mock parsed resume details.");
    return {
        fullName: "Candidate Name",
        title: "Software Engineer",
        contact: { email: "candidate@example.com", phone: "", location: "", github: "", linkedin: "" },
        skills: ["Languages: JavaScript, TypeScript", "Frameworks: React, Node.js"],
        experience: [{ role: "Software Engineer", company: "Tech Company", duration: "2022 - Present", bulletPoints: ["Developed scalable frontends", "Optimized database schemas"] }],
        projects: [{ name: "SaaS Dashboard", technologies: "React, MongoDB", bulletPoints: ["Built fully responsive customer metrics console"] }],
        education: [{ degree: "B.S. in Computer Science", institution: "University", year: "2020" }],
        certifications: [],
        achievements: []
    };
}

module.exports = {
    generateInterviewReport,
    generateFirstQuestion,
    evaluateResponseAndNextQuestion,
    generateTailoredResume,
    generateCustomTailoredResume,
    parseResumeToForm
};