import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router'
import { startPracticeSession, respondPracticeQuestion, savePracticeSession } from '../services/interview.api'
import { useAuth } from '../../auth/hooks/useAuth'
import Tech3DBackground from '../components/Tech3DBackground'
import Tilt3D from '../components/Tilt3D'

const Practice = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { handleLogout } = useAuth()

    // Read reportId from query parameter
    const searchParams = new URLSearchParams(location.search);
    const reportId = searchParams.get("reportId");

    const [questions, setQuestions] = useState([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [userResponse, setUserResponse] = useState("")
    const [isVideoOff, setIsVideoOff] = useState(false)
    
    // Voice agent specific states
    const [hasStarted, setHasStarted] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [isAiSpeaking, setIsAiSpeaking] = useState(false)
    const [recognition, setRecognition] = useState(null)
    const [speechSupported, setSpeechSupported] = useState(true)

    // Interactive session & LLM states
    const [context, setContext] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isThinking, setIsThinking] = useState(false)
    const [history, setHistory] = useState([]) // list of { role: 'interviewer'|'candidate', content: string }
    const [scorecard, setScorecard] = useState([]) // list of { question, response, score, feedback, keywords }
    const [showResults, setShowResults] = useState(false)

    // Real-time speech analysis states
    const [wordsPerMin, setWordsPerMin] = useState(0)
    const [starScore, setStarScore] = useState({ s: 0, t: 0, a: 0, r: 0 })
    const [detectedKeywords, setDetectedKeywords] = useState([])
    const [liveMatchScore, setLiveMatchScore] = useState(50)
    const [targetKeywords, setTargetKeywords] = useState(["stakeholders", "alignment", "data-driven", "scalability", "agile", "consistency", "latency", "testing"])

    const responseStartTimeRef = useRef(null)

    // Dynamic target keywords generation based on current question topic
    useEffect(() => {
        if (questions && questions[currentQuestionIndex]) {
            const currentQ = questions[currentQuestionIndex];
            const qLower = currentQ.toLowerCase();
            let keywords = [];
            if (qLower.includes("system") || qLower.includes("scale") || qLower.includes("design") || qLower.includes("architecture") || qLower.includes("database") || qLower.includes("cache") || qLower.includes("load") || qLower.includes("latency") || qLower.includes("shard")) {
                keywords = ["scalability", "latency", "database", "caching", "throughput", "redundancy", "consistency", "load-balancer"];
            } else if (qLower.includes("team") || qLower.includes("conflict") || qLower.includes("disagree") || qLower.includes("leader") || qLower.includes("priorit") || qLower.includes("project")) {
                keywords = ["alignment", "stakeholders", "collaboration", "conflict", "priority", "agile", "communication", "delivery"];
            } else {
                keywords = ["problem-solving", "testing", "optimization", "collaboration", "scalability", "refactoring", "security", "monitoring"];
            }
            setTargetKeywords(keywords);
        }
    }, [questions, currentQuestionIndex]);

    // Initialize Web Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSpeechSupported(false);
            return;
        }

        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript + ' ';
            }
            setUserResponse(transcript);
        };

        rec.onerror = (e) => {
            console.error("Speech Recognition Error:", e);
            if (e.error === 'not-allowed') {
                alert("Microphone permission was denied. Please allow microphone access in your browser settings.");
                setIsListening(false);
            }
        };

        rec.onend = () => {
            // Keep listening if state is still true
            if (isListening) {
                try {
                    rec.start();
                } catch (err) {
                    // Ignore start errors on boundary
                }
            }
        };

        setRecognition(rec);
    }, [isListening]);

    // Manage starting/stopping the speech recognition engine based on isListening state
    useEffect(() => {
        if (!recognition) return;

        if (isListening) {
            try {
                recognition.start();
                console.log("Speech recognition active.");
            } catch (e) {
                console.error("Error starting speech recognition:", e);
            }
        } else {
            try {
                recognition.stop();
                console.log("Speech recognition inactive.");
            } catch (e) {
                // Ignore if recognition already stopped
            }
        }
    }, [isListening, recognition]);

    // Speak a question using Web Speech Synthesis API
    const speakQuestion = (text) => {
        if (!('speechSynthesis' in window)) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        // Stop listening while AI is speaking to prevent transcribing the speaker audio
        setIsListening(false);

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Load voices dynamically
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) 
                             || voices.find(v => v.lang.startsWith('en')) 
                             || voices[0];
                             
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        utterance.onstart = () => {
            setIsAiSpeaking(true);
        };
        
        utterance.onend = () => {
            setIsAiSpeaking(false);
            // Automatically start listening after question completes
            setIsListening(true);
        };
        
        utterance.onerror = () => {
            setIsAiSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    // Clean up speech synthesis & recognition on unmount
    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            if (recognition) {
                recognition.stop();
            }
        };
    }, [recognition]);

    // Load first question & context from report on mount
    useEffect(() => {
        const initPractice = async () => {
            try {
                setLoading(true);
                const data = await startPracticeSession(reportId);
                if (data && data.question) {
                    setQuestions([data.question]);
                    setContext(data.context);
                    setHistory([{ role: 'interviewer', content: data.question }]);
                }
            } catch (err) {
                console.error("Could not load practice session:", err);
            } finally {
                setLoading(false);
            }
        };
        initPractice();
    }, [reportId]);

    const startSession = () => {
        setHasStarted(true);
        // Small delay to ensure synthesis engine is unlocked by click interaction
        setTimeout(() => {
            if (questions.length > 0) {
                speakQuestion(questions[0]);
            }
        }, 100);
    };

    // Real-time text analysis logic
    useEffect(() => {
        if (!userResponse.trim()) {
            setWordsPerMin(0)
            setStarScore({ s: 0, t: 0, a: 0, r: 0 })
            setDetectedKeywords([])
            setLiveMatchScore(50)
            responseStartTimeRef.current = null
            return
        }

        // Initialize start time on first character/word
        if (!responseStartTimeRef.current) {
            responseStartTimeRef.current = Date.now()
        }

        const words = userResponse.trim().split(/\s+/)
        const wordCount = words.length
        
        // Dynamic pacing calculation based on actual elapsed time
        const elapsedTimeMs = Date.now() - responseStartTimeRef.current
        const elapsedSeconds = elapsedTimeMs / 1000
        
        let calculatedWpm = 0
        if (elapsedSeconds > 1.5) {
            calculatedWpm = Math.round((wordCount / elapsedSeconds) * 60)
            // Constrain between reasonable metrics for visual stability
            calculatedWpm = Math.min(220, Math.max(40, calculatedWpm))
        } else {
            calculatedWpm = 135 // optimal default starting point
        }
        setWordsPerMin(calculatedWpm)

        // STAR detection based on semantic content cues
        const lowerResponse = userResponse.toLowerCase()

        // S: Situation (past context, team context, problems)
        const situationKeywords = ["when", "at my", "previous", "company", "client", "team", "situation", "problem", "issue", "challenge", "project", "background", "context", "before"]
        const sMatches = situationKeywords.filter(k => lowerResponse.includes(k)).length
        const sScore = Math.min(100, Math.round((sMatches / 3) * 100))

        // T: Task (responsibility, goals, expectations)
        const taskKeywords = ["responsible", "task", "my goal", "need to", "had to", "required", "expected", "duty", "objective", "assignment", "deliverable"]
        const tMatches = taskKeywords.filter(k => lowerResponse.includes(k)).length
        const tScore = Math.min(100, Math.round((tMatches / 2) * 100))

        // A: Action (concrete engineering work done, implementation details)
        const actionKeywords = ["designed", "implemented", "created", "built", "refactored", "led", "developed", "resolved", "collaborated", "wrote", "optimized", "fixed", "deployed", "code", "system"]
        const aMatches = actionKeywords.filter(k => lowerResponse.includes(k)).length
        const aScore = Math.min(100, Math.round((aMatches / 4) * 100))

        // R: Result (outcomes, success, numbers, percentages, metrics)
        const resultKeywords = ["result", "outcome", "reduced", "increased", "improved", "metrics", "percent", "saved", "successfully", "achieved", "consequently", "impact", "%", "seconds", "ms"]
        const rMatches = resultKeywords.filter(k => lowerResponse.includes(k)).length
        const rScore = Math.min(100, Math.round((rMatches / 2) * 100))

        setStarScore({ s: sScore, t: tScore, a: aScore, r: rScore })

        // Dynamic Keyword checking
        const foundKeywords = targetKeywords.filter(k => lowerResponse.includes(k))
        setDetectedKeywords(foundKeywords)

        // Live match score calculation based on STAR structure, WPM pacing appropriateness, and keywords matching
        // Pacing score: WPM between 110-170 gets optimal points
        const pacingDiff = Math.abs(calculatedWpm - 140)
        const pacingScore = Math.max(0, 30 - pacingDiff * 0.4)

        const starAvg = (sScore + tScore + aScore + rScore) / 4
        const starComponent = (starAvg / 100) * 35

        const keywordComponent = targetKeywords.length > 0
            ? (foundKeywords.length / targetKeywords.length) * 35
            : 0

        const finalScore = Math.min(100, Math.round(30 + pacingScore + starComponent + keywordComponent))
        setLiveMatchScore(finalScore)

    }, [userResponse, targetKeywords])

    const handleNextQuestion = async () => {
        if (!userResponse.trim() || isThinking) return;

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsListening(false);
        setIsThinking(true);

        const currentQuestion = questions[currentQuestionIndex];
        const candidateAnswer = userResponse.trim();

        // Update history with candidate response
        const newHistory = [
            ...history,
            { role: 'candidate', content: candidateAnswer }
        ];
        setHistory(newHistory);

        try {
            // Request evaluation and next question from backend (using Gemini)
            const evaluation = await respondPracticeQuestion({
                reportId: context?.reportId,
                currentQuestion,
                candidateAnswer,
                history: newHistory,
                resume: context?.resume,
                jobdescription: context?.jobdescription,
                selfdescription: context?.selfdescription
            });

            // Log item on scorecard
            const newScorecard = [
                ...scorecard,
                {
                    question: currentQuestion,
                    response: candidateAnswer,
                    score: evaluation.score,
                    feedback: evaluation.feedback,
                    keywords: evaluation.matchedKeywords
                }
            ];

            if (evaluation.isFinished || !evaluation.nextQuestion) {
                // Save session in database for future review
                const total = newScorecard.reduce((sum, item) => sum + item.score, 0);
                const avg = newScorecard.length > 0 ? Math.round(total / newScorecard.length) : 0;
                
                await savePracticeSession({
                    reportId: context?.reportId,
                    scorecard: newScorecard,
                    overallScore: avg
                });

                setScorecard(newScorecard);
                setShowResults(true);
            } else {
                // Update history with interviewer follow-up
                const updatedHistory = [
                    ...newHistory,
                    { role: 'interviewer', content: evaluation.nextQuestion }
                ];
                setHistory(updatedHistory);

                // Add next question and step forward
                setQuestions(prev => [...prev, evaluation.nextQuestion]);
                setScorecard(newScorecard);
                setCurrentQuestionIndex(prev => prev + 1);
                setUserResponse("");
                
                // Speak next question
                setTimeout(() => {
                    speakQuestion(evaluation.nextQuestion);
                }, 300);
            }
        } catch (err) {
            console.error("Evaluation error:", err);
            alert("The AI Interviewer encountered an issue. Please try submitting again.");
        } finally {
            setIsThinking(false);
        }
    }

    const handleEndSessionEarly = async () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsListening(false);

        // If they have not answered anything at all, just return home
        if (scorecard.length === 0 && !userResponse.trim()) {
            navigate('/');
            return;
        }

        const confirmSave = window.confirm("Would you like to conclude this interview session now and evaluate your progress?");
        if (!confirmSave) {
            if (hasStarted && !isAiSpeaking) {
                setIsListening(true);
            }
            return;
        }

        let finalScorecard = [...scorecard];

        // Evaluate the last typed/spoken answer if there is one
        if (userResponse.trim()) {
            setIsThinking(true);
            try {
                const currentQuestion = questions[currentQuestionIndex];
                const candidateAnswer = userResponse.trim();

                const evaluation = await respondPracticeQuestion({
                    reportId: context?.reportId,
                    currentQuestion,
                    candidateAnswer,
                    history: [...history, { role: 'candidate', content: candidateAnswer }],
                    resume: context?.resume,
                    jobdescription: context?.jobdescription,
                    selfdescription: context?.selfdescription
                });

                finalScorecard.push({
                    question: currentQuestion,
                    response: candidateAnswer,
                    score: evaluation.score,
                    feedback: evaluation.feedback,
                    keywords: evaluation.matchedKeywords
                });
            } catch (err) {
                console.error("Error evaluating final response:", err);
            } finally {
                setIsThinking(false);
            }
        }

        if (finalScorecard.length > 0) {
            try {
                const total = finalScorecard.reduce((sum, item) => sum + item.score, 0);
                const avg = Math.round(total / finalScorecard.length);

                await savePracticeSession({
                    reportId: context?.reportId,
                    scorecard: finalScorecard,
                    overallScore: avg
                });

                setScorecard(finalScorecard);
                setShowResults(true);
            } catch (err) {
                console.error("Error saving practice session database logs:", err);
                setScorecard(finalScorecard);
                setShowResults(true);
            }
        } else {
            navigate('/');
        }
    };

    const getAverageScore = () => {
        if (scorecard.length === 0) return 0;
        const total = scorecard.reduce((sum, item) => sum + item.score, 0);
        return Math.round(total / scorecard.length);
    };

    return (
        <div className="min-h-screen bg-background text-on-surface font-body-md selection:bg-primary/30 flex flex-col justify-between relative overflow-hidden">
            <Tech3DBackground />
            {/* Top Navigation Bar */}
            <header className="border-b border-border-subtle sticky top-0 bg-background/85 backdrop-blur-md z-50">
                <div className="flex justify-between items-center px-container-margin h-16 w-full max-w-7xl mx-auto">
                    <div className="flex items-center gap-8">
                        <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">InterviewIQ</span>
                        <nav className="hidden md:flex gap-6">
                            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" to="/">Dashboard</Link>
                            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" to="/">Reports</Link>
                            <Link className="font-body-md text-body-md text-primary border-b-2 border-primary pb-1" to="#">Practice</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handleLogout} className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer" title="Log Out">logout</button>
                        <Link to="/profile" className="w-8 h-8 rounded-full bg-surface-container-high border border-border-subtle overflow-hidden flex items-center justify-center hover:border-primary transition-colors cursor-pointer" title="View Profile">
                            <span className="material-symbols-outlined text-[20px] text-text-muted hover:text-primary transition-colors">person</span>
                        </Link>
                    </div>
                </div>
            </header>

            {loading ? (
                <main className="flex-grow flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                        <p className="text-sm font-label-technical text-text-muted">LOADING AI PRACTICE CONTEXT...</p>
                    </div>
                </main>
            ) : showResults ? (
                /* Session Results scorecard dashboard */
                <main className="flex-grow w-full max-w-4xl mx-auto px-container-margin py-10 flex flex-col gap-8 animate-fadeIn">
                    <Tilt3D className="w-full">
                        <div className="glass-panel p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                            <div className="space-y-2 text-center md:text-left">
                                <div className="font-label-technical text-label-technical text-primary">SESSION COMPLETED // SCORECARD</div>
                                <h1 className="font-headline-lg text-3xl font-extrabold text-on-surface animate-slideUp">Your Practice Evaluation</h1>
                                <p className="text-text-muted text-sm leading-relaxed max-w-md">
                                    The voice agent has graded your responses using Gemini AI model to evaluate core competence against the uploaded resume & job description.
                                </p>
                            </div>
                            <div className="shrink-0 flex flex-col items-center gap-2">
                                <div className="relative w-28 h-28 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle className="text-surface-elevated" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" stroke-width="6"></circle>
                                        <circle 
                                            className="text-primary transition-all duration-1000" 
                                            cx="56" 
                                            cy="56" 
                                            fill="transparent" 
                                            r="48" 
                                            stroke="currentColor" 
                                            strokeWidth="6" 
                                            strokeDasharray="301.6" 
                                            strokeDashoffset={301.6 - (301.6 * getAverageScore()) / 100}
                                            style={{ strokeLinecap: 'round' }}
                                        ></circle>
                                    </svg>
                                    <span className="absolute text-3xl font-extrabold text-on-surface">{getAverageScore()}%</span>
                                </div>
                                <span className="font-label-technical text-[10px] text-primary uppercase tracking-widest font-bold">OVERALL RATING</span>
                            </div>
                        </div>
                    </Tilt3D>

                    <div className="space-y-6">
                        {scorecard.map((item, index) => {
                            let grade = "Needs Work";
                            let color = "text-status-error bg-status-error/10 border-status-error/20";
                            if (item.score >= 80) {
                                grade = "Excellent";
                                color = "text-status-success bg-status-success/10 border-status-success/20";
                            } else if (item.score >= 60) {
                                grade = "Good";
                                color = "text-status-warning bg-status-warning/10 border-status-warning/20";
                            }
                            
                            return (
                                <Tilt3D key={index} className="flex">
                                    <div className="glass-panel rounded-xl p-6 flex flex-col gap-4 border border-border-subtle relative transition-all w-full">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border-subtle pb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 rounded-full bg-surface-container-highest border border-border-subtle flex items-center justify-center font-label-technical text-xs font-bold text-text-muted">
                                                    {index + 1}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-label-technical uppercase bg-primary/10 text-primary border border-primary/20">
                                                    QUESTION EVALUATION
                                                </span>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full border text-xs font-label-technical uppercase flex items-center gap-1.5 ${color}`}>
                                                <span className="font-bold">{grade}</span>
                                                <span>•</span>
                                                <span>Score: {item.score}%</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-headline-md text-lg text-on-surface font-bold leading-snug">
                                                {item.question}
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            <div className="p-4 rounded-lg bg-surface-container-low border border-border-subtle space-y-2">
                                                <div className="flex items-center gap-2 text-text-muted">
                                                    <span className="material-symbols-outlined text-sm">record_voice_over</span>
                                                    <span className="font-label-caps text-[9px] tracking-wider font-bold">YOUR RESPONSE</span>
                                                </div>
                                                <p className="text-xs text-on-surface-variant leading-relaxed italic whitespace-pre-line">
                                                    "{item.response}"
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-surface-container/50 border border-border-subtle space-y-2">
                                                <div className="flex items-center gap-2 text-primary">
                                                    <span className="material-symbols-outlined text-sm">feedback</span>
                                                    <span className="font-label-caps text-[9px] tracking-wider font-bold">GEMINI FEEDBACK</span>
                                                </div>
                                                <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">
                                                    {item.feedback}
                                                </p>
                                            </div>
                                        </div>

                                        {item.keywords && item.keywords.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-2 pt-2">
                                                <span className="font-label-caps text-[9px] tracking-wider font-bold text-text-muted">Matched skills:</span>
                                                {item.keywords.map((w, i) => (
                                                    <span key={i} className="px-2 py-0.5 rounded-md text-[10px] bg-status-success/10 text-status-success border border-status-success/20 font-label-technical">
                                                        {w}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Tilt3D>
                            );
                        })}
                    </div>

                    <div className="flex justify-center gap-4 mt-4">
                        <button 
                            onClick={() => {
                                setScorecard([]);
                                setHistory([]);
                                setQuestions([]);
                                setCurrentQuestionIndex(0);
                                setUserResponse("");
                                setShowResults(false);
                                setHasStarted(false);
                                setIsListening(false);
                                // Reload first question
                                startPracticeSession(reportId).then(data => {
                                    if (data && data.question) {
                                        setQuestions([data.question]);
                                        setContext(data.context);
                                        setHistory([{ role: 'interviewer', content: data.question }]);
                                    }
                                });
                            }}
                            className="bg-surface-container border border-border-subtle text-on-surface hover:bg-surface-bright px-8 py-3 rounded-full font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">restart_alt</span>
                            Practice Again
                        </button>
                        <button 
                            onClick={() => navigate("/")}
                            className="bg-primary text-on-primary hover:opacity-90 px-8 py-3 rounded-full font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-2 shadow-lg"
                        >
                            <span className="material-symbols-outlined">home</span>
                            Back to Dashboard
                        </button>
                    </div>
                </main>
            ) : (
                /* Main Workspace */
                <main className="flex-grow w-full max-w-7xl mx-auto px-container-margin py-8 flex flex-col md:flex-row gap-6">
                    
                    {/* Main Content Area */}
                    <section className="flex-grow flex flex-col gap-6 w-full md:w-2/3 lg:w-3/4">
                        
                        {!hasStarted ? (
                            /* Startup Screen overlay */
                            <div className="glass-panel rounded-xl p-10 flex flex-col items-center text-center gap-6 relative overflow-hidden flex-grow justify-center">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                                
                                <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center relative">
                                    <span className="material-symbols-outlined text-primary text-5xl animate-pulse">mic</span>
                                    <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-25"></div>
                                </div>
                                
                                <div className="space-y-2 max-w-lg">
                                    <h2 className="font-headline-lg text-2xl md:text-3xl text-on-surface font-extrabold tracking-tight">AI Voice Practice Session</h2>
                                    <p className="font-body-md text-text-muted leading-relaxed">
                                        Simulate a real voice interview. The AI agent will read out the questions, and you can speak your answers directly using your microphone.
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-xl w-full border border-border-subtle bg-surface-container/40 p-6 rounded-xl mt-2">
                                    <div className="flex gap-3">
                                        <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">volume_up</span>
                                        <div>
                                            <h4 className="font-bold text-sm text-on-surface">AI Audio Questions</h4>
                                            <p className="text-xs text-text-muted">The AI interviewer speaks each question using browser Speech Synthesis.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">settings_voice</span>
                                        <div>
                                            <h4 className="font-bold text-sm text-on-surface">Voice Transcription</h4>
                                            <p className="text-xs text-text-muted">Speak naturally to answer. Your voice is transcribed in real-time.</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={startSession}
                                    className="bg-primary text-on-primary font-bold px-8 py-3.5 rounded-full hover:scale-105 transition-all shadow-[0_0_15px_rgba(173,198,255,0.25)] flex items-center gap-2 cursor-pointer mt-4"
                                >
                                    <span className="material-symbols-outlined">play_arrow</span>
                                    Start Practice Session
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* AI Interviewer Avatar Card */}
                                <div className="glass-panel rounded-xl p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                                    <div className="relative z-10 w-full md:w-48 shrink-0 flex flex-col items-center">
                                        <div className="hologram-container w-full aspect-square">
                                            <div className={`hologram-box aspect-square w-full rounded-lg bg-surface-container-highest border overflow-hidden flex items-center justify-center relative transition-all duration-300 ${
                                                isAiSpeaking 
                                                    ? 'border-primary shadow-[0_0_20px_rgba(173,198,255,0.4)] scale-102 [transform:rotateY(10deg)_rotateX(10deg)]' 
                                                    : 'border-border-subtle [transform:rotateY(0deg)_rotateX(0deg)]'
                                            }`}>
                                                <div className="hologram-ring-1"></div>
                                                <div className="hologram-ring-2"></div>
                                                <span className={`material-symbols-outlined text-primary text-[80px] z-10 ${isAiSpeaking ? 'animate-pulse' : ''}`}>smart_toy</span>
                                                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none"></div>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${isAiSpeaking ? 'bg-primary' : 'bg-status-success'} animate-pulse`}></div>
                                            <span className="font-label-technical text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                                                {isAiSpeaking ? 'AI Speaking...' : isListening ? 'AI Listening...' : 'Idle'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="relative z-10 flex-grow flex flex-col gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-label-technical text-label-technical text-primary font-bold">QUESTION {currentQuestionIndex + 1}</span>
                                            <div className="flex-grow h-px bg-border-subtle"></div>
                                        </div>
                                        <h2 className="font-headline-lg text-2xl md:text-3xl text-on-surface leading-tight font-bold">
                                            {questions[currentQuestionIndex]}
                                        </h2>
                                        {isThinking && (
                                            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-xs text-primary flex items-center gap-2 mt-2 animate-pulse">
                                                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                                <span>AI Interviewer is evaluating your answer and formulating follow-up questions...</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className={`material-symbols-outlined text-primary text-xl ${isAiSpeaking ? 'animate-pulse' : ''}`}>volume_up</span>
                                            <div className="h-4 flex items-center gap-0.5">
                                                <div className={`w-1 h-3 bg-primary/40 rounded-full ${isAiSpeaking ? 'animate-bounce' : ''}`}></div>
                                                <div className={`w-1 h-5 bg-primary/60 rounded-full ${isAiSpeaking ? 'animate-bounce' : ''}`} style={{ animationDelay: '0.1s' }}></div>
                                                <div className={`w-1 h-2 bg-primary/30 rounded-full ${isAiSpeaking ? 'animate-bounce' : ''}`} style={{ animationDelay: '0.2s' }}></div>
                                                <div className={`w-1 h-6 bg-primary rounded-full ${isAiSpeaking ? 'animate-bounce' : ''}`} style={{ animationDelay: '0.3s' }}></div>
                                                <div className={`w-1 h-4 bg-primary/50 rounded-full ${isAiSpeaking ? 'animate-bounce' : ''}`} style={{ animationDelay: '0.4s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Real-time Response Transcript */}
                                <div className="flex-grow glass-panel rounded-xl flex flex-col min-h-[350px]">
                                    <div className="border-b border-border-subtle px-6 py-3 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">record_voice_over</span>
                                            <span className="font-label-technical text-label-technical font-bold">REAL-TIME TRANSCRIPT</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-label-technical text-label-technical text-text-muted uppercase">
                                                STATUS: {isThinking ? "EVALUATING" : isListening ? "LISTENING" : isAiSpeaking ? "AI SPEAKING" : "IDLE"}
                                            </span>
                                            {isListening && (
                                                <div className="writing-indicator flex gap-1">
                                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Interactive Text Input representing the voice/transcribed content */}
                                    <div className="p-8 flex-grow flex flex-col gap-4">
                                        {!speechSupported && (
                                            <div className="bg-status-error/10 border border-status-error/20 text-status-error text-xs px-4 py-3 rounded-lg flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">warning</span>
                                                <span>Speech Recognition is not supported by your browser. Please try Google Chrome or Microsoft Edge for voice input. You can still type your answers.</span>
                                            </div>
                                        )}
                                        <p className="text-text-muted font-body-sm italic">
                                            {isListening 
                                                ? "* Microphone is active. Speak clearly to transcribe your answer." 
                                                : "* Microphone is inactive. Click the microphone button below to start transcribing or type your answer directly."}
                                        </p>
                                        <textarea 
                                            disabled={isThinking}
                                            className="w-full flex-grow bg-surface-container/50 border border-border-subtle rounded-lg p-6 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-0 transition-all resize-none placeholder:text-outline/40 custom-scrollbar leading-relaxed"
                                            placeholder={isThinking ? "Please wait while the AI evaluates your answer..." : "Start speaking your answer here..."}
                                            value={userResponse}
                                            onChange={(e) => setUserResponse(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Controls Bar */}
                                <div className="flex items-center justify-between gap-4 p-4 border border-border-subtle bg-surface-container/40 rounded-xl">
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setIsListening(!isListening)}
                                            disabled={isAiSpeaking || isThinking}
                                            className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all active:scale-95 cursor-pointer ${
                                                isListening 
                                                    ? "bg-status-error/20 border-status-error text-status-error animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
                                                    : (isAiSpeaking || isThinking)
                                                        ? "bg-surface-container-high border-border-subtle text-text-muted cursor-not-allowed opacity-50"
                                                        : "bg-surface-container-high border-border-subtle hover:bg-surface-bright text-on-surface"
                                            }`}
                                            title={isListening ? "Mute Microphone" : "Unmute Microphone"}
                                        >
                                            <span className="material-symbols-outlined">{isListening ? "mic" : "mic_off"}</span>
                                        </button>

                                        <button 
                                            onClick={() => setIsVideoOff(!isVideoOff)}
                                            className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all active:scale-95 cursor-pointer ${
                                                isVideoOff 
                                                    ? "bg-status-error/20 border-status-error text-status-error" 
                                                    : "bg-surface-container-high border-border-subtle hover:bg-surface-bright text-on-surface"
                                            }`}
                                            title={isVideoOff ? "Start Camera" : "Stop Camera"}
                                        >
                                            <span className="material-symbols-outlined">{isVideoOff ? "videocam_off" : "videocam"}</span>
                                        </button>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={handleEndSessionEarly}
                                            className="px-6 h-14 rounded-full flex items-center justify-center bg-status-error/15 border border-status-error/30 text-status-error font-bold hover:bg-status-error/20 transition-all active:scale-95 gap-2 cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined">call_end</span>
                                            End Session
                                        </button>

                                        <button 
                                            onClick={handleNextQuestion}
                                            disabled={!userResponse.trim() || isThinking}
                                            className={`px-8 h-14 rounded-full flex items-center justify-center font-bold transition-all active:scale-95 gap-2 cursor-pointer ${
                                                userResponse.trim() && !isThinking
                                                    ? "bg-primary text-on-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(173,198,255,0.15)]"
                                                    : "bg-surface-container-high text-text-muted border border-border-subtle cursor-not-allowed"
                                            }`}
                                        >
                                            {isThinking ? (
                                                <>
                                                    <span>ANALYZING ANSWER...</span>
                                                    <span className="w-4 h-4 border-2 border-text-muted border-t-white rounded-full animate-spin"></span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>SUBMIT & NEXT</span>
                                                    <span className="material-symbols-outlined">arrow_forward</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </section>

                    {/* Sidebar Widget Analytics */}
                    <aside className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-6">
                        {/* Words Per Minute Pacing */}
                        <div className="glass-panel rounded-xl p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <span className="font-label-technical text-label-technical text-text-muted font-bold">PACING ANALYSIS</span>
                                <span className="material-symbols-outlined text-status-success text-sm">check_circle</span>
                            </div>
                            <div className="flex items-end gap-1 h-12">
                                {/* Animated wave bars */}
                                <div className="flex-grow bg-primary/20 h-4 rounded-t-sm animate-pulse"></div>
                                <div className="flex-grow bg-primary/40 h-8 rounded-t-sm animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                                <div className="flex-grow bg-primary/60 h-10 rounded-t-sm animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="flex-grow bg-primary h-6 rounded-t-sm animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                                <div className="flex-grow bg-primary/70 h-9 rounded-t-sm animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                <div className="flex-grow bg-primary/30 h-5 rounded-t-sm animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="font-headline-md text-2xl font-bold text-on-surface">{wordsPerMin}</span>
                                <span className="font-label-technical text-label-technical text-on-surface-variant font-bold">WORDS / MIN</span>
                            </div>
                            <p className="font-label-technical text-[10px] text-on-surface-variant leading-tight">
                                Optimal range is 130-150. Pacing details are computed based on typing speed cadence.
                            </p>
                        </div>

                        {/* STAR Method Progress */}
                        <div className="glass-panel rounded-xl p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <span className="font-label-technical text-label-technical text-text-muted font-bold">STAR STRUCTURE DETECTOR</span>
                                <span className="material-symbols-outlined text-status-warning text-sm">insights</span>
                            </div>
                            <div className="space-y-3 font-label-technical text-xs font-bold text-text-muted">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded border flex items-center justify-center font-bold text-xs ${
                                        starScore.s >= 100 
                                            ? "bg-status-success/20 border-status-success/40 text-status-success" 
                                            : "bg-surface-container-high border-border-subtle text-text-muted"
                                    }`}>S</div>
                                    <div className="flex-grow bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-status-success transition-all duration-300" style={{ width: `${starScore.s}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded border flex items-center justify-center font-bold text-xs ${
                                        starScore.t >= 100 
                                            ? "bg-status-success/20 border-status-success/40 text-status-success" 
                                            : "bg-surface-container-high border-border-subtle text-text-muted"
                                    }`}>T</div>
                                    <div className="flex-grow bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-status-success transition-all duration-300" style={{ width: `${starScore.t}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded border flex items-center justify-center font-bold text-xs ${
                                        starScore.a >= 100 
                                            ? "bg-primary/20 border-primary/40 text-primary" 
                                            : "bg-surface-container-high border-border-subtle text-text-muted"
                                    }`}>A</div>
                                    <div className="flex-grow bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${starScore.a}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded border flex items-center justify-center font-bold text-xs ${
                                        starScore.r >= 100 
                                            ? "bg-primary/20 border-primary/40 text-primary" 
                                            : "bg-surface-container-high border-border-subtle text-text-muted"
                                    }`}>R</div>
                                    <div className="flex-grow bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${starScore.r}%` }}></div>
                                    </div>
                                </div>
                            </div>
                            <p className="font-label-technical text-[10px] text-on-surface-variant leading-tight">
                                Build structure: Situation (S), Task (T), Action (A), Result (R). Ensure you hit all four segments for full points.
                            </p>
                        </div>

                        {/* Keyword Tracking */}
                        <div className="glass-panel rounded-xl p-6 flex flex-col gap-4">
                            <span className="font-label-technical text-label-technical text-text-muted font-bold uppercase">Keyword Tracking</span>
                            <div className="flex flex-wrap gap-2">
                                {targetKeywords.map((keyword, index) => {
                                    const isDetected = detectedKeywords.includes(keyword)
                                    const badgeColor = isDetected 
                                        ? "bg-primary/25 border-primary text-primary" 
                                        : "bg-surface-container-highest border-border-subtle text-text-muted"
                                    return (
                                        <span 
                                            key={index} 
                                            className={`px-2.5 py-1 border rounded text-[10px] font-label-technical uppercase transition-all duration-300 ${badgeColor}`}
                                        >
                                            {keyword}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Match Score Live Widget */}
                        <div className="glass-panel rounded-xl p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="font-label-technical text-label-technical text-primary font-bold">LIVE MATCH SCORE</span>
                                <span className="material-symbols-outlined text-primary">bolt</span>
                            </div>
                            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                                {/* SVG circular progress */}
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle className="text-surface-elevated" cx="64" cy="64" fill="transparent" r="54" stroke="currentColor" stroke-width="6"></circle>
                                    <circle 
                                        className="text-secondary transition-all duration-300" 
                                        cx="64" 
                                        cy="64" 
                                        fill="transparent" 
                                        r="54" 
                                        stroke="currentColor" 
                                        strokeWidth="6" 
                                        strokeDasharray="339.3" 
                                        strokeDashoffset={339.3 - (339.3 * liveMatchScore) / 100}
                                        style={{ strokeLinecap: 'round' }}
                                    ></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold font-headline-md text-on-surface">{liveMatchScore}</span>
                                    <span className="text-[10px] font-label-technical text-on-surface-variant uppercase">Percent</span>
                                </div>
                            </div>
                            <div className="text-center font-label-technical text-label-technical text-secondary font-bold">
                                {liveMatchScore >= 80 ? "High Relevancy Detected" : "Generating Structure..."}
                            </div>
                        </div>
                    </aside>
                </main>
            )}

        </div>
    )
}

export default Practice
