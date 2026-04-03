import './styles/bracketo.css';

export { Bracket } from './components/Bracket/Bracket';
export type { BracketProps, BracketTheme } from './components/Bracket/Bracket';
export { BracketProvider, useBracketStore } from './components/Bracket/BracketContext';

export { useBracket } from './hooks/useBracket';
export { usePdfExport } from './hooks/usePdfExport';

export { createBracket, createBracketStore } from './store/bracketStore';
export type { BracketStore, BracketState, BracketActions } from './store/bracketStore';

export type {
  TeamMember,
  ParticipantFlag,
  Participant,
  SetScore,
  MatchSet,
  MatchStatus,
  BracketSection,
  MatchRef,
  Match,
  BracketFormat,
  ParticipantType,
  IndicatorType,
  BracketConfig,
} from './types';

// Export Bracket type with a different name to avoid conflict with the component
export type { Bracket as BracketData } from './types';

export type {
  SlotData,
  MatchNodeData,
  ByeNodeData,
  LabelNodeData,
} from './types';
