import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import Tech3DBackground from '../../interview/components/Tech3DBackground'
import Tilt3D from '../../interview/components/Tilt3D'

const Register = () => {
    const { Loading, handleRegister, handleGoogleLogin } = useAuth()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    const navigate = useNavigate()

    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        
        const initializeGoogleSignIn = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleGoogleCallback
                });
                window.google.accounts.id.renderButton(
                    document.getElementById("googleSignInDiv"),
                    { theme: "outline", size: "large", width: "100%", text: "signup_with" }
                );
            }
        };

        const handleGoogleCallback = async (response) => {
            setErrorMsg("");
            const res = await handleGoogleLogin(response.credential);
            if (res && res.success) {
                navigate("/");
            } else {
                setErrorMsg(res?.error || "Google registration failed");
            }
        };

        if (window.google) {
            initializeGoogleSignIn();
        } else {
            const checkInterval = setInterval(() => {
                if (window.google) {
                    initializeGoogleSignIn();
                    clearInterval(checkInterval);
                }
            }, 300);
            return () => clearInterval(checkInterval);
        }
    }, [handleGoogleLogin, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMsg("")
        const result = await handleRegister({ username, email, password })
        if (result && result.success) {
            navigate("/")
        } else {
            setErrorMsg(result?.error || "Registration failed")
        }
    }

    if (Loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-5xl animate-spin">sync</span>
                    <h1 className="font-label-technical text-label-technical text-xl text-primary">INITIALIZING ACCOUNT...</h1>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-on-surface selection:bg-primary/30 flex flex-col justify-between relative overflow-hidden">
            <Tech3DBackground />
            {/* Top Navigation Bar */}
            <header className="border-b border-border-subtle sticky top-0 bg-background/80 backdrop-blur-md z-50">
                <nav className="flex justify-between items-center px-container-margin h-16 w-full max-w-7xl mx-auto">
                    <div className="flex items-center gap-8">
                        <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">InterviewIQ</span>
                    </div>
                </nav>
            </header>

            <main className="flex-grow overflow-y-auto">
                <div className="relative z-10 w-full max-w-7xl mx-auto px-container-margin grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12">
                    {/* Headline Content */}
                    <div className="lg:col-span-7">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-high border border-border-subtle rounded-full mb-6">
                            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
                            <span className="font-label-technical text-label-technical text-primary uppercase tracking-widest">AI-POWERED PREPARATION</span>
                        </div>
                        <h1 className="font-display-hero text-5xl lg:text-6xl text-on-surface mb-6 max-w-2xl leading-tight font-extrabold">
                            Master the Technical Interview with <span className="text-primary">AI Precision</span>.
                        </h1>
                        <p className="font-body-lg text-body-lg text-text-muted mb-8 max-w-xl">
                            An elite-tier diagnostic platform designed for high-stakes technical candidates. Analyze resumes, simulate realistic system design mocks, and identify critical knowledge gaps before you step into the room.
                        </p>
                        
                        {/* Expanded Site Features List */}
                        <div className="space-y-4 max-w-xl">
                            <div className="flex gap-4 items-start bg-surface-container-low/40 p-4 rounded-xl border border-border-subtle/50">
                                <span className="material-symbols-outlined text-primary text-2xl mt-0.5">psychology</span>
                                <div>
                                    <h4 className="font-body-md text-on-surface font-bold text-sm">AI Match Diagnostics</h4>
                                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                                        Instantly parse your PDF resume against targeted Job Descriptions. Detect skill gaps and get a tailored preparation timeline.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start bg-surface-container-low/40 p-4 rounded-xl border border-border-subtle/50">
                                <span className="material-symbols-outlined text-secondary text-2xl mt-0.5">record_voice_over</span>
                                <div>
                                    <h4 className="font-body-md text-on-surface font-bold text-sm">Real-time Speech Simulator</h4>
                                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                                        Simulate conversational technical rounds. Speak your responses to receive instant content quality scores and keyword feedback.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start bg-surface-container-low/40 p-4 rounded-xl border border-border-subtle/50">
                                <span className="material-symbols-outlined text-primary-fixed-dim text-2xl mt-0.5">description</span>
                                <div>
                                    <h4 className="font-body-md text-on-surface font-bold text-sm">ATS Serif LaTeX Builder</h4>
                                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                                        Optimize your work history descriptions automatically. Preview and compile a beautiful single-page tailored LaTeX resume.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Auth Integration */}
                    <div className="lg:col-span-5 relative z-10">
                        <Tilt3D>
                            <div className="glass-panel p-8 rounded-xl shadow-2xl relative overflow-hidden">
                                <div className="flex border-b border-border-subtle mb-8">
                                    <button onClick={() => navigate("/login")} className="flex-1 pb-4 font-label-technical text-label-technical text-text-muted hover:text-on-surface transition-all">
                                        LOGIN
                                    </button>
                                    <button className="flex-1 pb-4 font-label-technical text-label-technical text-on-surface border-b-2 border-primary transition-all">
                                        REGISTER
                                    </button>
                                </div>

                                {/* Register Form */}
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    {errorMsg && (
                                        <div className="p-4 bg-error-container/20 border border-error-container text-error rounded font-body-sm flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">error</span>
                                            <span>{errorMsg}</span>
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <label className="font-label-technical text-label-technical text-text-muted">FULL NAME</label>
                                        <input 
                                            className="w-full bg-surface-container border border-border-subtle rounded px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors font-label-technical text-white" 
                                            placeholder="John Doe" 
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="font-label-technical text-label-technical text-text-muted">EMAIL ADDRESS</label>
                                        <input 
                                            className="w-full bg-surface-container border border-border-subtle rounded px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors font-label-technical text-white" 
                                            placeholder="dev@interviewiq.ai" 
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="font-label-technical text-label-technical text-text-muted">PASSWORD</label>
                                        <input 
                                            className="w-full bg-surface-container border border-border-subtle rounded px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors font-label-technical text-white" 
                                            placeholder="••••••••" 
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button className="w-full bg-primary text-on-primary py-3.5 font-bold rounded flex justify-center items-center gap-2 hover:bg-primary/90 transition-all mt-4 cursor-pointer">
                                        <span>CREATE ACCOUNT</span>
                                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                                    </button>
                                </form>

                                <div className="relative flex py-5 items-center">
                                    <div className="flex-grow border-t border-border-subtle"></div>
                                    <span className="flex-shrink mx-4 text-text-muted font-label-technical text-[10px]">SECURE CONNECT</span>
                                    <div className="flex-grow border-t border-border-subtle"></div>
                                </div>
                                
                                <div id="googleSignInDiv" className="w-full flex justify-center"></div>
                            </div>
                        </Tilt3D>
                    </div>
                </div>

                {/* The 3-Step Preparation Loop Section */}
                <div className="border-t border-border-subtle bg-surface-container-lowest/50 py-16 relative">
                    <div className="max-w-7xl mx-auto px-container-margin space-y-12">
                        <div className="text-center max-w-2xl mx-auto space-y-4">
                            <h2 className="font-headline-lg text-3xl font-extrabold text-on-surface">The 3-Step Preparation Loop</h2>
                            <p className="text-body-md text-text-muted">No fluff. No generic advice. Just targeted, performance-driven feedback designed to get you hired.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="glass-panel p-8 rounded-xl border border-border-subtle hover:border-primary/45 transition-all space-y-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-headline-md text-primary font-bold text-xl">01</div>
                                <h3 className="font-body-lg text-on-surface font-bold">Submit Target Profile</h3>
                                <p className="text-xs text-text-muted leading-relaxed">
                                    Upload your PDF resume and paste the description of the exact position you are targeting.
                                </p>
                            </div>
                            <div className="glass-panel p-8 rounded-xl border border-border-subtle hover:border-primary/45 transition-all space-y-4">
                                <div className="w-12 h-12 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center font-headline-md text-secondary font-bold text-xl">02</div>
                                <h3 className="font-body-lg text-on-surface font-bold">Simulate Speech Rounds</h3>
                                <p className="text-xs text-text-muted leading-relaxed">
                                    Answer live, tailored behavioral and technical questions in our conversational speech simulator.
                                </p>
                            </div>
                            <div className="glass-panel p-8 rounded-xl border border-border-subtle hover:border-primary/45 transition-all space-y-4">
                                <div className="w-12 h-12 rounded-lg bg-primary-fixed-dim/10 border border-primary-fixed-dim/20 flex items-center justify-center font-headline-md text-primary-fixed-dim font-bold text-xl">03</div>
                                <h3 className="font-body-lg text-on-surface font-bold">Restructure Resume</h3>
                                <p className="text-xs text-text-muted leading-relaxed">
                                    Apply localized keywords and structured bullets to export a clean Serif LaTeX resume page.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    )
}

export default Register
