import type { Edge } from '@xyflow/react';
import type { Bracket } from '../types';

export function buildEdges(bracket: Bracket, highlightedEdgeIds: Set<string>): Edge[] {
  const edges: Edge[] = [];

  for (const match of Object.values(bracket.matches)) {
    if (match.winnerGoesTo) {
      const edgeId = `${match.id}->${match.winnerGoesTo.matchId}`;
      const isHighlighted = highlightedEdgeIds.has(edgeId);
      edges.push({
        id: edgeId,
        source: match.id,
        target: match.winnerGoesTo.matchId,
        sourceHandle: 'winner-out',
        targetHandle: `slot-${match.winnerGoesTo.slot}-in`,
        type: 'smoothstep',
        animated: isHighlighted,
        style: {
          stroke: isHighlighted ? 'var(--bracketo-highlight, #f59e0b)' : 'var(--bracketo-edge, #94a3b8)',
          strokeWidth: isHighlighted ? 3 : 2,
        },
      });
    }
  }

  return edges;
}
