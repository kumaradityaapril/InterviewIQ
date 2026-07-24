const { z } = require("zod");

// MongoDB 24-character hex ID validator
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Mongo ID format");

// Authentication Payloads
const registerSchema = z.object({
    body: z.object({
        username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username too long").regex(/^[a-zA-Z0-9_ ]+$/, "Letters, numbers, spaces and underscores only"),
        email: z.string().email("Invalid email address format"),
        password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long")
    }).strict()
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address format"),
        password: z.string().min(1, "Password is required").max(100)
    }).strict()
});

const googleLoginSchema = z.object({
    body: z.object({
        token: z.string().min(1, "Google token is required")
    }).strict()
});

const updateProfileSchema = z.object({
    body: z.object({
        username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_ ]+$/, "Letters, numbers, spaces and underscores only").optional(),
        password: z.string().min(6).max(100).optional()
    }).strict()
});

// Interview & Practice Payloads
const generateReportSchema = z.object({
    body: z.object({
        jobdescription: z.string().min(10, "Job description must be at least 10 characters").max(10000),
        selfdescription: z.string().max(10000).optional().or(z.literal(""))
    }).strict()
});

const startPracticeSchema = z.object({
    body: z.object({
        reportId: objectIdSchema
    }).strict()
});

const respondPracticeSchema = z.object({
    body: z.object({
        sessionId: objectIdSchema,
        question: z.string().min(1, "Question cannot be empty"),
        userAnswer: z.string().min(1, "Answer cannot be empty").max(10000)
    }).strict()
});

const savePracticeSchema = z.object({
    body: z.object({
        sessionId: objectIdSchema
    }).strict()
});

// Custom LaTeX Resume Payload
const tailorCustomResumeSchema = z.object({
    body: z.object({
        jobDescription: z.string().min(10, "Job description must be at least 10 characters"),
        fullName: z.string().min(2, "Full Name must be at least 2 characters").max(50),
        title: z.string().min(2, "Title must be at least 2 characters").max(50),
        contact: z.object({
            email: z.string().email("Invalid contact email format"),
            phone: z.string().max(20).optional().or(z.literal("")),
            location: z.string().max(100).optional().or(z.literal("")),
            github: z.string().max(100).optional().or(z.literal("")),
            linkedin: z.string().max(100).optional().or(z.literal(""))
        }).strict(),
        skills: z.array(z.string()),
        experience: z.array(
            z.object({
                role: z.string().min(1, "Role is required"),
                company: z.string().min(1, "Company is required"),
                duration: z.string().min(1, "Duration is required"),
                bulletPoints: z.array(z.string())
            }).strict()
        ),
        projects: z.array(
            z.object({
                name: z.string().min(1, "Project name is required"),
                technologies: z.string().min(1, "Technologies list is required"),
                bulletPoints: z.array(z.string())
            }).strict()
        ),
        education: z.array(
            z.object({
                degree: z.string().min(1, "Degree is required"),
                institution: z.string().min(1, "Institution is required"),
                year: z.string().optional().or(z.literal(""))
            }).strict()
        ),
        certifications: z.array(z.string()),
        achievements: z.array(z.string())
    }).strict()
});

// ID parameters validation (e.g. GET /reports/:id)
const paramsIdSchema = z.object({
    params: z.object({
        id: objectIdSchema
    }).strict()
});

module.exports = {
    registerSchema,
    loginSchema,
    googleLoginSchema,
    updateProfileSchema,
    generateReportSchema,
    startPracticeSchema,
    respondPracticeSchema,
    savePracticeSchema,
    tailorCustomResumeSchema,
    paramsIdSchema
};
