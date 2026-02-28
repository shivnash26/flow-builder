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
    <div class="app-layout">

      <div class="canvas-area">
        <app-canvas></app-canvas>
      </div>

      <div class="sidebar-area">
        <app-node-sidebar></app-node-sidebar>
      </div>

      <div class="json-area">
        <app-json-preview></app-json-preview>
      </div>

    </div>
  `,
  styleUrl: './app.scss'
})
export class App {}