import { Component } from '@angular/core';
import { Canvas } from './components/canvas/canvas';
import { NodeSidebar } from './components/node-sidebar/node-sidebar';
import { JsonPreview } from './components/json-preview/json-preview';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Canvas,
    NodeSidebar,
    JsonPreview
  ],
  template: `
    <div class="layout">
      <div class="canvas">
        <app-canvas></app-canvas>
      </div>
      <div class="sidebar">
        <app-node-sidebar></app-node-sidebar>
      </div>
    </div>

    <div class="json">
      <app-json-preview></app-json-preview>
    </div>
  `,
  styleUrl: './app.scss'
})
export class App {}