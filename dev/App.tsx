import { useState, useMemo } from 'react';
import { Bracket } from '../src/components/Bracket/Bracket';
import type { BracketConfig, Participant, ParticipantType, IndicatorType } from '../src/types';
import './demo.css';

/* ─── helpers ─── */
const COUNTRIES = ['US','DE','BR','FR','ES','JP','KR','AR','IT','NL','PT','MX','AU','CA','GB','CN','NG','ZA','IN','RU'];
const US_STATES = ['CA','TX','NY','FL','IL','PA','OH','GA','NC','MI','NJ','VA','WA','AZ','MA','TN','IN','MO','MD','WI'];

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0f172a,1e293b&radius=50`;
}

const FIRST_NAMES = ['Alex','Jordan','Sam','Taylor','Morgan','Riley','Casey','Jamie','Blake','Drew','Quinn','Avery'];
const LAST_NAMES  = ['Smith','Lee','Park','Chen','Rivera','Kim','Müller','Santos','Rossi','Tanaka','García','Okonkwo'];

function rName(seed: number, offset = 0) {
  return `${FIRST_NAMES[(seed + offset) % FIRST_NAMES.length]} ${LAST_NAMES[(seed * 3 + offset) % LAST_NAMES.length]}`;
}

function makeParticipants(n: number, type: ParticipantType): Participant[] {
  return Array.from({ length: n }, (_, i) => {
    const seed = i + 1;
    const country = COUNTRIES[i % COUNTRIES.length];
    const state0 = US_STATES[i % US_STATES.length];
    const state1 = US_STATES[(i + 7) % US_STATES.length];

    if (type === 'singles') {
      const name = rName(seed);
      return {
        id: `p${seed}`, name, seed,
        members: [{ id: `m${seed}`, name, photoUrl: avatarUrl(`m${seed}`), state: state0 }],
        flags: [{ type: 'country' as const, value: country }],
      };
    }

    if (type === 'couples') {
      const p1 = rName(seed, 0);
      const p2 = rName(seed, 1);
      return {
        id: `p${seed}`, name: `${p1} / ${p2}`, seed,
        members: [
          { id: `m${seed}a`, name: p1, photoUrl: avatarUrl(`m${seed}a`), state: state0 },
          { id: `m${seed}b`, name: p2, photoUrl: avatarUrl(`m${seed}b`), state: state1 },
        ],
        flags: [{ type: 'country' as const, value: country }],
      };
    }

    return {
      id: `p${seed}`, name: `Team ${seed}`, seed,
      members: Array.from({ length: 5 }, (_, j) => ({
        id: `m${seed}_${j}`, name: rName(seed, j),
        photoUrl: avatarUrl(`m${seed}_${j}`),
        state: US_STATES[(i + j) % US_STATES.length],
      })),
      flags: [{ type: 'country' as const, value: country }],
    };
  });
}

/* ─── Settings state ─── */
interface Settings {
  playerCount: number;
  format: 'single_elimination' | 'double_elimination';
  participantType: ParticipantType;
  indicatorType: IndicatorType;
  setsToWin: number;
  maxSetsPerMatch: number;
  thirdPlaceMatch: boolean;
  grandFinalReset: boolean;
  showSeed: boolean;
  showStatus: boolean;
}

const DEFAULTS: Settings = {
  playerCount: 8,
  format: 'single_elimination',
  participantType: 'singles',
  indicatorType: 'flag',
  setsToWin: 1,
  maxSetsPerMatch: 1,
  thirdPlaceMatch: false,
  grandFinalReset: false,
  showSeed: true,
  showStatus: true,
};

/* ─── Toggle component ─── */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="demo-toggle-label" onClick={() => onChange(!checked)}>
      <div
        className={['demo-toggle-track', checked ? 'demo-toggle-track--on' : ''].filter(Boolean).join(' ')}
      >
        <div className={['demo-toggle-thumb', checked ? 'demo-toggle-thumb--on' : ''].filter(Boolean).join(' ')} />
      </div>
      <span className={['demo-toggle-text', checked ? 'demo-toggle-text--on' : ''].filter(Boolean).join(' ')}>
        {label}
      </span>
    </label>
  );
}

/* ─── App ─── */
export default function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [bracketKey, setBracketKey] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function applySettings() {
    setWinner(null);
    setBracketKey((k) => k + 1);
  }

  const config = useMemo<BracketConfig>(() => ({
    format: settings.format,
    participantType: settings.participantType,
    indicatorType: settings.indicatorType,
    showSeed: settings.showSeed,
    showStatus: settings.showStatus,
    participants: makeParticipants(settings.playerCount, settings.participantType),
    setsToWin: settings.setsToWin,
    maxSetsPerMatch: settings.maxSetsPerMatch,
    allowTies: false,
    thirdPlaceMatch: settings.format === 'single_elimination' ? settings.thirdPlaceMatch : false,
    grandFinalReset: settings.format === 'double_elimination' ? settings.grandFinalReset : false,
  }), [settings]);

  const winnerParticipant = winner ? config.participants.find((p) => p.id === winner) : null;

  return (
    <div className="demo-root">

      {/* ── Header ── */}
      <header className="demo-header">
        <span className="demo-logo">⚡ Bracketo</span>
        <span className="demo-subtitle">Tournament bracket demo</span>
        {winnerParticipant && (
          <div className="demo-winner-banner">🏆 {winnerParticipant.name} wins!</div>
        )}
      </header>

      <div className="demo-layout">

        {/* ── Sidebar ── */}
        <aside className="demo-sidebar">

          {/* Quick start */}
          <div className="demo-section demo-section--quick-start">
            <span className="demo-section-title demo-section-title--accent">Quick start</span>
            <div className="demo-preset-list">
              {([
                { emoji: '⚽', label: 'Soccer',           sub: '8 teams · Single elim',      s: { playerCount: 8,  format: 'single_elimination', participantType: 'teams',   indicatorType: 'flag',  setsToWin: 1, maxSetsPerMatch: 1, thirdPlaceMatch: true,  grandFinalReset: false, showSeed: false, showStatus: true } },
                { emoji: '🎾', label: 'Tennis singles',   sub: '8 players · Best of 5',      s: { playerCount: 8,  format: 'single_elimination', participantType: 'singles', indicatorType: 'flag',  setsToWin: 2, maxSetsPerMatch: 5, thirdPlaceMatch: false, grandFinalReset: false, showSeed: true,  showStatus: true } },
                { emoji: '🏸', label: 'Badminton doubles', sub: '8 pairs · Best of 3',       s: { playerCount: 8,  format: 'single_elimination', participantType: 'couples', indicatorType: 'photo', setsToWin: 2, maxSetsPerMatch: 3, thirdPlaceMatch: false, grandFinalReset: false, showSeed: true,  showStatus: true } },
                { emoji: '🕹️', label: 'FGC Double Elim',  sub: '8 players · Losers bracket', s: { playerCount: 8,  format: 'double_elimination', participantType: 'singles', indicatorType: 'flag',  setsToWin: 2, maxSetsPerMatch: 3, thirdPlaceMatch: false, grandFinalReset: true,  showSeed: true,  showStatus: true } },
                { emoji: '🏆', label: 'Big bracket',      sub: '16 teams · Single elim',     s: { playerCount: 16, format: 'single_elimination', participantType: 'teams',   indicatorType: 'flag',  setsToWin: 1, maxSetsPerMatch: 1, thirdPlaceMatch: false, grandFinalReset: false, showSeed: false, showStatus: true } },
              ] as { emoji: string; label: string; sub: string; s: Settings }[]).map(({ emoji, label, sub, s }) => (
                <button
                  key={label}
                  className="demo-preset-btn"
                  onClick={() => { setSettings(s); setWinner(null); setBracketKey((k) => k + 1); }}
                >
                  <span className="demo-preset-emoji">{emoji}</span>
                  <span className="demo-preset-info">
                    <span className="demo-preset-name">{label}</span>
                    <span className="demo-preset-sub">{sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="demo-divider" />

          {/* Tournament */}
          <div className="demo-section">
            <span className="demo-section-title">Tournament</span>

            <div>
              <span className="demo-field-label">Format</span>
              <select
                className="demo-select"
                value={settings.format}
                onChange={(e) => set('format', e.target.value as Settings['format'])}
              >
                <option value="single_elimination">Single Elimination</option>
                <option value="double_elimination">Double Elimination</option>
              </select>
            </div>

            <div>
              <span className="demo-field-label">Bracket type</span>
              <div className="demo-radio-group">
                {([
                  { value: 'singles', label: 'Singles',           sub: 'One player per slot' },
                  { value: 'couples', label: 'Couples / Doubles', sub: 'Two players per slot' },
                  { value: 'teams',   label: 'Teams',             sub: 'Team name per slot' },
                ] as { value: ParticipantType; label: string; sub: string }[]).map(({ value, label, sub }) => (
                  <button
                    key={value}
                    className={['demo-radio-btn', settings.participantType === value ? 'demo-radio-btn--active' : ''].filter(Boolean).join(' ')}
                    onClick={() => set('participantType', value)}
                  >
                    <span className="demo-radio-btn-label">{label}</span>
                    <span className="demo-radio-btn-sub">{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="demo-field-label">Players / Teams</span>
              <div className="demo-range-row">
                <input
                  type="range"
                  className="demo-range"
                  min={2} max={32} step={1}
                  value={settings.playerCount}
                  onChange={(e) => set('playerCount', Number(e.target.value))}
                />
                <span className="demo-range-value">{settings.playerCount}</span>
              </div>
            </div>
          </div>

          <div className="demo-divider" />

          {/* Display */}
          <div className="demo-section">
            <span className="demo-section-title">Display</span>

            <div>
              <span className="demo-field-label">Player indicator</span>
              <div className="demo-radio-group">
                {([
                  { value: 'flag',        label: 'Flag',          sub: 'Country flag per slot' },
                  { value: 'photo',       label: 'Photos',        sub: 'Member avatars side-by-side' },
                  { value: 'state',       label: 'State',         sub: 'Region badge before name' },
                  { value: 'photo_state', label: 'Photo + State', sub: 'Avatars and region badge' },
                ] as { value: IndicatorType; label: string; sub: string }[]).map(({ value, label, sub }) => (
                  <button
                    key={value}
                    className={['demo-radio-btn', settings.indicatorType === value ? 'demo-radio-btn--active' : ''].filter(Boolean).join(' ')}
                    onClick={() => set('indicatorType', value)}
                  >
                    <span className="demo-radio-btn-label">{label}</span>
                    <span className="demo-radio-btn-sub">{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="demo-toggle-group">
              <Toggle checked={settings.showSeed}   onChange={(v) => set('showSeed', v)}   label="Show seed number" />
              <Toggle checked={settings.showStatus} onChange={(v) => set('showStatus', v)} label="Show match status" />
            </div>
          </div>

          <div className="demo-divider" />

          {/* Scoring */}
          <div className="demo-section demo-section--scoring">
            <span className="demo-section-title">Scoring</span>

            <div>
              <span className="demo-field-label">Sets to win</span>
              <div className="demo-segmented">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    className={['demo-segmented-btn demo-segmented-btn--lg', settings.setsToWin === n ? 'demo-segmented-btn--active' : ''].filter(Boolean).join(' ')}
                    onClick={() => set('setsToWin', n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="demo-hint">Best of {settings.setsToWin * 2 - 1}</p>
            </div>

            <div>
              <span className="demo-field-label">Max sets per match</span>
              <div className="demo-segmented">
                {[1, 3, 5, 7].map((n) => (
                  <button
                    key={n}
                    className={['demo-segmented-btn demo-segmented-btn--sm', settings.maxSetsPerMatch === n ? 'demo-segmented-btn--active' : ''].filter(Boolean).join(' ')}
                    onClick={() => set('maxSetsPerMatch', Math.max(n, settings.setsToWin * 2 - 1))}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="demo-hint">Soccer: 1 · Tennis: 5–7</p>
            </div>

            <div className="demo-toggle-group">
              {settings.format === 'single_elimination' && (
                <Toggle checked={settings.thirdPlaceMatch} onChange={(v) => set('thirdPlaceMatch', v)} label="3rd place match" />
              )}
              {settings.format === 'double_elimination' && (
                <Toggle checked={settings.grandFinalReset} onChange={(v) => set('grandFinalReset', v)} label="Grand final reset" />
              )}
            </div>
          </div>

          {/* Generate */}
          <button className="demo-generate-btn" onClick={applySettings}>
            Generate bracket
          </button>

          <div className="demo-callout">
            <strong>To enter scores:</strong>
            Click <strong>Edit</strong> in the bracket toolbar, then tap ✏️ on any match.
          </div>

        </aside>

        {/* ── Bracket ── */}
        <main className="demo-main">
          <Bracket
            key={bracketKey}
            config={config}
            height="100%"
            width="100%"
            showMiniMap={false}
            showControls
            showExportButton
            onWinnerChange={setWinner}
          />
        </main>
      </div>
    </div>
  );
}
