/**
 * Mock Service to generate fallback interview reports.
 * Tailwind/Schema-compliant mock output tailored to candidate inputs.
 */

const SKILL_QUESTIONS = {
    react: {
        skill: "React",
        techQuestion: {
            question: "What is the difference between state and props in React, and when would you use Context API?",
            intention: "Evaluate the candidate's core understanding of React data flow and state management scaling.",
            answer: "Props are read-only inputs passed from parent to child, while state is local mutable data managed by the component. Context API is used for sharing global state to avoid prop-drilling, suitable for UI themes, auth, etc., but should be used sparingly to avoid unnecessary re-renders."
        },
        gapSeverity: "medium",
        gapReason: "React state management best practices"
    },
    node: {
        skill: "Node.js",
        techQuestion: {
            question: "Explain how the Node.js event loop works and how it handles asynchronous operations.",
            intention: "Test the candidate's understanding of single-threaded non-blocking I/O runtime mechanics.",
            answer: "Node.js runs on a single thread and uses libuv to delegate blocking tasks to a pool of background threads. Once these tasks complete, they place callback functions on queues, which are executed by the event loop during its phases (timers, pending callbacks, poll, check, close callbacks)."
        },
        gapSeverity: "medium",
        gapReason: "Asynchronous programming and Node.js event loop lifecycle"
    },
    javascript: {
        skill: "JavaScript",
        techQuestion: {
            question: "Explain closures in JavaScript and provide a practical use case.",
            intention: "Test fundamental JS scoping and lexical environment concepts.",
            answer: "A closure is the combination of a function bundled together with references to its surrounding state (lexical environment). Closures allow an inner function to access the scope of an outer function even after the outer function has returned. A common use case is data privacy (creating private variables) or creating factory functions."
        },
        gapSeverity: "low",
        gapReason: "ES6+ advanced scope and lexical environment behavior"
    },
    python: {
        skill: "Python",
        techQuestion: {
            question: "What is the difference between list and tuple in Python, and when would you use one over the other?",
            intention: "Assess understanding of Python basic data structures and mutability.",
            answer: "Lists are mutable, defined with square brackets, and consume slightly more memory. Tuples are immutable, defined with parentheses, faster, and can be used as dictionary keys."
        },
        gapSeverity: "low",
        gapReason: "Python memory optimization and collection types"
    },
    sql: {
        skill: "SQL Databases",
        techQuestion: {
            question: "What is the difference between an INNER JOIN, LEFT JOIN, and how would you optimize a slow database query?",
            intention: "Assess database querying knowledge and optimization techniques like indexes.",
            answer: "INNER JOIN returns matching records in both tables. LEFT JOIN returns all records from the left table and matched from the right. Slow queries can be optimized by adding indexes to frequently searched columns, avoiding SELECT *, analyzing execution plans (EXPLAIN), and normalizing/denormalizing schema where appropriate."
        },
        gapSeverity: "high",
        gapReason: "Database optimization, indexing, and query planning"
    },
    docker: {
        skill: "Docker / DevOps",
        techQuestion: {
            question: "What is the difference between a Docker Image and a Docker Container, and how do you reduce image size?",
            intention: "Check understanding of containerization and optimization techniques like multi-stage builds.",
            answer: "A Docker Image is a read-only template containing instructions to build a container. A Container is a runnable instance of an image. Image size can be reduced using alpine-based base images, minimizing layers, and leveraging multi-stage builds."
        },
        gapSeverity: "medium",
        gapReason: "Docker image optimization and multi-stage container builds"
    },
    aws: {
        skill: "AWS Cloud",
        techQuestion: {
            question: "Explain the difference between horizontal and vertical scaling on AWS, and which services support them.",
            intention: "Verify architecture design principles for cloud applications.",
            answer: "Vertical scaling (scaling up) means adding more power (CPU, RAM) to an existing server, e.g. resizing an EC2 instance. Horizontal scaling (scaling out) means adding more instances to your pool, e.g. using Auto Scaling Groups with Application Load Balancer. Horizontal scaling is generally preferred for high availability and elastic load response."
        },
        gapSeverity: "medium",
        gapReason: "Cloud architecture, scaling, and highly-available AWS resources"
    }
};

const DEFAULT_TECH_QUESTIONS = [
    {
        question: "Describe your approach to designing a RESTful API and handling error states gracefully.",
        intention: "Evaluate systemic software design thinking and understanding of status codes.",
        answer: "I structure APIs around resources using plural nouns (e.g. /users). I use standard HTTP verbs (GET, POST, PUT, DELETE) and return standard HTTP status codes (200, 201, 400, 401, 403, 404, 500) with a consistent error JSON body. I also handle exceptions globally using middleware."
    },
    {
        question: "How do you ensure web application security against vulnerabilities like XSS and CSRF?",
        intention: "Assess security awareness and best practices in modern web development.",
        answer: "To prevent XSS, I sanitize and escape all user input, use Content Security Policy headers, and avoid rendering unescaped HTML. For CSRF, I use anti-CSRF tokens, SameSite cookies, and ensure API endpoints require authorization headers like JWT."
    }
];

