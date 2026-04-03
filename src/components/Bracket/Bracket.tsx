import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../../styles/bracketo.css';

import type { BracketConfig } from '../../types';
import { BracketProvider, useBracketStore, useContainerRef, useReadOnly } from './BracketContext';
import { MatchNode } from '../nodes/MatchNode';
import { ByeNode } from '../nodes/ByeNode';
import { LabelNode } from '../nodes/LabelNode';
import { ExportButton } from '../ui/ExportButton';
import { TemplateModal } from '../ui/TemplateModal';
import { buildNodes } from '../../flow/buildNodes';
import { buildEdges } from '../../flow/buildEdges';

const nodeTypes: NodeTypes = {
  matchNode: MatchNode,
  byeNode: ByeNode,
  labelNode: LabelNode,
};

function LockIcon() {
  return (
    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function UnlockIcon() {
  return (
    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

function TemplateIcon() {
  return (
    <svg aria-hidden="true" style={{ pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export interface BracketProps {
  config: BracketConfig;
  defaultReadOnly?: boolean;
  showMiniMap?: boolean;
  showControls?: boolean;
  showExportButton?: boolean;
  showTemplateButton?: boolean;
  height?: number | string;
  width?: number | string;
  onWinnerChange?: (winnerId: string | null) => void;
  onTemplateLoad?: (config: BracketConfig) => void;
}

function BracketInner({
  config,
  showMiniMap = false,
  showControls = true,
  showExportButton = true,
  showTemplateButton = true,
  height = 600,
  width = '100%',
  onWinnerChange,
  onTemplateLoad,
}: Omit<BracketProps, 'defaultReadOnly'>) {
  const containerRef = useContainerRef();
  const [readOnly, setReadOnly] = useReadOnly();
  const [templateOpen, setTemplateOpen] = useState(false);

  const initBracket = useBracketStore((s) => s.initBracket);
  const bracket = useBracketStore((s) => s.bracket);
  const highlightedMatchIds = useBracketStore((s) => s.highlightedMatchIds);
  const highlightedEdgeIds = useBracketStore((s) => s.highlightedEdgeIds);
  const winnerId = useBracketStore((s) => s.bracket?.winnerId ?? null);

  useEffect(() => {
    initBracket(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onWinnerChange?.(winnerId);
  }, [winnerId, onWinnerChange]);

  const nodes = useMemo(() => {
    if (!bracket) return [];
    return buildNodes(bracket, highlightedMatchIds);
  }, [bracket, highlightedMatchIds]);

  const edges = useMemo(() => {
    if (!bracket) return [];
    return buildEdges(bracket, highlightedEdgeIds);
  }, [bracket, highlightedEdgeIds]);

  const onPaneClick = useCallback(() => {
    // future: clear selection
  }, []);

  if (!bracket) return null;

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className="bracketo-root"
      style={{ width, height, position: 'relative' }}
    >
      <div className="bracketo-toolbar">
        {/* Read-only toggle */}
        <button
          className={['bracketo-mode-btn', readOnly ? '' : 'bracketo-mode-btn--edit'].filter(Boolean).join(' ')}
          onClick={() => setReadOnly((v) => !v)}
          title={readOnly ? 'Switch to edit mode to enter scores' : 'Switch to view mode'}
        >
          {readOnly ? <><LockIcon /> View</> : <><UnlockIcon /> Edit</>}
        </button>

        {showTemplateButton && (
          <button className="bracketo-mode-btn" onClick={() => setTemplateOpen(true)} title="Save or load a template">
            <TemplateIcon /> Template
          </button>
        )}

        {showExportButton && <ExportButton />}
      </div>

      {templateOpen && (
        <TemplateModal
          onClose={() => setTemplateOpen(false)}
          onLoad={onTemplateLoad}
        />
      )}

      {!readOnly && (
        <div className="bracketo-edit-hint" aria-live="polite">
          Edit mode — tap ✏️ on any match to enter scores
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        onPaneClick={onPaneClick}
        nodesConnectable={false}
        nodesDraggable={true}
        elementsSelectable={false}
        proOptions={{ hideAttribution: false }}
      >
        {showControls && <Controls />}
        {showMiniMap && <MiniMap />}
        <Background />
      </ReactFlow>
    </div>
  );
}

export function Bracket({ defaultReadOnly = true, ...props }: BracketProps) {
  return (
    <BracketProvider defaultReadOnly={defaultReadOnly}>
      <BracketInner {...props} />
    </BracketProvider>
  );
}
