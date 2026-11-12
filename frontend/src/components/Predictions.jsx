
import { useEffect, useState } from 'react';
import {
  BrainCircuit, BriefcaseBusiness, Target,
  ChartNoAxesCombined, Clock, RefreshCw,
  AlertCircle, CheckCircle2, History
} from 'lucide-react';
import { getPredictionHistory } from '../services/api';
import './Predictions.css';

function Predictions() {
  const [history, setHistory] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getPredictionHistory();
      const records = data.history || [];

      setHistory(records);
      setSelectedRecord(previous => {
        if (previous) {
          return records.find(record => record._id === previous._id) || records[0] || null;
        }
        return records[0] || null;
      });
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Unable to load prediction history.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const prediction = selectedRecord?.prediction_result;

  const formatDate = date => {
    if (!date) return 'Date unavailable';

    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const cards = [
    {
      title: 'Placement Prediction',
      value: prediction?.placement?.placement_status ?? 'N/A',
      detail: prediction?.placement?.placement_probability != null
        ? `${(prediction.placement.placement_probability * 100).toFixed(1)}% probability`
        : 'Probability unavailable',
      icon: BriefcaseBusiness
    },
    {
      title: 'Career Readiness',
      value: prediction?.career_readiness?.career_readiness ?? 'N/A',
      detail: 'Predicted readiness level',
      icon: BrainCircuit
    },
    {
      title: 'Recommended Domain',
      value: prediction?.career_domain?.recommended_career_domain ?? 'N/A',
      detail: prediction?.career_domain?.confidence != null
        ? `${(prediction.career_domain.confidence * 100).toFixed(1)}% model confidence`
        : 'Recommended career direction',
      icon: Target
    },
    {
      title: 'Employability Score',
      value: prediction?.employability?.employability_score != null
        ? `${Number(prediction.employability.employability_score).toFixed(2)}/100`
        : 'N/A',
      detail: 'Predicted employability score',
      icon: ChartNoAxesCombined
    }
  ];

  if (loading) {
    return (
      <div className="predictions-page">
        <div className="predictions-state">
          <RefreshCw className="assessment-spinner" size={25} />
          <p>Loading your career predictions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="predictions-page">
        <div className="predictions-state">
          <AlertCircle size={30} />
          <h2>Unable to load predictions</h2>
          <p>{error}</p>
          <button onClick={fetchHistory}>
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="predictions-page">
      <div className="predictions-heading">
        <div>
          <p className="eyebrow">CAREER NAVIGATOR / ANALYTICS</p>
          <h1>Career Predictions<span>.</span></h1>
          <p>Explore your predicted career outcomes and assessment history.</p>
        </div>

        <button className="predictions-refresh" onClick={fetchHistory}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      {!history.length ? (
        <div className="predictions-empty">
          <BrainCircuit size={42} />
          <h2>No predictions yet.</h2>
          <p>Complete your career assessment to see your personalized predictions here.</p>
        </div>
      ) : (
        <>
          <div className="predictions-summary">
            <div>
              <span>Total Assessments</span>
              <strong>{history.length}</strong>
            </div>
            <div>
              <span>Latest Assessment</span>
              <strong>{formatDate(history[0]?.created_at)}</strong>
            </div>
            <div>
              <span>Selected Record</span>
              <strong>{selectedRecord?._id?.slice(-8) || 'N/A'}</strong>
            </div>
          </div>

          <section className="predictions-section">
            <div className="predictions-section-heading">
              <div>
                <p className="eyebrow">ASSESSMENT RESULTS</p>
                <h2>Your Career Insights</h2>
              </div>
              <span className="prediction-date">
                <Clock size={15} />
                {formatDate(selectedRecord?.created_at)}
              </span>
            </div>

            <div className="predictions-grid">
              {cards.map(card => {
                const Icon = card.icon;

                return (
                  <div className="prediction-card" key={card.title}>
                    <div className="prediction-card-icon">
                      <Icon size={21} />
                    </div>
                    <span>{card.title}</span>
                    <strong>{card.value}</strong>
                    <small>{card.detail}</small>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="prediction-history-section">
            <div className="predictions-section-heading">
              <div>
                <p className="eyebrow">YOUR RECORDS</p>
                <h2>Assessment History</h2>
              </div>
              <History size={23} />
            </div>

            <div className="prediction-history-list">
              {history.map((record, index) => (
                <button
                  key={record._id}
                  className={`prediction-history-item ${
                    selectedRecord?._id === record._id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedRecord(record)}
                >
                  <span className="history-icon">
                    {selectedRecord?._id === record._id
                      ? <CheckCircle2 size={19} />
                      : <Clock size={19} />}
                  </span>

                  <span className="history-info">
                    <strong>
                      Assessment #{history.length - index}
                      {index === 0 && <small> LATEST</small>}
                    </strong>
                    <span>{formatDate(record.created_at)}</span>
                  </span>

                  <span className="history-domain">
                    {record.prediction_result?.career_domain
                      ?.recommended_career_domain || 'Not available'}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Predictions;
