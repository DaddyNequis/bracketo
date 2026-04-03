import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useBracketStore } from '../Bracket/BracketContext';
import { tsToDatetimeLocal, datetimeLocalToTs } from '../../utils/matchSchedule';

interface ScoreModalProps {
  matchId: string;
  onClose: () => void;
}

export function ScoreModal({ matchId, onClose }: ScoreModalProps) {
  const match = useBracketStore((s) => s.bracket?.matches[matchId]);
  const config = useBracketStore((s) => s.bracket?.config);
  const updateScore = useBracketStore((s) => s.updateScore);
  const addSet = useBracketStore((s) => s.addSet);
  const removeSet = useBracketStore((s) => s.removeSet);
  const resetMatch = useBracketStore((s) => s.resetMatch);
  const setMatchSchedule = useBracketStore((s) => s.setMatchSchedule);

  // Local draft scores — [setIndex][slotIndex]
  const [draft, setDraft] = useState<[number, number][]>([]);
  // Schedule draft
  const [draftLocation, setDraftLocation] = useState('');
  const [draftDatetime, setDraftDatetime] = useState('');
  // Reset confirmation guard
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!match) return;
    const maxSets = config?.maxSetsPerMatch ?? 1;
    // Initialise draft from existing sets, pad to at least 1 set
    const sets = match.sets.length > 0 ? match.sets : [null];
    setDraft(
      sets.map((s): [number, number] =>
        s ? [s.scores[0].score, s.scores[1].score] : [0, 0],
      ).slice(0, maxSets) as [number, number][],
    );
    // Initialise schedule draft
    setDraftLocation(match.location ?? '');
    setDraftDatetime(match.scheduledAt ? tsToDatetimeLocal(match.scheduledAt) : '');
  }, [match, config]);

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!match || !config) return null;

  const maxSets = config.maxSetsPerMatch;
  const p0 = config.participants.find((p) => p.id === match.participantIds[0]);
  const p1 = config.participants.find((p) => p.id === match.participantIds[1]);
  const isCompleted = match.status === 'completed';

  function handleScoreChange(setIdx: number, slot: 0 | 1, value: number) {
    setDraft((prev) => {
      const next = prev.map((s) => [...s] as [number, number]);
      next[setIdx][slot] = Math.max(0, value);
      return next;
    });
  }

  function handleSave() {
    // Save schedule info
    setMatchSchedule(matchId, datetimeLocalToTs(draftDatetime), draftLocation.trim() || undefined);

    // Ensure store has the right number of sets, then apply all scores
    const currentSetCount = match!.sets.length;
    const targetSetCount = draft.length;

    // Add missing sets
    for (let i = currentSetCount; i < targetSetCount; i++) {
      addSet(matchId);
    }
    // Remove extra sets (from the end)
    for (let i = currentSetCount - 1; i >= targetSetCount; i--) {
      removeSet(matchId, i);
    }

    // Apply scores
    draft.forEach(([s0, s1], setIdx) => {
      updateScore(matchId, setIdx, 0, s0);
      updateScore(matchId, setIdx, 1, s1);
    });

    onClose();
  }

  function handleAddSet() {
    if (draft.length >= maxSets) return;
    setDraft((prev) => [...prev, [0, 0]]);
  }

  function handleRemoveSet(setIdx: number) {
    if (draft.length <= 1) return;
    setDraft((prev) => prev.filter((_, i) => i !== setIdx));
  }

  function handleReset() {
    resetMatch(matchId);
    onClose();
  }

  function handleResetRequest() {
    setConfirmReset(true);
  }

  function handleResetCancel() {
    setConfirmReset(false);
  }

  const sectionLabel =
    match.bracketSection === 'grand_final'
      ? 'Grand Final'
      : match.bracketSection === 'losers'
      ? `Losers R${match.round + 1}`
      : `Winners R${match.round + 1}`;

  return createPortal(
    <div className="bracketo-modal-backdrop" onClick={handleClose} onMouseDown={(e) => e.stopPropagation()}>
      <div className="bracketo-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bracketo-modal-header">
          <div>
            <span className="bracketo-modal-section">{sectionLabel}</span>
            <h2 className="bracketo-modal-title">Match Scores</h2>
          </div>
          <button className="bracketo-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Participants header */}
        <div className="bracketo-modal-participants">
          <div className="bracketo-modal-participant">
            {p0 ? (
              <>
                <span className="bracketo-modal-seed">#{p0.seed}</span>
                {p0.flags?.find((f) => f.type === 'country') && (
                  <span>{countryCodeToEmoji(p0.flags.find((f) => f.type === 'country')!.value)}</span>
                )}
                <span className="bracketo-modal-p-name">{p0.name}</span>
              </>
            ) : (
              <span className="bracketo-modal-tbd">TBD</span>
            )}
          </div>
          <span className="bracketo-modal-vs">vs</span>
          <div className="bracketo-modal-participant bracketo-modal-participant--right">
            {p1 ? (
              <>
                <span className="bracketo-modal-p-name">{p1.name}</span>
                {p1.flags?.find((f) => f.type === 'country') && (
                  <span>{countryCodeToEmoji(p1.flags.find((f) => f.type === 'country')!.value)}</span>
                )}
                <span className="bracketo-modal-seed">#{p1.seed}</span>
              </>
            ) : (
              <span className="bracketo-modal-tbd">TBD</span>
            )}
          </div>
        </div>

        {/* Schedule — location & time */}
        <div className="bracketo-modal-schedule">
          <div className="bracketo-modal-schedule-field">
            <label className="bracketo-modal-schedule-label">Location</label>
            <input
              className="bracketo-modal-schedule-input"
              type="text"
              value={draftLocation}
              onChange={(e) => setDraftLocation(e.target.value)}
              placeholder="Court A, Field 3…"
            />
          </div>
          <div className="bracketo-modal-schedule-field">
            <label className="bracketo-modal-schedule-label">Date &amp; Time</label>
            <input
              className="bracketo-modal-schedule-input"
              type="datetime-local"
              value={draftDatetime}
              onChange={(e) => setDraftDatetime(e.target.value)}
            />
          </div>
        </div>

        {/* Sets */}
        <div className="bracketo-modal-sets">
          {draft.map(([s0, s1], setIdx) => {
            const setWinner = s0 > s1 ? 0 : s1 > s0 ? 1 : null;
            return (
              <div key={setIdx} className="bracketo-modal-set">
                <span className="bracketo-modal-set-label">Set {setIdx + 1}</span>
                <div className="bracketo-modal-set-scores">
                  <input
                    className={[
                      'bracketo-modal-score-input',
                      setWinner === 0 ? 'bracketo-modal-score-input--winner' : '',
                    ].filter(Boolean).join(' ')}
                    type="number"
                    min={0}
                    value={s0}
                    disabled={isCompleted}
                    onChange={(e) => handleScoreChange(setIdx, 0, parseInt(e.target.value, 10) || 0)}
                  />
                  <span className="bracketo-modal-set-sep">–</span>
                  <input
                    className={[
                      'bracketo-modal-score-input',
                      setWinner === 1 ? 'bracketo-modal-score-input--winner' : '',
                    ].filter(Boolean).join(' ')}
                    type="number"
                    min={0}
                    value={s1}
                    disabled={isCompleted}
                    onChange={(e) => handleScoreChange(setIdx, 1, parseInt(e.target.value, 10) || 0)}
                  />
                </div>
                {draft.length > 1 && !isCompleted && (
                  <button
                    className="bracketo-modal-remove-set"
                    onClick={() => handleRemoveSet(setIdx)}
                    title="Remove this set"
                    aria-label="Remove this set"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add set */}
        {!isCompleted && draft.length < maxSets && (
          <button className="bracketo-modal-add-set" onClick={handleAddSet}>
            + Add set
          </button>
        )}

        {/* Winner banner */}
        {isCompleted && match.winnerId && (
          <div className="bracketo-modal-winner-banner">
            🏆 Winner: {config.participants.find((p) => p.id === match.winnerId)?.name}
          </div>
        )}

        {/* Actions */}
        {confirmReset ? (
          <div className="bracketo-modal-actions bracketo-modal-actions--confirm">
            <p className="bracketo-modal-confirm-text">
              Clear all scores? This can't be undone.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="bracketo-modal-btn bracketo-modal-btn--cancel" onClick={handleResetCancel}>
                Keep scores
              </button>
              <button className="bracketo-modal-btn bracketo-modal-btn--reset" onClick={handleReset}>
                Yes, reset
              </button>
            </div>
          </div>
        ) : (
          <div className="bracketo-modal-actions">
            <button className="bracketo-modal-btn bracketo-modal-btn--reset" onClick={handleResetRequest}>
              Reset match
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="bracketo-modal-btn bracketo-modal-btn--cancel" onClick={onClose}>
                Cancel
              </button>
              <button className="bracketo-modal-btn bracketo-modal-btn--save" onClick={handleSave}>
                Save scores
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

function countryCodeToEmoji(code: string): string {
  const upper = code.toUpperCase().slice(0, 2);
  if (upper.length < 2) return code;
  const [a, b] = upper;
  return (
    String.fromCodePoint(0x1f1e6 + a.charCodeAt(0) - 65) +
    String.fromCodePoint(0x1f1e6 + b.charCodeAt(0) - 65)
  );
}
