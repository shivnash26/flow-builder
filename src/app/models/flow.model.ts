export interface Edge {
  to_node_id: string;
  condition: string;
  parameters?: Record<string, string>;
}

export interface NodeModel {
  uid: string; // INTERNAL ID (never changes)

  id: string;  // Editable user ID
  description: string;
  prompt: string;
  edges: Edge[];
  isStart?: boolean;

  x: number;
  y: number;
}