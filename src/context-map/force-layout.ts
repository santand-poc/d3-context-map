import {BoundedContext, ContextMapModel} from './model/map.models';
import {forceCenter, forceLink, forceManyBody, forceSimulation, SimulationLinkDatum, SimulationNodeDatum} from 'd3';
import * as d3 from 'd3';
import {defaultHeight, defaultWidth} from './canvas/context-map-canvas.component';

export function applyForceLayout(map: ContextMapModel): void {
  const allContexts = map.contexts;
  const contextByName = Object.fromEntries(allContexts.map(ctx => [ctx.name, ctx]));

  const relatedNames = new Set<string>();
  map.relationships.forEach(rel => {
    relatedNames.add(rel.from);
    relatedNames.add(rel.to);
  });

  const connectedContexts = allContexts.filter(ctx => relatedNames.has(ctx.name));
  const disconnectedContexts = allContexts.filter(ctx => !relatedNames.has(ctx.name));

  const forceAreaWidth = defaultWidth * 0.65;
  const margin = 150; // zwiększony margines

  const defaultNodeWidth = 300;
  const defaultNodeHeight = 100;
  const avgNodeSize = (defaultNodeWidth + defaultNodeHeight) / 2;

  const nodes: (SimulationNodeDatum & { ctx: BoundedContext })[] = connectedContexts.map(ctx => ({
    x: ctx.x ?? margin + Math.random() * (forceAreaWidth - 2 * margin),
    y: ctx.y ?? margin + Math.random() * (defaultHeight - 2 * margin),
    ctx,
    name: ctx.name
  }));

  const links: SimulationLinkDatum<SimulationNodeDatum>[] = map.relationships
    .filter(rel => contextByName[rel.from] && contextByName[rel.to])
    .map(rel => ({
      source: rel.from,
      target: rel.to,
      distance: 400 // 📏 Zwiększony dystans między powiązaniami
    }));

  const simulation = forceSimulation(nodes)
    .force('charge', forceManyBody().strength(-1000)) // 🧲 Zwiększona siła odpychania
    .force('link', forceLink(links).id((d: any) => d.name).distance(360))
    .force('collision', d3.forceCollide().radius(avgNodeSize * 0.6)) // 🧱 Detekcja kolizji
    .force('center', forceCenter(forceAreaWidth / 2, defaultHeight / 2))
    .stop();

  for (let i = 0; i < 500; i++) {
    simulation.tick();
  }

  nodes.forEach(node => {
    node.ctx.x = node.x!;
    node.ctx.y = node.y!;
  });

  // Rozmieszczanie kontekstów niepowiązanych po prawej stronie
  const buffer = 320;
  const colX = forceAreaWidth + buffer;
  const startY = 0;
  const spacingY = 110;

  disconnectedContexts.forEach((ctx, i) => {
    ctx.x = colX;
    ctx.y = startY + i * spacingY;
  });
}
