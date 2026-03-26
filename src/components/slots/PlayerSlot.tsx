import type { SlotData } from '../../types/flow';
import { FlagIndicator } from './FlagIndicator';
import { ScoreInput } from './ScoreInput';

interface PlayerSlotProps {
  slot: SlotData;
  slotIndex: 0 | 1;
  matchId: string;
  maxSets: number;
  disabled?: boolean;
  onScoreChange: (matchId: string, setIndex: number, slot: 0 | 1, score: number) => void;
  onNameClick?: (participantId: string) => void;
}

export function PlayerSlot({
  slot,
  slotIndex,
  matchId,
  maxSets,
  disabled,
  onScoreChange,
  onNameClick,
}: PlayerSlotProps) {
  const isEmpty = !slot.participant && !slot.isBye;

  return (
    <div
      className={[
        'bracketo-slot',
        slot.isWinner ? 'bracketo-slot--winner' : '',
        isEmpty ? 'bracketo-slot--empty' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="bracketo-slot-identity">
        <FlagIndicator
          seed={slot.participant?.seed}
          flags={slot.participant?.flags}
        />
        <span
          className="bracketo-slot-name"
          title={slot.participant?.name}
          onClick={() => {
            if (slot.participant && onNameClick) onNameClick(slot.participant.id);
          }}
          style={{ cursor: slot.participant && onNameClick ? 'pointer' : 'default' }}
        >
          {slot.participant?.name ?? (slot.isBye ? 'BYE' : 'TBD')}
        </span>
      </div>
      <div className="bracketo-slot-scores">
        {Array.from({ length: maxSets }).map((_, setIdx) => (
          <ScoreInput
            key={setIdx}
            value={slot.scores[setIdx] ?? 0}
            disabled={disabled || !slot.participant || isEmpty}
            onChange={(v) => onScoreChange(matchId, setIdx, slotIndex, v)}
          />
        ))}
      </div>
    </div>
  );
}
