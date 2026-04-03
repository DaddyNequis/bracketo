import React, { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  type NodeTypes,
  type NodeChange,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../../styles/bracketo.css';

import type { BracketConfig } from '../../types';
import type { TextVariant } from '../../types/flow';
import { BracketProvider, useBracketStore, useContainerRef, useReadOnly } from './BracketContext';
import { MatchNode } from '../nodes/MatchNode';
import { ByeNode } from '../nodes/ByeNode';
import { LabelNode } from '../nodes/LabelNode';
import { ImageNode } from '../nodes/ImageNode';
import { TextNode } from '../nodes/TextNode';
import { ExportButton } from '../ui/ExportButton';
import { TemplateModal } from '../ui/TemplateModal';
import { buildNodes } from '../../flow/buildNodes';
import { buildEdges } from '../../flow/buildEdges';

const nodeTypes: NodeTypes = {
  matchNode: MatchNode,
  byeNode: ByeNode,
  labelNode: LabelNode,
  imageNode: ImageNode,
  textNode: TextNode,
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

function ImageIcon() {
  return (
    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function TitleIcon() {
  return (
    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  );
}

/** Inner panel rendered inside <ReactFlow> so useReactFlow() is available */
function OverlayAddPanel({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const { screenToFlowPosition } = useReactFlow();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const addImageNode = useBracketStore((s) => s.addImageNode);
  const addTextNode = useBracketStore((s) => s.addTextNode);

  const getCenterPosition = useCallback(() => {
    const el = containerRef.current;
    if (!el) return { x: 100, y: 100 };
    const rect = el.getBoundingClientRect();
    return screenToFlowPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }, [screenToFlowPosition, containerRef]);

  const handleAddText = useCallback((variant: TextVariant) => {
    const pos = getCenterPosition();
    addTextNode(variant, { x: pos.x - 60, y: pos.y - 20 });
  }, [getCenterPosition, addTextNode]);

  const handleImageFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        alert('Image must be under 10 MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        const pos = getCenterPosition();
        addImageNode(src, { x: pos.x - 100, y: pos.y - 75 });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [getCenterPosition, addImageNode],
  );

  return (
    <Panel position="top-left" className="bracketo-overlay-panel">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageFile}
      />
      <button
        className="bracketo-mode-btn"
        onClick={() => imageInputRef.current?.click()}
        title="Add image to canvas"
      >
        <ImageIcon /> Image
      </button>
      <button
        className="bracketo-mode-btn"
        onClick={() => handleAddText('title')}
        title="Add title text"
      >
        <TitleIcon /> Title
      </button>
      <button
        className="bracketo-mode-btn"
        onClick={() => handleAddText('text')}
        title="Add text"
      >
        <TitleIcon /> Text
      </button>
    </Panel>
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
  const [selectedOverlayIds, setSelectedOverlayIds] = useState<Set<string>>(new Set());

  const initBracket = useBracketStore((s) => s.initBracket);
  const bracket = useBracketStore((s) => s.bracket);
  const highlightedMatchIds = useBracketStore((s) => s.highlightedMatchIds);
  const highlightedEdgeIds = useBracketStore((s) => s.highlightedEdgeIds);
  const winnerId = useBracketStore((s) => s.bracket?.winnerId ?? null);

  const overlayNodes = useBracketStore((s) => s.overlayNodes);
  const updateOverlayNodePosition = useBracketStore((s) => s.updateOverlayNodePosition);
  const updateOverlayNodeSize = useBracketStore((s) => s.updateOverlayNodeSize);
  const deleteOverlayNode = useBracketStore((s) => s.deleteOverlayNode);

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

  const overlayRfNodes = useMemo(
    () =>
      overlayNodes.map((o) => ({
        id: o.id,
        type: o.type,
        position: o.position,
        data: o.data,
        draggable: true,
        selectable: true,
        selected: selectedOverlayIds.has(o.id),
        ...(o.width && o.height ? { style: { width: o.width, height: o.height } } : {}),
      })),
    [overlayNodes, selectedOverlayIds],
  );

  const allNodes = useMemo(() => [...nodes, ...overlayRfNodes], [nodes, overlayRfNodes]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const change of changes) {
        const nodeId = 'id' in change ? change.id : null;
        if (!nodeId) continue;
        const isOverlay = nodeId.startsWith('img-') || nodeId.startsWith('txt-');
        if (!isOverlay) continue;

        if (change.type === 'position' && change.position) {
          updateOverlayNodePosition(nodeId, change.position);
        }
        if (change.type === 'dimensions' && change.dimensions) {
          updateOverlayNodeSize(nodeId, change.dimensions.width, change.dimensions.height);
        }
        if (change.type === 'remove') {
          deleteOverlayNode(nodeId);
        }
        if (change.type === 'select') {
          setSelectedOverlayIds((prev) => {
            const next = new Set(prev);
            if (change.selected) next.add(nodeId);
            else next.delete(nodeId);
            return next;
          });
        }
      }
    },
    [updateOverlayNodePosition, updateOverlayNodeSize, deleteOverlayNode],
  );

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
          Edit mode — tap the edit icon on any match to enter scores
        </div>
      )}

      <ReactFlow
        nodes={allNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        onPaneClick={onPaneClick}
        nodesConnectable={false}
        nodesDraggable={true}
        elementsSelectable={true}
        onNodesChange={onNodesChange}
        proOptions={{ hideAttribution: false }}
      >
        {showControls && <Controls />}
        {showMiniMap && <MiniMap />}
        <Background />
        {!readOnly && <OverlayAddPanel containerRef={containerRef as React.RefObject<HTMLDivElement | null>} />}
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
