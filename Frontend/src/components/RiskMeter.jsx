import { ShieldAlert, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import './RiskMeter.css';

const RISK_CONFIG = {
  CRITICAL: {
    label: 'Critical Risk',
    color: 'risk-critical',
    icon: '🔴',
    score: '100%',
    IconComponent: ShieldAlert,
    description: 'Severe vulnerabilities detected. Immediate action required.',
  },
  HIGH: {
    label: 'High Risk',
    color: 'risk-high',
    icon: '🟠',
    score: '75%',
    IconComponent: AlertTriangle,
    description: 'Significant issues identified. Prioritize fixes before release.',
  },
  MEDIUM: {
    label: 'Medium Risk',
    color: 'risk-medium',
    icon: '🟡',
    score: '50%',
    IconComponent: AlertCircle,
    description: 'Notable issues present. Address before staging deployment.',
  },
  LOW: {
    label: 'Low Risk',
    color: 'risk-low',
    icon: '🟢',
    score: '25%',
    IconComponent: CheckCircle2,
    description: 'Minor suggestions. Code structure is fundamentally sound.',
  },
};

export default function RiskMeter({ overallRisk, findingCount, summary }) {
  const config = RISK_CONFIG[overallRisk] ?? RISK_CONFIG.LOW;
  const IconComp = config.IconComponent;

  return (
    <div className={`risk-meter ${config.color}`}>
      {/* ── Header row ── */}
      <div className="risk-header">
        <div className="risk-badge-wrap">
          <div className="risk-icon-pill">
            <IconComp size={15} className="risk-svg-icon" />
            <span className="risk-label">{config.label}</span>
          </div>
          <span className="risk-score-pill">Impact: {config.score}</span>
        </div>

        <span className="risk-count">
          {findingCount} {findingCount === 1 ? 'Finding' : 'Findings'}
        </span>
      </div>

      {/* ── Gauge Bar ── */}
      <div className="risk-bar-bg">
        <div
          className="risk-bar-fill"
          style={{ width: `${config.score}` }}
        />
      </div>

      {/* ── Summary Box ── */}
      {summary && (
        <div className="risk-summary-box">
          <p className="risk-summary">{summary}</p>
        </div>
      )}
    </div>
  );
}
