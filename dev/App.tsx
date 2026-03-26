import { useState, useMemo } from 'react';
import { Bracket } from '../src/components/Bracket/Bracket';
import type { BracketConfig, Participant, ParticipantType, IndicatorType } from '../src/types';

/* ─── helpers ─── */
const COUNTRIES = ['US','DE','BR','FR','ES','JP','KR','AR','IT','NL','PT','MX','AU','CA','GB','CN','NG','ZA','IN','RU'];
const US_STATES = ['CA','TX','NY','FL','IL','PA','OH','GA','NC','MI','NJ','VA','WA','AZ','MA','TN','IN','MO','MD','WI'];
// Placeholder avatars via DiceBear (deterministic, no external deps required)
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
        id: `p${seed}`,
        name,
        seed,
        members: [{ id: `m${seed}`, name, photoUrl: avatarUrl(`m${seed}`), state: state0 }],
        flags: [{ type: 'country' as const, value: country }],
      };
    }

    if (type === 'couples') {
      const p1 = rName(seed, 0);
      const p2 = rName(seed, 1);
      return {
        id: `p${seed}`,
        name: `${p1} / ${p2}`,
        seed,
        members: [
          { id: `m${seed}a`, name: p1, photoUrl: avatarUrl(`m${seed}a`), state: state0 },
          { id: `m${seed}b`, name: p2, photoUrl: avatarUrl(`m${seed}b`), state: state1 },
        ],
        flags: [{ type: 'country' as const, value: country }],
      };
    }

    // teams
    return {
      id: `p${seed}`,
      name: `Team ${seed}`,
      seed,
      members: Array.from({ length: 5 }, (_, j) => ({ id: `m${seed}_${j}`, name: rName(seed, j), photoUrl: avatarUrl(`m${seed}_${j}`), state: US_STATES[(i + j) % US_STATES.length] })),
      flags: [{ type: 'country' as const, value: country }],
    };
  });
}

/* ─── settings state ─── */
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

