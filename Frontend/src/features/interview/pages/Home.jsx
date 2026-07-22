import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import { generateReport, getReports, getPracticeHistory } from '../services/interview.api'
import Tilt3D from '../components/Tilt3D'
import Tech3DBackground from '../components/Tech3DBackground'

const Home = () => {
    const { user, handleLogout } = useAuth()
    const navigate = useNavigate()

    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [resumeFile, setResumeFile] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const [reportsList, setReportsList] = useState([])
    const [practiceHistory, setPracticeHistory] = useState([])
    const [selectedPractice, setSelectedPractice] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getReports()
                if (data && data.reports) {
                    setReportsList(data.reports)
                }
            } catch (err) {
                console.error("Failed to load reports history", err)
            }
        }
        fetchHistory()
    }, [])

    useEffect(() => {
        const fetchPracticeSessions = async () => {
            try {
                const data = await getPracticeHistory()
                if (data && data.sessions) {
                    setPracticeHistory(data.sessions)
                }
            } catch (err) {
                console.error("Failed to load practice history", err)
            }
        }
        fetchPracticeSessions()
    }, [])

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            if (file.type === "application/pdf") {
                setResumeFile(file)
            } else {
                setErrorMsg("Only PDF resumes are supported.")
            }
        }
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.type === "application/pdf") {
                setResumeFile(file)
            } else {
                setErrorMsg("Only PDF resumes are supported.")
            }
        }
    }

    const handleGenerate = async () => {
        setErrorMsg("")
        if (!jobDescription.trim()) {
            setErrorMsg("Job Description is required.")
            return
        }
        if (!resumeFile) {
            setErrorMsg("Please upload your PDF resume.")
            return
        }

        setSubmitting(true)
        try {
            const formData = new FormData()
            formData.append("resume", resumeFile)
            formData.append("jobdescription", jobDescription)
            formData.append("selfdescription", selfDescription)

            const data = await generateReport(formData)
            if (data && data.interviewReport) {
                navigate(`/reports/${data.interviewReport._id}`)
            } else {
                setErrorMsg("Failed to generate report.")
                setSubmitting(false)
            }
        } catch (err) {
            console.error(err)
            const serverMsg = err.response?.data?.message || "An error occurred while generating the interview report. Please check server logs."
            setErrorMsg(serverMsg)
            setSubmitting(false)
        }
    }

    if (submitting) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-on-surface">
                <div className="flex flex-col items-center gap-6 max-w-md text-center p-8 glass-panel rounded-xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary-fixed-dim to-primary animate-pulse"></div>
                    <span className="material-symbols-outlined text-primary text-6xl animate-spin">sync</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface">ANALYSIS IN PROGRESS</h2>
                    <p className="font-label-technical text-label-technical text-primary tracking-widest uppercase">ENGINE_v4.2 // RUNNING_DIAGNOSTICS</p>
                    <p className="font-body-md text-text-muted">
                        Parsing resume PDF, mapping experience gaps, and generating personalized technical & behavioral questionnaires. Please wait...
                    </p>
                </div>
            </div>
        )
    }

    // Helper to format date
    const formatDate = (isoString) => {
        const d = new Date(isoString)
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
    }

    return (
        <div className="min-h-screen bg-background text-on-surface font-body-md selection:bg-primary/30 flex flex-col justify-between relative overflow-hidden">
            <Tech3DBackground />
            {/* Top Navigation Bar */}
            <header className="border-b border-border-subtle sticky top-0 bg-background/85 backdrop-blur-md z-50">
                <div className="flex justify-between items-center px-container-margin h-16 w-full max-w-7xl mx-auto">
                    <div className="flex items-center gap-8">
                        <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">InterviewIQ</span>
                        <nav className="hidden md:flex gap-6">
                            <Link className="font-body-md text-body-md text-primary border-b-2 border-primary pb-1" to="/">Dashboard</Link>
                            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" to="/practice">Practice</Link>
                            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" to="/resume-builder">Resume Builder</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer">notifications</button>
                        <button onClick={handleLogout} className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer" title="Log Out">logout</button>
                        <Link to="/profile" className="w-8 h-8 rounded-full bg-surface-container-high border border-border-subtle overflow-hidden flex items-center justify-center hover:border-primary transition-colors cursor-pointer" title="View Profile">
                            <span className="material-symbols-outlined text-[20px] text-text-muted hover:text-primary transition-colors">person</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="w-full max-w-7xl mx-auto px-container-margin py-8 flex-grow space-y-12 animate-fadeIn">
                {/* Welcome Section */}
                <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center pt-4">
                    <div className="md:col-span-8 space-y-2">
                        <h1 className="font-headline-lg text-4xl text-on-surface font-extrabold">Welcome, {user?.username || "Candidate"}</h1>
                        <p className="text-text-muted font-body-md">Your interview readiness has increased this week. Analyze a new role to get started.</p>
                    </div>
                    <div className="md:col-span-4 flex justify-end">
                        <div className="flex items-center gap-4 bg-surface-container border border-border-subtle p-4 rounded-lg">
                            <div className="w-16 h-16 rounded-full border-4 border-secondary flex items-center justify-center shadow-[0_0_12px_rgba(0,238,252,0.15)]">
                                <span className="font-label-technical text-label-technical text-secondary font-bold">READY</span>
                            </div>
                            <div>
                                <p className="font-label-caps text-label-caps text-text-muted">ANALYSIS STATE</p>
                                <p className="font-headline-md text-headline-md text-on-surface">Active</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* New Analysis Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                        <h2 className="font-headline-md text-2xl text-on-surface font-bold">New Readiness Analysis</h2>
                        <span className="font-label-technical text-label-technical text-primary">ANALYSIS_ENGINE_v4.2</span>
                    </div>

                    {errorMsg && (
                        <div className="p-4 bg-error-container/20 border border-error-container text-error rounded font-body-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Job Description */}
                        <div className="space-y-4">
                            <label className="font-label-caps text-label-caps text-text-muted flex items-center gap-2 font-bold tracking-wider">
                                <span className="material-symbols-outlined text-sm">description</span>
                                JOB DESCRIPTION
                            </label>
                            <div className="relative group">
                                <textarea 
                                    className="w-full h-[400px] bg-surface-container border border-border-subtle rounded-lg p-6 font-label-technical text-label-technical focus:outline-none focus:border-primary focus:ring-0 transition-colors resize-none placeholder:text-outline/40 custom-scrollbar" 
                                    placeholder="Paste the full job description text here... (Role requirements, technical stack, expectations)"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                ></textarea>
                                <div className="absolute bottom-4 right-4 text-outline font-label-technical text-[10px] bg-surface-container-high px-2 py-0.5 rounded border border-border-subtle">
                                    {jobDescription.length} CHARS
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Resume & Self Desc */}
                        <div className="space-y-8 flex flex-col justify-between">
                            <div className="space-y-4">
                                <label className="font-label-caps text-label-caps text-text-muted flex items-center gap-2 font-bold tracking-wider">
                                    <span className="material-symbols-outlined text-sm">upload_file</span>
                                    RESUME UPLOAD
                                </label>
                                <div 
                                    className={`w-full h-48 rounded-lg flex flex-col items-center justify-center border transition-all cursor-pointer ${
                                        isDragging 
                                            ? "bg-primary/5 border-primary" 
                                            : resumeFile 
                                                ? "bg-status-success/5 border-status-success" 
                                                : "bg-surface-container border-dashed border-border-subtle hover:border-primary"
                                    }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('resume-file-input').click()}
                                >
                                    <input 
                                        type="file" 
                                        id="resume-file-input" 
                                        accept=".pdf" 
                                        className="hidden" 
                                        onChange={handleFileChange}
                                    />
                                    {resumeFile ? (
                                        <>
                                            <span className="material-symbols-outlined text-status-success text-4xl mb-2">check_circle</span>
                                            <p className="font-body-md text-on-surface font-bold">{resumeFile.name}</p>
                                            <p className="font-label-technical text-label-technical text-text-muted mt-1">
                                                {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Loaded
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-primary text-4xl mb-2">cloud_upload</span>
                                            <p className="font-body-md text-on-surface">Drag and drop your PDF resume, or browse</p>
                                            <p className="font-label-technical text-label-technical text-text-muted mt-1">Maximum file size: 3MB</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="font-label-caps text-label-caps text-text-muted flex items-center gap-2 font-bold tracking-wider">
                                    <span className="material-symbols-outlined text-sm">person</span>
                                    SELF DESCRIPTION / CONTEXT (OPTIONAL)
                                </label>
                                <textarea 
                                    className="w-full h-40 bg-surface-container border border-border-subtle rounded-lg p-4 font-label-technical text-label-technical focus:outline-none focus:border-primary focus:ring-0 transition-colors resize-none placeholder:text-outline/40 custom-scrollbar" 
                                    placeholder="Add specific highlights, constraints, or experience details for this interview..."
                                    value={selfDescription}
                                    onChange={(e) => setSelfDescription(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center pt-4">
                        <button 
                            onClick={handleGenerate}
                            className="bg-primary hover:bg-primary/90 text-on-primary px-12 py-4 rounded-lg font-bold text-lg transition-all active:scale-95 flex items-center gap-3 cursor-pointer shadow-[0_0_20px_rgba(173,198,255,0.15)]"
                        >
                            <span className="material-symbols-outlined">analytics</span>
                            Generate Readiness Report
                        </button>
                    </div>
                </section>

                {/* Recent Reports Section */}
                <section className="space-y-6 pt-4">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                        <h2 className="font-headline-md text-2xl text-on-surface font-bold">Recent Analyses</h2>
                        <span className="font-label-technical text-label-technical text-text-muted">Total: {reportsList.length}</span>
                    </div>

                    {reportsList.length === 0 ? (
                        <div className="text-center p-12 bg-surface-container border border-border-subtle rounded-lg text-text-muted">
                            <span className="material-symbols-outlined text-4xl mb-2">folder_open</span>
                            <p className="font-body-md">No reports generated yet. Paste a job description and upload a resume above to create your first report!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {reportsList.map((rep) => {
                                const firstLine = rep.jobDescription?.split('\n')[0] || "Software Engineer"
                                const title = firstLine.length > 30 ? firstLine.substring(0, 30) + "..." : firstLine
                                const matchScore = rep.matchScore || 0
                                const scoreColorClass = matchScore >= 80 
                                    ? "border-status-success text-status-success" 
                                    : matchScore >= 60 
                                        ? "border-status-warning text-status-warning" 
                                        : "border-status-error text-status-error"

                                const scoreBgTintClass = matchScore >= 80 
                                    ? "bg-status-success/10 text-status-success" 
                                    : matchScore >= 60 
                                        ? "bg-status-warning/10 text-status-warning" 
                                        : "bg-status-error/10 text-status-error"

                                return (
                                    <Tilt3D key={rep._id} className="flex">
                                        <div 
                                            onClick={() => navigate(`/reports/${rep._id}`)}
                                            className="bg-surface-container border border-border-subtle p-6 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer group flex flex-col justify-between w-full"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="space-y-1 pr-4">
                                                    <h3 className="font-body-lg text-on-surface font-bold group-hover:text-primary transition-colors line-clamp-1">{title}</h3>
                                                    <p className="font-label-technical text-label-technical text-text-muted line-clamp-1">
                                                        ID: #{rep._id.substring(rep._id.length - 6).toUpperCase()}
                                                    </p>
                                                </div>
                                                <div className={`w-12 h-12 rounded-full border-2 ${scoreColorClass} flex items-center justify-center font-bold font-label-technical`}>
                                                    {matchScore}%
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-label-technical uppercase ${scoreBgTintClass}`}>
                                                        Match: {matchScore >= 80 ? "STRONG" : matchScore >= 60 ? "AVERAGE" : "GAP_DETECTED"}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-sm bg-primary/10 text-primary text-[10px] font-label-technical uppercase">
                                                        Gaps: {rep.skillGaps?.length || 0}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center pt-4 border-t border-border-subtle/50">
                                                    <span className="font-label-technical text-text-muted text-[10px]">
                                                        {formatDate(rep.createdAt)}
                                                    </span>
                                                    <button className="text-primary material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">
                                                        arrow_forward
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Tilt3D>
                                )
                            })}
                        </div>
                    )}
                </section>

                {/* Voice Practice Sessions History */}
                <section className="space-y-6 pt-4">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                        <h2 className="font-headline-md text-2xl text-on-surface font-bold">Practice History & AI Feedback</h2>
                        <span className="font-label-technical text-label-technical text-text-muted">Total sessions: {practiceHistory.length}</span>
                    </div>

                    {practiceHistory.length === 0 ? (
                        <div className="text-center p-12 bg-surface-container border border-border-subtle rounded-lg text-text-muted">
                            <span className="material-symbols-outlined text-4xl mb-2">record_voice_over</span>
                            <p className="font-body-md">No voice practice sessions recorded yet. Start a session from a report profile to log your AI evaluations!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {practiceHistory.map((session) => {
                                let grade = "Needs Work";
                                let scoreColorClass = "border-status-error text-status-error";
                                if (session.overallScore >= 80) {
                                    grade = "Excellent";
                                    scoreColorClass = "border-status-success text-status-success";
                                } else if (session.overallScore >= 60) {
                                    grade = "Good";
                                    scoreColorClass = "border-status-warning text-status-warning";
                                }

                                return (
                                    <Tilt3D key={session._id} className="flex">
                                        <div 
                                            onClick={() => setSelectedPractice(session)}
                                            className="bg-surface-container border border-border-subtle p-6 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer group flex flex-col justify-between w-full"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="space-y-1 pr-4">
                                                    <h3 className="font-body-lg text-on-surface font-bold group-hover:text-primary transition-colors line-clamp-1">
                                                        Voice Practice Session
                                                    </h3>
                                                    <p className="font-label-technical text-label-technical text-text-muted">
                                                        {session.questions?.length} Questions Asked
                                                    </p>
                                                </div>
                                                <div className={`w-12 h-12 rounded-full border-2 ${scoreColorClass} flex items-center justify-center font-bold font-label-technical`}>
                                                    {session.overallScore}%
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="px-2 py-0.5 rounded-sm bg-primary/10 text-primary text-[10px] font-label-technical uppercase">
                                                        Rating: {grade}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center pt-4 border-t border-border-subtle/50">
                                                    <span className="font-label-technical text-text-muted text-[10px]">
                                                        {formatDate(session.createdAt)}
                                                    </span>
                                                    <span className="text-primary font-bold text-xs flex items-center gap-1 group-hover:underline">
                                                        View Feedback
                                                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Tilt3D>
                                )
                            })}
                        </div>
                    )}
                </section>
            </main>

            {/* Modal for practice details */}
            {selectedPractice && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-background border border-border-subtle rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-scaleUp">
                        <div className="border-b border-border-subtle p-6 flex justify-between items-center bg-surface-container">
                            <div>
                                <h3 className="font-headline-md text-xl text-on-surface font-extrabold">Practice Scorecard & AI Review</h3>
                                <p className="text-xs text-text-muted mt-1">Conducted on {formatDate(selectedPractice.createdAt)} • Overall Score: {selectedPractice.overallScore}%</p>
                            </div>
                            <button 
                                onClick={() => setSelectedPractice(null)} 
                                className="material-symbols-outlined hover:text-primary transition-colors cursor-pointer"
                            >
                                close
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-grow bg-background">
                            {selectedPractice.questions?.map((q, idx) => {
                                let grade = "Needs Work";
                                let color = "text-status-error bg-status-error/10 border-status-error/20";
                                if (q.score >= 80) {
                                    grade = "Excellent";
                                    color = "text-status-success bg-status-success/10 border-status-success/20";
                                } else if (q.score >= 60) {
                                    grade = "Good";
                                    color = "text-status-warning bg-status-warning/10 border-status-warning/20";
                                }

                                return (
                                    <div key={idx} className="border border-border-subtle rounded-xl p-5 space-y-4 bg-surface-container-low">
                                        <div className="flex justify-between items-center border-b border-border-subtle pb-3">
                                            <span className="font-bold text-xs text-text-muted uppercase font-label-technical">Question {idx + 1}</span>
                                            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-label-technical uppercase font-bold ${color}`}>
                                                {grade} ({q.score}%)
                                            </span>
                                        </div>
                                        <p className="font-body-md text-on-surface font-bold leading-snug">{q.question}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                            <div className="p-3 bg-surface-container-lowest border border-border-subtle rounded-lg space-y-1">
                                                <span className="font-label-caps text-[8px] tracking-wide text-text-muted font-bold">YOUR TRANSCRIPT</span>
                                                <p className="italic text-on-surface leading-relaxed">"{q.userAnswer || "No speech recorded."}"</p>
                                            </div>
                                            <div className="p-3 bg-surface-container-lowest border border-border-subtle rounded-lg space-y-1">
                                                <span className="font-label-caps text-[8px] tracking-wide text-primary font-bold">GEMINI AI FEEDBACK</span>
                                                <p className="text-on-surface-variant leading-relaxed">{q.feedback}</p>
                                            </div>
                                        </div>
                                        {q.matchedKeywords?.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                <span className="text-[9px] font-bold text-text-muted uppercase mr-1">Skills Hit:</span>
                                                {q.matchedKeywords.map((kw, i) => (
                                                    <span key={i} className="px-2 py-0.5 rounded bg-status-success/10 text-status-success border border-status-success/20 text-[9px] font-label-technical">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="border-t border-border-subtle p-4 flex justify-end bg-surface-container">
                            <button 
                                onClick={() => setSelectedPractice(null)} 
                                className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                            >
                                Close Scorecard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-surface-container-lowest border-t border-border-subtle mt-12">
                <div className="flex flex-col md:flex-row justify-between items-center py-8 px-container-margin w-full max-w-7xl mx-auto gap-4">
                    <span className="font-label-caps text-label-caps text-on-surface-variant font-bold">INTERVIEWIQ // TECH_EXCELLENCE</span>
                    <div className="flex gap-6">
                        <Link className="font-label-technical text-label-technical text-text-muted hover:text-primary transition-colors" to="#">Terms</Link>
                        <Link className="font-label-technical text-label-technical text-text-muted hover:text-primary transition-colors" to="#">Privacy</Link>
                        <Link className="font-label-technical text-label-technical text-text-muted hover:text-primary transition-colors" to="#">Support</Link>
                    </div>
                    <p className="font-label-technical text-label-technical text-text-muted">© 2024 InterviewIQ. Technical Excellence.</p>
                </div>
            </footer>
        </div>
    )
}

export default Home