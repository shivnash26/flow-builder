import { Component, OnInit } from '@angular/core';
import { NodeModel } from '../../models/flow.model';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { FlowService } from '../../core/flow.service.ts';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule, CdkDrag],
  template: `
    <div class="toolbar">
      <button (click)="addNode()">Add Node</button>
    </div>

    <div class="canvas" #canvas>

      <!-- SVG Edges -->
      <svg class="edges">
        @for (edge of computedEdges;  track edge.id) {
          <line
            [attr.x1]="edge.x1"
            [attr.y1]="edge.y1"
            [attr.x2]="edge.x2"
            [attr.y2]="edge.y2"
            stroke="black"
          />
          <text
            [attr.x]="(edge.x1 + edge.x2) / 2"
            [attr.y]="(edge.y1 + edge.y2) / 2 - 5"
            font-size="12"
            fill="black"
          >
            {{ edge.label }}
          </text>
        }
      </svg>

      <!-- Nodes -->
      @for (node of nodes; track node.uid) {
        <div
          class="node"
          [class.start-node]="node.isStart"
          cdkDrag
          [cdkDragFreeDragPosition]="{ x: node.x, y: node.y }"
          (cdkDragEnded)="dragEnded($event, node)"
          (click)="selectNode(node)"
        >
          {{ node.id }}
        </div>
      }

    </div>
  `,
  styles: [`
    .toolbar {
      padding: 10px;
    }

    .canvas {
      position: relative;
      height: 600px;
      background: #f0f2f5;
      overflow: hidden;
    }

    .edges {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .node {
      position: absolute;
      width: 120px;
      height: 60px;
      padding: 10px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      cursor: move;
      text-align: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .start-node {
      border: 2px solid green;
      background: #eaffea;
    }
  `]
})
export class Canvas implements OnInit {

  nodes: NodeModel[] = [];
  computedEdges: any[] = [];

  constructor(private flowService: FlowService) {}

  ngOnInit() {
    this.flowService.nodes$.subscribe(nodes => {
      this.nodes = nodes;
      this.computeEdges();
    });
  }

  addNode() {
    this.flowService.addNode();
  }

  selectNode(node: NodeModel) {
    this.flowService.selectNode(node);
  }

  dragEnded(event: CdkDragEnd, node: NodeModel) {
    const position = event.source.getFreeDragPosition();
    this.flowService.updateNodePosition(node.uid, position.x, position.y);
  }


  computeEdges() {

    const NODE_WIDTH = 120;
    const NODE_HEIGHT = 60;

    const nodesMap = new Map(
      this.nodes.map(n => [n.id, n])
    );

    const edges: any[] = [];

    this.nodes.forEach(sourceNode => {

      sourceNode.edges.forEach(edge => {

        const targetNode = nodesMap.get(edge.to_node_id);

        if (targetNode) {

          edges.push({
            id: sourceNode.uid + '-' + edge.to_node_id,

            x1: sourceNode.x + NODE_WIDTH / 2,
            y1: sourceNode.y + NODE_HEIGHT / 2,

            x2: targetNode.x + NODE_WIDTH / 2,
            y2: targetNode.y + NODE_HEIGHT / 2,

            label: edge.condition
          });

        }

      });

    });

    this.computedEdges = edges;
  }
}