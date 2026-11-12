
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  History as HistoryIcon,
  RefreshCw,
  Search,
  AlertCircle,
  X,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import jsPDF from 'jspdf';
import {
  getPredictionHistory,
  getPredictionDetails
} from '../services/api';
import './History.css';

// Safely handles the different possible prediction result shapes.
const getPredictionData = (result = {}) => {
  const placement = result.placement_status ?? result.placement ?? {};
  const readiness = result.career_readiness ?? {};
  const domain = result.career_domain ?? result.recommended_career_domain ?? {};
  const employability = result.employability ?? result.employability_score ?? {};

  return {
    placementStatus:
      typeof placement === 'string'
        ? placement
        : placement?.placement_status ?? placement?.status ?? '—',

    placementProbability:
      typeof placement === 'object'
        ? placement?.placement_probability ?? null
        : null,

    readiness:
      typeof readiness === 'string'
        ? readiness
        : readiness?.career_readiness ?? readiness?.status ?? '—',

    readinessProbabilities:
      typeof readiness === 'object'
        ? readiness?.class_probabilities ?? {}
        : {},

    domain:
      typeof domain === 'string'
        ? domain
        : domain?.recommended_career_domain ?? domain?.domain ?? '—',

    domainProbabilities:
      typeof domain === 'object'
        ? domain?.domain_probabilities ?? {}
        : {},

    employabilityScore:
      typeof employability === 'number' || typeof employability === 'string'
        ? employability
        : employability?.employability_score ?? null
  };
};

const formatDate = value => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString();
};

const formatLabel = value =>
  String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase());

const formatValue = value => {
  if (value === null || value === undefined || value === '') return '—';

  if (Array.isArray(value)) return value.join(', ');

  if (typeof value === 'object') return JSON.stringify(value);

  return String(value);
};

