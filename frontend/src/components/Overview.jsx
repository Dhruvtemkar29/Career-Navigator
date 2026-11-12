
import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  BrainCircuit,
  ChartNoAxesCombined,
  ClipboardList,
  RefreshCw,
  GraduationCap,
  Clock3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { getPredictionHistory } from '../services/api';

const formatDate = (date) =>
  new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

export default function Overview({ onNavigate }) {
  const [historyData, setHistoryData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getPredictionHistory();
      setHistoryData(data.history || []);
      setTotalRecords(data.total_records || 0);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to connect to the prediction history service.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const latestRecord = historyData[0];
  const prediction = latestRecord?.prediction_result;
  const student = latestRecord?.student_data;

  const domainProbabilities = prediction?.career_domain?.domain_probabilities;

  const domainChartData = domainProbabilities
    ? Object.entries(domainProbabilities)
      .map(([domain, probability]) => ({
        domain,
        probability: Number((probability * 100).toFixed(2))
      }))
      .sort((a, b) => b.probability - a.probability)
    : [];

  const stats = [
    {
      label: 'TOTAL ASSESSMENTS',
      value: totalRecords,
      description: 'Saved prediction records',
      icon: ClipboardList
    },
    {
      label: 'EMPLOYABILITY SCORE',
      value: prediction
        ? `${prediction.employability.employability_score.toFixed(1)}%`
        : '--',
      description: 'Predicted employability',
      icon: BriefcaseBusiness
    },
    {
      label: 'CAREER READINESS',
      value: prediction?.career_readiness?.career_readiness || '--',
      description: 'Current readiness level',
      icon: BrainCircuit
    },
    {
      label: 'PLACEMENT PROBABILITY',
      value: prediction
        ? `${(prediction.placement.placement_probability * 100).toFixed(1)}%`
        : '--',
      description: prediction?.placement?.placement_status || 'No prediction',
      icon: ChartNoAxesCombined
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-state">
        <RefreshCw className="loading-icon" size={28} />
        <h3>Loading your career dashboard...</h3>
        <p>Retrieving your prediction history.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-state">
        <h3>Dashboard connection failed</h3>
        <p>{error}</p>
        <button className="cn-button" onClick={fetchDashboard}>
          <RefreshCw size={17} /> Retry connection
        </button>
      </div>
    );
  }

  return (
    <div className="overview-page">
      <header className="overview-header">
        <div>
          <p className="eyebrow">CAREER INTELLIGENCE / OVERVIEW</p>
          <h1>Discover your next <span>big move.</span></h1>
          <p className="overview-description">
            Your career journey, backed by predictive analytics.
          </p>
        </div>

        <button className="cn-button refresh-button" onClick={fetchDashboard}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      {latestRecord ? (
        <>
          <section className="student-strip">
            <div className="student-strip-icon">
              <GraduationCap size={22} />
            </div>
            <div>
              <strong>
                {student?.degree || 'Student'} · {student?.specialization || 'Career Profile'}
              </strong>
              <span>
                {student?.education_level || '--'} · Year {student?.study_year ?? '--'}
              </span>
            </div>
            <div className="student-strip-date">
              <Clock3 size={15} />
              <span>Latest: {formatDate(latestRecord.created_at)}</span>
            </div>
          </section>

          <section className="stats-grid">
            {stats.map(({ label, value, description, icon: Icon }, index) => (
              <article className="stat-card" key={label}>
                <div className="stat-card-top">
                  <span>{label}</span>
                  <Icon size={20} />
                </div>
                <h2>{value}</h2>
                <p>{description}</p>
                <span className="stat-index">0{index + 1}</span>
              </article>
            ))}
          </section>

          <section className="dashboard-grid">
            <article className="dashboard-panel domain-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">AI RECOMMENDATION</p>
                  <h3>Career domain analysis</h3>
                </div>
                <ChartNoAxesCombined size={22} />
              </div>

              <div className="recommended-domain">
                <span>RECOMMENDED CAREER DOMAIN</span>
                <h2>
                  {prediction?.career_domain?.recommended_career_domain || '--'}
                </h2>
              </div>

              <div className="chart-container">
                {domainChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={domainChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        unit="%"
                        tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="domain"
                        width={145}
                        tick={{ fill: 'var(--text-primary)', fontSize: 10 }}
                      />
                      <Tooltip
                        formatter={(value) => [`${value}%`, 'Probability']}
                        contentStyle={{
                          background: 'var(--surface)',
                          border: '2px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <Bar
                        dataKey="probability"
                        fill="#C6FF45"
                        stroke="var(--border)"
                        strokeWidth={1}
                        barSize={17}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p>No career-domain probabilities available.</p>
                )}
              </div>
            </article>

            <article className="dashboard-panel placement-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">PLACEMENT OUTLOOK</p>
                  <h3>Prediction summary</h3>
                </div>
                <BriefcaseBusiness size={22} />
              </div>

              <div className="placement-result">
                <span className="result-label">PLACEMENT STATUS</span>
                <h2>{prediction?.placement?.placement_status || '--'}</h2>
                <div className="probability-track">
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, prediction?.placement?.placement_probability * 100 || 0)
                      )}%`
                    }}
                  />
                </div>
                <p>
                  {((prediction?.placement?.placement_probability || 0) * 100).toFixed(2)}%
                  {' '}predicted placement probability
                </p>
              </div>

              <div className="readiness-result">
                <span>CAREER READINESS</span>
                <strong>
                  {prediction?.career_readiness?.career_readiness || '--'}
                </strong>
              </div>

              <div className="readiness-result">
                <span>EMPLOYABILITY</span>
                <strong>
                  {prediction?.employability?.employability_score?.toFixed(2) || '--'}
                  {prediction?.employability ? '%' : ''}
                </strong>
              </div>
            </article>
          </section>

          <section className="dashboard-panel history-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">YOUR ACTIVITY</p>
                <h3>Recent assessments</h3>
              </div>
              <span className="record-count">{totalRecords} RECORDS</span>
            </div>

            {historyData.length > 0 ? (
              <div className="history-list">
                {historyData.slice(0, 5).map((record) => (
                  <div className="history-row" key={record._id}>
                    <div className="history-icon">
                      <BrainCircuit size={19} />
                    </div>
                    <div className="history-info">
                      <strong>
                        {record.prediction_result?.career_domain?.recommended_career_domain || 'Career Assessment'}
                      </strong>
                      <span>{formatDate(record.created_at)}</span>
                    </div>
                    <span className="history-readiness">
                      {record.prediction_result?.career_readiness?.career_readiness || '--'}
                    </span>
                    <ArrowUpRight size={18} />
                  </div>
                ))}
              </div>
            ) : (
              <p>No assessment records found. Start your first assessment.</p>
            )}
          </section>
        </>
      ) : (

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            marginTop: '24px'
          }}
        >
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 0.8fr',
              gap: '24px',
              alignItems: 'center',
              padding: 'clamp(24px, 5vw, 56px)',
              minHeight: '300px',
              background: 'var(--surface)',
              border: '2px solid var(--border)',
              borderRadius: '14px',
              boxShadow: '6px 6px 0 var(--border)'
            }}
          >
            <div>
              <span className="eyebrow">YOUR CAREER JOURNEY / GET STARTED</span>
              <h2 style={{
                fontSize: 'clamp(30px, 4vw, 48px)',
                lineHeight: 1.1,
                margin: '18px 0'
              }}>
                Your future starts with <span style={{ color: '#9BCB28' }}>one assessment.</span>
              </h2>
              <p style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                maxWidth: '520px',
                marginBottom: '24px'
              }}>
                Discover your strengths, understand your career readiness,
                and explore career opportunities with AI-powered predictive analytics.
              </p>
              <button
                className="cn-button"
                onClick={() => onNavigate?.('Career Assessment')}
              >
                <ClipboardList size={17} />
                Start Your Career Assessment
                <ArrowUpRight size={17} />
              </button>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '180px'
            }}>
              <div style={{
                width: '180px',
                height: '180px',
                border: '2px solid var(--border)',
                borderRadius: '24px',
                background: '#C6FF45',
                color: '#20211F',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transform: 'rotate(-5deg)',
                boxShadow: '8px 8px 0 var(--border)'
              }}>
                <BrainCircuit size={90} strokeWidth={1.5} />
              </div>
            </div>
          </section>

          <div>
            <p className="eyebrow">HOW IT WORKS</p>
            <h3 style={{ fontSize: '24px', margin: '8px 0 18px' }}>
              Three steps to career clarity.
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '18px'
            }}>
              {[
                {
                  number: '01',
                  title: 'Assess',
                  description: 'Share your academic background, skills, interests and experience.',
                  Icon: ClipboardList
                },
                {
                  number: '02',
                  title: 'Predict',
                  description: 'Explore AI-generated predictions about your career outcomes.',
                  Icon: BrainCircuit
                },
                {
                  number: '03',
                  title: 'Improve',
                  description: 'Identify skill gaps and discover ways to improve your career readiness.',
                  Icon: ChartNoAxesCombined
                }
              ].map(({ number, title, description, Icon }) => (
                <article
                  key={number}
                  style={{
                    padding: '24px',
                    background: 'var(--surface)',
                    border: '2px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: '4px 4px 0 var(--border)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '22px'
                  }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
                      {number}
                    </span>
                    <Icon size={25} />
                  </div>
                  <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{title}</h3>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    lineHeight: 1.6
                  }}>
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <section style={{
            padding: '24px',
            background: 'var(--surface)',
            border: '2px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '4px 4px 0 var(--border)'
          }}>
            <p className="eyebrow">COMING INTO FOCUS</p>
            <h3 style={{ fontSize: '22px', margin: '8px 0' }}>
              Your career intelligence workspace
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              Complete your first assessment to unlock these personalized insights.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '12px'
            }}>
              {[
                'Career readiness analysis',
                'Employability prediction',
                'Recommended career domains',
                'Placement outlook',
                'Skill gap identification',
                'Personalized career roadmap'
              ].map((item, index) => (
                <div key={item} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '13px'
                }}>
                  <span style={{ color: '#9BCB28', fontWeight: 800 }}>
                    0{index + 1}
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>

      )}
    </div>
  );
}
