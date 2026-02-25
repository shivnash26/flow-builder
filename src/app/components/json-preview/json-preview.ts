import { Component, OnInit } from '@angular/core';
import { Validation } from '../../core/validation';
import { CommonModule } from '@angular/common';
import { FlowService } from '../../core/flow.service.ts';

@Component({
  selector: 'app-json-preview',
  standalone: true,
  imports: [CommonModule],
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
  `]
})
export class JsonPreview implements OnInit {

  json = '';
  errors: string[] = [];

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
}