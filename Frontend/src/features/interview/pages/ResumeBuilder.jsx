import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { tailorResume } from '../services/interview.api';
import Tech3DBackground from '../components/Tech3DBackground';
import Tilt3D from '../components/Tilt3D';

const ResumeBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);

    // Resume field states
    const [fullName, setFullName] = useState("");
    const [title, setTitle] = useState("");
    const [contact, setContact] = useState({
        email: "",
        phone: "",
        location: "",
        github: "",
        linkedin: ""
    });
    const [summary, setSummary] = useState("");
    const [skills, setSkills] = useState([]);
    const [experience, setExperience] = useState([]);
    const [projects, setProjects] = useState([]);
    const [education, setEducation] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [achievements, setAchievements] = useState([]);

    useEffect(() => {
        // If we received tailoredResume state from custom form wizard, use it directly!
        if (location.state?.tailoredResume) {
            const r = location.state.tailoredResume;
            setFullName(r.fullName || "Candidate Name");
            setTitle(r.title || "Software Engineer");
            setContact(r.contact || { email: "", phone: "", location: "", github: "", linkedin: "" });
            setSummary(r.summary || "");
            setSkills(r.skills || []);
            setExperience(r.experience || []);
            setProjects(r.projects || []);
            setEducation(r.education || []);
            setCertifications(r.certifications || []);
            setAchievements(r.achievements || []);
            setLoading(false);
            return;
        }

        // Standard Report-based Fetch
        const fetchTailoredResume = async () => {
            if (!id) {
                setErrorMsg("No custom resume context provided. Create one from the Form.");
                setLoading(false);
                return;
            }
            try {
                const data = await tailorResume(id);
                if (data && data.tailoredResume) {
                    const r = data.tailoredResume;
                    setFullName(r.fullName || "Candidate Name");
                    setTitle(r.title || "Software Engineer");
                    setContact(r.contact || { email: "", phone: "", location: "", github: "", linkedin: "" });
                    setSummary(r.summary || "");
                    setSkills(r.skills || []);
                    setExperience(r.experience || []);
                    setProjects(r.projects || []);
                    setEducation(r.education || []);
                    setCertifications(r.certifications || []);
                    setAchievements(r.achievements || []);
                } else {
                    setErrorMsg("Failed to generate tailored resume payload.");
                }
            } catch (err) {
                console.error(err);
                setErrorMsg("Failed to connect to the resume tailoring agent.");
            } finally {
                setLoading(false);
            }
        };
        fetchTailoredResume();
    }, [id, location.state]);

    const handlePrint = () => {
        window.print();
    };

    // Helper handlers to live update experience bullet points
    const handleBulletChange = (expIdx, bulletIdx, value) => {
        setExperience(prev => {
            const updated = [...prev];
            updated[expIdx].bulletPoints[bulletIdx] = value;
            return updated;
        });
    };

    const handleAddBullet = (expIdx) => {
        setExperience(prev => {
            const updated = [...prev];
            updated[expIdx].bulletPoints.push("New achievement bullet point...");
            return updated;
        });
    };

    const handleRemoveBullet = (expIdx, bulletIdx) => {
        setExperience(prev => {
            const updated = [...prev];
            updated[expIdx].bulletPoints.splice(bulletIdx, 1);
            return updated;
        });
    };

    // Helper handlers to live update project bullet points
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
            updated[projIdx].bulletPoints.push("New project description bullet...");
            return updated;
        });
    };

    const handleRemoveProjBullet = (projIdx, bulletIdx) => {
        setProjects(prev => {
            const updated = [...prev];
            updated[projIdx].bulletPoints.splice(bulletIdx, 1);
            return updated;
        });
    };

    // Handler to edit skills
    const handleSkillChange = (idx, value) => {
        setSkills(prev => {
            const updated = [...prev];
            updated[idx] = value;
            return updated;
        });
    };

    // Handlers for certifications and achievements
    const handleCertChange = (idx, value) => {
        setCertifications(prev => {
            const updated = [...prev];
            updated[idx] = value;
            return updated;
        });
    };

    const handleAchievementChange = (idx, value) => {
        setAchievements(prev => {
            const updated = [...prev];
            updated[idx] = value;
            return updated;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-on-surface relative overflow-hidden">
                <Tech3DBackground />
                <div className="flex flex-col items-center gap-6 max-w-md text-center p-8 glass-panel rounded-xl shadow-2xl relative overflow-hidden z-10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary animate-pulse"></div>
                    <span className="material-symbols-outlined text-primary text-5xl animate-spin">sync</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold">TAILORING RESUME...</h2>
                    <p className="font-label-technical text-label-technical text-primary uppercase tracking-widest font-bold">AGENT_v4.2 // RESTRUCTURING_EXPERIENCE</p>
                    <p className="font-body-md text-text-muted">
                        AI agent is matching your credentials, inserting industry action keywords, and aligning bullet points to optimize against target Job Description...
                    </p>
                </div>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-on-surface p-6 relative overflow-hidden">
                <Tech3DBackground />
                <div className="glass-panel p-8 rounded-xl max-w-md text-center z-10">
                    <span className="material-symbols-outlined text-status-error text-6xl mb-4">error</span>
                    <h2 className="font-headline-lg text-2xl mb-2 text-on-surface">Error Generating Resume</h2>
                    <p className="font-body-md text-text-muted mb-6">{errorMsg}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-primary text-on-primary px-6 py-2.5 rounded font-bold hover:bg-primary/90 transition-all cursor-pointer font-bold"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-on-surface font-body-md selection:bg-primary/30 flex flex-col justify-between relative overflow-hidden">
            <Tech3DBackground />

            {/* Print Specific CSS Overrides */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                        background: none !important;
                    }
                    #print-resume-area, #print-resume-area * {
                        visibility: visible;
                    }
                    #print-resume-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 210mm;
                        height: 297mm;
                        padding: 15mm !important;
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        overflow: hidden !important;
                        box-sizing: border-box;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                }
            `}</style>

            {/* Top Navigation Bar */}
            <header className="border-b border-border-subtle sticky top-0 bg-background/85 backdrop-blur-md z-50 print:hidden">
                <div className="flex justify-between items-center px-container-margin h-16 w-full max-w-7xl mx-auto">
                    <div className="flex items-center gap-8">
                        <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">InterviewIQ</span>
                        <span className="font-label-technical text-label-technical text-text-muted">RESUME AGENT v4.2</span>
                    </div>
                    <button 
                        onClick={() => navigate(-1)}
                        className="text-primary hover:text-primary/90 text-sm font-label-technical flex items-center gap-1 cursor-pointer font-bold"
                    >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span> BACK
                    </button>
                </div>
            </header>

            {/* Editor Controls Banner */}
            <main className="w-full max-w-7xl mx-auto px-container-margin py-8 flex-grow flex flex-col gap-8 z-10 print:p-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container border border-border-subtle p-6 rounded-xl print:hidden">
                    <div>
                        <h2 className="font-headline-md text-xl text-on-surface font-extrabold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">description</span>
                            Resume Optimized for Job (LaTeX Style)
                        </h2>
                        <p className="text-text-muted text-xs mt-1">AI-tailored LaTeX template. Enforces a strict one-page PDF budget. Toggle edit mode to modify text.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`px-4 py-2.5 rounded-lg font-label-technical text-label-technical border flex items-center gap-2 cursor-pointer transition-colors ${
                                isEditMode 
                                    ? "bg-primary/25 border-primary text-primary" 
                                    : "bg-surface-container border-border-subtle text-on-surface hover:bg-surface-bright"
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                            {isEditMode ? "LOCK FIELDS" : "EDIT TEXT"}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-label-technical text-label-technical hover:opacity-90 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(173,198,255,0.2)] font-bold"
                        >
                            <span className="material-symbols-outlined text-[18px]">print</span>
                            DOWNLOAD PDF
                        </button>
                    </div>
                </div>

                {/* Printable A4 Resume Preview Sheet (LaTeX Layout) */}
                <div className="w-full overflow-x-auto py-4 flex justify-center print:p-0">
                    <div 
                        id="print-resume-area"
                        className="w-[210mm] h-[297mm] bg-white text-[#111111] p-12 shadow-2xl rounded border border-gray-200 flex flex-col gap-4 font-serif transition-all text-left overflow-hidden select-text relative"
                    >
                        {/* Header Section */}
                        <div className="text-center pb-2">
                            {isEditMode ? (
                                <div className="space-y-2">
                                    <input 
                                        type="text" 
                                        className="w-full text-center text-2xl font-bold bg-gray-50 border border-gray-300 rounded p-1 font-serif focus:outline-none focus:border-indigo-600 text-black"
                                        value={fullName} 
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                    <input 
                                        type="text" 
                                        className="w-full text-center text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-300 rounded p-1 font-serif focus:outline-none focus:border-indigo-600"
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-serif uppercase">{fullName}</h1>
                                    <p className="text-sm font-medium text-indigo-700 tracking-wide mt-0.5 font-serif uppercase">{title}</p>
                                </>
                            )}

                            {/* Contact Panel */}
                            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-gray-600 mt-2 font-serif font-medium">
                                {isEditMode ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full mt-2">
                                        <input 
                                            placeholder="Email" 
                                            className="bg-gray-50 border border-gray-300 rounded p-1 text-xs text-black font-serif" 
                                            value={contact.email} 
                                            onChange={(e) => setContact({...contact, email: e.target.value})} 
                                        />
                                        <input 
                                            placeholder="Phone" 
                                            className="bg-gray-50 border border-gray-300 rounded p-1 text-xs text-black font-serif" 
                                            value={contact.phone} 
                                            onChange={(e) => setContact({...contact, phone: e.target.value})} 
                                        />
                                        <input 
                                            placeholder="Location" 
                                            className="bg-gray-50 border border-gray-300 rounded p-1 text-xs text-black font-serif" 
                                            value={contact.location} 
                                            onChange={(e) => setContact({...contact, location: e.target.value})} 
                                        />
                                        <input 
                                            placeholder="GitHub" 
                                            className="bg-gray-50 border border-gray-300 rounded p-1 text-xs text-black font-serif" 
                                            value={contact.github} 
                                            onChange={(e) => setContact({...contact, github: e.target.value})} 
                                        />
                                        <input 
                                            placeholder="LinkedIn" 
                                            className="bg-gray-50 border border-gray-300 rounded p-1 text-xs text-black font-serif" 
                                            value={contact.linkedin} 
                                            onChange={(e) => setContact({...contact, linkedin: e.target.value})} 
                                        />
                                    </div>
                                ) : (
                                    <>
                                        {contact.email && <span className="flex items-center gap-1">{contact.email}</span>}
                                        {contact.phone && <span className="flex items-center gap-1">| {contact.phone}</span>}
                                        {contact.location && <span className="flex items-center gap-1">| {contact.location}</span>}
                                        {contact.github && <span className="flex items-center gap-1">| GitHub: {contact.github}</span>}
                                        {contact.linkedin && <span className="flex items-center gap-1">| LinkedIn: {contact.linkedin}</span>}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Professional Summary */}
                        <div className="flex flex-col gap-1 w-full">
                            <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider font-serif">Professional Summary</h2>
                            <div className="border-b border-gray-900 w-full mb-1"></div>
                            {isEditMode ? (
                                <textarea 
                                    rows="2" 
                                    className="w-full text-[10px] bg-gray-50 border border-gray-300 rounded p-1.5 text-black leading-relaxed font-serif" 
                                    value={summary} 
                                    onChange={(e) => setSummary(e.target.value)}
                                />
                            ) : (
                                <p className="text-[10px] text-gray-700 leading-relaxed font-serif">{summary}</p>
                            )}
                        </div>

                        {/* Key Technical Skills */}
                        <div className="flex flex-col gap-1 w-full">
                            <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider font-serif">Technical Skills</h2>
                            <div className="border-b border-gray-900 w-full mb-1"></div>
                            <div className="flex flex-col gap-1 mt-0.5">
                                {skills.map((skill, idx) => (
                                    <div key={idx} className="text-[10px] text-gray-700 flex items-start font-serif">
                                        {isEditMode ? (
                                            <input 
                                                type="text" 
                                                className="w-full bg-gray-50 border border-gray-300 rounded p-0.5 text-xs text-black font-serif" 
                                                value={skill} 
                                                onChange={(e) => handleSkillChange(idx, e.target.value)} 
                                            />
                                        ) : (
                                            <>
                                                <span className="text-gray-900 mr-2 font-bold">•</span>
                                                <span>{skill}</span>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider font-serif">Professional Experience</h2>
                            <div className="border-b border-gray-900 w-full mb-1"></div>
                            
                            <div className="flex flex-col gap-3">
                                {experience.map((exp, expIdx) => (
                                    <div key={expIdx} className="flex flex-col gap-1 font-serif">
                                        <div className="flex justify-between items-start font-serif">
                                            <div>
                                                {isEditMode ? (
                                                    <div className="space-y-1">
                                                        <input 
                                                            type="text" 
                                                            className="font-bold text-xs bg-gray-50 border border-gray-300 rounded p-0.5 text-black font-serif" 
                                                            value={exp.role} 
                                                            onChange={(e) => {
                                                                const updated = [...experience];
                                                                updated[expIdx].role = e.target.value;
                                                                setExperience(updated);
                                                            }} 
                                                        />
                                                        <input 
                                                            type="text" 
                                                            className="text-[10px] font-semibold text-gray-600 bg-gray-50 border border-gray-300 rounded p-0.5 font-serif" 
                                                            value={exp.company} 
                                                            onChange={(e) => {
                                                                const updated = [...experience];
                                                                updated[expIdx].company = e.target.value;
                                                                setExperience(updated);
                                                            }} 
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] font-serif">
                                                        <span className="font-bold text-gray-900">{exp.role}</span>
                                                        <span className="text-gray-600 italic">, {exp.company}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                {isEditMode ? (
                                                    <input 
                                                        type="text" 
                                                        className="text-[10px] text-right bg-gray-50 border border-gray-300 rounded p-0.5 text-black font-serif" 
                                                        value={exp.duration} 
                                                        onChange={(e) => {
                                                            const updated = [...experience];
                                                            updated[expIdx].duration = e.target.value;
                                                            setExperience(updated);
                                                        }} 
                                                    />
                                                ) : (
                                                    <span className="text-[10px] text-gray-600 italic font-serif">{exp.duration}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Experience Bullets */}
                                        <ul className="list-disc list-outside ml-4 text-[10px] text-gray-700 space-y-1 leading-relaxed mt-0.5 font-serif">
                                            {exp.bulletPoints.map((bullet, bulletIdx) => (
                                                <li key={bulletIdx} className="font-serif relative group">
                                                    {isEditMode ? (
                                                        <div className="flex gap-2 items-center w-full">
                                                            <textarea 
                                                                rows="1" 
                                                                className="w-full bg-gray-50 border border-gray-300 rounded p-0.5 text-[10px] text-black font-serif" 
                                                                value={bullet} 
                                                                onChange={(e) => handleBulletChange(expIdx, bulletIdx, e.target.value)} 
                                                            />
                                                            <button 
                                                                onClick={() => handleRemoveBullet(expIdx, bulletIdx)}
                                                                className="text-red-500 hover:text-red-700 font-bold text-xs shrink-0 cursor-pointer"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span>{bullet}</span>
                                                    )}
                                                </li>
                                            ))}
                                            {isEditMode && (
                                                <button 
                                                    onClick={() => handleAddBullet(expIdx)}
                                                    className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold mt-0.5 block cursor-pointer"
                                                >
                                                    + Add Achievement Bullet
                                                </button>
                                            )}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Projects Section */}
                        {projects && projects.length > 0 && (
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider font-serif">Key Projects</h2>
                                <div className="border-b border-gray-900 w-full mb-1"></div>
                                <div className="flex flex-col gap-3">
                                    {projects.map((proj, projIdx) => (
                                        <div key={projIdx} className="flex flex-col gap-1 font-serif">
                                            <div className="flex justify-between items-start font-serif">
                                                <div className="text-[10px] font-serif">
                                                    {isEditMode ? (
                                                        <div className="space-y-1">
                                                            <input 
                                                                type="text" 
                                                                className="font-bold text-xs bg-gray-50 border border-gray-300 rounded p-0.5 text-black font-serif" 
                                                                value={proj.name} 
                                                                onChange={(e) => {
                                                                    const updated = [...projects];
                                                                    updated[projIdx].name = e.target.value;
                                                                    setProjects(updated);
                                                                }} 
                                                            />
                                                            <input 
                                                                type="text" 
                                                                className="text-[10px] text-gray-600 bg-gray-50 border border-gray-300 rounded p-0.5 font-serif" 
                                                                value={proj.technologies} 
                                                                onChange={(e) => {
                                                                    const updated = [...projects];
                                                                    updated[projIdx].technologies = e.target.value;
                                                                    setProjects(updated);
                                                                }} 
                                                            />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <span className="font-bold text-gray-900">{proj.name}</span>
                                                            <span className="text-gray-600 italic"> | {proj.technologies}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Project bullets */}
                                            <ul className="list-disc list-outside ml-4 text-[10px] text-gray-700 space-y-1 leading-relaxed mt-0.5 font-serif">
                                                {proj.bulletPoints.map((bullet, bulletIdx) => (
                                                    <li key={bulletIdx} className="font-serif relative group">
                                                        {isEditMode ? (
                                                            <div className="flex gap-2 items-center w-full">
                                                                <textarea 
                                                                    rows="1" 
                                                                    className="w-full bg-gray-50 border border-gray-300 rounded p-0.5 text-[10px] text-black font-serif" 
                                                                    value={bullet} 
                                                                    onChange={(e) => handleProjectBulletChange(projIdx, bulletIdx, e.target.value)} 
                                                                />
                                                                <button 
                                                                    onClick={() => handleRemoveProjBullet(projIdx, bulletIdx)}
                                                                    className="text-red-500 hover:text-red-700 font-bold text-xs shrink-0 cursor-pointer"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span>{bullet}</span>
                                                        )}
                                                    </li>
                                                ))}
                                                {isEditMode && (
                                                    <button 
                                                        onClick={() => handleAddProjBullet(projIdx)}
                                                        className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold mt-0.5 block cursor-pointer"
                                                    >
                                                        + Add Bullet
                                                    </button>
                                                )}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education, Certifications & Achievements Group */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-1">
                            {/* Education */}
                            <div className="flex flex-col gap-1 font-serif">
                                <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider font-serif">Education</h2>
                                <div className="border-b border-gray-900 w-full mb-1"></div>
                                <div className="flex flex-col gap-1 mt-0.5 font-serif">
                                    {education.map((edu, idx) => (
                                        <div key={idx} className="flex justify-between items-start font-serif text-[10px]">
                                            <div>
                                                <span className="font-bold text-gray-900 font-serif">{edu.degree}</span>
                                                <span className="text-gray-600 font-serif">, {edu.institution}</span>
                                            </div>
                                            {edu.year && <span className="text-gray-600 italic font-serif">{edu.year}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Certs & Achievements */}
                            <div className="flex flex-col gap-1 font-serif">
                                <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider font-serif">Certifications & Honors</h2>
                                <div className="border-b border-gray-900 w-full mb-1"></div>
                                <ul className="list-disc list-outside ml-4 text-[10px] text-gray-700 space-y-0.5 font-serif">
                                    {certifications.map((cert, idx) => (
                                        <li key={idx}>
                                            {isEditMode ? (
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-gray-50 border border-gray-300 rounded p-0.5 text-[9px] text-black font-serif" 
                                                    value={cert} 
                                                    onChange={(e) => handleCertChange(idx, e.target.value)} 
                                                />
                                            ) : (
                                                <span>{cert}</span>
                                            )}
                                        </li>
                                    ))}
                                    {achievements.map((ach, idx) => (
                                        <li key={idx}>
                                            {isEditMode ? (
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-gray-50 border border-gray-300 rounded p-0.5 text-[9px] text-black font-serif" 
                                                    value={ach} 
                                                    onChange={(e) => handleAchievementChange(idx, e.target.value)} 
                                                />
                                            ) : (
                                                <span className="italic">{ach}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-surface-container-lowest border-t border-border-subtle py-6 print:hidden z-10">
                <div className="max-w-7xl mx-auto px-container-margin text-center">
                    <p className="font-label-technical text-label-technical text-text-muted">© 2024 InterviewIQ. LaTeX Template.</p>
                </div>
            </footer>
        </div>
    );
};

export default ResumeBuilder;
