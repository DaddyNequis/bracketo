import { useCallback, useRef } from 'react';
import { type NodeProps, NodeResizer, NodeToolbar, Position } from '@xyflow/react';
import type { ImageNodeData } from '../../../types/flow';
import { useBracketStore } from '../../Bracket/BracketContext';

export function ImageNode({ id, data, selected }: NodeProps) {
  const { src, opacity } = data as ImageNodeData;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateImageOpacity = useBracketStore((s) => s.updateImageOpacity);
  const updateImageSrc = useBracketStore((s) => s.updateImageSrc);
  const deleteOverlayNode = useBracketStore((s) => s.deleteOverlayNode);
  const updateOverlayNodeSize = useBracketStore((s) => s.updateOverlayNodeSize);

  const onResize = useCallback(
    (_: unknown, params: { width: number; height: number }) => {
      updateOverlayNodeSize(id, params.width, params.height);
    },
    [id, updateOverlayNodeSize],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        alert('Image must be under 10 MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        updateImageSrc(id, result);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [id, updateImageSrc],
  );

  return (
    <>
      <NodeResizer
        minWidth={60}
        minHeight={40}
        isVisible={selected}
        onResize={onResize}
      />

      <NodeToolbar isVisible={selected} position={Position.Top} align="end">
        <div className="bn-overlay-toolbar">
          <label className="bn-overlay-toolbar__label">
            Opacity
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={opacity}
              className="bn-overlay-opacity-slider nodrag nopan"
              onChange={(e) => updateImageOpacity(id, parseFloat(e.target.value))}
            />
          </label>
          <button
            className="bn-overlay-toolbar__btn bn-overlay-toolbar__btn--danger nodrag nopan"
            onClick={() => deleteOverlayNode(id)}
            title="Delete image"
          >
            Delete
          </button>
        </div>
      </NodeToolbar>

      <div className="bn-image-node" style={{ opacity }}>
        {src ? (
          <img src={src} alt="" className="bn-image-node__img" draggable={false} />
        ) : (
          <div
            className="bn-image-node__placeholder nodrag nopan"
            onClick={() => fileInputRef.current?.click()}
          >
            Click to add image
          </div>
        )}
        {src && (
          <button
            className="bn-image-node__change-btn nodrag nopan"
            onClick={() => fileInputRef.current?.click()}
            title="Change image"
          >
            Change
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        className="nodrag nopan"
        onChange={handleFileChange}
      />
    </>
  );
}
