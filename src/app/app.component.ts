import {Component} from '@angular/core';
import {ContextMapCanvasComponent} from '../context-map/canvas/context-map-canvas.component';

@Component({
  selector: 'app-root',
  imports: [
    ContextMapCanvasComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'context-map';
}
