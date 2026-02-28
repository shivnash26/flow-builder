import { Component, OnInit } from '@angular/core';
import { NodeModel } from '../../models/flow.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FlowService } from '../../core/flow.service.ts';
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-node-sidebar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (selectedNode) {
      <div>
        <h3>Edit Node</h3>

        <form [formGroup]="form">

          <label>ID</label>
          <input formControlName="id" />
          @if (form.get('id')?.hasError('duplicate')) {
            <div class="error">ID must be unique</div>
          }

          <label>Description</label>
          <textarea formControlName="description"></textarea>
          @if (form.get('description')?.invalid) {
            <div class="error">Description is required</div>
          }

          <div class="start-row">
            <label for="startNode">Start Node</label>
            <input id="startNode" type="checkbox" formControlName="isStart" />
          </div>
          <hr />
          <h4>Outgoing Edges</h4>

          <button type="button" (click)="addEdge()">Add Edge</button>

          @for (edge of selectedNode.edges; track $index; let i = $index) {
            <div class="edge-block">
              
              <label>Target Node</label>
              <select
                [value]="edge.to_node_id"
                (change)="updateEdge(i, 'to_node_id', $any($event.target).value)"
              >
                <option value="">Select target</option>
                @for (target of availableTargets; track target.uid) {
                  <option [value]="target.id">
                    {{ target.id }}
                  </option>
                }
              </select>

              <label>Condition</label>
              <input
                [value]="edge.condition"
                (input)="updateEdge(i, 'condition', $any($event.target).value)"
              />

              <button type="button" (click)="removeEdge(i)">
                Remove
              </button>

              <hr />
            </div>
          }

        </form>
      </div>
    } @else {
      <p>Select a node to edit</p>
    }
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
    }

    h3 {
      margin-top: 0;
    }

    label {
      display: block;
      margin-top: 12px;
      font-weight: 500;
    }

    input, textarea, select {
      width: 100%;
      padding: 6px 8px;
      margin-top: 4px;
      border-radius: 6px;
      border: 1px solid #ccc;
      font-size: 14px;
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    .error {
      color: #dc2626;
      font-size: 12px;
      margin-top: 4px;
    }

    .start-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 16px;
    }

    .start-row input {
      width: auto;
    }

    .edge-block {
      background: #f8fafc;
      padding: 10px;
      border-radius: 8px;
      margin-top: 12px;
    }

    button {
      margin-top: 8px;
      padding: 6px 10px;
      border-radius: 6px;
      border: none;
      background: #2563eb;
      color: white;
      cursor: pointer;
    }

    button:hover {
      opacity: 0.9;
    }
  `]
})
export class NodeSidebar implements OnInit {

  selectedNode: NodeModel | null = null;
  private destroyRef = inject(DestroyRef);

  form: any;

  constructor(
    private flowService: FlowService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {

    this.form = this.fb.group({
    id: ['', Validators.required],
    description: ['', Validators.required],
    isStart: [false]
  });

  this.flowService.selectedNode$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(node => {
      this.selectedNode = node;
      if (node) {
        this.form.patchValue(node, { emitEvent: false });
      }
    });

  this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
      if (!this.selectedNode) return;

      if (!this.isUniqueId(value.id!)) {
        this.form.get('id')?.setErrors({ duplicate: true });
      } else {
        this.form.get('id')?.setErrors(null);
      }

      const updatedNode: NodeModel = {
        ...this.selectedNode,
        ...value
      };

      this.flowService.updateNode(updatedNode);
    });
  }

  private isUniqueId(id: string): boolean {
    const nodes = this.flowService.getNodesSnapshot();

    return !nodes.some(n =>
      n.id === id && n.uid !== this.selectedNode?.uid
    );
  }

  get availableTargets() {
    const nodes = this.flowService.getNodesSnapshot();
    return nodes.filter(n => n.uid !== this.selectedNode?.uid);
  }

  addEdge() {
    if (!this.selectedNode) return;

    const updated = {
      ...this.selectedNode,
      edges: [
        ...this.selectedNode.edges,
        {
          to_node_id: '',
          condition: ''
        }
      ]
    };

    this.flowService.updateNode(updated);
  }

  updateEdge(index: number, key: 'to_node_id' | 'condition', value: string) {
    if (!this.selectedNode) return;

    const updatedEdges = [...this.selectedNode.edges];
    updatedEdges[index] = {
      ...updatedEdges[index],
      [key]: value
    };

    const updated = {
      ...this.selectedNode,
      edges: updatedEdges
    };

    this.flowService.updateNode(updated);
  }

  removeEdge(index: number) {
    if (!this.selectedNode) return;

    const updated = {
      ...this.selectedNode,
      edges: this.selectedNode.edges.filter((_, i) => i !== index)
    };

    this.flowService.updateNode(updated);
  }

}