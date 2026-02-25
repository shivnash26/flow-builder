import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NodeModel } from '../models/flow.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class FlowService {

  private nodesSubject = new BehaviorSubject<NodeModel[]>([]);
  nodes$ = this.nodesSubject.asObservable();

  private selectedNodeSubject = new BehaviorSubject<NodeModel | null>(null);
  selectedNode$ = this.selectedNodeSubject.asObservable();

  constructor() {}

  // -----------------------
  // Node CRUD
  // -----------------------

  addNode() {
    const uid = uuidv4();

    const newNode: NodeModel = {
      uid,
      id: uid.substring(0, 6), // short default display id
      description: '',
      prompt: '',
      edges: [],
      isStart: false,
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 200
    };

    this.nodesSubject.next([...this.nodesSubject.value, newNode]);
  }

  selectNode(node: NodeModel | null) {
    this.selectedNodeSubject.next(node);
  }

  updateNodePosition(uid: string, x: number, y: number) {
    const updated = this.nodesSubject.value.map(node =>
      node.uid === uid ? { ...node, x, y } : node
    );

    this.nodesSubject.next(updated);
  }

  updateNode(updatedNode: NodeModel) {

    let nodes = this.nodesSubject.value;

    if (updatedNode.isStart) {
      nodes = nodes.map(node =>
        node.uid === updatedNode.uid
          ? { ...updatedNode }
          : { ...node, isStart: false }
      );
    } else {
      nodes = nodes.map(node =>
        node.uid === updatedNode.uid
          ? { ...updatedNode }
          : node
      );
    }

    this.nodesSubject.next(nodes);

    const stored = nodes.find(n => n.uid === updatedNode.uid) || null;
    this.selectedNodeSubject.next(stored);
  }

  deleteNode(nodeId: string) {
    const filtered = this.nodesSubject.value.filter(n => n.id !== nodeId);

    // Also remove edges pointing to this node
    const cleaned = filtered.map(node => ({
      ...node,
      edges: node.edges.filter(e => e.to_node_id !== nodeId)
    }));

    this.nodesSubject.next(cleaned);
    this.selectedNodeSubject.next(null);
  }

  getNodesSnapshot(): NodeModel[] {
    return this.nodesSubject.value;
  }
}