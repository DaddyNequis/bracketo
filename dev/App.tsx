import { useState, useMemo } from 'react';
import { MdBolt, MdEmojiEvents, MdSportsSoccer, MdSportsTennis, MdSportsEsports, MdEdit } from 'react-icons/md';
import { GiShuttlecock } from 'react-icons/gi';
import { Bracket } from '../src/components/Bracket/Bracket';
import type { BracketConfig, Participant, ParticipantType, IndicatorType } from '../src/types';
import './demo.css';

/* ─── helpers ─── */
const COUNTRIES = ['US','DE','BR','FR','ES','JP','KR','AR','IT','NL','PT','MX','AU','CA','GB','CN','NG','ZA','IN','RU'];
const US_STATES = ['CA','TX','NY','FL','IL','PA','OH','GA','NC','MI','NJ','VA','WA','AZ','MA','TN','IN','MO','MD','WI'];

const FOOTBALL_PLAYERS: { name: string; photo: string }[] = [
  { name: 'Lionel Messi',           photo: '/players/player1.jpg'  },
  { name: 'Cristiano Ronaldo',      photo: '/players/player2.jpg'  },
  { name: 'Neymar Jr',              photo: '/players/player3.jpg'  },
  { name: 'Kylian Mbappé',          photo: '/players/player4.jpg'  },
  { name: 'Erling Haaland',         photo: '/players/player5.jpg'  },
  { name: 'Mohamed Salah',          photo: '/players/player6.jpg'  },
  { name: 'Robert Lewandowski',     photo: '/players/player7.jpg'  },
  { name: 'Kevin De Bruyne',        photo: '/players/player8.jpg'  },
  { name: 'Virgil van Dijk',        photo: '/players/player9.jpg'  },
  { name: 'Sadio Mané',             photo: '/players/player10.jpg' },
  { name: 'Harry Kane',             photo: '/players/player11.jpg' },
  { name: 'Son Heung-min',          photo: '/players/player12.jpg' },
  { name: 'Bruno Fernandes',        photo: '/players/player13.jpg' },
  { name: 'Luka Modrić',            photo: '/players/player14.jpg' },
  { name: 'Toni Kroos',             photo: '/players/player15.jpg' },
  { name: 'Karim Benzema',          photo: '/players/player16.jpg' },
  { name: 'Antoine Griezmann',      photo: '/players/player17.jpg' },
  { name: 'Paulo Dybala',           photo: '/players/player18.jpg' },
  { name: 'Raheem Sterling',        photo: '/players/player19.jpg' },
  { name: 'Marcus Rashford',        photo: '/players/player20.jpg' },
  { name: 'Jack Grealish',          photo: '/players/player21.jpg' },
  { name: 'Phil Foden',             photo: '/players/player22.jpg' },
  { name: 'Bukayo Saka',            photo: '/players/player23.jpg' },
  { name: 'Jude Bellingham',        photo: '/players/player24.jpg' },
  { name: 'Vinicius Jr',            photo: '/players/player25.jpg' },
  { name: 'Rodri',                  photo: '/players/player26.jpg' },
  { name: 'Pedri',                  photo: '/players/player27.jpg' },
  { name: 'Gavi',                   photo: '/players/player28.jpg' },
  { name: 'Jamal Musiala',          photo: '/players/player29.jpg' },
  { name: 'Florian Wirtz',          photo: '/players/player30.jpg' },
  { name: 'Federico Valverde',      photo: '/players/player31.jpg' },
  { name: 'Rafael Leão',            photo: '/players/player32.jpg' },
  { name: 'João Félix',             photo: '/players/player33.jpg' },
  { name: 'Declan Rice',            photo: '/players/player34.jpg' },
  { name: 'Casemiro',               photo: '/players/player35.jpg' },
  { name: "N'Golo Kanté",           photo: '/players/player36.jpg' },
  { name: 'Ilkay Gündogan',         photo: '/players/player37.jpg' },
  { name: 'Thomas Müller',          photo: '/players/player38.jpg' },
  { name: 'Joshua Kimmich',         photo: '/players/player39.jpg' },
  { name: 'Christian Pulisic',      photo: '/players/player40.jpg' },
  { name: 'Memphis Depay',          photo: '/players/player41.jpg' },
  { name: 'Xavi Simons',            photo: '/players/player42.jpg' },
  { name: 'Cody Gakpo',             photo: '/players/player43.jpg' },
  { name: 'Bernardo Silva',         photo: '/players/player44.jpg' },
  { name: 'Rúben Dias',             photo: '/players/player45.jpg' },
  { name: 'Darwin Núñez',           photo: '/players/player46.jpg' },
  { name: 'Alexis Mac Allister',    photo: '/players/player47.jpg' },
  { name: 'Lautaro Martínez',       photo: '/players/player48.jpg' },
  { name: 'Ángel Di María',         photo: '/players/player49.jpg' },
  { name: 'Ousmane Dembélé',        photo: '/players/player50.jpg' },
];

