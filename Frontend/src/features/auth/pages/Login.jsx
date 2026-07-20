import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'

const Login = () => {
    const { user, Loading, handleLogin, handleLogout } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMsg("")
        const res = await handleLogin({ email, password })
        if (res && res.success) {
            navigate("/")
        } else {
            setErrorMsg(res?.error || "Login failed")
        }
    }

    if (Loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-5xl animate-spin">sync</span>
                    <h1 className="font-label-technical text-label-technical text-xl text-primary">AUTHENTICATING...</h1>
                </div>
            </div>
        )
    }

    if (user) {
        return (
            <div className="min-h-screen bg-background flex flex-col justify-between">
                <header className="border-b border-border-subtle">
                    <div className="flex justify-between items-center px-container-margin h-16 w-full max-w-7xl mx-auto">
                        <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">InterviewIQ</span>
                    </div>
                </header>
                <main className="flex-grow flex items-center justify-center px-container-margin">
                    <div className="glass-panel p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
                        <span className="material-symbols-outlined text-primary text-[64px] mb-4">verified_user</span>
                        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Welcome, {user.username}!</h1>
                        <p className="font-body-md text-text-muted mb-6">You are successfully authenticated and logged in.</p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => navigate("/")}
                                className="w-full bg-primary text-on-primary py-3 font-bold rounded hover:bg-primary/90 transition-all cursor-pointer"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full border border-primary text-primary py-3 font-bold rounded hover:bg-primary/10 transition-all cursor-pointer"
                            >
                                Terminate Session
                            </button>
                        </div>
                    </div>
                </main>
                <footer className="border-t border-border-subtle py-8">
                    <div className="max-w-7xl mx-auto px-container-margin text-center">
                        <p className="font-label-technical text-label-technical text-text-muted">© 2024 InterviewIQ. Technical Excellence.</p>
                    </div>
                </footer>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-on-surface selection:bg-primary/30 flex flex-col justify-between">
            {/* Top Navigation Bar */}
            <header className="border-b border-border-subtle sticky top-0 bg-background/80 backdrop-blur-md z-50">
                <nav className="flex justify-between items-center px-container-margin h-16 w-full max-w-7xl mx-auto">
                    <div className="flex items-center gap-8">
                        <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">InterviewIQ</span>
                        <div className="hidden md:flex items-center gap-6">
                            <Link className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-body-md text-body-md" to="/">Dashboard</Link>
                            <Link className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-body-md text-body-md" to="/login">Reports</Link>
                            <Link className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-body-md text-body-md" to="/login">Practice</Link>
                        </div>
                    </div>
                </nav>
            </header>

            <main className="flex-grow flex items-center overflow-hidden hero-gradient">
                <div className="relative z-10 w-full max-w-7xl mx-auto px-container-margin grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12">
                    {/* Headline Content */}
                    <div className="lg:col-span-7">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-high border border-border-subtle rounded-full mb-6">
                            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
                            <span className="font-label-technical text-label-technical text-primary uppercase tracking-widest">New: AI Engine v4.2</span>
                        </div>
                        <h1 className="font-display-hero text-5xl lg:text-6xl text-on-surface mb-6 max-w-2xl leading-tight font-extrabold">
                            Master the Technical Interview with <span className="text-primary">AI Precision</span>.
                        </h1>
                        <p className="font-body-lg text-body-lg text-text-muted mb-8 max-w-xl">
                            An elite-tier diagnostic platform designed for high-stakes technical candidates. Analyze resumes, simulate realistic system design mocks, and identify critical knowledge gaps before you step into the room.
                        </p>
                        <div className="grid grid-cols-3 gap-8 max-w-lg">
                            <div>
                                <div className="font-headline-md text-2xl font-bold text-on-surface">98.2%</div>
                                <div className="font-label-technical text-label-technical text-text-muted">Prediction Accuracy</div>
                            </div>
                            <div>
                                <div className="font-headline-md text-2xl font-bold text-on-surface">450+</div>
                                <div className="font-label-technical text-label-technical text-text-muted">Algorithm Templates</div>
                            </div>
                            <div>
                                <div className="font-headline-md text-2xl font-bold text-on-surface">12ms</div>
                                <div className="font-label-technical text-label-technical text-text-muted">Analysis Latency</div>
                            </div>
                        </div>
                    </div>

                    {/* Auth Integration */}
                    <div className="lg:col-span-5">
                        <div className="glass-panel p-8 rounded-xl shadow-2xl relative overflow-hidden">
                            <div className="flex border-b border-border-subtle mb-8">
                                <button className="flex-1 pb-4 font-label-technical text-label-technical text-on-surface border-b-2 border-primary transition-all">
                                    LOGIN
                                </button>
                                <button onClick={() => navigate("/register")} className="flex-1 pb-4 font-label-technical text-label-technical text-text-muted hover:text-on-surface transition-all">
                                    REGISTER
                                </button>
                            </div>

                            {/* Login Form */}
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {errorMsg && (
                                    <div className="p-4 bg-error-container/20 border border-error-container text-error rounded font-body-sm flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">error</span>
                                        <span>{errorMsg}</span>
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <label className="font-label-technical text-label-technical text-text-muted">IDENTIFIER (EMAIL)</label>
                                    <input 
                                        className="w-full bg-surface-container border border-border-subtle rounded px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors font-label-technical" 
                                        placeholder="dev@interviewiq.ai" 
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-label-technical text-label-technical text-text-muted">SECURITY TOKEN (PASSWORD)</label>
                                    <input 
                                        className="w-full bg-surface-container border border-border-subtle rounded px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors font-label-technical" 
                                        placeholder="••••••••" 
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button className="w-full bg-primary text-on-primary py-4 font-bold rounded flex justify-center items-center gap-2 hover:bg-primary/90 transition-all cursor-pointer">
                                    <span>AUTHENTICATE</span>
                                    <span className="material-symbols-outlined text-[18px]">fingerprint</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-surface-container-lowest border-t border-border-subtle">
                <div className="flex flex-col md:flex-row justify-between items-center py-8 px-container-margin w-full max-w-7xl mx-auto gap-4">
                    <div className="flex flex-col gap-2">
                        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">InterviewIQ</span>
                        <p className="font-label-technical text-label-technical text-text-muted">© 2024 InterviewIQ. Technical Excellence.</p>
                    </div>
                    <div className="flex gap-8">
                        <Link className="font-label-technical text-label-technical text-text-muted hover:text-primary transition-colors" to="#">Terms</Link>
                        <Link className="font-label-technical text-label-technical text-text-muted hover:text-primary transition-colors" to="#">Privacy</Link>
                        <Link className="font-label-technical text-label-technical text-text-muted hover:text-primary transition-colors" to="#">Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Login