/* ─── small UI atoms ─── */
const S = {
  label: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#64748b', marginBottom: 5, display: 'block' },
  input: { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 7, color: '#e2e8f0', padding: '7px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none' },
  select: { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 7, color: '#e2e8f0', padding: '7px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' },
};

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, borderRadius: 10, position: 'relative', flexShrink: 0, cursor: 'pointer',
          background: checked ? '#3b82f6' : '#334155', transition: 'background 0.2s',
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: checked ? 18 : 3, width: 14, height: 14,
          background: '#fff', borderRadius: '50%', transition: 'left 0.2s',
        }} />
      </div>
      <span style={{ fontSize: 13, color: checked ? '#e2e8f0' : '#64748b' }}>{label}</span>
    </label>
  );
}

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

  const winnerParticipant = winner
    ? config.participants.find((p) => p.id === winner)
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Page header ── */}
      <div style={{ borderBottom: '1px solid #1e293b', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>⚡ Bracketo</div>
        <div style={{ fontSize: 13, color: '#475569' }}>Tournament bracket demo</div>
        {winnerParticipant && (
          <div style={{ marginLeft: 'auto', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>
            🏆 {winnerParticipant.name} wins!
          </div>
        )}
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 57px)' }}>

        {/* ── Settings sidebar ── */}
        <aside style={{ width: 260, flexShrink: 0, background: '#0f172a', borderRight: '1px solid #1e293b', padding: '20px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Settings
          </div>

          {/* Players */}
          <div>
            <span style={S.label}>Players / Teams</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="range"
                min={2} max={32} step={1}
                value={settings.playerCount}
                onChange={(e) => set('playerCount', Number(e.target.value))}
                style={{ flex: 1, accentColor: '#3b82f6' }}
              />
              <span style={{ minWidth: 24, textAlign: 'right', fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>
                {settings.playerCount}
              </span>
            </div>
          </div>

          {/* Format */}
          <div>
            <span style={S.label}>Format</span>
            <select
              style={S.select}
              value={settings.format}
              onChange={(e) => set('format', e.target.value as Settings['format'])}
            >
              <option value="single_elimination">Single Elimination</option>
              <option value="double_elimination">Double Elimination</option>
            </select>
          </div>

          {/* Participant type */}
          <div>
            <span style={S.label}>Bracket type</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {([
                { value: 'singles', label: 'Singles', sub: 'One player per slot' },
                { value: 'couples', label: 'Couples / Doubles', sub: 'Two players per slot' },
                { value: 'teams',   label: 'Teams', sub: 'Team name per slot' },
              ] as { value: ParticipantType; label: string; sub: string }[]).map(({ value, label, sub }) => (
                <button
                  key={value}
                  onClick={() => set('participantType', value)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    padding: '8px 10px', borderRadius: 8, border: '1px solid', textAlign: 'left',
                    borderColor: settings.participantType === value ? '#3b82f6' : '#334155',
                    background: settings.participantType === value ? 'rgba(59,130,246,0.12)' : 'transparent',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: settings.participantType === value ? '#93c5fd' : '#94a3b8' }}>{label}</span>
                  <span style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>{sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Indicator type */}
          <div>
            <span style={S.label}>Indicator</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {([
                { value: 'flag',        label: 'Flag',         sub: 'Country flag per slot' },
                { value: 'photo',       label: 'Photos',       sub: 'Member avatars side-by-side' },
                { value: 'state',       label: 'State',        sub: 'Region badge before name' },
                { value: 'photo_state', label: 'Photo + State', sub: 'Avatars and region badge' },
              ] as { value: IndicatorType; label: string; sub: string }[]).map(({ value, label, sub }) => (
                <button
                  key={value}
                  onClick={() => set('indicatorType', value)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    padding: '8px 10px', borderRadius: 8, border: '1px solid', textAlign: 'left',
                    borderColor: settings.indicatorType === value ? '#3b82f6' : '#334155',
                    background: settings.indicatorType === value ? 'rgba(59,130,246,0.12)' : 'transparent',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: settings.indicatorType === value ? '#93c5fd' : '#94a3b8' }}>{label}</span>
                  <span style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>{sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sets to win */}
          <div>
            <span style={S.label}>Sets to win</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => set('setsToWin', n)}
                  style={{
                    flex: 1, padding: '7px 0', borderRadius: 7, border: '1px solid',
                    borderColor: settings.setsToWin === n ? '#3b82f6' : '#334155',
                    background: settings.setsToWin === n ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: settings.setsToWin === n ? '#93c5fd' : '#64748b',
                    cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
              Best of {settings.setsToWin * 2 - 1}
            </div>
          </div>

          {/* Max sets per match */}
          <div>
            <span style={S.label}>Max sets per match</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 3, 5, 7].map((n) => (
                <button
                  key={n}
                  onClick={() => set('maxSetsPerMatch', Math.max(n, settings.setsToWin * 2 - 1))}
                  style={{
                    flex: 1, padding: '7px 0', borderRadius: 7, border: '1px solid',
                    borderColor: settings.maxSetsPerMatch === n ? '#3b82f6' : '#334155',
                    background: settings.maxSetsPerMatch === n ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: settings.maxSetsPerMatch === n ? '#93c5fd' : '#64748b',
                    cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
              Soccer: 1 · Tennis: 5–7
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Toggle
              checked={settings.showSeed}
              onChange={(v) => set('showSeed', v)}
              label="Show seed / order number"
            />
            <Toggle
              checked={settings.showStatus}
              onChange={(v) => set('showStatus', v)}
              label="Show match status"
            />
            {settings.format === 'single_elimination' && (
              <Toggle
                checked={settings.thirdPlaceMatch}
                onChange={(v) => set('thirdPlaceMatch', v)}
                label="3rd place match"
              />
            )}
            {settings.format === 'double_elimination' && (
              <Toggle
                checked={settings.grandFinalReset}
                onChange={(v) => set('grandFinalReset', v)}
                label="Grand final reset"
              />
            )}
          </div>

          {/* Apply */}
          <button
            onClick={applySettings}
            style={{
              background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8,
              padding: '10px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              width: '100%', fontFamily: 'inherit', transition: 'background 0.15s', marginTop: 4,
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#2563eb')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#3b82f6')}
          >
            Generate bracket
          </button>

          {/* Quick presets */}
          <div>
            <span style={S.label}>Quick presets</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {([
                { label: 'Soccer (8 teams)',     s: { playerCount: 8,  format: 'single_elimination', participantType: 'teams',   setsToWin: 1, maxSetsPerMatch: 1, thirdPlaceMatch: true,  grandFinalReset: false, showSeed: false } },
                { label: 'Tennis singles (8)',   s: { playerCount: 8,  format: 'single_elimination', participantType: 'singles', setsToWin: 2, maxSetsPerMatch: 5, thirdPlaceMatch: false, grandFinalReset: false, showSeed: true  } },
                { label: 'Badminton doubles (8)',s: { playerCount: 8,  format: 'single_elimination', participantType: 'couples', setsToWin: 2, maxSetsPerMatch: 3, thirdPlaceMatch: false, grandFinalReset: false, showSeed: true  } },
                { label: 'FGC Double Elim (8)', s: { playerCount: 8,  format: 'double_elimination', participantType: 'singles', setsToWin: 2, maxSetsPerMatch: 3, thirdPlaceMatch: false, grandFinalReset: true,  showSeed: true  } },
                { label: 'Big bracket (16)',     s: { playerCount: 16, format: 'single_elimination', participantType: 'teams',   setsToWin: 1, maxSetsPerMatch: 1, thirdPlaceMatch: false, grandFinalReset: false, showSeed: false } },
              ] as { label: string; s: Settings }[]).map(({ label, s }) => (
                <button
                  key={label}
                  onClick={() => { setSettings(s); setWinner(null); setBracketKey((k) => k + 1); }}
                  style={{
                    background: 'transparent', border: '1px solid #1e293b', borderRadius: 7,
                    color: '#64748b', padding: '6px 10px', fontSize: 12, fontFamily: 'inherit',
                    cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94a3b8'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#64748b'; }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 11, color: '#334155', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #1e293b' }}>
            Switch to <strong style={{ color: '#4ade80' }}>Editing</strong> mode in the bracket toolbar, then click ✏️ on a match to enter scores.
          </div>
        </aside>

        {/* ── Bracket area ── */}
        <main style={{ flex: 1, overflow: 'hidden', padding: 0 }}>
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
