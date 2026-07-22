import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { parseResumeToForm, tailorCustomResume } from '../services/interview.api';
import Tech3DBackground from '../components/Tech3DBackground';
import Tilt3D from '../components/Tilt3D';

const ResumeFormPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const reportId = searchParams.get("reportId");

    const [loading, setLoading] = useState(false);
    const [fetchingContext, setFetchingContext] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [step, setStep] = useState(1);

    useEffect(() => {
        if (!reportId) return;

        const loadReportContext = async () => {
            setFetchingContext(true);
            setErrorMsg("");
            try {
                const data = await parseResumeToForm(reportId);
                if (data && data.parsedResume) {
                    const pr = data.parsedResume;
                    setJobDescription(data.jobDescription || "");
                    setFullName(pr.fullName || "");
                    setTitle(pr.title || "");
                    setContact(pr.contact || { email: "", phone: "", location: "", github: "", linkedin: "" });
                    setSkills(pr.skills && pr.skills.length > 0 ? pr.skills : [""]);
                    setExperience(pr.experience && pr.experience.length > 0 ? pr.experience : [{ role: "", company: "", duration: "", bulletPoints: [""] }]);
                    setProjects(pr.projects && pr.projects.length > 0 ? pr.projects : [{ name: "", technologies: "", bulletPoints: [""] }]);
                    setEducation(pr.education && pr.education.length > 0 ? pr.education : [{ degree: "", institution: "", year: "" }]);
                    setCertifications(pr.certifications && pr.certifications.length > 0 ? pr.certifications : [""]);
                    setAchievements(pr.achievements && pr.achievements.length > 0 ? pr.achievements : [""]);
                } else {
                    setErrorMsg("AI agent failed to parse report resume details.");
                }
            } catch (err) {
                console.error("Error populating resume form from report context:", err);
                setErrorMsg("Failed to connect to the resume parsing agent.");
            } finally {
                setFetchingContext(false);
            }
        };
        loadReportContext();
    }, [reportId]);

    // Form inputs state
    const [jobDescription, setJobDescription] = useState("");
    const [fullName, setFullName] = useState("");
    const [title, setTitle] = useState("");
    
    const [contact, setContact] = useState({
        email: "",
        phone: "",
        location: "",
        github: "",
        linkedin: ""
    });

    const [skills, setSkills] = useState([""]);
    const [experience, setExperience] = useState([
        { role: "", company: "", duration: "", bulletPoints: [""] }
    ]);
    const [projects, setProjects] = useState([
        { name: "", technologies: "", bulletPoints: [""] }
    ]);
    const [education, setEducation] = useState([
        { degree: "", institution: "", year: "" }
    ]);
    const [certifications, setCertifications] = useState([""]);
    const [achievements, setAchievements] = useState([""]);

    // Handlers for experience dynamic entries
    const handleAddExperience = () => {
        setExperience(prev => [...prev, { role: "", company: "", duration: "", bulletPoints: [""] }]);
    };
    const handleRemoveExperience = (idx) => {
        setExperience(prev => prev.filter((_, i) => i !== idx));
    };
    const handleExperienceChange = (idx, field, value) => {
        setExperience(prev => {
            const updated = [...prev];
            updated[idx][field] = value;
            return updated;
        });
    };
    const handleExperienceBulletChange = (expIdx, bulletIdx, value) => {
        setExperience(prev => {
            const updated = [...prev];
            updated[expIdx].bulletPoints[bulletIdx] = value;
            return updated;
        });
    };
    const handleAddExpBullet = (expIdx) => {
        setExperience(prev => {
            const updated = [...prev];
            updated[expIdx].bulletPoints.push("");
            return updated;
        });
    };
    const handleRemoveExpBullet = (expIdx, bulletIdx) => {
        setExperience(prev => {
            const updated = [...prev];
            updated[expIdx].bulletPoints = updated[expIdx].bulletPoints.filter((_, i) => i !== bulletIdx);
            return updated;
        });
    };

    // Handlers for projects dynamic entries
    const handleAddProject = () => {
        setProjects(prev => [...prev, { name: "", technologies: "", bulletPoints: [""] }]);
    };
    const handleRemoveProject = (idx) => {
        setProjects(prev => prev.filter((_, i) => i !== idx));
    };
    const handleProjectChange = (idx, field, value) => {
        setProjects(prev => {
            const updated = [...prev];
            updated[idx][field] = value;
            return updated;
        });
    };
    const handleProjectBulletChange = (projIdx, bulletIdx, value) => {
        setProjects(prev => {
            const updated = [...prev];
            updated[projIdx].bulletPoints[bulletIdx] = value;
            return updated;
        });
    };
    const handleAddProjBullet = (projIdx) => {
        setProjects(prev => {
            const updated = [...prev];
            updated[projIdx].bulletPoints.push("");
            return updated;
        });
    };
    const handleRemoveProjBullet = (projIdx, bulletIdx) => {
        setProjects(prev => {
            const updated = [...prev];
            updated[projIdx].bulletPoints = updated[projIdx].bulletPoints.filter((_, i) => i !== bulletIdx);
            return updated;
        });
    };

    // Dynamic strings lists (Skills, Certifications, Achievements)
    const handleAddListItem = (setter) => {
        setter(prev => [...prev, ""]);
    };
    const handleRemoveListItem = (setter, idx) => {
        setter(prev => prev.filter((_, i) => i !== idx));
    };
    const handleListItemChange = (setter, idx, value) => {
        setter(prev => {
            const updated = [...prev];
            updated[idx] = value;
            return updated;
        });
    };

    // Handlers for education entries
    const handleAddEducation = () => {
        setEducation(prev => [...prev, { degree: "", institution: "", year: "" }]);
    };
    const handleRemoveEducation = (idx) => {
        setEducation(prev => prev.filter((_, i) => i !== idx));
    };
    const handleEducationChange = (idx, field, value) => {
        setEducation(prev => {
            const updated = [...prev];
            updated[idx][field] = value;
            return updated;
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            // Package payload
            const payload = {
                jobDescription,
                fullName,
                title,
                contact,
                skills: skills.filter(Boolean),
                experience: experience.map(exp => ({
                    ...exp,
                    bulletPoints: exp.bulletPoints.filter(Boolean)
                })),
                projects: projects.map(proj => ({
                    ...proj,
                    bulletPoints: proj.bulletPoints.filter(Boolean)
                })),
                education: education.filter(edu => edu.degree && edu.institution),
                certifications: certifications.filter(Boolean),
                achievements: achievements.filter(Boolean)
            };

            const response = await tailorCustomResume(payload);
            if (response && response.tailoredResume) {
                // Navigate to preview page and pass the tailored resume details via Router state!
                navigate("/resume-builder/preview", { state: { tailoredResume: response.tailoredResume } });
            } else {
                setErrorMsg("Failed to generate custom tailored resume JSON.");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("An error occurred during resume compilation. Please check Gemini keys.");
        } finally {
            setLoading(false);
        }
    };

    if (fetchingContext) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-on-surface relative overflow-hidden">
                <Tech3DBackground />
                <div className="flex flex-col items-center gap-6 max-w-md text-center p-8 glass-panel rounded-xl shadow-2xl relative overflow-hidden z-10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary animate-pulse"></div>
                    <span className="material-symbols-outlined text-primary text-5xl animate-spin">psychology</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold">EXTRACTING CREDENTIALS...</h2>
                    <p className="font-label-technical text-label-technical text-primary uppercase tracking-widest font-bold">AI_PARSER_ACTIVE // PARSING_PDF_DATA</p>
                    <p className="font-body-md text-text-muted">
                        AI agent is scan-extracting your original resume accomplishments, projects, and target job description to pre-fill the form builder details...
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-on-surface relative overflow-hidden">
                <Tech3DBackground />
                <div className="flex flex-col items-center gap-6 max-w-md text-center p-8 glass-panel rounded-xl shadow-2xl relative overflow-hidden z-10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary animate-pulse"></div>
                    <span className="material-symbols-outlined text-primary text-5xl animate-spin">sync</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold">GENERATING LaTeX BUILD...</h2>
                    <p className="font-label-technical text-label-technical text-primary uppercase tracking-widest font-bold">COMPILING_LATEX_TEMPLATES</p>
                    <p className="font-body-md text-text-muted">
                        Gemini AI agent is reading your profile inputs, matching them to target keywords in the Job Description, and formatting them into a single-page LaTeX template...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-on-surface font-body-md selection:bg-primary/30 flex flex-col justify-between relative overflow-hidden">
            <Tech3DBackground />

            {/* Header */}
            <header className="border-b border-border-subtle sticky top-0 bg-background/85 backdrop-blur-md z-50">
                <div className="flex justify-between items-center px-container-margin h-16 w-full max-w-7xl mx-auto">
                    <div className="flex items-center gap-8">
                        <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">InterviewIQ</span>
                        <span className="font-label-technical text-label-technical text-text-muted">LATEX BUILDER v1.0</span>
                    </div>
                    <button 
                        onClick={() => navigate("/")}
                        className="text-primary hover:text-primary/90 text-sm font-label-technical flex items-center gap-1 cursor-pointer font-bold"
                    >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span> DASHBOARD
                    </button>
                </div>
            </header>

            {/* Main Form container */}
            <main className="w-full max-w-4xl mx-auto px-container-margin py-10 flex-grow z-10">
                <div className="space-y-2 mb-8">
                    <h1 className="font-headline-lg text-3xl font-extrabold text-on-surface">LaTeX Resume Creator</h1>
                    <p className="text-text-muted text-sm leading-relaxed font-semibold">
                        Input your professional achievements, projects, and target job description to build a custom LaTeX-compiled single page resume.
                    </p>
                </div>

                {errorMsg && (
                    <div className="bg-status-error/10 border border-status-error/20 text-status-error p-4 rounded-lg mb-6 flex items-center gap-3 text-sm">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {errorMsg}
                    </div>
                )}

                {/* Steps Navigator */}
                <div className="grid grid-cols-5 gap-2 mb-8 text-center text-xs font-label-technical">
                    {[
                        "1. TARGET JD",
                        "2. CONTACT INFO",
                        "3. EXPERIENCE",
                        "4. PROJECTS",
                        "5. EXTRA / EDU"
                    ].map((label, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setStep(idx + 1)}
                            className={`py-2 border-b-2 font-bold cursor-pointer transition-colors ${
                                step === idx + 1 
                                    ? "border-primary text-primary" 
                                    : "border-border-subtle text-text-muted hover:text-on-surface"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* Step 1: Target Job Description */}
                    {step === 1 && (
                        <Tilt3D>
                            <div className="glass-panel p-8 rounded-xl space-y-6">
                                <h3 className="font-label-caps text-label-caps text-primary tracking-widest font-bold border-b border-border-subtle pb-3">STEP 1: TARGET JOB PROFILE</h3>
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-label-technical text-text-muted uppercase font-bold">Target Job Description (JD) *</label>
                                        <textarea
                                            required
                                            rows="8"
                                            placeholder="Paste the details of the job you are targeting. The AI will scan this description and tailor your experience descriptions and skills list to match."
                                            className="w-full text-sm bg-surface-container border border-border-subtle rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary placeholder-text-muted/65 leading-relaxed font-semibold"
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-label-technical text-text-muted uppercase font-bold">Target Job Title (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Senior Frontend Engineer"
                                            className="w-full text-sm bg-surface-container border border-border-subtle rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary placeholder-text-muted/65 font-semibold text-black"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4 border-t border-border-subtle/50">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-technical text-label-technical font-bold hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-2"
                                    >
                                        NEXT STEP <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </Tilt3D>
                    )}

                    {/* Step 2: Contact Information */}
                    {step === 2 && (
                        <Tilt3D>
                            <div className="glass-panel p-8 rounded-xl space-y-6">
                                <h3 className="font-label-caps text-label-caps text-primary tracking-widest font-bold border-b border-border-subtle pb-3">STEP 2: CONTACT DETAILS</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-label-technical text-text-muted uppercase font-bold">Full Name *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full text-sm bg-surface-container border border-border-subtle rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary font-semibold text-black"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-label-technical text-text-muted uppercase font-bold">Email Address *</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="john.doe@example.com"
                                            className="w-full text-sm bg-surface-container border border-border-subtle rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary font-semibold text-black"
                                            value={contact.email}
                                            onChange={(e) => setContact({...contact, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-label-technical text-text-muted uppercase font-bold">Phone Number</label>
                                        <input
                                            type="tel"
                                            placeholder="+1 (555) 123-4567"
                                            className="w-full text-sm bg-surface-container border border-border-subtle rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary font-semibold text-black"
                                            value={contact.phone}
                                            onChange={(e) => setContact({...contact, phone: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-label-technical text-text-muted uppercase font-bold">Location</label>
                                        <input
                                            type="text"
                                            placeholder="San Francisco, CA"
                                            className="w-full text-sm bg-surface-container border border-border-subtle rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary font-semibold text-black"
                                            value={contact.location}
                                            onChange={(e) => setContact({...contact, location: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-label-technical text-text-muted uppercase font-bold">GitHub Profile URL</label>
                                        <input
                                            type="text"
                                            placeholder="github.com/johndoe"
                                            className="w-full text-sm bg-surface-container border border-border-subtle rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary font-semibold text-black"
                                            value={contact.github}
                                            onChange={(e) => setContact({...contact, github: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-label-technical text-text-muted uppercase font-bold">LinkedIn Profile URL</label>
                                        <input
                                            type="text"
                                            placeholder="linkedin.com/in/johndoe"
                                            className="w-full text-sm bg-surface-container border border-border-subtle rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary font-semibold text-black"
                                            value={contact.linkedin}
                                            onChange={(e) => setContact({...contact, linkedin: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between pt-4 border-t border-border-subtle/50">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="border border-border-subtle px-5 py-2.5 rounded-lg font-label-technical text-label-technical text-on-surface hover:bg-surface-bright transition-colors cursor-pointer font-bold"
                                    >
                                        BACK
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-technical text-label-technical font-bold hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-2"
                                    >
                                        NEXT STEP <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </Tilt3D>
                    )}

                    {/* Step 3: Work History */}
                    {step === 3 && (
                        <div className="glass-panel p-8 rounded-xl space-y-6">
                            <div className="flex justify-between items-center border-b border-border-subtle pb-3">
                                <h3 className="font-label-caps text-label-caps text-primary tracking-widest font-bold">STEP 3: WORK HISTORY</h3>
                                <button
                                    type="button"
                                    onClick={handleAddExperience}
                                    className="bg-secondary/20 text-secondary border border-secondary/30 px-3 py-1.5 rounded-lg font-label-technical text-[11px] font-bold hover:bg-secondary/35 cursor-pointer flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm font-bold">add</span> ADD WORK
                                </button>
                            </div>

                            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                {experience.length === 0 ? (
                                    <p className="text-center text-text-muted text-xs py-4 font-semibold">No experiences added yet. Click Add Work above.</p>
                                ) : (
                                    experience.map((exp, idx) => (
                                        <div key={idx} className="p-5 rounded-lg bg-surface-container border border-border-subtle space-y-4 relative">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExperience(idx)}
                                                className="absolute top-4 right-4 text-text-muted hover:text-status-error font-bold text-xs cursor-pointer"
                                            >
                                                ✕ REMOVE
                                            </button>
                                            <h4 className="font-label-technical text-xs font-bold text-primary">ROLE #{idx + 1}</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <input
                                                    placeholder="Role (e.g. Frontend Dev)"
                                                    className="w-full text-xs bg-background border border-border-subtle rounded p-2 text-black font-semibold"
                                                    value={exp.role}
                                                    onChange={(e) => handleExperienceChange(idx, "role", e.target.value)}
                                                />
                                                <input
                                                    placeholder="Company (e.g. Google)"
                                                    className="w-full text-xs bg-background border border-border-subtle rounded p-2 text-black font-semibold"
                                                    value={exp.company}
                                                    onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                                                />
                                                <input
                                                    placeholder="Duration (e.g. 2022 - Present)"
                                                    className="w-full text-xs bg-background border border-border-subtle rounded p-2 text-black font-semibold"
                                                    value={exp.duration}
                                                    onChange={(e) => handleExperienceChange(idx, "duration", e.target.value)}
                                                />
                                            </div>

                                            {/* Bullet Points */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-label-technical uppercase text-text-muted font-bold">Key Achievements</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddExpBullet(idx)}
                                                        className="text-primary hover:underline text-[10px] font-bold cursor-pointer"
                                                    >
                                                        + Add Bullet
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {exp.bulletPoints.map((bullet, bulletIdx) => (
                                                        <div key={bulletIdx} className="flex gap-2 items-center">
                                                            <input
                                                                placeholder="e.g. Led development of new dashboard modules using React"
                                                                className="w-full text-xs bg-background border border-border-subtle rounded p-2 text-black font-semibold"
                                                                value={bullet}
                                                                onChange={(e) => handleExperienceBulletChange(idx, bulletIdx, e.target.value)}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveExpBullet(idx, bulletIdx)}
                                                                className="text-text-muted hover:text-status-error text-[10px] font-bold cursor-pointer"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="flex justify-between pt-4 border-t border-border-subtle/50">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="border border-border-subtle px-5 py-2.5 rounded-lg font-label-technical text-label-technical text-on-surface hover:bg-surface-bright transition-colors cursor-pointer font-bold"
                                >
                                    BACK
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(4)}
                                    className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-technical text-label-technical font-bold hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-2"
                                >
                                    NEXT STEP <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Projects */}
                    {step === 4 && (
                        <div className="glass-panel p-8 rounded-xl space-y-6">
                            <div className="flex justify-between items-center border-b border-border-subtle pb-3">
                                <h3 className="font-label-caps text-label-caps text-primary tracking-widest font-bold">STEP 4: PROJECTS</h3>
                                <button
                                    type="button"
                                    onClick={handleAddProject}
                                    className="bg-secondary/20 text-secondary border border-secondary/30 px-3 py-1.5 rounded-lg font-label-technical text-[11px] font-bold hover:bg-secondary/35 cursor-pointer flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm font-bold">add</span> ADD PROJECT
                                </button>
                            </div>

                            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                {projects.length === 0 ? (
                                    <p className="text-center text-text-muted text-xs py-4 font-semibold">No projects added yet. Click Add Project above.</p>
                                ) : (
                                    projects.map((proj, idx) => (
                                        <div key={idx} className="p-5 rounded-lg bg-surface-container border border-border-subtle space-y-4 relative">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveProject(idx)}
                                                className="absolute top-4 right-4 text-text-muted hover:text-status-error font-bold text-xs cursor-pointer"
                                            >
                                                ✕ REMOVE
                                            </button>
                                            <h4 className="font-label-technical text-xs font-bold text-primary">PROJECT #{idx + 1}</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <input
                                                    placeholder="Project Name (e.g. Chat App)"
                                                    className="w-full text-xs bg-background border border-border-subtle rounded p-2 text-black font-semibold"
                                                    value={proj.name}
                                                    onChange={(e) => handleProjectChange(idx, "name", e.target.value)}
                                                />
                                                <input
                                                    placeholder="Technologies (e.g. React, Node, WebSockets)"
                                                    className="w-full text-xs bg-background border border-border-subtle rounded p-2 text-black font-semibold"
                                                    value={proj.technologies}
                                                    onChange={(e) => handleProjectChange(idx, "technologies", e.target.value)}
                                                />
                                            </div>

                                            {/* Bullet Points */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-label-technical uppercase text-text-muted font-bold">Project Details</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddProjBullet(idx)}
                                                        className="text-primary hover:underline text-[10px] font-bold cursor-pointer"
                                                    >
                                                        + Add Bullet
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {proj.bulletPoints.map((bullet, bulletIdx) => (
                                                        <div key={bulletIdx} className="flex gap-2 items-center">
                                                            <input
                                                                placeholder="e.g. Built fully real-time responsive chat interface reducing latency by 120ms"
                                                                className="w-full text-xs bg-background border border-border-subtle rounded p-2 text-black font-semibold"
                                                                value={bullet}
                                                                onChange={(e) => handleProjectBulletChange(idx, bulletIdx, e.target.value)}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveProjBullet(idx, bulletIdx)}
                                                                className="text-text-muted hover:text-status-error text-[10px] font-bold cursor-pointer"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="flex justify-between pt-4 border-t border-border-subtle/50">
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    className="border border-border-subtle px-5 py-2.5 rounded-lg font-label-technical text-label-technical text-on-surface hover:bg-surface-bright transition-colors cursor-pointer font-bold"
                                >
                                    BACK
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(5)}
                                    className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-technical text-label-technical font-bold hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-2"
                                >
                                    NEXT STEP <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Education, Skills, Certs, Achievements */}
                    {step === 5 && (
                        <div className="glass-panel p-8 rounded-xl space-y-6">
                            <h3 className="font-label-caps text-label-caps text-primary tracking-widest font-bold border-b border-border-subtle pb-3">STEP 5: EDUCATION & CERTIFICATIONS</h3>
                            
                            {/* Skills list input */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-label-technical text-text-muted uppercase font-bold">Key Skills (e.g. Languages: Java, Python)</label>
                                    <button
                                        type="button"
                                        onClick={() => handleAddListItem(setSkills)}
                                        className="text-primary hover:underline text-[10px] font-bold cursor-pointer"
                                    >
                                        + Add Skill Category
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {skills.map((skill, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input
                                                placeholder="e.g. Languages: JavaScript, Rust"
                                                className="w-full text-xs bg-surface-container border border-border-subtle rounded p-2 text-black font-semibold"
                                                value={skill}
                                                onChange={(e) => handleListItemChange(setSkills, idx, e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveListItem(setSkills, idx)}
                                                className="text-text-muted hover:text-status-error font-bold text-xs cursor-pointer"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-border-subtle/50" />

                            {/* Education List */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-label-technical text-text-muted uppercase font-bold">Education History</label>
                                    <button
                                        type="button"
                                        onClick={handleAddEducation}
                                        className="text-primary hover:underline text-[10px] font-bold cursor-pointer"
                                    >
                                        + Add Education
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {education.map((edu, idx) => (
                                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-surface-container/50 border border-border-subtle rounded-lg relative">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveEducation(idx)}
                                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-status-error/10 text-status-error border border-status-error/20 flex items-center justify-center font-bold text-[10px] cursor-pointer"
                                                title="Remove Education"
                                            >
                                                ✕
                                            </button>
                                            <input
                                                placeholder="Degree (e.g. B.S. CS)"
                                                className="text-xs bg-background border border-border-subtle rounded p-2 text-black font-semibold"
                                                value={edu.degree}
                                                onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                                            />
                                            <input
                                                placeholder="Institution (e.g. MIT)"
                                                className="text-xs bg-background border border-border-subtle rounded p-2 text-black font-semibold"
                                                value={edu.institution}
                                                onChange={(e) => handleEducationChange(idx, "institution", e.target.value)}
                                            />
                                            <input
                                                placeholder="Graduation Year (e.g. 2021)"
                                                className="text-xs bg-background border border-border-subtle rounded p-2 text-black font-semibold"
                                                value={edu.year}
                                                onChange={(e) => handleEducationChange(idx, "year", e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-border-subtle/50" />

                            {/* Certifications and Achievements */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-label-technical text-text-muted uppercase font-bold">Certifications</label>
                                        <button
                                            type="button"
                                            onClick={() => handleAddListItem(setCertifications)}
                                            className="text-primary hover:underline text-[10px] font-bold cursor-pointer"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {certifications.map((cert, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <input
                                                    placeholder="AWS Certified Solutions Architect"
                                                    className="w-full text-xs bg-surface-container border border-border-subtle rounded p-2 text-black font-semibold"
                                                    value={cert}
                                                    onChange={(e) => handleListItemChange(setCertifications, idx, e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveListItem(setCertifications, idx)}
                                                    className="text-text-muted hover:text-status-error font-bold text-xs cursor-pointer"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-label-technical text-text-muted uppercase font-bold">Achievements</label>
                                        <button
                                            type="button"
                                            onClick={() => handleAddListItem(setAchievements)}
                                            className="text-primary hover:underline text-[10px] font-bold cursor-pointer"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {achievements.map((ach, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <input
                                                    placeholder="First Place in Hackathon"
                                                    className="w-full text-xs bg-surface-container border border-border-subtle rounded p-2 text-black font-semibold"
                                                    value={ach}
                                                    onChange={(e) => handleListItemChange(setAchievements, idx, e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveListItem(setAchievements, idx)}
                                                    className="text-text-muted hover:text-status-error font-bold text-xs cursor-pointer"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4 border-t border-border-subtle/50">
                                <button
                                    type="button"
                                    onClick={() => setStep(4)}
                                    className="border border-border-subtle px-5 py-2.5 rounded-lg font-label-technical text-label-technical text-on-surface hover:bg-surface-bright transition-colors cursor-pointer font-bold"
                                >
                                    BACK
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary text-on-primary px-8 py-2.5 rounded-lg font-label-technical text-label-technical font-bold hover:opacity-90 active:scale-95 transition-transform cursor-pointer flex items-center gap-2 shadow-[0_0_12px_rgba(173,198,255,0.25)]"
                                >
                                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                                    COMPILE LaTeX BUILD
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </main>

            {/* Footer */}
            <footer className="bg-surface-container-lowest border-t border-border-subtle py-6">
                <div className="max-w-7xl mx-auto px-container-margin text-center">
                    <p className="font-label-technical text-label-technical text-text-muted">© 2024 InterviewIQ. Dynamic LaTeX Compilation.</p>
                </div>
            </footer>
        </div>
    );
};

export default ResumeFormPage;
