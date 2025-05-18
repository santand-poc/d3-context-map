import {BoundedContext, ContextMapModel} from './model/map.models';

export function applyVerticalHierarchyLayout(map: ContextMapModel): void {
  const allContexts = map.contexts;
  const contextByName = Object.fromEntries(allContexts.map(ctx => [ctx.name, ctx]));

  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();
  const graph = new Map<string, string[]>(); // from → [to]

  allContexts.forEach(ctx => {
    inDegree.set(ctx.name, 0);
    outDegree.set(ctx.name, 0);
  });

  // Budujemy graf i liczymy wejścia/wyjścia
  map.relationships.forEach(rel => {
    if (!graph.has(rel.from)) graph.set(rel.from, []);
    graph.get(rel.from)!.push(rel.to);
    inDegree.set(rel.to, (inDegree.get(rel.to) ?? 0) + 1);
    outDegree.set(rel.from, (outDegree.get(rel.from) ?? 0) + 1);
  });

  // Kolejka do topologicznego sortowania
  const queue: [string, number][] = [];
  const layerMap = new Map<string, number>();

  // Najpierw dodajemy konteksty bez żadnych powiązań (layer = -1)
  allContexts.forEach(ctx => {
    const inD = inDegree.get(ctx.name) ?? 0;
    const outD = outDegree.get(ctx.name) ?? 0;
    if (inD === 0 && outD === 0) {
      layerMap.set(ctx.name, -1);
    }
  });

  // Teraz konteksty wejściowe (upstreamy) do kolejki z layer = 0
  inDegree.forEach((deg, ctx) => {
    if (deg === 0 && !layerMap.has(ctx)) {
      queue.push([ctx, 0]);
    }
  });

  while (queue.length > 0) {
    const [current, layer] = queue.shift()!;
    layerMap.set(current, layer);

    for (const neighbor of graph.get(current) ?? []) {
      inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
      if (inDegree.get(neighbor)! === 0 && !layerMap.has(neighbor)) {
        queue.push([neighbor, layer + 1]);
      }
    }
  }

  // Grupowanie kontekstów po layer
  const layers: Record<number, BoundedContext[]> = {};
  allContexts.forEach(ctx => {
    const l = layerMap.get(ctx.name) ?? 0;
    if (!layers[l]) layers[l] = [];
    layers[l].push(ctx);
  });

  // Pozycjonowanie
  const xSpacing = 400;
  const ySpacing = 300;
  const marginX = 100;
  const marginY = 80;

  const sortedLayers = Object.keys(layers).map(Number).sort((a, b) => a - b);
  sortedLayers.forEach(layer => {
    const group = layers[layer];
    group.forEach((ctx, i) => {
      ctx.x = marginX + i * xSpacing;
      ctx.y = marginY + (layer + 1) * ySpacing; // +1 to sprawia, że layer=-1 nie zderzy się z ujemną pozycją
    });
  });
}

