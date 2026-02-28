import { Component, HostListener, OnInit } from '@angular/core';
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
        <defs>
          <marker id="arrow"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#000" />
          </marker>
        </defs>

        @for (edge of computedEdges; track edge.id) {
          <path
            [attr.d]="'M ' + edge.x1 + ' ' + edge.y1 +
                      ' C ' + (edge.x1 + edge.x2)/2 + ' ' + edge.y1 +
                      ', ' + (edge.x1 + edge.x2)/2 + ' ' + edge.y2 +
                      ', ' + edge.x2 + ' ' + edge.y2"
            stroke="black"
            fill="none"
            marker-end="url(#arrow)"
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
          [class.selected]="node.uid === selectedNode?.uid"
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
      height: 70vh;
      background: #f8fafc;
      border-right: 1px solid #e5e7eb;
    }

    /* SVG layer */
    .edges {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;          /* lower */
    }

    /* Node layer */
    .node {
      position: absolute;
      width: 120px;
      height: 60px;
      padding: 10px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 10px;
      cursor: move;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      transition: 0.2s ease;
      z-index: 2;          /* higher */
    }

    .node:hover {
      box-shadow: 0 6px 18px rgba(0,0,0,0.15);
    }

    .start-node {
      border: 2px solid green;
      background: #eaffea;
    }
    .selected {
      border: 2px solid #2563eb;
      box-shadow: 0 6px 18px rgba(37, 99, 235, 0.25);
    }
  `]
})
export class Canvas implements OnInit {

  nodes: NodeModel[] = [];
  computedEdges: any[] = [];
  selectedNode: NodeModel | null = null;

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
    this.selectedNode = node;
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

    this.nodes.forEach(source => {

      source.edges.forEach(edge => {

        const target = nodesMap.get(edge.to_node_id);
        if (!target) return;

        // Centers
        const sx = source.x + NODE_WIDTH / 2;
        const sy = source.y + NODE_HEIGHT / 2;

        const tx = target.x + NODE_WIDTH / 2;
        const ty = target.y + NODE_HEIGHT / 2;

        // Direction vector
        const dx = tx - sx;
        const dy = ty - sy;

        const angle = Math.atan2(dy, dx);

        // Offset to stop at edge of box
        const offsetX = (NODE_WIDTH / 2) * Math.cos(angle);
        const offsetY = (NODE_HEIGHT / 2) * Math.sin(angle);

        edges.push({
          id: source.uid + '-' + edge.to_node_id,

          x1: sx,
          y1: sy,

          x2: tx - offsetX,
          y2: ty - offsetY,

          label: edge.condition
        });

      });

    });

    this.computedEdges = edges;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {

    if (event.key === 'Delete' && this.selectedNode) {
      this.flowService.deleteNode(this.selectedNode.uid);
      this.selectedNode = null;
    }

  }
}