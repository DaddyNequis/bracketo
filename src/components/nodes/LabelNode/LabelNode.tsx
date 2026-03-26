import type { NodeProps } from '@xyflow/react';
import type { LabelNodeData } from '../../../types/flow';

export function LabelNode({ data }: NodeProps) {
  const { label } = data as LabelNodeData;
  return (
    <div className="bracketo-label-node">
      {label}
    </div>
  );
}
