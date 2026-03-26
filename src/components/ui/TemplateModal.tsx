import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useBracketStore } from '../Bracket/BracketContext';
import { serializeTemplate, deserializeTemplate, TemplateParseError } from '../../utils/template';
import type { BracketConfig } from '../../types';

interface TemplateModalProps {
  onClose: () => void;
  onLoad?: (config: BracketConfig) => void;
}

type Tab = 'save' | 'load';

export function TemplateModal({ onClose, onLoad }: TemplateModalProps) {
  const config = useBracketStore((s) => s.bracket?.config);
  const initBracket = useBracketStore((s) => s.initBracket);

  const [tab, setTab] = useState<Tab>('save');

  // ── Save state ──────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [serialized, setSerialized] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!config) return;
    setSerialized(serializeTemplate(config, name));
  }, [config, name]);

  function handleCopy() {
    navigator.clipboard.writeText(serialized).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    const blob = new Blob([serialized], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(name.trim() || 'bracket-template').toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Load state ──────────────────────────────────────────────────────────
  const [loadInput, setLoadInput] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);

  function handleLoad() {
    setLoadError(null);
    try {
      const template = deserializeTemplate(loadInput);
      initBracket(template.config);
      onLoad?.(template.config);
      onClose();
    } catch (err) {
      setLoadError(err instanceof TemplateParseError ? err.message : 'Unexpected error parsing template.');
    }
  }

  // ── Keyboard ────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleBackdrop = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  if (!config) return null;

  return createPortal(
    <div className="bracketo-modal-backdrop" onClick={handleBackdrop} onMouseDown={(e) => e.stopPropagation()}>
      <div className="bracketo-modal bracketo-tpl-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="bracketo-modal-header">
          <div>
            <span className="bracketo-modal-section">Bracket</span>
            <h2 className="bracketo-modal-title">Template</h2>
          </div>
          <button className="bracketo-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Tabs */}
        <div className="bracketo-tpl-tabs">
          <button
            className={`bracketo-tpl-tab${tab === 'save' ? ' bracketo-tpl-tab--active' : ''}`}
            onClick={() => setTab('save')}
          >
            Save template
          </button>
          <button
            className={`bracketo-tpl-tab${tab === 'load' ? ' bracketo-tpl-tab--active' : ''}`}
            onClick={() => setTab('load')}
          >
            Load template
          </button>
        </div>

        {/* ── Save panel ── */}
        {tab === 'save' && (
          <div className="bracketo-tpl-body">
            <label className="bracketo-tpl-label">Template name</label>
            <input
              className="bracketo-tpl-input"
              type="text"
              placeholder="e.g. FGC Double Elim 8"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label className="bracketo-tpl-label" style={{ marginTop: 14 }}>
              Template JSON
              <span className="bracketo-tpl-hint">Copy this string and store it in your database</span>
            </label>
            <textarea
              className="bracketo-tpl-textarea"
              readOnly
              value={serialized}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />

            <div className="bracketo-tpl-actions">
              <button className="bracketo-modal-btn bracketo-modal-btn--cancel" onClick={handleCopy}>
                {copied ? '✓ Copied!' : 'Copy to clipboard'}
              </button>
              <button className="bracketo-modal-btn bracketo-modal-btn--save" onClick={handleDownload}>
                Download .json
              </button>
            </div>
          </div>
        )}

        {/* ── Load panel ── */}
        {tab === 'load' && (
          <div className="bracketo-tpl-body">
            <label className="bracketo-tpl-label">
              Paste template JSON
              <span className="bracketo-tpl-hint">Paste the string you previously saved</span>
            </label>
            <textarea
              className="bracketo-tpl-textarea"
              placeholder={'{\n  "version": 1,\n  "name": "My template",\n  ...\n}'}
              value={loadInput}
              onChange={(e) => { setLoadInput(e.target.value); setLoadError(null); }}
            />

            {loadError && (
              <div className="bracketo-tpl-error">{loadError}</div>
            )}

            <div className="bracketo-tpl-actions">
              <button className="bracketo-modal-btn bracketo-modal-btn--cancel" onClick={onClose}>
                Cancel
              </button>
              <button
                className="bracketo-modal-btn bracketo-modal-btn--save"
                onClick={handleLoad}
                disabled={!loadInput.trim()}
              >
                Load bracket
              </button>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body,
  );
}
