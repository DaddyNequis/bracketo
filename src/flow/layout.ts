import type { Match, ParticipantType } from '../types';

export const MATCH_NODE_WIDTH = 240;

// Header ~27px + (slot × 2) + 1px divider
const SLOT_HEIGHT_DEFAULT = 38; // singles / teams
const SLOT_HEIGHT_COUPLES = 52; // couples — two stacked names

const HEADER_HEIGHT = 27;

export function matchNodeHeight(participantType: ParticipantType): number {
  const slotH = participantType === 'couples' ? SLOT_HEIGHT_COUPLES : SLOT_HEIGHT_DEFAULT;
  return HEADER_HEIGHT + slotH * 2 + 1; // +1 for divider
}

export const ROUND_GAP = 80;
export const MATCH_GAP = 16;
export const LABEL_NODE_HEIGHT = 36;
export const SECTION_GAP = 60;
export const LABEL_OFFSET_Y = -LABEL_NODE_HEIGHT - 8;

export interface NodePosition {
  x: number;
  y: number;
}

/**
 * y position of a match node, centering it between its two feeder matches.
 * In round 0, spacing = nodeHeight + MATCH_GAP.
 * In round r, spacing doubles each round.
 */
export function matchY(
  round: number,
  position: number,
  sectionOffsetY: number,
  nodeHeight: number,
): number {
  const baseSpacing = nodeHeight + MATCH_GAP;
  const spacing = baseSpacing * Math.pow(2, round);
  const firstMatchTop = sectionOffsetY + (spacing - nodeHeight) / 2;
  return firstMatchTop + position * spacing;
}

export function matchX(round: number): number {
  return round * (MATCH_NODE_WIDTH + ROUND_GAP);
}

/** Total height of a bracket section with `bracketSize` initial slots. */
export function sectionHeight(bracketSize: number, nodeHeight: number): number {
  const baseSpacing = nodeHeight + MATCH_GAP;
  return (bracketSize / 2) * baseSpacing - MATCH_GAP;
}

export interface LayoutResult {
  nodePositions: Map<string, NodePosition>;
  totalHeight: number;
}

export function computeLayout(
  matches: Record<string, Match>,
  bracketSize: number,
  participantType: ParticipantType,
): LayoutResult {
  const nodeHeight = matchNodeHeight(participantType);
  const nodePositions = new Map<string, NodePosition>();

  const winnersMatches = Object.values(matches).filter((m) => m.bracketSection === 'winners');
  const losersMatches  = Object.values(matches).filter((m) => m.bracketSection === 'losers');
  const grandFinalMatches = Object.values(matches).filter((m) => m.bracketSection === 'grand_final');

  // Winners bracket — starts at y = 0
  const winnersHeight = sectionHeight(bracketSize, nodeHeight);

  for (const m of winnersMatches) {
    nodePositions.set(m.id, {
      x: matchX(m.round),
      y: matchY(m.round, m.position, 0, nodeHeight),
    });
  }

  // Losers bracket — starts below winners
  const losersSectionY = winnersHeight + SECTION_GAP;
  const losersInitialSlots = Math.max(2, bracketSize / 2);
  const losersHeight = sectionHeight(losersInitialSlots, nodeHeight);

  for (const m of losersMatches) {
    const baseSpacing = nodeHeight + MATCH_GAP;
    const losersSpacing = baseSpacing * Math.pow(2, m.round);
    const firstMatchTop = losersSectionY + (losersSpacing - nodeHeight) / 2;
    nodePositions.set(m.id, {
      x: matchX(m.round),
      y: firstMatchTop + m.position * losersSpacing,
    });
  }

  // Grand final — rightmost column, vertically centered in winners section
  const maxRoundX = Math.max(...Object.values(matches).map((m) => matchX(m.round)), 0);
  const grandFinalX = maxRoundX + MATCH_NODE_WIDTH + ROUND_GAP;
  const grandFinalCenterY = winnersHeight / 2 - nodeHeight / 2;

  for (let i = 0; i < grandFinalMatches.length; i++) {
    nodePositions.set(grandFinalMatches[i].id, {
      x: grandFinalX + i * (MATCH_NODE_WIDTH + ROUND_GAP),
      y: grandFinalCenterY,
    });
  }

  return {
    nodePositions,
    totalHeight: winnersHeight + losersHeight + SECTION_GAP,
  };
}
