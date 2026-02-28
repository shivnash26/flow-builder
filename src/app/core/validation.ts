import { Injectable } from '@angular/core';
import { NodeModel } from '../models/flow.model';

@Injectable({
  providedIn: 'root'
})
export class Validation {

  validate(nodes: NodeModel[]) {
    const errors: string[] = [];

    // Must have one start node
    const startNodes = nodes.filter(n => n.isStart);

    if (startNodes.length === 0) {
      errors.push('A start node must exist.');
    }

    if (startNodes.length > 1) {
      errors.push('Only one start node is allowed.');
    }
    
    // Description required
    nodes.forEach(node => {
      if (!node.description) {
        errors.push(`Node "${node.id}" requires a description.`);
      }
    });

    // -------- DISCONNECTED NODE CHECK --------
    if (startNodes.length === 1) {
      const reachable = new Set<string>();
      const nodeMap = new Map(nodes.map(n => [n.id, n]));

      const dfs = (node: NodeModel) => {
        if (reachable.has(node.id)) return;
        reachable.add(node.id);

        node.edges.forEach(edge => {
          const target = nodeMap.get(edge.to_node_id);
          if (target) dfs(target);
        });
      };

      dfs(startNodes[0]);

      const disconnected = nodes.filter(n => !reachable.has(n.id));

      if (disconnected.length > 0) {
        errors.push(
          `Disconnected nodes: ${disconnected.map(n => n.id).join(', ')}`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}