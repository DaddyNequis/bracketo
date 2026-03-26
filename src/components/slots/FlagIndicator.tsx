import type { ParticipantFlag } from '../../types';

interface FlagIndicatorProps {
  flags?: ParticipantFlag[];
  seed?: number;
}

export function FlagIndicator({ flags, seed }: FlagIndicatorProps) {
  return (
    <span className="bracketo-flags">
      {seed !== undefined && (
        <span className="bracketo-seed" title={`Seed ${seed}`}>
          {seed}
        </span>
      )}
      {flags?.map((flag, i) => {
        if (flag.type === 'country') {
          return (
            <span key={i} className="bracketo-flag-country" title={flag.label ?? flag.value}>
              {/* Emoji flag from country code */}
              {countryCodeToEmoji(flag.value)}
            </span>
          );
        }
        if (flag.type === 'status') {
          return (
            <span key={i} className="bracketo-flag-status" title={flag.label ?? flag.value}>
              {flag.value}
            </span>
          );
        }
        if (flag.type === 'custom') {
          return (
            <img
              key={i}
              className="bracketo-flag-custom"
              src={flag.value}
              alt={flag.label ?? ''}
              width={16}
              height={16}
            />
          );
        }
        return null;
      })}
    </span>
  );
}

function countryCodeToEmoji(code: string): string {
  const upper = code.toUpperCase().slice(0, 2);
  if (upper.length < 2) return code;
  const [a, b] = upper;
  return String.fromCodePoint(0x1f1e6 + a.charCodeAt(0) - 65) +
    String.fromCodePoint(0x1f1e6 + b.charCodeAt(0) - 65);
}
