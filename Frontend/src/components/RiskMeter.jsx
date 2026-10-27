import './RiskMeter.css';

const RISK_CONFIG = {
  CRITICAL: {
    label: 'Critical Risk',
    color: 'risk-critical',
    icon: '🔴',
    bar: 100,
    description: 'Severe issues detected. Immediate action required.',
  },
  HIGH: {
    label: 'High Risk',
    color: 'risk-high',
    icon: '🟠',
    bar: 75,
    description: 'Significant problems found. Prioritize fixes.',
  },
  MEDIUM: {
    label: 'Medium Risk',
    color: 'risk-medium',
    icon: '🟡',
    bar: 50,
    description: 'Notable issues present. Address before release.',
  },
  LOW: {
    label: 'Low Risk',
    color: 'risk-low',
    icon: '🟢',
    bar: 25,
    description: 'Minor improvements suggested. Code is generally solid.',
  },
};

export default function RiskMeter({ overallRisk, findingCount, summary }) {
  const config = RISK_CONFIG[overallRisk] ?? RISK_CONFIG.LOW;

  return (
    <div className={`risk-meter ${config.color}`}>
      {/* ── Header row ── */}
      <div className="risk-header">
        <div className="risk-badge-wrap">
          <span className="risk-icon">{config.icon}</span>
          <span className="risk-label">{config.label}</span>
        </div>
        <span className="risk-count">
          {findingCount} {findingCount === 1 ? 'finding' : 'findings'}
        </span>
      </div>

      {/* ── Bar ── */}
      <div className="risk-bar-bg">
        <div
          className="risk-bar-fill"
          style={{ width: `${config.bar}%` }}
        />
      </div>

      {/* ── Summary ── */}
      {summary && (
        <p className="risk-summary">{summary}</p>
      )}
    </div>
  );
}
