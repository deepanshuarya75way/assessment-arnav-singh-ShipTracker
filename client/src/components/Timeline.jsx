import { useState } from 'react';
import StatusBadge from './StatusBadge';

const STATUS_OPTIONS = ['Pending', 'In Transit', 'Customs', 'Delivered'];
const STATUS_NODE_CLASS = {
  Pending: 'pending',
  'In Transit': 'transit',
  Customs: 'customs',
  Delivered: 'delivered',
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// A single timeline row can be in one of two modes: display, or (for admins)
// inline edit. Keeping edit state per-entry (rather than one shared "which
// entry is being edited" id in the parent) keeps this component self-
// contained - the parent just needs to know WHEN something changed so it
// can refetch.
const TimelineEntry = ({ entry, isLast, isAdmin, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    status: entry.status,
    note: entry.note || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]= useState('');


  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await onUpdate(entry._id, form);
      setEditing(false);
    } catch(err){
      setError(err.respomse?.data?.message || 'Failed to update status entry.');
    }
    finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this status update? This cannot be undone.')) return;
    setError('');
    try {
      await onDelete(entry._id);
    }
    catch(err){
      setError(err.reponse?.data?.message || 'Failed to delete status entry.');
    }
  };

  return (
    <li className="tl-item">
      {!isLast && <span className="tl-line" aria-hidden="true" />}
      <span
        className={`tl-node ${STATUS_NODE_CLASS[entry.status] || 'pending'}`}
        aria-hidden="true"
      />

      <div className="tl-body">
        {editing ? (
          <div className="tl-edit-panel">
            <div className="row">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {error && (
              <p style={{ color:'var(--red)', fontSize: '12.5px', margin: '8px 0'}}>{error}</p>
            )}
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Note (optional)"
            />
            <div className="tl-edit-actions">
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div className="tl-meta">
                <StatusBadge status={entry.status} />
                <span className="tl-time">{formatDateTime(entry.timestamp)}</span>
              </div>
              {entry.note && <p className="tl-note">{entry.note}</p>}
              {error && (
              <p style={{ color:'var(--red)', fontSize: '12.5px', margin: '8px 0'}}>{error}</p>
            )}
            </div>

            {isAdmin && (
              <div className="tl-actions">
                <button onClick={() => {setEditing(true)}} className="btn-secondary">
                  Edit
                </button>
                <button onClick={handleDelete} className="btn-ghost" style={{ color: 'var(--red)' }}>
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
};

// Renders entries oldest-first so the timeline reads top-to-bottom as the
// shipment's actual journey (created -> in transit -> ... -> delivered),
// ending with the current status at the bottom.
const Timeline = ({ history, isAdmin, onUpdate, onDelete }) => {
  const sorted = [...history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <ul className="tl-list">
      {sorted.map((entry, i) => (
        <TimelineEntry
          key={entry._id}
          entry={entry}
          isLast={i === sorted.length - 1}
          isAdmin={isAdmin}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

export default Timeline;
