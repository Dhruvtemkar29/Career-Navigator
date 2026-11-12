
import { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, LoaderCircle,
  GraduationCap, Code2, BriefcaseBusiness, Compass,
  Sparkles, AlertCircle, BrainCircuit
} from 'lucide-react';
import api from '../services/api';
import './CareerAssessment.css';

const categories = {
  education_level: ['UG', 'PG'],
  degree: ['BA', 'BCA', 'BCom', 'BSc', 'BTech', 'MA', 'MBA', 'MCA', 'MSc', 'MTech'],
  specialization: [
    'AI & ML', 'Artificial Intelligence', 'Business',
    'Business Analytics', 'Commerce', 'Computer Science',
    'Cybersecurity', 'Data Science', 'Electronics',
    'Finance', 'Information Technology'
  ],
  preferred_career_domain: [
    'Artificial Intelligence & Machine Learning',
    'Data Science',
    'Software Development',
    'Cybersecurity',
    'Cloud Computing',
    'UI/UX Design'
  ]
};

const skillGroups = {
  'AI & Machine Learning': [
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
    'Express.js', 'React Native', 'Flutter', 'MongoDB',
    'Git & GitHub'
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

const allSkills = [...new Set(Object.values(skillGroups).flat())];

const sections = [
  {
    title: 'Academic Profile',
    description: 'Tell us about your education and academic performance.',
    icon: GraduationCap,
    fields: [
      'education_level', 'degree', 'specialization', 'study_year',
      'academic_score_10th', 'academic_score_12th',
      'current_cgpa', 'undergraduate_cgpa',
      'backlogs', 'attendance_percentage'
    ]
  },
  {
    title: 'Projects & Experience',
    description: 'Share your practical experience and achievements.',
    icon: BriefcaseBusiness,
    fields: [
      'academic_projects', 'major_projects', 'research_experience',
      'internship_count', 'internship_duration_months',
      'certifications_count', 'hackathon_participation',
      'hackathon_wins', 'github_projects'
    ]
  },
  {
    title: 'Skills & Communication',
    description: 'Select your technical skills and share your communication and interview experience.',
    icon: Code2,
    fields: [
      'selected_skills', 'communication_rating', 'interviews_attended'
    ]
  },
  {
    title: 'Career Preferences',
    description: 'Choose the career domain you are most interested in pursuing.',
    icon: Compass,
    fields: ['preferred_career_domain']
  }
];

const labels = {
  education_level: 'Education Level',
  degree: 'Degree',
  specialization: 'Specialization',
  study_year: 'Current Study Year',
  academic_score_10th: '10th Standard Percentage',
  academic_score_12th: '12th Standard Percentage',
  current_cgpa: 'Current CGPA',
  undergraduate_cgpa: 'Undergraduate CGPA',
  backlogs: 'Number of Backlogs',
  attendance_percentage: 'Attendance Percentage',
  academic_projects: 'Academic Projects',
  major_projects: 'Major Projects',
  research_experience: 'Research Experience',
  internship_count: 'Number of Internships',
  internship_duration_months: 'Total Internship Duration (Months)',
  certifications_count: 'Number of Certifications',
  hackathon_participation: 'Hackathons Participated',
  hackathon_wins: 'Hackathons Won',
  github_projects: 'GitHub Projects',
  communication_rating: 'Rate Your Communication Skills (1–10)',
  interviews_attended: 'Number of Interviews Attended',
  selected_skills: 'Technical Skills',
  preferred_career_domain: 'Preferred Career Domain'
};

const countFields = [
  'study_year', 'backlogs', 'academic_projects', 'major_projects',
  'research_experience', 'internship_count',
  'internship_duration_months', 'certifications_count',
  'hackathon_participation', 'hackathon_wins',
  'github_projects', 'interviews_attended'
];

const initialValues = () => ({
  education_level: '',
  degree: '',
  specialization: '',
  study_year: '',
  academic_score_10th: '',
  academic_score_12th: '',
  current_cgpa: '',
  undergraduate_cgpa: '',
  backlogs: '',
  attendance_percentage: '',
  academic_projects: '',
  major_projects: '',
  research_experience: '',
  internship_count: '',
  internship_duration_months: '',
  certifications_count: '',
  hackathon_participation: '',
  hackathon_wins: '',
  github_projects: '',
  communication_rating: '',
  interviews_attended: '',
  selected_skills: [],
  preferred_career_domain: ''
});

function CareerAssessment() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [result, setResult] = useState(null);
  const idempotencyKey = useRef(null);
  const submissionLock = useRef(false);

  const currentSection = sections[step];
  const progress = ((step + 1) / sections.length) * 100;

  const completedCount = useMemo(() => {
    return Object.entries(formData).filter(([key, value]) => {
      if (key === 'undergraduate_cgpa' && formData.education_level === 'UG') return true;
      if (key === 'selected_skills') return value.length > 0;
      return value !== '' && value !== null && value !== undefined;
    }).length;
  }, [formData]);

  const updateField = (field, value) => {
    setFormData(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: '' }));
    setApiError('');
    setResult(null);
    submissionLock.current = false;
    idempotencyKey.current = null;
  };

  const toggleSkill = skill => {
    const selected = formData.selected_skills;
    updateField(
      'selected_skills',
      selected.includes(skill)
        ? selected.filter(item => item !== skill)
        : [...selected, skill]
    );
  };

  const getLimits = field => {
    if (field === 'study_year') {
      return formData.education_level === 'PG' ? [1, 2, 1] : [1, 4, 1];
    }
    if (field.includes('cgpa')) return [0, 10, 0.01];
    if (field.includes('percentage')) return [0, 100, 0.01];
    if (field === 'communication_rating') return [1, 10, 1];
    if (field === 'internship_duration_months') return [0, 120, 1];
    if (countFields.includes(field)) return [0, 100, 1];
    return [0, 100, 1];
  };

  const validateStep = () => {
    const nextErrors = {};

    currentSection.fields.forEach(field => {
      const value = formData[field];

      if (field === 'undergraduate_cgpa' && formData.education_level === 'UG') return;

      if (field === 'selected_skills') {
        if (!value.length) nextErrors[field] = 'Select at least one technical skill.';
        return;
      }

      if (value === '' || value === null || value === undefined) {
        nextErrors[field] = 'This field is required.';
        return;
      }

      if (field === 'study_year' && !formData.education_level) {
        nextErrors[field] = 'Select your education level first.';
        return;
      }

      if (!categories[field]) {
        const [min, max] = getLimits(field);
        const number = Number(value);

        if (!Number.isFinite(number) || number < min || number > max) {
          nextErrors[field] = `Enter a value between ${min} and ${max}.`;
        } else if (countFields.includes(field) && !Number.isInteger(number)) {
          nextErrors[field] = 'Enter a whole number.';
        }
      }
    });

    if (
      !nextErrors.academic_projects &&
      !nextErrors.major_projects &&
      Number(formData.major_projects) > Number(formData.academic_projects)
    ) {
      nextErrors.major_projects = 'Major projects cannot exceed academic projects.';
    }

    if (
      !nextErrors.hackathon_participation &&
      !nextErrors.hackathon_wins &&
      Number(formData.hackathon_wins) > Number(formData.hackathon_participation)
    ) {
      nextErrors.hackathon_wins = 'Wins cannot exceed hackathon participation.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep()) setStep(previous => Math.min(previous + 1, sections.length - 1));
  };

  const goBack = () => {
    setErrors({});
    setStep(previous => Math.max(previous - 1, 0));
  };

  const submitAssessment = async event => {
    event.preventDefault();

    if (submissionLock.current || loading || result) return;
    if (!validateStep()) return;

    if (!idempotencyKey.current) {
      idempotencyKey.current = crypto.randomUUID();
    }
    submissionLock.current = true;
    setLoading(true);
    setApiError('');
    setResult(null);

    try {
      const studentData = { ...formData };

      Object.keys(studentData).forEach(key => {
        if (key === 'selected_skills' || categories[key]) return;

        if (key === 'undergraduate_cgpa' && formData.education_level === 'UG') {
          studentData[key] = null;
        } else {
          studentData[key] = Number(studentData[key]);
        }
      });

      const response = await api.post(
        '/predictions/all',
        { student_data: studentData },
        {
          headers: {
            'Idempotency-Key': idempotencyKey.current
          }
        }
      );

      setResult(response.data);
    } catch (error) {
      submissionLock.current = false;

      const detail = error.response?.data?.detail;
      setApiError(
        typeof detail === 'string'
          ? detail
          : detail
            ? JSON.stringify(detail)
            : error.message || 'Unable to generate predictions.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderField = field => {
    const isSelect = Boolean(categories[field]);
    const [min, max, stepValue] = getLimits(field);
    const isOptional = field === 'undergraduate_cgpa' && formData.education_level === 'UG';

    if (field === 'undergraduate_cgpa' && formData.education_level === 'UG') return null;

    if (field === 'selected_skills') {
      return (
        <div className="assessment-field skill-selection" key={field}>
          <label>{labels[field]}</label>
          <p className="assessment-subtitle">Select all skills you currently have experience with.</p>

          {Object.entries(skillGroups).map(([group, skills]) => (
            <div className="skill-group" key={group}>
              <h4>{group}</h4>
              <div className="skill-options">
                {skills.map(skill => (
                  <label className={`skill-option ${formData.selected_skills.includes(skill) ? 'selected' : ''}`} key={`${group}-${skill}`}>
                    <input
                      type="checkbox"
                      checked={formData.selected_skills.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                    />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <small>{formData.selected_skills.length} skills selected</small>
          {errors[field] && <span className="field-error-text">{errors[field]}</span>}
        </div>
      );
    }

    return (
      <div className="assessment-field" key={field}>
        <label htmlFor={field}>
          {labels[field]}
          {isOptional && <span className="optional-label">Optional for UG</span>}
        </label>

        {isSelect ? (
          <select
            id={field}
            value={formData[field]}
            onChange={event => updateField(field, event.target.value)}
            className={errors[field] ? 'field-error' : ''}
          >
            <option value="">Select {labels[field]}</option>
            {categories[field].map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <input
            id={field}
            type="number"
            min={min}
            max={max}
            step={stepValue}
            value={formData[field]}
            placeholder={`Enter ${labels[field].toLowerCase()}`}
            onChange={event => updateField(field, event.target.value)}
            className={errors[field] ? 'field-error' : ''}
          />
        )}

        {errors[field] && <span className="field-error-text">{errors[field]}</span>}
      </div>
    );
  };

  return (
    <div className="assessment-page">
      <div className="assessment-heading">
        <div>
          <p className="eyebrow">CAREER NAVIGATOR / ASSESSMENT</p>
          <h1>Career Assessment<span>.</span></h1>
          <p className="assessment-subtitle">
            Help us understand your profile to generate personalized career insights.
          </p>
        </div>
        <div className="assessment-completion">
          <BrainCircuit size={20} />
          <span>{completedCount}/22 fields</span>
        </div>
      </div>

      <div className="assessment-progress">
        <div className="assessment-progress-track">
          <div style={{ width: `${progress}%` }} />
        </div>
        <div className="assessment-step-label">
          <span>STEP {step + 1} OF 4</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>

      <div className="assessment-stepper">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <button
              type="button"
              key={section.title}
              className={`assessment-step ${index === step ? 'active' : ''} ${index < step ? 'completed' : ''}`}
              onClick={() => {
                if (index < step) {
                  setStep(index);
                  setErrors({});
                }
              }}
              disabled={index > step}
            >
              <span className="step-icon">
                {index < step ? <Check size={17} /> : <Icon size={17} />}
              </span>
              <span className="step-name">{section.title}</span>
            </button>
          );
        })}
      </div>

      <form className="assessment-card" onSubmit={submitAssessment}>
        <div className="assessment-card-heading">
          <div>
            <p className="eyebrow">SECTION 0{step + 1}</p>
            <h2>{currentSection.title}</h2>
            <p>{currentSection.description}</p>
          </div>
          <span className="assessment-section-icon">
            <currentSection.icon size={27} />
          </span>
        </div>

        <div className="assessment-fields-grid">
          {currentSection.fields.map(renderField)}
        </div>

        {apiError && (
          <div className="assessment-error">
            <AlertCircle size={18} />
            <span>{apiError}</span>
          </div>
        )}

        <div className="assessment-actions">
          <button
            type="button"
            className="assessment-back-button"
            onClick={goBack}
            disabled={step === 0 || loading}
          >
            <ArrowLeft size={17} /> Back
          </button>

          {step < sections.length - 1 ? (
            <button
              type="button"
              className="assessment-next-button"
              onClick={goNext}
            >
              Continue <ArrowRight size={17} />
            </button>
          ) : (
            <button
              type="submit"
              className="assessment-next-button"
              disabled={loading || Boolean(result)}
            >
              {loading ? (
                <><LoaderCircle className="assessment-spinner" size={18} /> Generating...</>
              ) : result ? (
                <><Check size={18} /> Predictions Generated</>
              ) : (
                <><Sparkles size={18} /> Generate Predictions</>
              )}
            </button>
          )}
        </div>
      </form>

      {result && (
        <div className="assessment-result">
          <div className="assessment-result-heading">
            <span className="result-success-icon"><Check size={20} /></span>
            <div>
              <p className="eyebrow">ASSESSMENT COMPLETE</p>
              <h2>Your career predictions are ready.</h2>
            </div>
          </div>

          <div className="assessment-result-grid">
            <div className="assessment-result-item">
              <span>Placement</span>
              <strong>{result.placement?.placement_status}</strong>
              <small>
                {(result.placement?.placement_probability * 100).toFixed(1)}% probability
              </small>
            </div>
            <div className="assessment-result-item">
              <span>Career Readiness</span>
              <strong>{result.career_readiness?.career_readiness}</strong>
            </div>
            <div className="assessment-result-item">
              <span>Recommended Domain</span>
              <strong>{result.career_domain?.recommended_career_domain}</strong>
            </div>
            <div className="assessment-result-item">
              <span>Employability Score</span>
              <strong>{result.employability?.employability_score}/100</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CareerAssessment;