const BEHAVIORAL_QUESTIONS = [
    {
        question: "Tell me about a time you had a conflict with a team member. How did you resolve it?",
        intention: "Assess collaboration, communication, and conflict resolution skills.",
        answer: "I resolve conflicts by scheduling a private, constructive discussion where both sides present their perspectives. I focus on technical facts and shared project goals rather than personal differences, and if needed, seek a compromise or build a prototype to test both approaches."
    },
    {
        question: "Describe a situation where you had to meet a tight deadline but were running behind. What did you do?",
        intention: "Evaluate time management, delegation, prioritization, and communication under pressure.",
        answer: "I immediately analyzed the remaining tasks to identify the critical path. I communicated the bottleneck to my team lead early, proposing a revised scope to deliver the core functionality on time, while scheduling non-critical features for a post-launch patch."
    }
];

function generateMockInterviewReport({ resume = "", selfdescription = "", jobdescription = "" }) {
    const resumeText = resume.toLowerCase();
    const jdText = jobdescription.toLowerCase();

    // Heuristically detect matching skills in the JD
    const jdSkills = [];
    const matchedSkills = [];
    const missingSkills = [];

    for (const [key, meta] of Object.entries(SKILL_QUESTIONS)) {
        const hasInJD = jdText.includes(key) || jdText.includes(meta.skill.toLowerCase());
        const hasInResume = resumeText.includes(key) || resumeText.includes(meta.skill.toLowerCase());

        if (hasInJD) {
            jdSkills.push(meta);
            if (hasInResume) {
                matchedSkills.push(meta);
            } else {
                missingSkills.push(meta);
            }
        }
    }

    // Determine Match Score dynamically based on matches
    let matchScore = 70; // baseline
    if (jdSkills.length > 0) {
        matchScore = Math.round((matchedSkills.length / jdSkills.length) * 100);
    } else {
        // default baseline variations
        matchScore = Math.floor(Math.random() * 20) + 65; // 65 - 85
    }
    // Cap score boundaries
    matchScore = Math.max(15, Math.min(95, matchScore));

    // Construct Technical Questions
    const technicalQuestions = [];
    if (matchedSkills.length > 0) {
        // Add questions for candidate's matched skills to test proficiency
        matchedSkills.slice(0, 3).forEach(meta => {
            technicalQuestions.push(meta.techQuestion);
        });
    }
    
    // Fill up to at least 2 questions with default ones if needed
    while (technicalQuestions.length < 2) {
        const nextDefault = DEFAULT_TECH_QUESTIONS[technicalQuestions.length];
        if (nextDefault) {
            technicalQuestions.push(nextDefault);
        } else {
            break;
        }
    }

    // Construct Skill Gaps
    const skillGaps = [];
    if (missingSkills.length > 0) {
        missingSkills.slice(0, 3).forEach(meta => {
            skillGaps.push({
                skill: meta.skill,
                severity: meta.gapSeverity
            });
        });
    } else {
        // Default gap if everything matched
        skillGaps.push({
            skill: "System Architecture Design Scaling",
            severity: "low"
        });
    }

    // Construct Preparation Plan
    const focusSkills = skillGaps.map(g => g.skill).join(" & ") || "Full-Stack Development";
    const preparationPlan = [
        {
            day: 1,
            focus: "Fundamentals Refresh",
            tasks: [
                "Review theoretical core concepts of " + (matchedSkills[0]?.skill || "General Engineering"),
                "Refactor one existing mini-project to implement clean code standards",
                "Practice active self-explanation of data flow mechanisms"
            ]
        },
        {
            day: 2,
            focus: "Deep Dive on Key Gaps: " + (skillGaps[0]?.skill || "System Design"),
            tasks: [
                "Study documentation on " + (skillGaps[0]?.skill || "System Design best practices"),
                "Watch advanced tutorials or read architectural guides",
                "Draft a sample database schema or system architecture diagram to model scenarios"
            ]
        },
        {
            day: 3,
            focus: "Hands-on Practical Coding Exercises",
            tasks: [
                "Solve 3 medium-difficulty algorithmic problems",
                "Build a small service testing code integration with " + (skillGaps[1]?.skill || "associated libraries"),
                "Verify standard input error handling limits"
            ]
        },
        {
            day: 4,
            focus: "Behavioral Preparation & Mock Scenarios",
            tasks: [
                "Draft STAR method descriptions for 3 past key projects",
                "Prepare descriptions of leadership, conflict resolution, and technical problem-solving",
                "Conduct a mock interview recording your responses to analyze speech pacing"
            ]
        },
        {
            day: 5,
            focus: "Final Review & Warm-up",
            tasks: [
                "Execute light review of cheat-sheets and core syntax",
                "Simulate full interview simulation under time limits",
                "Sleep well and focus on positive communication delivery"
            ]
        }
    ];

    return {
        matchScore,
        technicalQuestions,
        behavioralQuestions: BEHAVIORAL_QUESTIONS,
        skillGaps,
        preparationPlan,
        isMock: true
    };
}

module.exports = generateMockInterviewReport;