function playerAt(index: number) {
  return FOOTBALL_PLAYERS[index % FOOTBALL_PLAYERS.length];
}

function makeParticipants(n: number, type: ParticipantType): Participant[] {
  return Array.from({ length: n }, (_, i) => {
    const seed = i + 1;
    const country = COUNTRIES[i % COUNTRIES.length];
    const state0 = US_STATES[i % US_STATES.length];
    const state1 = US_STATES[(i + 7) % US_STATES.length];

    if (type === 'singles') {
      const { name, photo } = playerAt(i);
      return {
        id: `p${seed}`, name, seed,
        members: [{ id: `m${seed}`, name, photoUrl: photo, state: state0 }],
        flags: [{ type: 'country' as const, value: country }],
      };
    }

    if (type === 'couples') {
      const pl1 = playerAt(i * 2);
      const pl2 = playerAt(i * 2 + 1);
      return {
        id: `p${seed}`, name: `${pl1.name} / ${pl2.name}`, seed,
        members: [
          { id: `m${seed}a`, name: pl1.name, photoUrl: pl1.photo, state: state0 },
          { id: `m${seed}b`, name: pl2.name, photoUrl: pl2.photo, state: state1 },
        ],
        flags: [{ type: 'country' as const, value: country }],
      };
    }

    return {
      id: `p${seed}`, name: `Team ${seed}`, seed,
      members: Array.from({ length: 5 }, (_, j) => {
        const { name, photo } = playerAt(i * 5 + j);
        return { id: `m${seed}_${j}`, name, photoUrl: photo, state: US_STATES[(i + j) % US_STATES.length] };
      }),
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
        <span className="demo-logo"><MdBolt style={{ verticalAlign: 'middle', marginRight: 4 }} />Bracketo</span>
        <span className="demo-subtitle">Tournament bracket demo</span>
        {winnerParticipant && (
          <div className="demo-winner-banner"><MdEmojiEvents style={{ verticalAlign: 'middle', marginRight: 5 }} />{winnerParticipant.name} wins!</div>
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
                { icon: <MdSportsSoccer />, label: 'Soccer',           sub: '8 teams · Single elim',      s: { playerCount: 8,  format: 'single_elimination', participantType: 'teams',   indicatorType: 'flag',  setsToWin: 1, maxSetsPerMatch: 1, thirdPlaceMatch: true,  grandFinalReset: false, showSeed: false, showStatus: true } },
                { icon: <MdSportsTennis />, label: 'Tennis singles',   sub: '8 players · Best of 5',      s: { playerCount: 8,  format: 'single_elimination', participantType: 'singles', indicatorType: 'flag',  setsToWin: 2, maxSetsPerMatch: 5, thirdPlaceMatch: false, grandFinalReset: false, showSeed: true,  showStatus: true } },
                { icon: <GiShuttlecock />, label: 'Badminton doubles', sub: '8 pairs · Best of 3',      s: { playerCount: 8,  format: 'single_elimination', participantType: 'couples', indicatorType: 'photo', setsToWin: 2, maxSetsPerMatch: 3, thirdPlaceMatch: false, grandFinalReset: false, showSeed: true,  showStatus: true } },
                { icon: <MdSportsEsports />, label: 'FGC Double Elim', sub: '8 players · Losers bracket', s: { playerCount: 8,  format: 'double_elimination', participantType: 'singles', indicatorType: 'flag',  setsToWin: 2, maxSetsPerMatch: 3, thirdPlaceMatch: false, grandFinalReset: true,  showSeed: true,  showStatus: true } },
                { icon: <MdEmojiEvents />,  label: 'Big bracket',      sub: '16 teams · Single elim',     s: { playerCount: 16, format: 'single_elimination', participantType: 'teams',   indicatorType: 'flag',  setsToWin: 1, maxSetsPerMatch: 1, thirdPlaceMatch: false, grandFinalReset: false, showSeed: false, showStatus: true } },
              ] as { icon: React.ReactNode; label: string; sub: string; s: Settings }[]).map(({ icon, label, sub, s }) => (
                <button
                  key={label}
                  className="demo-preset-btn"
                  onClick={() => { setSettings(s); setWinner(null); setBracketKey((k) => k + 1); }}
                >
                  <span className="demo-preset-emoji">{icon}</span>
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
            Click <strong>Edit</strong> in the bracket toolbar, then tap the edit icon on any match.
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
