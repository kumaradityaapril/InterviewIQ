import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { getReportById } from '../services/interview.api'
import { useAuth } from '../../auth/hooks/useAuth'

const Report = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { handleLogout } = useAuth()

    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState("")

    // Accordion expansion states
    const [expandedTech, setExpandedTech] = useState({})
    const [expandedBehavioral, setExpandedBehavioral] = useState({})

    useEffect(() => {
        const fetchReportDetails = async () => {
            try {
                const data = await getReportById(id)
                if (data && data.report) {
                    setReport(data.report)
                } else {
                    setErrorMsg("Report not found.")
                }
            } catch (err) {
                console.error(err)
                setErrorMsg("Failed to load report details.")
            } finally {
                setLoading(false)
            }
        }
        fetchReportDetails()
    }, [id])

    const toggleTechAccordion = (index) => {
        setExpandedTech(prev => ({ ...prev, [index]: !prev[index] }))
    }

    const toggleBehavioralAccordion = (index) => {
        setExpandedBehavioral(prev => ({ ...prev, [index]: !prev[index] }))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-on-surface">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-5xl animate-spin">sync</span>
                    <h1 className="font-label-technical text-label-technical text-xl text-primary">RETRIEVING REPORT...</h1>
                </div>
            </div>
        )
    }

    if (errorMsg || !report) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-on-surface p-6">
                <div className="glass-panel p-8 rounded-xl max-w-md text-center">
                    <span className="material-symbols-outlined text-status-error text-6xl mb-4">error</span>
                    <h2 className="font-headline-lg text-2xl mb-2 text-on-surface">Error Loading Report</h2>
                    <p className="font-body-md text-text-muted mb-6">{errorMsg || "An unknown error occurred."}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-primary text-on-primary px-6 py-2.5 rounded font-bold hover:bg-primary/90 transition-all cursor-pointer"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    const firstLine = report.jobDescription?.split('\n')[0] || "Software Engineer"
    const title = firstLine.length > 50 ? firstLine.substring(0, 50) + "..." : firstLine
    const matchScore = report.matchScore || 0
    const reportDate = new Date(report.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })

    // Separate skill gaps by severity
    const highGaps = report.skillGaps?.filter(g => g.severity?.toLowerCase() === 'high') || []
    const medGaps = report.skillGaps?.filter(g => g.severity?.toLowerCase() === 'medium') || []
    const lowGaps = report.skillGaps?.filter(g => g.severity?.toLowerCase() === 'low') || []

    return (
        <div className="min-h-screen bg-background text-on-surface font-body-md selection:bg-primary/30 flex flex-col justify-between">
            {/* Top Navigation Bar */}
            <header className="border-b border-border-subtle sticky top-0 bg-background/85 backdrop-blur-md z-50">
                <div className="flex justify-between items-center px-container-margin h-16 w-full max-w-7xl mx-auto">
                    <div className="flex items-center gap-8">
                        <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">InterviewIQ</span>
                        <nav className="hidden md:flex gap-6">
                            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" to="/">Dashboard</Link>
                            <Link className="font-body-md text-body-md text-primary border-b-2 border-primary pb-1" to="#">Reports</Link>
                            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" to="/practice">Practice</Link>
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

            {/* Main Content */}
            <main className="w-full max-w-7xl mx-auto px-container-margin py-8 flex-grow space-y-12">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-label-technical text-label-technical">
                            <span className="material-symbols-outlined text-[16px]">analytics</span>
                            ANALYSIS REPORT #{report._id.substring(report._id.length - 6).toUpperCase()}
                        </div>
                        <h1 className="font-headline-lg text-3xl md:text-4xl text-on-surface font-extrabold">
                            Analysis for <span className="text-primary">{title}</span>
                        </h1>
                        <p className="text-text-muted font-body-md">Comprehensive gap analysis and readiness preparation generated on {reportDate}.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="bg-surface-container border border-border-subtle px-4 py-2 rounded-lg font-label-technical text-label-technical hover:bg-surface-bright transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">download</span> EXPORT REPORT
                        </button>
                        <button
                            onClick={() => navigate('/practice')}
                            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-technical text-label-technical hover:opacity-90 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">play_circle</span> START SIMULATION
                        </button>
                    </div>
                </header>

                {/* Bento Grid: Score & Technical Gaps */}
                <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Radial Match Score */}
                    <div className="md:col-span-4 bg-surface-container border border-border-subtle p-8 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary-container to-primary"></div>
                        <h3 className="font-label-caps text-label-caps text-text-muted mb-8 self-start tracking-widest font-bold">OVERALL MATCH SCORE</h3>
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            {/* Circular SVG Progress */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle className="text-surface-elevated" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" stroke-width="10"></circle>
                                <circle
                                    className="text-secondary transition-all duration-1000"
                                    cx="96"
                                    cy="96"
                                    fill="transparent"
                                    r="80"
                                    stroke="currentColor"
                                    strokeWidth="10"
                                    strokeDasharray="502.6"
                                    strokeDashoffset={502.6 - (502.6 * matchScore) / 100}
                                    style={{ strokeLinecap: 'round' }}
                                ></circle>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="font-display-hero text-5xl font-extrabold text-on-surface">
                                    {matchScore}<span className="text-2xl font-normal">%</span>
                                </span>
                                <span className="font-label-technical text-label-technical text-status-success mt-1 tracking-widest">
                                    {matchScore >= 80 ? "STRONG MATCH" : matchScore >= 60 ? "AVERAGE MATCH" : "GAP DETECTED"}
                                </span>
                            </div>
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                            <div className="text-center p-3 bg-surface-container-low rounded-lg border border-border-subtle">
                                <div className="text-text-muted font-label-caps text-[10px] tracking-wider font-bold">CULTURAL FIT</div>
                                <div className="font-label-technical text-label-technical text-on-surface font-bold mt-1">94%</div>
                            </div>
                            <div className="text-center p-3 bg-surface-container-low rounded-lg border border-border-subtle">
                                <div className="text-text-muted font-label-caps text-[10px] tracking-wider font-bold">TECHNICAL SKILLS</div>
                                <div className="font-label-technical text-label-technical text-on-surface font-bold mt-1">{matchScore}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Technical Gaps List */}
                    <div className="md:col-span-8 bg-surface-container border border-border-subtle p-8 rounded-xl flex flex-col gap-6">
                        <div className="flex justify-between items-center border-b border-border-subtle/50 pb-3">
                            <h3 className="font-label-caps text-label-caps text-text-muted tracking-widest font-bold">PRIORITY GAPS DETECTED</h3>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-1 font-label-technical text-label-technical text-status-error bg-status-error/10 px-2 py-1 rounded">High: {highGaps.length}</span>
                                <span className="flex items-center gap-1 font-label-technical text-label-technical text-status-warning bg-status-warning/10 px-2 py-1 rounded">Med: {medGaps.length}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                            {report.skillGaps && report.skillGaps.length > 0 ? (
                                report.skillGaps.map((gap, index) => {
                                    const severityColor = gap.severity?.toLowerCase() === 'high'
                                        ? "border-l-status-error text-status-error"
                                        : gap.severity?.toLowerCase() === 'medium'
                                            ? "border-l-status-warning text-status-warning"
                                            : "border-l-primary text-primary"

                                    const tagBg = gap.severity?.toLowerCase() === 'high'
                                        ? "bg-status-error/10 text-status-error"
                                        : gap.severity?.toLowerCase() === 'medium'
                                            ? "bg-status-warning/10 text-status-warning"
                                            : "bg-primary/10 text-primary"

                                    return (
                                        <div
                                            key={index}
                                            className={`bg-surface-container-lowest border border-border-subtle p-5 rounded-lg border-l-4 ${severityColor} hover:border-outline transition-colors group`}
                                        >
                                            <div className="flex justify-between mb-3">
                                                <span className="font-label-technical text-label-technical uppercase tracking-widest">{gap.severity} Severity</span>
                                            </div>
                                            <h4 className="font-headline-md text-lg font-bold mb-2 text-on-surface">{gap.skill}</h4>
                                            <p className="text-text-muted font-body-sm mb-4 leading-relaxed">
                                                Identified discrepancy in experience with {gap.skill}. Core alignment gap against requirements.
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                <span className={`font-label-technical text-[10px] px-2 py-0.5 rounded-sm ${tagBg} uppercase`}>
                                                    {gap.skill}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="col-span-2 text-center p-8 text-text-muted">
                                    <span className="material-symbols-outlined text-4xl mb-2 text-status-success">check_circle</span>
                                    <p className="font-body-md">No significant skill gaps found! Your profile aligns perfectly with this job specification.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Q&A Accordion Sections */}
                <section className="space-y-6">
                    <h3 className="font-label-caps text-label-caps text-text-muted tracking-widest font-bold uppercase">STRATEGIC PREPARATION FOLDERS</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Technical Q&A */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 px-2 border-b border-border-subtle/50 pb-2">
                                <span className="material-symbols-outlined text-primary">code</span>
                                <h4 className="font-headline-md text-xl font-bold text-on-surface">Technical Deep-Dive</h4>
                            </div>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                {report.technicalQuestions && report.technicalQuestions.map((q, idx) => {
                                    const isExpanded = !!expandedTech[idx]
                                    return (
                                        <div key={idx} className="bg-surface-container border border-border-subtle rounded-lg overflow-hidden transition-all">
                                            <button
                                                className="w-full text-left p-4 flex justify-between items-center hover:bg-surface-bright transition-colors cursor-pointer"
                                                onClick={() => toggleTechAccordion(idx)}
                                            >
                                                <span className="font-body-md text-body-md font-semibold text-on-surface pr-4">{q.question}</span>
                                                <span className={`material-symbols-outlined text-text-muted transition-transform duration-200 ${isExpanded ? "rotate-90 text-primary" : ""}`}>
                                                    chevron_right
                                                </span>
                                            </button>
                                            {isExpanded && (
                                                <div className="bg-surface-container-low border-t border-border-subtle p-6 space-y-4 animate-fadeIn">
                                                    <div>
                                                        <div className="font-label-technical text-label-technical text-primary mb-1 uppercase tracking-wider">Interviewer Intent</div>
                                                        <p className="text-text-muted font-body-sm leading-relaxed">{q.intention}</p>
                                                    </div>
                                                    <div>
                                                        <div className="font-label-technical text-label-technical text-secondary mb-1 uppercase tracking-wider">Suggested Answer Strategy</div>
                                                        <p className="text-on-surface font-body-sm leading-relaxed whitespace-pre-wrap">{q.answer}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Behavioral Q&A */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 px-2 border-b border-border-subtle/50 pb-2">
                                <span className="material-symbols-outlined text-tertiary">psychology</span>
                                <h4 className="font-headline-md text-xl font-bold text-on-surface">Behavioral &amp; Values</h4>
                            </div>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                {report.behavioralQuestions && report.behavioralQuestions.map((q, idx) => {
                                    const isExpanded = !!expandedBehavioral[idx]
                                    return (
                                        <div key={idx} className="bg-surface-container border border-border-subtle rounded-lg overflow-hidden transition-all">
                                            <button
                                                className="w-full text-left p-4 flex justify-between items-center hover:bg-surface-bright transition-colors cursor-pointer"
                                                onClick={() => toggleBehavioralAccordion(idx)}
                                            >
                                                <span className="font-body-md text-body-md font-semibold text-on-surface pr-4">{q.question}</span>
                                                <span className={`material-symbols-outlined text-text-muted transition-transform duration-200 ${isExpanded ? "rotate-90 text-tertiary" : ""}`}>
                                                    chevron_right
                                                </span>
                                            </button>
                                            {isExpanded && (
                                                <div className="bg-surface-container-low border-t border-border-subtle p-6 space-y-4 animate-fadeIn">
                                                    <div>
                                                        <div className="font-label-technical text-label-technical text-primary mb-1 uppercase tracking-wider">Interviewer Intent</div>
                                                        <p className="text-text-muted font-body-sm leading-relaxed">{q.intention}</p>
                                                    </div>
                                                    <div>
                                                        <div className="font-label-technical text-label-technical text-tertiary mb-1 uppercase tracking-wider">STAR Response Strategy</div>
                                                        <p className="text-on-surface font-body-sm leading-relaxed whitespace-pre-wrap">{q.answer}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 7-Day Readiness Roadmap */}
                <section className="space-y-8 pb-12">
                    <div className="flex justify-between items-center border-b border-border-subtle pb-3">
                        <h3 className="font-label-caps text-label-caps text-text-muted tracking-widest font-bold uppercase">READINESS ROADMAP (7 DAYS)</h3>
                        <span className="text-status-success font-label-technical text-label-technical flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span> SYSTEM GENERATED PLAN
                        </span>
                    </div>

                    <div className="relative pt-12">
                        {/* Timeline Connector Line */}
                        <div className="absolute top-[4.5rem] left-0 w-full h-[1px] border-t border-dashed border-border-subtle"></div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                            {report.preparationPlan && report.preparationPlan.map((plan, index) => {
                                return (
                                    <div key={index} className="relative group flex flex-col">
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold z-10 ring-4 ring-background">
                                            {plan.day}
                                        </div>
                                        <div className="bg-surface-container border border-primary p-4 rounded-lg flex-grow hover:bg-surface-bright transition-all shadow-[0_0_15px_rgba(173,198,255,0.06)] min-h-[160px] flex flex-col justify-between">
                                            <div>
                                                <h5 className="font-label-caps text-label-caps text-primary mb-2 font-bold line-clamp-1">{plan.focus}</h5>
                                                <ul className="text-on-surface font-body-sm space-y-1.5 list-disc list-inside">
                                                    {plan.tasks && plan.tasks.slice(0, 2).map((t, idx) => (
                                                        <li key={idx} className="line-clamp-2 text-xs leading-normal">{t}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-surface-container-lowest border-t border-border-subtle">
                <div className="max-w-7xl mx-auto px-container-margin flex flex-col md:flex-row justify-between items-center py-8 gap-4">
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <span className="font-label-caps text-label-caps text-on-surface-variant font-bold">INTERVIEWIQ</span>
                        <span className="font-label-technical text-label-technical text-text-muted">© 2024 InterviewIQ. Technical Excellence.</span>
                    </div>
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

export default Report
