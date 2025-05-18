import {ContextMapModel} from './model/map.models';
import {defaultHeight, defaultWidth} from './canvas/context-map-canvas.component';

export function applyGridLayout(map: ContextMapModel) {
  const total = map.contexts.length;
  if (total === 0) return;

  const padding = 50; // margines z każdej strony

  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);

  const usableWidth = defaultWidth - 2 * padding;
  const usableHeight = defaultHeight - 2 * padding;

  const spacingX = usableWidth / Math.max(cols - 1, 1);
  const spacingY = usableHeight / Math.max(rows - 1, 1);

  map.contexts.forEach((ctx, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    ctx.x = padding + col * spacingX;
    ctx.y = padding + row * spacingY;
  });
}
