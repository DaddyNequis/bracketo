import type { BracketConfig } from '../types';

/** Versioned, self-contained bracket template — JSON-serializable, safe for any document DB. */
export interface BracketTemplate {
  /** Schema version — bump when the shape changes so consumers can migrate. */
  version: 1;
  name: string;
  createdAt: number;
  config: BracketConfig;
}

/** Serialize a config + name into a compact JSON string ready to store in a DB. */
export function serializeTemplate(config: BracketConfig, name: string): string {
  const template: BracketTemplate = {
    version: 1,
    name: name.trim() || 'Untitled template',
    createdAt: Date.now(),
    config,
  };
  return JSON.stringify(template);
}

export class TemplateParseError extends Error {}

/** Parse and validate a template JSON string. Throws `TemplateParseError` on failure. */
export function deserializeTemplate(raw: string): BracketTemplate {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.trim());
  } catch {
    throw new TemplateParseError('Invalid JSON — make sure you copied the full template string.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new TemplateParseError('Template must be a JSON object.');
  }

  const obj = parsed as Record<string, unknown>;

  if (obj.version !== 1) {
    throw new TemplateParseError(`Unknown template version "${obj.version}". Only version 1 is supported.`);
  }
  if (typeof obj.config !== 'object' || obj.config === null) {
    throw new TemplateParseError('Template is missing a valid "config" field.');
  }

  const cfg = obj.config as Record<string, unknown>;
  if (!cfg.format || !cfg.participants || !Array.isArray(cfg.participants)) {
    throw new TemplateParseError('Template config is missing required fields (format, participants).');
  }

  return parsed as BracketTemplate;
}
