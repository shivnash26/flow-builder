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
        errors.push(`Node ${node.id} requires a description.`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}