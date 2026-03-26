import type { Node } from '@xyflow/react';
import type { Bracket } from '../types';
import type { MatchNodeData, LabelNodeData } from '../types/flow';
import { computeLayout, matchX, LABEL_OFFSET_Y, MATCH_NODE_WIDTH, LABEL_NODE_HEIGHT } from './layout';
import { nextPowerOf2 } from '../utils/math';

function getRoundLabel(round: number, totalRounds: number, section: string): string {
  if (section === 'grand_final') return 'Grand Final';
  const remaining = totalRounds - round;
  if (remaining === 1) return 'Final';
  if (remaining === 2) return 'Semi-Finals';
  if (remaining === 3) return 'Quarter-Finals';
  return `Round ${round + 1}`;
}

export function buildNodes(
  bracket: Bracket,
  highlightedMatchIds: Set<string>,
): Node[] {
  const matches = bracket.matches;
  const n = bracket.config.participants.length;
  const bracketSize = nextPowerOf2(n);

  const participantType = bracket.config.participantType;
  const { nodePositions } = computeLayout(matches, bracketSize, participantType);

  const winnerRounds = Math.log2(bracketSize);
  const nodes: Node[] = [];
  const seenRoundLabels = new Set<string>();

  for (const match of Object.values(matches)) {
    const pos = nodePositions.get(match.id);
    if (!pos) continue;

    const [id0, id1] = match.participantIds;
    const p0 = id0 ? bracket.config.participants.find((p) => p.id === id0) ?? null : null;
    const p1 = id1 ? bracket.config.participants.find((p) => p.id === id1) ?? null : null;

    // Build per-slot scores from sets
    const scores0 = match.sets.map((s) => s.scores[0].score);
    const scores1 = match.sets.map((s) => s.scores[1].score);

    const data: MatchNodeData = {
      matchId: match.id,
      round: match.round,
      position: match.position,
      bracketSection: match.bracketSection,
      slots: [
        {
          participant: p0,
          isBye: match.status === 'bye' && p0 === null,
          isWinner: match.winnerId === id0,
          scores: scores0,
        },
        {
          participant: p1,
          isBye: match.status === 'bye' && p1 === null,
          isWinner: match.winnerId === id1,
          scores: scores1,
        },
      ],
      sets: match.sets,
      status: match.status,
      isHighlighted: highlightedMatchIds.has(match.id),
    };

    nodes.push({
      id: match.id,
      type: 'matchNode',
      position: pos,
      data,
      draggable: true,
      selectable: false,
    });

    // Round label node (one per round per section)
    const labelKey = `${match.bracketSection}-r${match.round}`;
    if (!seenRoundLabels.has(labelKey) && match.position === 0) {
      seenRoundLabels.add(labelKey);
      const labelData: LabelNodeData = {
        label: getRoundLabel(match.round, winnerRounds, match.bracketSection),
        bracketSection: match.bracketSection,
      };
      nodes.push({
        id: `label-${labelKey}`,
        type: 'labelNode',
        position: {
          x: matchX(match.round) + MATCH_NODE_WIDTH / 2 - 60,
          y: pos.y + LABEL_OFFSET_Y,
        },
        data: labelData,
        draggable: false,
        selectable: false,
        style: { width: 120, height: LABEL_NODE_HEIGHT },
      });
    }
  }

  return nodes;
}
