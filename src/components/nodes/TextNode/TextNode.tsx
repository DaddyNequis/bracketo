import { useState, useRef, useCallback, useEffect } from 'react';
import { type NodeProps, NodeToolbar, Position } from '@xyflow/react';
import type { TextNodeData, TextVariant } from '../../../types/flow';
import { useBracketStore } from '../../Bracket/BracketContext';

export function TextNode({ id, data, selected }: NodeProps) {
  const { content, variant } = data as TextNodeData;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateTextContent = useBracketStore((s) => s.updateTextContent);
  const updateTextVariant = useBracketStore((s) => s.updateTextVariant);
  const deleteOverlayNode = useBracketStore((s) => s.deleteOverlayNode);

  useEffect(() => { setDraft(content); }, [content]);

  const startEditing = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }, 0);
  }, []);

  const commitEdit = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== content) {
      updateTextContent(id, trimmed || content);
    }
  }, [draft, content, id, updateTextContent]);

  const toggleVariant = useCallback(() => {
    const next: TextVariant = variant === 'title' ? 'text' : 'title';
    updateTextVariant(id, next);
  }, [variant, id, updateTextVariant]);

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} align="end">
        <div className="bn-overlay-toolbar">
          <button
            className="bn-overlay-toolbar__btn nodrag nopan"
            onClick={toggleVariant}
            title="Toggle Title / Text size"
          >
            {variant === 'title' ? 'As Text' : 'As Title'}
          </button>
          <button
            className="bn-overlay-toolbar__btn bn-overlay-toolbar__btn--danger nodrag nopan"
            onClick={() => deleteOverlayNode(id)}
            title="Delete text"
          >
            Delete
          </button>
        </div>
      </NodeToolbar>

      <div
        className={`bn-text-node bn-text-node--${variant}`}
        onDoubleClick={startEditing}
      >
        {editing ? (
          <textarea
            ref={textareaRef}
            className="bn-text-node__editor nodrag nopan"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(); }
              if (e.key === 'Escape') { setDraft(content); setEditing(false); }
            }}
          />
        ) : (
          <span className="bn-text-node__display">{content}</span>
        )}
      </div>
    </>
  );
}
