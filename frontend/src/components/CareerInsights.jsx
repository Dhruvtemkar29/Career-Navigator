
import { useEffect, useState } from 'react';
import {
    BrainCircuit, Target, BriefcaseBusiness, BookOpen,
    Lightbulb, AlertCircle, RefreshCw, CheckCircle2
} from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis,
    YAxis, Tooltip, CartesianGrid, LabelList
} from 'recharts';
import { getPredictionHistory } from '../services/api';
import './CareerInsights.css';

const domainSkills = {
    'Artificial Intelligence & Machine Learning': [
        'Machine Learning', 'Deep Learning', 'NLP',
        'Generative AI', 'TensorFlow', 'PyTorch'
    ],
    'Data Science': [
        'Python', 'R', 'Data Analysis', 'Data Visualization',
        'SQL', 'MySQL', 'PostgreSQL', 'Power BI', 'Tableau', 'Excel'
    ],
    'Software Development': [
        'Python', 'Java', 'C', 'C++', 'JavaScript', 'TypeScript',
        'PHP', 'HTML', 'CSS', 'React', 'Angular', 'Node.js',
        'Express.js', 'React Native', 'Flutter', 'MySQL',
        'MongoDB', 'PostgreSQL', 'Git & GitHub'
    ],
    'Cybersecurity': [
        'Network Security', 'Ethical Hacking',
        'Penetration Testing', 'Cryptography', 'Linux'
    ],
    'Cloud Computing': [
        'AWS', 'Microsoft Azure', 'Google Cloud', 'Docker', 'Linux'
    ],
    'UI/UX Design': [
        'Figma', 'UI/UX Design', 'HTML', 'CSS'
    ]
};


const careerRoles = {
    'Artificial Intelligence & Machine Learning': [
        {
            title: 'Machine Learning Engineer',
            description: 'Build, train and deploy machine learning models to solve real-world problems.',
            skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch']
        },
        {
            title: 'AI Engineer',
            description: 'Develop intelligent applications using AI models and modern AI technologies.',
            skills: ['Python', 'Generative AI', 'NLP', 'Deep Learning']
        },
        {
            title: 'Deep Learning Engineer',
            description: 'Design and optimize neural networks for complex prediction tasks.',
            skills: ['Python', 'Deep Learning', 'TensorFlow', 'PyTorch']
        },
        {
            title: 'NLP Engineer',
            description: 'Build systems that understand, process and generate human language.',
            skills: ['Python', 'NLP', 'Machine Learning', 'Generative AI']
        }
    ],
    'Data Science': [
        {
            title: 'Data Analyst',
            description: 'Analyze datasets and communicate meaningful business insights.',
            skills: ['Python', 'SQL', 'Excel', 'Power BI']
        },
        {
            title: 'Data Scientist',
            description: 'Apply statistical methods and machine learning to discover patterns.',
            skills: ['Python', 'R', 'Machine Learning', 'Data Visualization']
        },
        {
            title: 'Business Intelligence Analyst',
            description: 'Transform business data into reports, dashboards and decisions.',
            skills: ['SQL', 'Power BI', 'Tableau', 'Excel']
        },
        {
            title: 'Data Engineer',
            description: 'Build and maintain reliable data pipelines and infrastructure.',
            skills: ['Python', 'SQL', 'PostgreSQL', 'MongoDB']
        }
    ],
    'Software Development': [
        {
            title: 'Frontend Developer',
            description: 'Build responsive and interactive user interfaces for applications.',
            skills: ['HTML', 'CSS', 'JavaScript', 'React']
        },
        {
            title: 'Backend Developer',
            description: 'Develop server-side applications, APIs and database systems.',
            skills: ['Python', 'Node.js', 'Express.js', 'MongoDB']
        },
        {
            title: 'Full Stack Developer',
            description: 'Develop complete applications across frontend and backend.',
            skills: ['React', 'Node.js', 'JavaScript', 'MySQL']
        },
        {
            title: 'Software Engineer',
            description: 'Design, develop, test and maintain software applications.',
            skills: ['Python', 'Java', 'Git & GitHub', 'SQL']
        }
    ],
    'Cybersecurity': [
        {
            title: 'Security Analyst',
            description: 'Monitor systems and investigate potential security threats.',
            skills: ['Network Security', 'Linux', 'Cryptography']
        },
        {
            title: 'Penetration Tester',
            description: 'Identify vulnerabilities through authorized security testing.',
            skills: ['Ethical Hacking', 'Penetration Testing', 'Linux']
        },
        {
            title: 'Cybersecurity Engineer',
            description: 'Implement security solutions to protect applications and networks.',
            skills: ['Network Security', 'Cryptography', 'Linux']
        }
    ],
    'Cloud Computing': [
        {
            title: 'Cloud Engineer',
            description: 'Deploy and maintain applications on cloud infrastructure.',
            skills: ['AWS', 'Microsoft Azure', 'Docker']
        },
        {
            title: 'Cloud Architect',
            description: 'Design scalable and reliable cloud infrastructure solutions.',
            skills: ['AWS', 'Microsoft Azure', 'Google Cloud']
        },
        {
            title: 'DevOps Engineer',
            description: 'Automate software delivery, deployment and infrastructure workflows.',
            skills: ['Docker', 'Linux', 'AWS', 'Git & GitHub']
        }
    ],
    'UI/UX Design': [
        {
            title: 'UI Designer',
            description: 'Design visually consistent and user-friendly application interfaces.',
            skills: ['Figma', 'UI/UX Design', 'HTML', 'CSS']
        },
        {
            title: 'UX Designer',
            description: 'Research user needs and improve the usability of digital products.',
            skills: ['Figma', 'UI/UX Design']
        },
        {
            title: 'Product Designer',
            description: 'Shape end-to-end digital product experiences and interfaces.',
            skills: ['Figma', 'UI/UX Design', 'HTML', 'CSS']
        }
    ]
};


