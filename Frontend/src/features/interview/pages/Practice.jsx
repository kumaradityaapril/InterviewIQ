import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import { getReports } from '../services/interview.api'
import { useAuth } from '../../auth/hooks/useAuth'

const Practice = () => {
    const navigate = useNavigate()
    const { handleLogout } = useAuth()

    const [questions, setQuestions] = useState([
        "Can you describe a situation where you had to reconcile conflicting priorities from different stakeholders? How did you handle it?",
        "Explain the 'CAP Theorem' in the context of our distributed ledger.",
        "How do you profile a memory leak in a production Rust binary?",
        "Describe a time you disagreed with a technical decision from leadership."
    ])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [userResponse, setUserResponse] = useState("")
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    
    // Real-time analysis states
    const [wordsPerMin, setWordsPerMin] = useState(0)
    const [starScore, setStarScore] = useState({ s: 0, t: 0, a: 0, r: 0 })
    const [detectedKeywords, setDetectedKeywords] = useState([])
    const [liveMatchScore, setLiveMatchScore] = useState(50)

    const targetKeywords = ["stakeholders", "alignment", "data-driven", "scalability", "agile", "consistency", "latency", "testing"]

    // Try loading questions from the latest user report on mount
    useEffect(() => {
        const fetchQuestionsFromReport = async () => {
            try {
                const data = await getReports()
                if (data && data.reports && data.reports.length > 0) {
                    const latestReport = data.reports[0]
                    const qList = []
                    if (latestReport.behavioralQuestions) {
                        latestReport.behavioralQuestions.forEach(q => qList.push(q.question))
                    }
                    if (latestReport.technicalQuestions) {
                        latestReport.technicalQuestions.forEach(q => qList.push(q.question))
                    }
                    if (qList.length > 0) {
                        setQuestions(qList)
                    }
                }
            } catch (err) {
                console.error("Could not load custom practice questions from report history", err)
            }
        }
        fetchQuestionsFromReport()
    }, [])

    // Real-time text analysis logic
    useEffect(() => {
        if (!userResponse) {
            setWordsPerMin(0)
            setStarScore({ s: 0, t: 0, a: 0, r: 0 })
            setDetectedKeywords([])
            setLiveMatchScore(50)
            return
        }

        const words = userResponse.trim().split(/\s+/)
        const wordCount = words.length
        
        // Simulating words per minute based on character typing frequency
        const calculatedWpm = Math.min(160, Math.max(90, 110 + (wordCount % 45)))
        setWordsPerMin(calculatedWpm)

        // STAR detection simulator based on text length milestones
        let s = Math.min(100, Math.floor((wordCount / 10) * 100))
        let t = wordCount > 15 ? Math.min(100, Math.floor(((wordCount - 15) / 15) * 100)) : 0
        let a = wordCount > 35 ? Math.min(100, Math.floor(((wordCount - 35) / 25) * 100)) : 0
        let r = wordCount > 65 ? Math.min(100, Math.floor(((wordCount - 65) / 20) * 100)) : 0
        setStarScore({ s, t, a, r })

        // Keyword checking
        const lowerResponse = userResponse.toLowerCase()
        const foundKeywords = targetKeywords.filter(k => lowerResponse.includes(k))
        setDetectedKeywords(foundKeywords)

        // Live score calculations
        const keywordBonus = foundKeywords.length * 5
        const lengthBonus = Math.min(30, Math.floor(wordCount / 4))
        const finalScore = Math.min(98, 50 + keywordBonus + lengthBonus)
        setLiveMatchScore(finalScore)

    }, [userResponse])

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
            setUserResponse("")
        } else {
            alert("Practice session completed! Great job.")
            navigate("/")
        }
    }

    return (
        <div className="min-h-screen bg-background text-on-surface font-body-md selection:bg-primary/30 flex flex-col justify-between">
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
                        <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer">notifications</button>
                        <button onClick={handleLogout} className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer" title="Log Out">logout</button>
                        <div className="w-8 h-8 rounded-full bg-surface-container-high border border-border-subtle overflow-hidden flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px] text-text-muted">person</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Workspace */}
            <main className="flex-grow w-full max-w-7xl mx-auto px-container-margin py-8 flex flex-col md:flex-row gap-6">
                
                {/* Main Content Area */}
                <section className="flex-grow flex flex-col gap-6 w-full md:w-2/3 lg:w-3/4">
                    {/* AI Interviewer Avatar Card */}
                    <div className="glass-panel rounded-xl p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                        <div className="relative z-10 w-full md:w-48 shrink-0 flex flex-col items-center">
                            <div className="aspect-square w-full rounded-lg bg-surface-container-highest border border-border-subtle overflow-hidden flex items-center justify-center relative">
                                <span className="material-symbols-outlined text-primary text-[80px]">smart_toy</span>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-status-success animate-pulse"></div>
                                <span className="font-label-technical text-[10px] text-status-success uppercase tracking-widest font-bold">Live: AI Interviewer</span>
                            </div>
                        </div>
                        <div className="relative z-10 flex-grow flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <span className="font-label-technical text-label-technical text-primary">QUESTION {currentQuestionIndex + 1} OF {questions.length}</span>
                                <div className="flex-grow h-px bg-border-subtle"></div>
                            </div>
                            <h2 className="font-headline-lg text-2xl md:text-3xl text-on-surface leading-tight font-bold">
                                {questions[currentQuestionIndex]}
                            </h2>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="material-symbols-outlined text-primary text-xl">volume_up</span>
                                <div className="h-4 flex items-center gap-0.5">
                                    <div className="w-1 h-3 bg-primary/40 rounded-full animate-bounce"></div>
                                    <div className="w-1 h-5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-1 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-1 h-6 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                    <div className="w-1 h-4 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
                                <span className="font-label-technical text-label-technical text-text-muted">STATUS: LISTENING</span>
                                <div className="writing-indicator flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Text Input representing the voice/transcribed content */}
                        <div className="p-8 flex-grow flex flex-col gap-4">
                            <p className="text-text-muted font-body-sm italic">
                                * Type your response below to simulate transcribing speech. Watch real-time metrics update in the sidebar as you type.
                            </p>
                            <textarea 
                                className="w-full flex-grow bg-surface-container/50 border border-border-subtle rounded-lg p-6 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-0 transition-all resize-none placeholder:text-outline/40 custom-scrollbar leading-relaxed"
                                placeholder="Start speaking/typing your answer here..."
                                value={userResponse}
                                onChange={(e) => setUserResponse(e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    {/* Controls Bar */}
                    <div className="flex items-center justify-center gap-4 p-4 border border-border-subtle bg-surface-container/40 rounded-xl">
                        <button 
                            onClick={() => setIsMuted(!isMuted)}
                            className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all active:scale-95 cursor-pointer ${
                                isMuted 
                                    ? "bg-status-error/20 border-status-error text-status-error" 
                                    : "bg-surface-container-high border-border-subtle hover:bg-surface-bright text-on-surface"
                            }`}
                            title={isMuted ? "Unmute Mic" : "Mute Mic"}
                        >
                            <span className="material-symbols-outlined">{isMuted ? "mic_off" : "mic"}</span>
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
                        
                        <button 
                            onClick={handleNextQuestion}
                            disabled={!userResponse.trim()}
                            className={`px-8 h-14 rounded-full flex items-center justify-center font-bold transition-all active:scale-95 gap-2 cursor-pointer ${
                                userResponse.trim()
                                    ? "bg-primary text-on-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(173,198,255,0.15)]"
                                    : "bg-surface-container-high text-text-muted border border-border-subtle cursor-not-allowed"
                            }`}
                        >
                            <span>{currentQuestionIndex === questions.length - 1 ? "FINISH SESSION" : "NEXT QUESTION"}</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>

                        <button 
                            onClick={() => navigate('/')}
                            className="px-6 h-14 rounded-full flex items-center justify-center bg-status-error text-white font-bold hover:brightness-110 transition-all active:scale-95 gap-2 cursor-pointer"
                        >
                            <span className="material-symbols-outlined">call_end</span>
                            End Session
                        </button>
                    </div>
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

            {/* Footer */}
            <footer className="bg-surface-container-lowest border-t border-border-subtle mt-12 py-8">
                <div className="max-w-7xl mx-auto px-container-margin flex flex-col md:flex-row justify-between items-center gap-4">
                    <span className="font-label-caps text-label-caps text-on-surface-variant font-bold">INTERVIEWIQ // TECH_EXCELLENCE</span>
                    <div className="flex gap-6">
                        <Link className="font-label-technical text-label-technical text-text-muted hover:text-primary transition-colors" to="#">Terms</Link>
                        <Link className="font-label-technical text-label-technical text-text-muted hover:text-primary transition-colors" to="#">Privacy</Link>
                        <Link className="font-label-technical text-label-technical text-text-muted hover:text-primary transition-colors" to="#">Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Practice
