import { useEffect, useState } from 'react';
import { X, Trash2, RotateCcw, Clock, Code2, Loader2, AlertCircle } from 'lucide-react';
import api from '../api';
import DeleteConfirmModal from './DeleteConfirmModal';
import './HistoryDrawer.css';

// ─── Risk badge colors ────────────────────────────────────────────────────────

const RISK_COLOR = {
  CRITICAL: 'hist-risk-critical',
  HIGH:     'hist-risk-high',
  MEDIUM:   'hist-risk-medium',
  LOW:      'hist-risk-low',
};

const RISK_LABEL = {
  CRITICAL: '🔴 Critical',
  HIGH:     '🟠 High',
  MEDIUM:   '🟡 Medium',
  LOW:      '🟢 Low',
};

const STATUS_COLOR = {
  COMPLETED: 'hist-status-done',
  PENDING:   'hist-status-pending',
  FAILED:    'hist-status-failed',
};

// ─── Language display map ────────────────────────────────────────────────────

const LANG_LABEL = {
  javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
  java: 'Java', c: 'C', cpp: 'C++', csharp: 'C#', go: 'Go', rust: 'Rust',
  php: 'PHP', ruby: 'Ruby', swift: 'Swift', kotlin: 'Kotlin',
  sql: 'SQL', html: 'HTML', css: 'CSS', other: 'Other',
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HistoryDrawer({ isOpen, onClose, onReopenReview }) {
  const [reviews, setReviews] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState('');

  // For reopen
  const [reopening, setReopening] = useState(null); // review id being reopened

  // For delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
  const [deleting, setDeleting] = useState(false);

  // Fetch reviews when drawer opens
  useEffect(() => {
    if (!isOpen) return;
    fetchReviews();
  }, [isOpen]);

  async function fetchReviews() {
    setLoadingList(true);
    setListError('');
    try {
      const res = await api.get('/reviews');
      setReviews(res.data.reviews ?? []);
    } catch {
      setListError('Failed to load review history. Please try again.');
    } finally {
      setLoadingList(false);
    }
  }

  // ── Reopen a past review ──────────────────────────────────────────────────
  async function handleReopen(reviewId) {
    setReopening(reviewId);
    try {
      const res = await api.get(`/reviews/${reviewId}`);
      onReopenReview(res.data.review, res.data.findings ?? []);
      onClose();
    } catch {
      alert('Could not load review. It may have been deleted.');
    } finally {
      setReopening(null);
    }
  }

  // ── Delete flow ───────────────────────────────────────────────────────────
  function requestDelete(review) {
    setDeleteTarget({ id: review.id, title: review.title });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/reviews/${deleteTarget.id}`);
      setReviews(prev => prev.filter(r => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      alert('Failed to delete review. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className={`hist-backdrop ${isOpen ? 'hist-backdrop-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Drawer panel ── */}
      <aside className={`hist-drawer ${isOpen ? 'hist-drawer-open' : ''}`} role="dialog" aria-label="Review History">

        {/* Header */}
        <div className="hist-header">
          <div className="hist-header-title">
            <div className="hist-header-icon-wrap">
              <Clock size={16} className="hist-header-icon" />
            </div>
            <div>
              <span className="hist-title-text">Review History</span>
              <span className="hist-count-tag">{reviews.length} saved</span>
            </div>
          </div>
          <div className="hist-header-right">
            <button
              className="hist-refresh-btn"
              onClick={fetchReviews}
              title="Refresh history"
              id="btn-history-refresh"
              aria-label="Refresh reviews"
              type="button"
            >
              <RotateCcw size={14} />
            </button>
            <button
              className="hist-close-btn"
              onClick={onClose}
              title="Close history"
              id="btn-history-close"
              aria-label="Close history drawer"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="hist-body">

          {/* Loading */}
          {loadingList && (
            <div className="hist-center">
              <div className="hist-spinner-wrap">
                <Loader2 size={24} className="hist-spinner" />
              </div>
              <span className="hist-loading-text">Retrieving saved reviews…</span>
            </div>
          )}

          {/* Error */}
          {!loadingList && listError && (
            <div className="hist-error" role="alert">
              <AlertCircle size={16} />
              <span>{listError}</span>
            </div>
          )}

          {/* Empty */}
          {!loadingList && !listError && reviews.length === 0 && (
            <div className="hist-center hist-empty">
              <div className="hist-empty-icon-box">
                <Code2 size={32} className="hist-empty-icon" />
              </div>
              <h4>No reviews recorded</h4>
              <p>Submit your code in the workspace to save and track reviews over time.</p>
            </div>
          )}

          {/* Review list */}
          {!loadingList && !listError && reviews.length > 0 && (
            <ul className="hist-list">
              {reviews.map(review => (
                <li key={review.id} className="hist-item">
                  <div className="hist-item-main">

                    {/* Top row */}
                    <div className="hist-item-top">
                      <span className="hist-lang-pill">
                        {LANG_LABEL[review.language] ?? review.language}
                      </span>
                      {review.overallRisk ? (
                        <span className={`hist-risk-badge ${RISK_COLOR[review.overallRisk]}`}>
                          {RISK_LABEL[review.overallRisk]}
                        </span>
                      ) : (
                        <span className={`hist-status-badge ${STATUS_COLOR[review.status]}`}>
                          {review.status}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <p className="hist-item-title" title={review.title}>
                      {review.title}
                    </p>

                    {/* Date */}
                    <span className="hist-item-date">{formatDate(review.createdAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="hist-item-actions">
                    <button
                      className="hist-action-btn hist-reopen-btn"
                      onClick={() => handleReopen(review.id)}
                      disabled={reopening === review.id}
                      title="Reopen review in workspace"
                      id={`btn-reopen-${review.id.slice(0, 8)}`}
                      aria-label="Reopen review"
                      type="button"
                    >
                      {reopening === review.id
                        ? <Loader2 size={13} className="hist-spinner-inline" />
                        : <RotateCcw size={13} />}
                    </button>
                    <button
                      className="hist-action-btn hist-delete-btn"
                      onClick={() => requestDelete(review)}
                      title="Delete review from history"
                      id={`btn-delete-${review.id.slice(0, 8)}`}
                      aria-label="Delete review"
                      type="button"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.title}
        deleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
