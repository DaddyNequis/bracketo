import { useState, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MatchNodeData } from '../../../types/flow';
import type { ParticipantType, IndicatorType } from '../../../types';
import { useBracketStore, useReadOnly } from '../../Bracket/BracketContext';
import { ScoreModal } from '../../ui/ScoreModal';
import { MATCH_NODE_WIDTH, matchNodeHeight } from '../../../flow/layout';
import { deriveDisplayStatus, formatScheduleTime } from '../../../utils/matchSchedule';

// pointerEvents:none on SVGs ensures the <button> is always event.target,
// making ReactFlow's nodrag class lookup reliable.
function PencilIcon() {
  return (
    <svg style={{ pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg style={{ pointerEvents: 'none' }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

interface SlotRowProps {
  slot: MatchNodeData['slots'][0];
  participantType: ParticipantType;
  indicatorType: IndicatorType;
  showSeed: boolean;
  isWinner: boolean;
  isEmpty: boolean;
  isBye: boolean;
  scores: number[];
  onNameClick?: () => void;
}

function SlotRow({ slot, participantType, indicatorType, showSeed, isWinner, isEmpty, isBye, scores, onNameClick }: SlotRowProps) {
  const p = slot.participant;
  const showScores = scores.length > 0 && scores.some((s) => s > 0) && !isEmpty && !isBye;

  // Resolve flag emoji from country code
  const flagEmoji = (() => {
    if (indicatorType !== 'flag') return undefined;
    const cf = p?.flags?.find((f) => f.type === 'country');
    if (!cf) return undefined;
    const code = cf.value.toUpperCase().slice(0, 2);
    if (code.length < 2) return undefined;
    return (
      String.fromCodePoint(0x1f1e6 + code.charCodeAt(0) - 65) +
      String.fromCodePoint(0x1f1e6 + code.charCodeAt(1) - 65)
    );
  })();

  const member0 = p?.members?.[0];
  const member1 = p?.members?.[1];

  // ── Photo indicator: avatars side-by-side ──────────────────────────────
  const PhotoAvatars = () => {
    if (!p || isBye || isEmpty) return null;
    const members = participantType === 'singles' ? [member0] : [member0, member1].filter(Boolean);
    return (
      <div className="bn-member-photos">
        {members.map((m) =>
          m?.photoUrl ? (
            <img key={m.id} src={m.photoUrl} alt={m.name} className="bn-member-photo" />
          ) : (
            <div key={m?.id ?? 'ph'} className="bn-member-photo bn-member-photo--placeholder">
              {(m?.name ?? '?')[0].toUpperCase()}
            </div>
          )
        )}
      </div>
    );
  };

  // ── State badge: text before each name ────────────────────────────────
  const StateBadge = ({ member }: { member: typeof member0 }) => {
    if (!member?.state) return null;
    return <span className="bn-state-badge">{member.state}</span>;
  };

  return (
    <div
      className={[
        'bn-slot',
        isWinner ? 'bn-slot--winner' : '',
        isEmpty ? 'bn-slot--empty' : '',
        participantType === 'couples' ? 'bn-slot--couples' : '',
      ].filter(Boolean).join(' ')}
    >
      {/* Identity block */}
      <div
        className={`bn-slot-identity${onNameClick ? ' nopan nodrag' : ''}`}
        onClick={onNameClick}
        onPointerDown={
          onNameClick
            ? (e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }
            : undefined
        }
        style={{ cursor: onNameClick ? 'pointer' : 'default' }}
      >
        {/* Seed badge — conditionally shown */}
        {showSeed && p && !isBye && !isEmpty && (
          <span className="bn-seed">{p.seed}</span>
        )}

        {/* Photo indicator (also shown for photo_state) */}
        {(indicatorType === 'photo' || indicatorType === 'photo_state') && <PhotoAvatars />}

        {/* Flag indicator: one emoji for the slot (not shown for teams separately below) */}
        {indicatorType === 'flag' && flagEmoji && participantType !== 'teams' && (
          <span className="bn-flag">{flagEmoji}</span>
        )}

        {/* Name area — varies by participantType */}
        {participantType === 'couples' && p && member0 ? (
          // Two stacked player names, optionally with inline state badges
          <div className="bn-couples-names">
            <span className="bn-couple-name">
              {indicatorType === 'state' && <StateBadge member={member0} />}
              {member0.name}
            </span>
            <span className="bn-couple-sep" />
            <span className="bn-couple-name">
              {indicatorType === 'state' && member1 && <StateBadge member={member1} />}
              {member1?.name ?? '—'}
            </span>
          </div>
        ) : participantType === 'teams' && p ? (
          // Team name: flag (if flag mode) inline, no state/photo per-member
          <div className="bn-team-identity">
            {indicatorType === 'flag' && flagEmoji && <span className="bn-flag">{flagEmoji}</span>}
            <span className="bn-name" title={p.name}>{p.name}</span>
          </div>
        ) : (
          // Singles or fallback
          <span className="bn-name" title={p?.name}>
            {indicatorType === 'state' && member0 && p && <StateBadge member={member0} />}
            {p?.name ?? (isBye ? 'BYE' : 'TBD')}
          </span>
        )}

        {/* photo_state: state badge pinned to the right end of the identity row */}
        {indicatorType === 'photo_state' && p && !isBye && !isEmpty && member0?.state && (
          <span className="bn-state-badge bn-state-badge--right">{member0.state}</span>
        )}

        {isWinner && (
          <span className="bn-winner-check">
            <CheckIcon />
          </span>
        )}
      </div>

      {/* Score pills */}
      {showScores && (
        <div className="bn-scores">
          {scores.map((sc, i) => (
            <span
              key={i}
              className={['bn-score', isWinner ? 'bn-score--winner' : ''].filter(Boolean).join(' ')}
            >
              {sc}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function MatchNode({ data }: NodeProps) {
  const nodeData = data as MatchNodeData;
  const { matchId, slots, status, isHighlighted } = nodeData;

  const [readOnly] = useReadOnly();
  const [modalOpen, setModalOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Re-derive time-based status every 30 s
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const setHighlightPath = useBracketStore((s) => s.setHighlightPath);
  const participantType = useBracketStore((s) => s.bracket?.config.participantType ?? 'singles');
  const showSeed = useBracketStore((s) => s.bracket?.config.showSeed ?? true);
  const showStatus = useBracketStore((s) => s.bracket?.config.showStatus ?? true);
  const indicatorType = useBracketStore((s) => s.bracket?.config.indicatorType ?? 'flag');
  const match = useBracketStore((s) => s.bracket?.matches[matchId]);

  const isBye = status === 'bye';
  const isCompleted = status === 'completed';
  const canEdit = !readOnly && !isBye;

  const p0 = slots[0].participant;
  const p1 = slots[1].participant;

  // Time-based display status
  const displayStatus = match ? deriveDisplayStatus(match, now) : null;
  const scheduleInfo = match?.scheduledAt
    ? [match.location, formatScheduleTime(match.scheduledAt, now)].filter(Boolean).join(' · ')
    : match?.location || null;

  return (
    <>
      <div
        className={[
          'bn',
          isHighlighted ? 'bn--highlighted' : '',
          isCompleted ? 'bn--completed' : '',
          isBye ? 'bn--bye' : '',
          participantType === 'couples' ? 'bn--couples' : '',
        ].filter(Boolean).join(' ')}
        style={{ width: MATCH_NODE_WIDTH, minHeight: matchNodeHeight(participantType) }}
      >
        {/* ReactFlow handles */}
        <Handle type="target" position={Position.Left} id="slot-0-in"
          className="bn-handle" style={{ top: '33%' }} />
        <Handle type="target" position={Position.Left} id="slot-1-in"
          className="bn-handle" style={{ top: '67%' }} />
        <Handle type="source" position={Position.Right} id="winner-out"
          className="bn-handle" style={{ top: '50%' }} />

        {/* Header */}
        <div className="bn-header">
          {showStatus && displayStatus && (
            <span className={`bn-header-status bn-header-status--${displayStatus.variant}`}>
              <span className="bn-status-dot" />
              {displayStatus.label}
            </span>
          )}
          {/* Schedule fills remaining space; expands to full width when status is hidden */}
          {scheduleInfo && (
            <span className="bn-header-schedule">{scheduleInfo}</span>
          )}
          {canEdit && (
            <button
              className="bn-edit-btn nopan nodrag"
              onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
              onPointerDown={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
              title="Edit match"
            >
              <PencilIcon />
            </button>
          )}
        </div>

        {/* Slot 0 */}
        <SlotRow
          slot={slots[0]}
          participantType={participantType}
          indicatorType={indicatorType}
          showSeed={showSeed}
          isWinner={slots[0].isWinner}
          isEmpty={!p0 && !slots[0].isBye}
          isBye={slots[0].isBye}
          scores={slots[0].scores}
          onNameClick={p0 ? () => setHighlightPath(p0.id) : undefined}
        />

        <div className="bn-divider" />

        <SlotRow
          slot={slots[1]}
          participantType={participantType}
          indicatorType={indicatorType}
          showSeed={showSeed}
          isWinner={slots[1].isWinner}
          isEmpty={!p1 && !slots[1].isBye}
          isBye={slots[1].isBye}
          scores={slots[1].scores}
          onNameClick={p1 ? () => setHighlightPath(p1.id) : undefined}
        />
      </div>

      {modalOpen && <ScoreModal matchId={matchId} onClose={() => setModalOpen(false)} />}
    </>
  );
}
