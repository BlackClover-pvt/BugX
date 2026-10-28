import { useEffect } from 'react';
import { Trash2, X, Loader2 } from 'lucide-react';
import './DeleteConfirmModal.css';

export default function DeleteConfirmModal({ isOpen, title, deleting, onCancel, onConfirm }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape' && !deleting) onCancel();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, deleting, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="dcm-backdrop" onClick={!deleting ? onCancel : undefined} aria-hidden="true" />

      {/* Modal */}
      <div className="dcm-modal" role="alertdialog" aria-modal="true" aria-labelledby="dcm-title">
        {/* Header */}
        <div className="dcm-header">
          <div className="dcm-icon-wrap">
            <Trash2 size={20} className="dcm-icon" />
          </div>
          <div className="dcm-header-text">
            <h3 id="dcm-title" className="dcm-title">Delete Review</h3>
            <p className="dcm-subtitle">This action cannot be undone.</p>
          </div>
          {!deleting && (
            <button className="dcm-close-btn" onClick={onCancel} title="Cancel" id="btn-delete-cancel-x">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="dcm-body">
          <p className="dcm-description">
            Are you sure you want to delete{' '}
            <span className="dcm-review-title">&ldquo;{title}&rdquo;</span>?
          </p>
          <p className="dcm-warning">
            All associated findings will be permanently removed from the database.
          </p>
        </div>

        {/* Actions */}
        <div className="dcm-actions">
          <button
            className="dcm-btn dcm-btn-cancel"
            onClick={onCancel}
            disabled={deleting}
            id="btn-delete-cancel"
          >
            Cancel
          </button>
          <button
            className="dcm-btn dcm-btn-delete"
            onClick={onConfirm}
            disabled={deleting}
            id="btn-delete-confirm"
          >
            {deleting ? (
              <>
                <Loader2 size={14} className="dcm-spinner" />
                <span>Deleting…</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Yes, Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