function CareerInsights() {
    const [record, setRecord] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchInsights = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await getPredictionHistory();
            const records = response.history || [];

            setHistory(records);
            setRecord(records[0] || null);
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                'Unable to load career insights.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, []);

    if (loading) {
        return (
            <div className="insights-state">
                <RefreshCw className="assessment-spinner" size={25} />
                <p>Analyzing your career profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="insights-state">
                <AlertCircle size={30} />
                <h2>Unable to load insights</h2>
                <p>{error}</p>
                <button onClick={fetchInsights}>Try Again</button>
            </div>
        );
    }

    if (!record) {
        return (
            <div className="insights-state">
                <BrainCircuit size={40} />
                <h2>No assessment found</h2>
                <p>Complete your Career Assessment to generate personalized insights.</p>
            </div>
        );
    }

    const student = record.student_data || {};
    const result = record.prediction_result || {};

    const readiness = result.career_readiness || {};
    const domain = result.career_domain || {};
    const placement = result.placement || {};
    const employability = result.employability || {};

    const recommendedDomain = domain.recommended_career_domain;

    const selectedSkills = student.selected_skills || [];
    const requiredSkills = domainSkills[recommendedDomain] || [];

    const matchedSkills = requiredSkills.filter(skill =>
        selectedSkills.includes(skill)
    );

    const missingSkills = requiredSkills.filter(skill =>
        !selectedSkills.includes(skill)
    );

    const domainData = Object.entries(
        domain.domain_probabilities || {}
    ).map(([name, probability]) => ({
        name,
        probability: Number((probability * 100).toFixed(2))
    })).sort((a, b) => b.probability - a.probability);

    const readinessData = Object.entries(
        readiness.class_probabilities || {}
    ).map(([name, probability]) => ({
        name,
        probability: Number((probability * 100).toFixed(2))
    }));

    const roles = (careerRoles[recommendedDomain] || [])
        .map(role => {
            const matchedCount = role.skills.filter(skill =>
                selectedSkills.includes(skill)
            ).length;

            const matchPercentage = Math.round(
                (matchedCount / role.skills.length) * 100
            );

            return { ...role, matchedCount, matchPercentage };
        })
        .sort((a, b) => b.matchPercentage - a.matchPercentage);

    const readinessColors = {
        High: 'var(--accent)',
        Moderate: '#E8B84A',
        Low: '#E58C80'
    };

    const readinessColor =
        readinessColors[readiness.career_readiness] ||
        'var(--accent)';

    const readinessConfidence = Number(
        (readiness.class_probabilities?.[readiness.career_readiness] || 0) * 100
    ).toFixed(2);

    const formatDate = date =>
        date ? new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }) : 'Unavailable';


    const developmentPriorities = [];

    if (missingSkills.length > 0) {
        developmentPriorities.push({
            id: 'skills',
            priority: 'High',
            title: 'Strengthen Domain-Specific Skills',
            reason: `You have ${missingSkills.length} skills to explore in ${recommendedDomain}.`,
            actions: [
                `Start learning ${missingSkills[0]}.`,
                `Practice ${missingSkills.slice(0, 3).join(', ')} through small projects.`,
                'Build one practical project demonstrating your new skills.'
            ]
        });
    }

    if (readiness.career_readiness === 'Low') {
        developmentPriorities.push({
            id: 'readiness',
            priority: 'High',
            title: 'Improve Career Readiness',
            reason: 'Your assessment currently predicts a Low career readiness level.',
            actions: [
                'Practice technical and behavioral interview questions.',
                'Work on communication and problem-solving exercises.',
                'Complete practical projects related to your target domain.'
            ]
        });
    } else if (readiness.career_readiness === 'Moderate') {
        developmentPriorities.push({
            id: 'readiness',
            priority: 'Medium',
            title: 'Improve Career Readiness',
            reason: 'Your assessment indicates room for improvement in career readiness.',
            actions: [
                'Practice mock interviews regularly.',
                'Strengthen technical and communication skills.',
                'Build projects demonstrating practical knowledge.'
            ]
        });
    }

    const employabilityScore = Number(employability.employability_score);

    if (Number.isFinite(employabilityScore) && employabilityScore < 70) {
        developmentPriorities.push({
            id: 'employability',
            priority: 'Medium',
            title: 'Strengthen Employability',
            reason: `Your predicted employability score is ${employabilityScore.toFixed(2)} out of 100.`,
            actions: [
                'Create and maintain a portfolio of projects.',
                'Gain practical experience through internships or projects.',
                'Document your technical work on GitHub.'
            ]
        });
    }

    if (placement.placement_status === 'Not Placed') {
        developmentPriorities.push({
            id: 'placement',
            priority: 'High',
            title: 'Prepare for Placement Opportunities',
            reason: 'Your placement model currently predicts Not Placed.',
            actions: [
                'Practice aptitude and technical assessments.',
                'Prepare your resume and project portfolio.',
                'Participate in mock placement interviews.'
            ]
        });
    }


    return (
        <div className="career-insights-page">

            <header className="insights-heading">
                <div>
                    <p className="eyebrow">CAREER NAVIGATOR / ANALYSIS</p>
                    <h1>Career Insights<span>.</span></h1>
                    <p>Your personalized career analysis and development recommendations.</p>
                </div>

                <button className="insights-refresh" onClick={fetchInsights}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </header>

            {history.length > 0 && (
                <div className="insights-history-selector">
                    <label htmlFor="insights-assessment">View Assessment</label>

                    <select
                        id="insights-assessment"
                        value={record?._id || ''}
                        onChange={event => {
                            const selectedRecord = history.find(
                                item => item._id === event.target.value
                            );

                            if (selectedRecord) {
                                setRecord(selectedRecord);
                            }
                        }}
                    >
                        {history.map((item, index) => (
                            <option key={item._id} value={item._id}>
                                Assessment #{history.length - index} — {formatDate(item.created_at)}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="insights-profile-banner">
                <div className="insights-profile-icon">
                    <BrainCircuit size={28} />
                </div>
                <div>
                    <span>YOUR RECOMMENDED CAREER DOMAIN</span>
                    <h2>{recommendedDomain || 'Not available'}</h2>
                    <p>Based on your latest assessment · {formatDate(record.created_at)}</p>
                </div>
            </div>

            <section className="insights-section">
                <div className="insights-section-heading">
                    <div>
                        <p className="eyebrow">01 / READINESS</p>
                        <h2>Career Readiness Analysis</h2>
                        <p>Understanding your predicted career readiness level.</p>
                    </div>
                    <BrainCircuit size={25} />
                </div>

                <div className="insights-readiness-layout">
                    <div className="insights-readiness-card">
                        <span>Predicted Readiness</span>
                        <strong style={{ color: readinessColor }}>
                            {readiness.career_readiness || 'N/A'}
                        </strong>
                        <small>Classification from the trained model</small>

                        <div className="readiness-confidence">
                            <span>Prediction Confidence</span>
                            <strong>{readinessConfidence}%</strong>
                        </div>
                    </div>

                    <div className="insights-chart-card">
                        <h3>Readiness Probability Distribution</h3>
                        {readinessData.length ? (
                            <ResponsiveContainer width="100%" height={230}>
                                <BarChart data={readinessData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 100]} unit="%" />
                                    <Tooltip formatter={value => `${value}%`} />
                                    <Bar
                                        dataKey="probability"
                                        fill="#C6FF45"
                                        radius={[5, 5, 0, 0]}
                                    >
                                        <LabelList
                                            dataKey="probability"
                                            position="top"
                                            formatter={value => `${value}%`}
                                            style={{
                                                fill: 'var(--text-primary)',
                                                fontSize: 12,
                                                fontWeight: 600
                                            }}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>Readiness probabilities are unavailable.</p>
                        )}
                    </div>
                </div>
            </section>

            <section className="insights-section">
                <div className="insights-section-heading">
                    <div>
                        <p className="eyebrow">02 / DOMAIN</p>
                        <h2>Career Domain Analysis</h2>
                        <p>Compare the model's predictions across career domains.</p>
                    </div>
                    <Target size={25} />
                </div>

                <div className="insights-chart-card">
                    {domainData.length ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={domainData}
                                layout="vertical"
                                margin={{ left: 20, right: 30 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} unit="%" />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={170}
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip formatter={value => `${value}%`} />
                                <Bar
                                    dataKey="probability"
                                    fill="#C6FF45"
                                    radius={[0, 5, 5, 0]}
                                >
                                    <LabelList
                                        dataKey="probability"
                                        position="right"
                                        formatter={value => `${value}%`}
                                        style={{
                                            fill: 'var(--text-primary)',
                                            fontSize: 11,
                                            fontWeight: 600
                                        }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p>Domain probabilities are unavailable.</p>
                    )}
                </div>
            </section>

            <section className="insights-section">
                <div className="insights-section-heading">
                    <div>
                        <p className="eyebrow">03 / SKILLS</p>
                        <h2>Skill Gap Analysis</h2>
                        <p>Compare your selected skills against the skills listed for your recommended domain.</p>
                    </div>
                    <Target size={25} />
                </div>

                <div className="skill-analysis-summary">
                    <div>
                        <strong>{matchedSkills.length}</strong>
                        <span>Matching Skills</span>
                    </div>
                    <div>
                        <strong>{missingSkills.length}</strong>
                        <span>Skills to Explore</span>
                    </div>
                    <div>
                        <strong>{requiredSkills.length}</strong>
                        <span>Domain Skill List</span>
                    </div>
                </div>

                <div className="skill-analysis-grid">
                    <div className="skill-analysis-card">
                        <h3><CheckCircle2 size={18} /> Your Matching Skills</h3>
                        {matchedSkills.length ? (
                            <div className="insight-skill-list">
                                {matchedSkills.map(skill => (
                                    <span className="matched-skill" key={skill}>{skill}</span>
                                ))}
                            </div>
                        ) : (
                            <p>No matching skills found in the domain list.</p>
                        )}
                    </div>

                    <div className="skill-analysis-card">
                        <h3><Lightbulb size={18} /> Skills to Explore</h3>
                        {missingSkills.length ? (
                            <div className="insight-skill-list">
                                {missingSkills.map(skill => (
                                    <span className="missing-skill" key={skill}>{skill}</span>
                                ))}
                            </div>
                        ) : (
                            <p>You have selected all skills in this domain list.</p>
                        )}
                    </div>
                </div>

                <p className="insights-disclaimer">
                    Skill gaps are based on a predefined domain skill list.
                    They represent skills you have not selected in your assessment,
                    not a verified evaluation of your proficiency.
                </p>
            </section>

            <section className="insights-section">
                <div className="insights-section-heading">
                    <div>
                        <p className="eyebrow">04 / CAREER PATHS</p>
                        <h2>Suggested Career Roles</h2>
                        <p>Potential roles associated with your recommended domain.</p>
                    </div>
                    <BriefcaseBusiness size={25} />
                </div>



                <div className="career-role-grid">
                    {roles.map((role, index) => {
                        const matchedCount = role.skills.filter(skill =>
                            selectedSkills.includes(skill)
                        ).length;

                        const matchPercentage = Math.round(
                            (matchedCount / role.skills.length) * 100
                        );

                        return (
                            <div className="career-role-card" key={role.title}>
                                <div className="career-role-labels">
                                    <span>ROLE {String(index + 1).padStart(2, '0')}</span>
                                    {index === 0 && (
                                        <span className="best-match-badge">BEST MATCH</span>
                                    )}
                                </div>
                                <h3>{role.title}</h3>
                                <p>{role.description}</p>

                                <div className="career-role-match">
                                    <div>
                                        <strong>Skill Match</strong>
                                        <span>{matchedCount}/{role.skills.length} skills · {matchPercentage}%</span>
                                    </div>
                                    <div className="career-role-progress">
                                        <div style={{ width: `${matchPercentage}%` }} />
                                    </div>
                                </div>

                                <div className="career-role-skills">
                                    <strong>Key Skills</strong>
                                    <div className="insight-skill-list">
                                        {role.skills.map(skill => {
                                            const isSelected = selectedSkills.includes(skill);

                                            return (
                                                <span
                                                    className={isSelected ? 'matched-skill' : 'missing-skill'}
                                                    key={skill}
                                                >
                                                    {skill}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>


            </section>


            <section className="insights-section">
                <div className="insights-section-heading">
                    <div>
                        <p className="eyebrow">05 / DEVELOPMENT</p>
                        <h2>Your Development Roadmap</h2>
                        <p>Actionable steps based on your career assessment.</p>
                    </div>
                    <BookOpen size={25} />
                </div>

                <div className="development-overview">
                    <div>
                        <strong>{developmentPriorities.length}</strong>
                        <span>Development Areas</span>
                    </div>
                    <div>
                        <strong>
                            {developmentPriorities.reduce(
                                (total, item) => total + item.actions.length, 0
                            )}
                        </strong>
                        <span>Recommended Actions</span>
                    </div>
                </div>

                {developmentPriorities.length > 0 ? (
                    <div className="development-roadmap">
                        {developmentPriorities.map((item, index) => (
                            <div className="development-card" key={item.id}>
                                <div className="development-card-header">
                                    <span>PRIORITY 0{index + 1}</span>
                                    <span className={`priority-badge priority-${item.priority.toLowerCase()}`}>
                                        {item.priority} Priority
                                    </span>
                                </div>

                                <h3>{item.title}</h3>
                                <p className="development-reason">{item.reason}</p>

                                <div className="development-actions">
                                    <strong>Recommended Actions</strong>

                                    {item.actions.map((action, actionIndex) => (
                                        <label className="development-action" key={actionIndex}>
                                            <input type="checkbox" />
                                            <span>{action}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="development-empty">
                        <CheckCircle2 size={30} />
                        <h3>You're on a positive track!</h3>
                        <p>
                            Your current assessment does not identify any immediate
                            development priorities. Continue learning and building projects.
                        </p>
                    </div>
                )}
            </section>


            <p className="insights-footer-note">
                These insights combine outputs from trained predictive models
                with rule-based career suggestions. They are guidance, not guarantees
                of employment or professional readiness.
            </p>

        </div>
    );
}

export default CareerInsights;