const probabilityToPercent = value => {
  const number = Number(value);

  if (!Number.isFinite(number)) return 0;

  return Math.min(100, Math.max(0, number <= 1 ? number * 100 : number));
};

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [readinessFilter, setReadinessFilter] = useState('All');

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const [compareIds, setCompareIds] = useState([]);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getPredictionHistory();
      const records = Array.isArray(response?.history)
        ? response.history
        : [];

      setHistory(records);

      // Remove comparison selections for records that no longer exist.
      setCompareIds(previous =>
        previous.filter(id => records.some(item => item._id === id))
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Unable to load assessment history.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredHistory = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return history.filter(item => {
      const prediction = getPredictionData(item.prediction_result);

      const matchesSearch = prediction.domain
        .toLowerCase()
        .includes(search);

      const matchesReadiness =
        readinessFilter === 'All' ||
        prediction.readiness === readinessFilter;

      return matchesSearch && matchesReadiness;
    });
  }, [history, searchTerm, readinessFilter]);

  const trendData = useMemo(() => {
    return history
      .map(item => {
        const prediction = getPredictionData(item.prediction_result);
        const score = Number(prediction.employabilityScore);

        if (!Number.isFinite(score)) return null;

        return {
          id: item._id,
          date: item.created_at,
          assessment: '',
          score,
          formattedDate: formatDate(item.created_at)
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item, index) => ({
        ...item,
        assessment: `#${index + 1}`
      }));
  }, [history]);

  const summary = useMemo(() => {
    let placed = 0;
    let highReadiness = 0;

    history.forEach(item => {
      const prediction = getPredictionData(item.prediction_result);

      if (prediction.placementStatus === 'Placed') placed += 1;
      if (prediction.readiness === 'High') highReadiness += 1;
    });

    return {
      total: history.length,
      placed,
      highReadiness
    };
  }, [history]);

  const openAssessmentDetails = async recordId => {
    try {
      setDetailsError('');
      setSelectedRecord(null);
      setDetailsLoading(true);

      const details = await getPredictionDetails(recordId);

      setSelectedRecord(details);
    } catch (err) {
      setDetailsError(
        err.response?.data?.detail ||
        err.message ||
        'Unable to load assessment details.'
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const toggleCompare = recordId => {
    setCompareIds(previous => {
      if (previous.includes(recordId)) {
        return previous.filter(id => id !== recordId);
      }

      if (previous.length >= 2) {
        return [previous[1], recordId];
      }

      return [...previous, recordId];
    });
  };

  const comparisonRecords = compareIds
    .map(id => history.find(item => item._id === id))
    .filter(Boolean);

  const exportAssessmentPDF = () => {
    if (!selectedRecord) return;

    const doc = new jsPDF();
    const result = selectedRecord.prediction_result || {};
    const student = selectedRecord.student_data || {};
    const prediction = getPredictionData(result);

    let y = 20;

    const addLine = (label, value) => {
      const lines = doc.splitTextToSize(
        `${label}: ${formatValue(value)}`,
        170
      );

      if (y + lines.length * 7 > 275) {
        doc.addPage();
        y = 20;
      }

      doc.text(lines, 20, y);
      y += lines.length * 7;
    };

    const addHeading = heading => {
      if (y > 265) {
        doc.addPage();
        y = 20;
      }

      y += 5;
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(heading, 20, y);
      y += 9;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Career Navigator', 20, y);
    y += 10;

    doc.setFontSize(15);
    doc.text('Assessment Report', 20, y);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    addLine('Assessment Date', formatDate(selectedRecord.created_at));

    addHeading('Prediction Results');

    addLine('Placement Status', prediction.placementStatus);
    addLine(
      'Placement Probability',
      prediction.placementProbability != null
        ? `${probabilityToPercent(prediction.placementProbability).toFixed(2)}%`
        : '—'
    );
    addLine('Career Readiness', prediction.readiness);
    addLine('Recommended Domain', prediction.domain);
    addLine(
      'Employability Score',
      prediction.employabilityScore != null
        ? `${prediction.employabilityScore}/100`
        : '—'
    );

    if (Object.keys(prediction.readinessProbabilities).length) {
      addHeading('Career Readiness Probabilities');

      Object.entries(prediction.readinessProbabilities).forEach(
        ([label, value]) => {
          addLine(label, `${probabilityToPercent(value).toFixed(2)}%`);
        }
      );
    }

    if (Object.keys(prediction.domainProbabilities).length) {
      addHeading('Career Domain Probabilities');

      Object.entries(prediction.domainProbabilities)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .forEach(([label, value]) => {
          addLine(label, `${probabilityToPercent(value).toFixed(2)}%`);
        });
    }

    addHeading('Submitted Student Information');

    Object.entries(student).forEach(([key, value]) => {
      addLine(formatLabel(key), formatValue(value));
    });

    doc.save(`career-assessment-${selectedRecord._id || 'report'}.pdf`);
  };

  const exportHistoryCSV = () => {
    if (!history.length) return;

    const rows = history.map((item, index) => {
      const prediction = getPredictionData(item.prediction_result);

      return {
        Assessment: history.length - index,
        Date: formatDate(item.created_at),
        'Recommended Domain': prediction.domain,
        'Career Readiness': prediction.readiness,
        'Placement Status': prediction.placementStatus,
        'Placement Probability':
          prediction.placementProbability != null
            ? `${probabilityToPercent(prediction.placementProbability).toFixed(2)}%`
            : '',
        'Employability Score': prediction.employabilityScore ?? ''
      };
    });

    const headers = Object.keys(rows[0]);

    const escapeCSV = value =>
      `"${String(value ?? '').replace(/"/g, '""')}"`;

    const csv = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row =>
        headers.map(header => escapeCSV(row[header])).join(',')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF', csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'career-assessment-history.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const renderProbabilityList = (title, probabilities) => {
    const entries = Object.entries(probabilities || {})
      .filter(([, value]) => Number.isFinite(Number(value)))
      .sort((a, b) => Number(b[1]) - Number(a[1]));

    if (!entries.length) return null;

    return (
      <div className="details-probability-section">
        <h4>{title}</h4>

        {entries.map(([label, value]) => {
          const percentage = probabilityToPercent(value);

          return (
            <div className="details-probability-item" key={label}>
              <div className="details-probability-label">
                <span>{label}</span>
                <strong>{percentage.toFixed(2)}%</strong>
              </div>

              <div className="details-probability-track">
                <div
                  className="details-probability-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="history-page">
      <header className="history-heading">
        <div>
          <p className="eyebrow">CAREER NAVIGATOR / RECORDS</p>
          <h1>Assessment History<span>.</span></h1>
          <p>Review your previous career assessments and predictions.</p>
        </div>

        <div className="history-heading-actions">
          <button
            className="history-refresh"
            onClick={fetchHistory}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>

          <button
            className="history-export-btn"
            onClick={exportHistoryCSV}
            disabled={!history.length}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </header>

      {error && (
        <div className="history-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={fetchHistory}>Try again</button>
        </div>
      )}

      {loading ? (
        <div className="history-state">Loading assessment history...</div>
      ) : history.length === 0 ? (
        <div className="history-state">
          <HistoryIcon size={30} />
          <h3>No assessments found</h3>
          <p>Complete your first career assessment to see it here.</p>
        </div>
      ) : (
        <div className="history-content">
          <div className="history-summary">
            <div>
              <strong>{summary.total}</strong>
              <span>Total Assessments</span>
            </div>

            <div>
              <strong>{summary.placed}</strong>
              <span>Predicted Placed</span>
            </div>

            <div>
              <strong>{summary.highReadiness}</strong>
              <span>High Readiness</span>
            </div>
          </div>

          {trendData.length > 1 && (
            <div className="history-trend-card">
              <div className="history-trend-heading">
                <div>
                  <h3>Employability Progress</h3>
                  <p>Predicted employability score across assessments</p>
                </div>

                <span>{trendData.length} assessments</span>
              </div>

              <div className="history-trend-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="assessment" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={value => [`${value}`, 'Employability']}
                      labelFormatter={(label, payload) =>
                        payload?.[0]?.payload?.formattedDate || label
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#9BCB32"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="history-filters">
            <div className="history-search">
              <Search size={17} />

              <input
                type="text"
                placeholder="Search career domain..."
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
              />
            </div>

            <select
              value={readinessFilter}
              onChange={event => setReadinessFilter(event.target.value)}
              aria-label="Filter by career readiness"
            >
              <option value="All">All Readiness Levels</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {compareIds.length === 2 && comparisonRecords.length === 2 && (
            <div className="history-compare-panel">
              <div className="history-compare-heading">
                <div>
                  <h3>Assessment Comparison</h3>
                  <p>Comparing your two selected assessments.</p>
                </div>

                <button onClick={() => setCompareIds([])}>
                  Clear Comparison
                </button>
              </div>

              <div className="history-compare-grid">
                {comparisonRecords.map((record, index) => {
                  const prediction = getPredictionData(record.prediction_result);

                  return (
                    <div className="history-compare-card" key={record._id}>
                      <span>Assessment {index + 1}</span>
                      <strong>{formatDate(record.created_at)}</strong>
                      <p>Domain: {prediction.domain}</p>
                      <p>Readiness: {prediction.readiness}</p>
                      <p>Placement: {prediction.placementStatus}</p>
                      <p>
                        Employability:{' '}
                        {prediction.employabilityScore != null
                          ? `${prediction.employabilityScore}/100`
                          : '—'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Compare</th>
                  <th>Assessment</th>
                  <th>Date</th>
                  <th>Recommended Domain</th>
                  <th>Readiness</th>
                  <th>Placement</th>
                  <th>Employability</th>
                </tr>
              </thead>

              <tbody>
                {filteredHistory.map(item => {
                  const prediction = getPredictionData(item.prediction_result);
                  const originalIndex = history.findIndex(
                    record => record._id === item._id
                  );

                  const assessmentNumber =
                    originalIndex >= 0 ? history.length - originalIndex : '—';

                  return (
                    <tr
                      key={item._id}
                      className="history-clickable-row"
                      onClick={() => openAssessmentDetails(item._id)}
                      onKeyDown={event => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openAssessmentDetails(item._id);
                        }
                      }}
                      tabIndex={0}
                      aria-label={`Open assessment ${assessmentNumber}`}
                    >
                      <td onClick={event => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={compareIds.includes(item._id)}
                          onChange={() => toggleCompare(item._id)}
                          aria-label={`Select assessment ${assessmentNumber} for comparison`}
                        />
                      </td>

                      <td><strong>#{assessmentNumber}</strong></td>
                      <td>{formatDate(item.created_at)}</td>
                      <td>{prediction.domain}</td>
                      <td>
                        <span className="history-status">
                          {prediction.readiness}
                        </span>
                      </td>
                      <td>
                        <span className="history-status">
                          {prediction.placementStatus}
                        </span>
                      </td>
                      <td>
                        {prediction.employabilityScore != null
                          ? `${prediction.employabilityScore}/100`
                          : '—'}
                      </td>
                    </tr>
                  );
                })}

                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan="7" className="history-no-results">
                      No assessments match your search or filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailsLoading && (
        <div className="history-modal-backdrop">
          <div className="history-modal-loading">
            Loading assessment details...
          </div>
        </div>
      )}

      {detailsError && (
        <div className="history-error">
          <AlertCircle size={18} />
          <span>{detailsError}</span>
          <button onClick={() => setDetailsError('')}>Dismiss</button>
        </div>
      )}

      {selectedRecord && (() => {
        const result = selectedRecord.prediction_result || {};
        const student = selectedRecord.student_data || {};
        const prediction = getPredictionData(result);

        return (
          <div
            className="history-modal-backdrop"
            onClick={() => setSelectedRecord(null)}
          >
            <div
              className="history-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="history-modal-title"
              onClick={event => event.stopPropagation()}
            >
              <div className="history-modal-header">
                <div>
                  <p className="eyebrow">CAREER NAVIGATOR / RECORDS</p>
                  <h2 id="history-modal-title">
                    Assessment Details<span>.</span>
                  </h2>
                  <p>{formatDate(selectedRecord.created_at)}</p>
                </div>

                <div className="history-modal-actions">
                  <button
                    className="history-export-btn"
                    onClick={exportAssessmentPDF}
                  >
                    <Download size={16} />
                    Export PDF
                  </button>

                  <button
                    className="history-close-btn"
                    onClick={() => setSelectedRecord(null)}
                    aria-label="Close assessment details"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <section className="details-section">
                <h3>Prediction Results</h3>

                <div className="details-result-grid">
                  <div className="details-result-card">
                    <span>Placement Status</span>
                    <strong>{prediction.placementStatus}</strong>
                    <small>
                      Probability:{' '}
                      {prediction.placementProbability != null
                        ? `${probabilityToPercent(prediction.placementProbability).toFixed(2)}%`
                        : '—'}
                    </small>
                  </div>

                  <div className="details-result-card">
                    <span>Career Readiness</span>
                    <strong>{prediction.readiness}</strong>
                  </div>

                  <div className="details-result-card">
                    <span>Recommended Domain</span>
                    <strong>{prediction.domain}</strong>
                  </div>

                  <div className="details-result-card">
                    <span>Employability Score</span>
                    <strong>
                      {prediction.employabilityScore != null
                        ? `${prediction.employabilityScore}/100`
                        : '—'}
                    </strong>
                    <small>Predicted score</small>
                  </div>
                </div>

                {renderProbabilityList(
                  'Career Readiness Probabilities',
                  prediction.readinessProbabilities
                )}

                {renderProbabilityList(
                  'Career Domain Probabilities',
                  prediction.domainProbabilities
                )}
              </section>

              <section className="details-section">
                <h3>Submitted Student Information</h3>

                {Object.keys(student).length ? (
                  <div className="details-student-grid">
                    {Object.entries(student).map(([key, value]) => (
                      <div className="details-student-item" key={key}>
                        <span>{formatLabel(key)}</span>
                        <strong>{formatValue(value)}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="history-muted">
                    No student information is available for this assessment.
                  </p>
                )}
              </section>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default History;
