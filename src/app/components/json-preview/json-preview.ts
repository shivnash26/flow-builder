import { Component, OnInit } from '@angular/core';
import { Validation } from '../../core/validation';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlowService } from '../../core/flow.service.ts';

@Component({
  selector: 'app-json-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (errors.length > 0) {
      <div class="validation">
        <h4>Validation Errors:</h4>
        <ul>
          @for (err of errors; track err) {
            <li>{{ err }}</li>
          }
        </ul>
      </div>
    }

    <div class="import-section">
      <textarea
        placeholder="Paste JSON here to import..."
        [(ngModel)]="importText"
        rows="5"
      ></textarea>
      <button (click)="importJson()">Import JSON</button>
    </div>

    <div class="json-actions">
      <button (click)="copyJson()">Copy JSON</button>
      <button (click)="downloadJson()">Download JSON</button>
    </div>

    <pre>{{ json }}</pre>
  `,
  styles: [`
    .validation {
      background: #2b0000;
      color: #ffb3b3;
      padding: 10px;
      margin-bottom: 10px;
      border-left: 4px solid red;
    }

    pre {
      white-space: pre-wrap;
      word-break: break-word;
    }
    .json-actions {
      margin-bottom: 10px;
    }

    .json-actions button {
      margin-right: 10px;
    }
  `]
})
export class JsonPreview implements OnInit {

  json = '';
  errors: string[] = [];
  importText = '';

  constructor(
    private flowService: FlowService,
    private validation: Validation
  ) {}

  ngOnInit() {
    this.flowService.nodes$.subscribe(nodes => {

      const result = this.validation.validate(nodes);

      this.errors = result.errors;

      this.json = JSON.stringify(nodes, null, 2);
    });
  }

  copyJson() {
    navigator.clipboard.writeText(this.json);
  }

  downloadJson() {
    const blob = new Blob([this.json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'flow.json';
    a.click();

    URL.revokeObjectURL(url);
  }

  importJson() {
    try {
      const parsed = JSON.parse(this.importText);

      if (!Array.isArray(parsed)) {
        alert('Invalid format: JSON must be an array of nodes.');
        return;
      }

      this.flowService.setNodes(parsed);
      this.importText = '';

    } catch (err) {
      alert('Invalid JSON format.');
    }
  }
}