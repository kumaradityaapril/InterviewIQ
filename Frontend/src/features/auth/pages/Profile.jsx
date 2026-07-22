import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getUserProfile, updateUserProfile } from '../services/auth.api';
import Tech3DBackground from '../../../features/interview/components/Tech3DBackground';
import Tilt3D from '../../../features/interview/components/Tilt3D';

const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Profile state details
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const [stats, setStats] = useState({
        totalReports: 0,
        totalPracticeSessions: 0,
        averagePracticeScore: 0
    });

    // Update state fields
    const [newName, setNewName] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await getUserProfile();
                if (data && data.profile) {
                    const p = data.profile;
                    setUsername(p.username || "");
                    setEmail(p.email || "");
                    setIsGoogleUser(p.isGoogleUser || false);
                    setStats(p.stats || { totalReports: 0, totalPracticeSessions: 0, averagePracticeScore: 0 });
                    setNewName(p.username || "");
                } else {
                    setErrorMsg("Failed to retrieve profile details.");
                }
            } catch (err) {
                console.error(err);
                setErrorMsg("Failed to connect to the authentication service.");
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSuccessMsg("");
        setErrorMsg("");

        if (!newName.trim()) {
            setErrorMsg("Full Name cannot be empty.");
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            setErrorMsg("Passwords do not match.");
            return;
        }

        setUpdating(true);
        try {
            const data = await updateUserProfile({
                username: newName,
                password: newPassword || undefined
            });
            if (data && data.user) {
                setUsername(data.user.username);
                setNewPassword("");
                setConfirmPassword("");
                setSuccessMsg("Profile details updated successfully!");
            } else {
                setErrorMsg(data.message || "Failed to update profile details.");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(err.response?.data?.message || "Failed to update profile details.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-on-surface relative overflow-hidden">
                <Tech3DBackground />
                <div className="flex flex-col items-center gap-4 z-10">
                    <span className="material-symbols-outlined text-primary text-5xl animate-spin">sync</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold">LOADING PROFILE...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-on-surface font-body-md selection:bg-primary/30 flex flex-col justify-between relative overflow-hidden">
            <Tech3DBackground />

            {/* Top Navigation Bar */}
            <header className="border-b border-border-subtle sticky top-0 bg-background/85 backdrop-blur-md z-50">
                <div className="flex justify-between items-center px-container-margin h-16 w-full max-w-7xl mx-auto">
                    <div className="flex items-center gap-8">
                        <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">InterviewIQ</span>
                        <span className="font-label-technical text-label-technical text-text-muted">PROFILE BOARD v1.0</span>
                    </div>
                    <button 
                        onClick={() => navigate(-1)}
                        className="text-primary hover:text-primary/90 text-sm font-label-technical flex items-center gap-1 cursor-pointer font-bold"
                    >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span> BACK
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full max-w-6xl mx-auto px-container-margin py-10 flex-grow z-10 flex flex-col gap-8">
                <div className="space-y-2">
                    <h1 className="font-headline-lg text-3xl font-extrabold text-on-surface">Your Account Center</h1>
                    <p className="text-text-muted text-sm leading-relaxed">
                        Manage your user settings and review your aggregate AI readiness achievements in one location.
                    </p>
                </div>

                {successMsg && (
                    <div className="bg-status-success/10 border border-status-success/20 text-status-success p-4 rounded-lg flex items-center gap-3 text-sm">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        {successMsg}
                    </div>
                )}

                {errorMsg && (
                    <div className="bg-status-error/10 border border-status-error/20 text-status-error p-4 rounded-lg flex items-center gap-3 text-sm">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {errorMsg}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Profile Card & Edit Forms */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <Tilt3D>
                            <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                                
                                {/* Large Avatar */}
                                <div className="w-24 h-24 rounded-full bg-surface-container-high border-2 border-primary/50 overflow-hidden flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-[64px] text-text-muted">person</span>
                                </div>

                                <h2 className="font-headline-md text-xl font-bold text-on-surface">{username}</h2>
                                <p className="text-text-muted text-sm mt-0.5">{email}</p>

                                <div className="mt-4 px-3 py-1 rounded-full text-xs font-label-technical uppercase flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary">
                                    <span className="material-symbols-outlined text-sm">{isGoogleUser ? 'lock_open' : 'key'}</span>
                                    <span>{isGoogleUser ? 'Google Login Active' : 'Credential Login Active'}</span>
                                </div>
                            </div>
                        </Tilt3D>

                        <div className="glass-panel p-8 rounded-2xl space-y-4">
                            <h3 className="font-label-caps text-label-caps text-on-surface border-b border-border-subtle pb-2 font-bold uppercase tracking-wider text-xs">EDIT DETAILS</h3>
                            <form onSubmit={handleProfileUpdate} className="space-y-4 text-left">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-label-technical text-text-muted uppercase font-bold">Full Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full text-sm bg-surface-container border border-border-subtle rounded-lg p-2.5 text-on-surface focus:outline-none focus:border-primary text-black font-semibold"
                                        value={newName} 
                                        onChange={(e) => setNewName(e.target.value)}
                                    />
                                </div>

                                {!isGoogleUser && (
                                    <>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-label-technical text-text-muted uppercase font-bold">New Password</label>
                                            <input 
                                                type="password" 
                                                placeholder="••••••••"
                                                className="w-full text-sm bg-surface-container border border-border-subtle rounded-lg p-2.5 text-on-surface focus:outline-none focus:border-primary text-black"
                                                value={newPassword} 
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-label-technical text-text-muted uppercase font-bold">Confirm Password</label>
                                            <input 
                                                type="password" 
                                                placeholder="••••••••"
                                                className="w-full text-sm bg-surface-container border border-border-subtle rounded-lg p-2.5 text-on-surface focus:outline-none focus:border-primary text-black"
                                                value={confirmPassword} 
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}

                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="w-full bg-primary text-on-primary py-2.5 rounded-lg font-label-technical text-label-technical hover:opacity-90 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer font-bold shadow-md"
                                >
                                    {updating ? (
                                        <>
                                            <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                            UPDATING...
                                        </>
                                    ) : (
                                        'SAVE CHANGES'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Performance Statistics Dashboard */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Tilt3D>
                                <div className="glass-panel p-6 rounded-2xl space-y-2 relative overflow-hidden text-center sm:text-left">
                                    <span className="material-symbols-outlined text-primary text-3xl mb-2">description</span>
                                    <h4 className="font-label-caps text-label-caps text-text-muted text-[10px] uppercase font-bold tracking-wider">AI EVALUATION REPORTS</h4>
                                    <p className="font-headline-lg text-4xl font-black text-on-surface">{stats.totalReports}</p>
                                    <p className="text-text-muted text-xs">Total resumes analyzed against target job specs.</p>
                                </div>
                            </Tilt3D>

                            <Tilt3D>
                                <div className="glass-panel p-6 rounded-2xl space-y-2 relative overflow-hidden text-center sm:text-left">
                                    <span className="material-symbols-outlined text-secondary text-3xl mb-2">record_voice_over</span>
                                    <h4 className="font-label-caps text-label-caps text-text-muted text-[10px] uppercase font-bold tracking-wider">PRACTICE INTERVIEWS</h4>
                                    <p className="font-headline-lg text-4xl font-black text-on-surface">{stats.totalPracticeSessions}</p>
                                    <p className="text-text-muted text-xs">Completed simulator mock practice evaluations.</p>
                                </div>
                            </Tilt3D>
                        </div>

                        {/* Overall Average Rating Scorecard */}
                        <Tilt3D>
                            <div className="glass-panel p-8 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                                <div className="space-y-2 text-center sm:text-left">
                                    <h3 className="font-label-caps text-label-caps text-primary tracking-widest font-bold uppercase text-xs">Overall Practice Rating</h3>
                                    <h4 className="font-headline-md text-xl text-on-surface font-extrabold">Aggregate Simulation Score</h4>
                                    <p className="text-text-muted text-xs max-w-sm leading-relaxed">
                                        Your cumulative average score across all voice practice evaluation rounds calculated in real-time.
                                    </p>
                                </div>

                                <div className="shrink-0 flex flex-col items-center gap-2">
                                    <div className="relative w-28 h-28 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle className="text-surface-elevated" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="6"></circle>
                                            <circle 
                                                className="text-primary transition-all duration-1000" 
                                                cx="56" 
                                                cy="56" 
                                                fill="transparent" 
                                                r="48" 
                                                stroke="currentColor" 
                                                strokeWidth="6" 
                                                strokeDasharray="301.6" 
                                                strokeDashoffset={301.6 - (301.6 * (stats.averagePracticeScore || 0)) / 100}
                                                style={{ strokeLinecap: 'round' }}
                                            ></circle>
                                        </svg>
                                        <span className="absolute text-3xl font-extrabold text-on-surface">{stats.averagePracticeScore || 0}%</span>
                                    </div>
                                    <span className="font-label-technical text-[10px] text-primary uppercase tracking-widest font-bold">AVERAGE RATING</span>
                                </div>
                            </div>
                        </Tilt3D>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-surface-container-lowest border-t border-border-subtle py-6">
                <div className="max-w-7xl mx-auto px-container-margin text-center">
                    <p className="font-label-technical text-label-technical text-text-muted">© 2024 InterviewIQ. Performance Dashboard.</p>
                </div>
            </footer>
        </div>
    );
};

export default Profile;
