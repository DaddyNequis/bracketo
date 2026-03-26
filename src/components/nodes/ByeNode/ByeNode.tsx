import type { NodeProps } from '@xyflow/react';
import { MATCH_NODE_WIDTH } from '../../../flow/layout';

export function ByeNode(_props: NodeProps) {
  return (
    <div className="bracketo-bye-node" style={{ width: MATCH_NODE_WIDTH }} />
  );
}
