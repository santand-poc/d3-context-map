import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {BoundedContext, ContextMapModel, ContextRelationship} from '../model/map.models';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {ContextDetailsModalComponent} from '../modal/context-details-modal.component';
import {ResultMap} from '../model/exported';
import {applyForceLayout} from '../force-layout';
import {applyGridLayout} from '../grid-layout';
import {applyVerticalHierarchyLayout} from '../hierarchy-layout';

export const defaultWidth = 1200;
export const defaultHeight = 800;

@Component({
  selector: 'app-context-map-canvas',
  template: `
    <div class="w-full h-full relative">

      <div class="absolute top-2 left-2 z-10 space-x-2">
        <button style="margin: 10px" (click)="exportLayout()">Eksportuj layout</button>
        <button style="margin: 10px" (click)="applyForceLayout()">Force</button>
        <button style="margin: 10px" (click)="applyGridLayout()">GRID</button>
        <button style="margin: 10px" (click)="applyHierarchyLayout()">HIERARCHY</button>
        <button style="margin: 10px" (click)="fitToView()">FIT TO VIEW</button>
        <button style="margin: 10px" (click)="toggleTags()">TAGS</button>
      </div>
      <div #container class="w-full h-full"></div>
    </div>
  `,
  styles: [':host { display: block; width: 100%; height: 100%; overflow: hidden; }'],
  standalone: true,
  imports: [MatDialogModule]
})
export class ContextMapCanvasComponent implements OnInit, AfterViewInit {
  @Input() map: ContextMapModel = ResultMap;
  @Input() width = defaultWidth;
  @Input() height = defaultHeight;
  @Input() background = '#111';

  @ViewChild('container', {static: true}) containerRef!: ElementRef;

  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private canvas!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private zoomBehavior!: d3.ZoomBehavior<SVGSVGElement, unknown>;
  filterContextNames: Set<string> = new Set();
  allowedRelationKeys: Set<string> = new Set();
  tagsVisible: boolean = true;

  constructor(private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.map.contexts.forEach(setContextDefaults);
    this.map.relationships.forEach(setRelationshipDefaults);
  }

  ngAfterViewInit(): void {
    (window as any).contextMapComponent = this;

    this.createSvg();
    if (!this.map.layoutMode || this.map.layoutMode === 'auto') {
      this.applyGridLayout();
    } else {
      this.rerender();
      this.fitToView();
    }
  }

  applyGridLayout(): void {
    applyGridLayout(this.map);
    this.rerender();
    this.fitToView();
  }

  applyForceLayout(): void {
    applyForceLayout(this.map)
    this.rerender();
    this.fitToView();
  }

  applyHierarchyLayout(): void {
    applyVerticalHierarchyLayout(this.map)
    this.rerender();
    this.fitToView();
  }

  private rerender(): void {
    this.canvas.selectAll('*').remove();
    this.renderContexts();
    this.renderRelationships();
  }

  applyContextFilter(focus: string[]): void {
    const selected = new Set<string>(focus);
    const directlyConnected = new Set<string>();
    const allowedRelations: Set<string> = new Set();

    this.map.relationships.forEach(rel => {
      if (selected.has(rel.from)) {
        directlyConnected.add(rel.to);
        allowedRelations.add(`${rel.from}→${rel.to}`);
      } else if (selected.has(rel.to)) {
        directlyConnected.add(rel.from);
        allowedRelations.add(`${rel.from}→${rel.to}`);
      }
    });

    const visibleContexts = new Set<string>([...selected, ...directlyConnected]);

    this.filterContextNames = visibleContexts;
    this.allowedRelationKeys = allowedRelations;

    this.applyVisibilityFilter();
  }


  applyVisibilityFilter(): void {
    const visibleNames = this.filterContextNames;
    const allowedRelations = this.allowedRelationKeys;


    // Filtrowanie kontekstów
    this.canvas.selectAll<SVGGElement, any>('g.context-node')
      .style('display', function (_, i, nodes) {
        const el = nodes[i] as SVGGElement;
        const name = el.getAttribute('data-name');
        return visibleNames.size === 0 || (name && visibleNames.has(name)) ? null : 'none';
      });

    // Filtrowanie relacji i terminali
    this.canvas.selectAll('line, rect.integration-terminal, text.integration-terminal')
      .style('display', (_, i, nodes) => {
        const el = nodes[i] as SVGElement;
        const from = el.getAttribute('data-from');
        const to = el.getAttribute('data-to');
        const key = `${from}→${to}`;
        if (!allowedRelations?.size) {
          return null;
        }
        return (from && to && visibleNames.has(from) && visibleNames.has(to) && allowedRelations.has(key)) ? null : 'none';
      });
  }

  clearContextFilter(): void {
    this.filterContextNames.clear();
    this.allowedRelationKeys.clear();
    this.applyVisibilityFilter();
  }

  fitToView(): void {
    const margin = 20;

    const visibleContexts = this.map.contexts.filter(ctx =>
      this.filterContextNames.size === 0 || this.filterContextNames.has(ctx.name)
    );

    if (!visibleContexts.length) return;

    const bounds = visibleContexts.reduce(
      (acc, ctx) => {
        const w = ctx.width;
        const h = ctx.height;
        acc.minX = Math.min(acc.minX, ctx.x);
        acc.minY = Math.min(acc.minY, ctx.y);
        acc.maxX = Math.max(acc.maxX, ctx.x + w);
        acc.maxY = Math.max(acc.maxY, ctx.y + h);
        return acc;
      },
      {
        minX: Number.POSITIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
      }
    );

    const bboxWidth = bounds.maxX - bounds.minX;
    const bboxHeight = bounds.maxY - bounds.minY;

    const availableWidth = this.width - 2 * margin;
    const availableHeight = this.height - 2 * margin;

    const scaleX = availableWidth / bboxWidth;
    const scaleY = availableHeight / bboxHeight;
    const scale = Math.min(scaleX, scaleY);

    const translateX = (this.width - bboxWidth * scale) / 2 - bounds.minX * scale;
    const translateY = (this.height - bboxHeight * scale) / 2 - bounds.minY * scale;

    this.svg.transition().duration(500).call(
      this.zoomBehavior.transform,
      d3.zoomIdentity.translate(translateX, translateY).scale(scale)
    );
  }

  toggleTags(): void {
    this.tagsVisible = !this.tagsVisible;
    this.rerender();
  }

  exportLayout(): void {
    const toExportMap: ContextMapModel = {...this.map, layoutMode: 'manual'};
    console.log(toExportMap);
  }

  private createSvg(): void {
    this.zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.01, 100])
      .on('zoom', (event) => {
        this.canvas.attr('transform', event.transform);
      });

    this.svg = d3.select(this.containerRef.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('background', this.background)
      .call(this.zoomBehavior);

    // dodajemy warstwę roboczą (grupa <g>)
    this.canvas = this.svg
      .call(
        d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.5, 2])
          .on('zoom', (event) => {
            this.canvas.attr('transform', event.transform); // <- canvas, nie svg!
          })
      )
      .append('g'); // ← tu tworzymy <g> do rysowania

    this.svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 40)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .attr('markerUnits', 'strokeWidth')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#00bbee');

    this.svg.on('contextmenu', (event) => {
      const target = event.target as HTMLElement;

      // Jeśli kliknięto w SVG, ale NIE na g.context-node (ani jego dziecko)
      const clickedInNode = target.closest('g.context-node');
      if (!clickedInNode) {
        event.preventDefault();
        this.clearContextFilter();
      }
    });
  }

  openContextDetailsModal(ctx: BoundedContext): void {
    this.dialog.open(ContextDetailsModalComponent, {
      data: ctx,
      width: '400px'
    });
  }


  renderContexts(): void {
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    if (!this.map?.contexts) return;

    const groups = this.canvas.selectAll('g.context-node')
      .data(this.map.contexts, (ctx: BoundedContext) => ctx.name)
      .enter()
      .append('g')
      .attr('class', 'context-node')
      .attr('data-name', d => d.name)
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('display', d =>
        this.filterContextNames.size === 0 || this.filterContextNames.has(d.name) ? null : 'none'
      )
      .call(
        d3.drag<SVGGElement, BoundedContext>()
          .on('start', function (event, d) {
            d3.select(this).raise();
            dragOffsetX = event.x - d.x;
            dragOffsetY = event.y - d.y;
          })
          .on('drag', function (event, d) {
            d.x = event.x - dragOffsetX;
            d.y = event.y - dragOffsetY;
            d3.select(this).attr('transform', `translate(${d.x}, ${d.y})`);
            const component = (window as any).contextMapComponent as ContextMapCanvasComponent;
            component?.redrawRelationships?.();
          })
      );

    groups.each((d, i, nodes) => {
      const group = d3.select(nodes[i]);
      const width = d.width;
      const height = d.height;

      switch (d.shape) {
        case 'rectangle':
          group.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', d.style.fill)
            .attr('stroke', d.style?.stroke)
            .attr('stroke-dasharray', d.style.dash)
            .attr('stroke-width', 2);
          break;
        case 'rounded':
          group.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('rx', 10)
            .attr('ry', 10)
            .attr('fill', d.style.fill)
            .attr('stroke', d.style?.stroke)
            .attr('stroke-dasharray', d.style.dash)
            .attr('stroke-width', 2);
          break;
      }

      const hasTagsAndTagsVisible = this.tagsVisible && d.domainTags && d.domainTags.length > 0

      // Nazwa Kontextu bez prefixu (CLP_Collateral -> Collateral)
      let names = (d.name || '').split('_');
      const contextName = names?.length > 0 ? names[1] : names[0];
      const contextNameY =  hasTagsAndTagsVisible ? 30 : 50;
      group.append('text')
        .text(contextName)
        .attr('x', width / 2)
        .attr('y', contextNameY)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('font-family', 'sans-serif');

      // 🏷️ Nazwa systemu (jeśli istnieje)
      if (d.details?.systemName) {
        const contextSystemNameY =  hasTagsAndTagsVisible ? 50 : 70;
        group.append('text')
          .text(d.details.systemName)
          .attr('x', width / 2)
          .attr('y', contextSystemNameY)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ccc')
          .style('font-size', '14px')
          .style('font-family', 'monospace');
      }

      // 🏷️ Tagi domenowe
      if (hasTagsAndTagsVisible) {
        const tagGroup = group.append('g').attr('class', 'context-tags');

        const paddingX = 8;
        const paddingY = 4;
        const spacingX = 6;
        const spacingY = 6;
        const fontSize = 8;
        const maxWidth = width - 10;

        let x = 5;
        let y = height - 8; // zacznij kilka px nad dolną krawędzią

        let lineHeight = 0;

        d.domainTags.forEach(tag => {
          const text = `${tag}`;
          const tmpText = tagGroup.append('text')
            .text(text)
            .style('font-size', `${fontSize}px`)
            .style('font-family', 'monospace')
            .attr('visibility', 'hidden');

          const textWidth = tmpText.node()!.getBBox().width;
          tmpText.remove();

          const tagWidth = textWidth + paddingX * 2;
          const tagHeight = fontSize + paddingY * 2;

          if (x + tagWidth > maxWidth) {
            x = 5;
            y -= (lineHeight + spacingY);
            lineHeight = 0;
          }

          // tło
          tagGroup.append('rect')
            .attr('x', x)
            .attr('y', y - tagHeight)
            .attr('width', tagWidth)
            .attr('height', tagHeight)
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('fill', '#480000')
            .attr('stroke', 'red')
            .attr('stroke-width', 1);

          // tekst
          tagGroup.append('text')
            .text(text)
            .attr('x', x + tagWidth / 2)
            .attr('y', y - tagHeight / 2 + fontSize / 2 - 1)
            .attr('text-anchor', 'middle')
            .attr('fill', 'red')
            .style('font-size', `${fontSize}px`)
            .style('font-family', 'monospace');

          x += tagWidth + spacingX;
          lineHeight = Math.max(lineHeight, tagHeight);
        });
      }



      if (d.description) {
        group.append('title').text(d.description);
      }

      group.on('contextmenu', (event) => {
        event.preventDefault();
        console.log(event)
        const isShift = event.shiftKey;
        if (isShift) {
          this.openContextDetailsModal(d);
        } else {
          this.applyContextFilter([d.name]);
        }
      });
    });
  }


  private redrawRelationships(): void {
    this.canvas.selectAll('line').remove();
    this.canvas.selectAll('rect.integration-terminal').remove();
    this.canvas.selectAll('text.integration-terminal').remove();

    this.renderRelationships();
    this.applyVisibilityFilter();
  }

  private renderRelationships(): void {
    if (!this.map?.relationships?.length) return;

    const contextByName = Object.fromEntries(this.map.contexts.map(c => [c.name, c]));

    this.map.relationships.forEach(rel => {
      const from = contextByName[rel.from];
      const to = contextByName[rel.to];
      if (!from || !to) return;

      if (
        this.filterContextNames.size &&
        (!this.filterContextNames.has(from.name) || !this.filterContextNames.has(to.name))
      ) return;

      const fontSize = 12;
      const padding = 6;
      const boxHeight = 22;

      const fromLabel = rel.fromIntegrations.join(', ');
      const toLabel = rel.toIntegrations.join(', ');

      const fromBoxWidth = fromLabel.length * (fontSize * 0.6) + padding * 2;
      const toBoxWidth = toLabel.length * (fontSize * 0.6) + padding * 2;

      const dx = to.x - from.x;
      const dy = to.y - from.y;

      // 🧠 Obliczamy punkty przecięcia z ramką
      const [fromBoxX, fromBoxY] = this.edgeIntersection(from.x, from.y, from.width, from.height, dx, dy);
      const [toBoxX, toBoxY] = this.edgeIntersection(to.x, to.y, to.width, to.height, -dx, -dy);

      const fromRectX = fromBoxX - fromBoxWidth / 2;
      const fromRectY = fromBoxY - boxHeight / 2;
      const toRectX = toBoxX - toBoxWidth / 2;
      const toRectY = toBoxY - boxHeight / 2;

      const fromCenterX = fromBoxX;
      const fromCenterY = fromBoxY;
      const toCenterX = toBoxX;
      const toCenterY = toBoxY;

      // 🔷 linia
      this.canvas.append('line')
        .attr('x1', fromCenterX)
        .attr('y1', fromCenterY)
        .attr('x2', toCenterX)
        .attr('y2', toCenterY)
        .attr('data-from', from.name)
        .attr('data-to', to.name)
        .attr('stroke', rel.style.color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', rel.style?.dash ?? null)
        .attr('marker-end', rel.style?.marker === 'arrow' ? 'url(#arrowhead)' : null);

      // 🔹 FROM terminal
      this.canvas.append('rect')
        .attr('class', 'integration-terminal')
        .attr('x', fromRectX)
        .attr('y', fromRectY)
        .attr('width', fromBoxWidth)
        .attr('height', boxHeight)
        .attr('fill', '#222')
        .attr('stroke', rel.style?.color)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('data-from', from.name)
        .attr('data-to', to.name);

      this.canvas.append('text')
        .attr('class', 'integration-terminal')
        .attr('x', fromCenterX)
        .attr('y', fromCenterY + 4)
        .attr('text-anchor', 'middle')
        .attr('fill', rel.style.color)
        .style('font-size', `${fontSize}px`)
        .style('font-family', 'monospace')
        .text(fromLabel)
        .attr('data-from', from.name)
        .attr('data-to', to.name);

      // 🔹 TO terminal
      this.canvas.append('rect')
        .attr('class', 'integration-terminal')
        .attr('x', toRectX)
        .attr('y', toRectY)
        .attr('width', toBoxWidth)
        .attr('height', boxHeight)
        .attr('fill', '#222')
        .attr('stroke', rel.style.color)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('data-from', from.name)
        .attr('data-to', to.name);

      this.canvas.append('text')
        .attr('class', 'integration-terminal')
        .attr('x', toCenterX)
        .attr('y', toCenterY + 4)
        .attr('text-anchor', 'middle')
        .attr('fill', rel.style?.color ?? '#aaa')
        .style('font-size', `${fontSize}px`)
        .style('font-family', 'monospace')
        .text(toLabel)
        .attr('data-from', from.name)
        .attr('data-to', to.name);
    });
  }

  private edgeIntersection(x: number, y: number, w: number, h: number, dx: number, dy: number): [number, number] {
    const cx = x + w / 2;
    const cy = y + h / 2;

    const m = dy / dx;

    let ix = 0, iy = 0;

    if (Math.abs(m) * w / 2 <= h / 2) {
      // przecina pionowe boki
      ix = dx >= 0 ? x + w : x;
      iy = cy + m * (ix - cx);
    } else {
      // przecina poziome boki
      iy = dy >= 0 ? y + h : y;
      ix = cx + (iy - cy) / m;
    }

    return [ix, iy];
  }


  // TODO: render contexts, relationships, domains
}

function setContextDefaults(ctx: BoundedContext) {
  if (!ctx.width) {
    ctx.width = 400;
  }
  if (!ctx.height) {
    ctx.height = 200;
  }
  if (!ctx.shape) {
    ctx.shape = "rounded";
  }
  if (!ctx.style) {
    ctx.style = {}
  }
  if (!ctx.style?.fill) {
    ctx.style.fill = '#002244'
  }
  if (!ctx.style.stroke) {
    ctx.style.stroke = '#88ccff'
  }
  if (!ctx.style.dash) {
    ctx.style.dash = null
  }
}

function setRelationshipDefaults(rel: ContextRelationship) {
  if (!rel.style) {
    rel.style = {}
  }

  if (!rel.style.marker) {
    rel.style.marker = 'arrow';
  }

  if (!rel.style.color) {
    rel.style.color = '#00bbee'
  }

  if (!rel.style.dash) {
    rel.style.dash = null
  }

  if (!rel.style.marker) {
    rel.style.marker = null
  }
}


// @formatter:off

const ExampleMap: ContextMapModel = {
  "name": "ContextMapModel",
  "domains": [],
  "contexts": [
    {"name": "CLP_CorporateCustomer",},
    {"name": "CLP_ProductRepository",},
    {"name": "CLP_ProductStandard",},
    {"name": "CLP_ProductNonStandard",},
    {"name": "CLP_ProductRelations",},
    {"name": "CLP_Collateral",},
    {"name": "CLP_CovenantsAndConditions",},
    {"name": "CLP_Reports",},
    {"name": "CLP_Profitability",},
    {"name": "CLP_Policy",},
    {"name": "DE_Profitability", "details": {"systemName": 'DE'}},
  ],
  "relationships": [
    { "to": "CLP_ProductStandard", "from": "CLP_ProductRepository", "fromIntegrations": ["U", "OSH-PL"], "toIntegrations": ["ACL"],},
    { "to": "CLP_ProductNonStandard", "from": "CLP_ProductRepository", "fromIntegrations": ["U", "OSH-PL"], "toIntegrations": ["ACL"],},
    { "to": "CLP_ProductNonStandard", "from": "CLP_ProductStandard", "fromIntegrations": ["U", "OSH-PL"], "toIntegrations": ["ACL"],},
    { "to": "CLP_ProductRelations", "from": "CLP_ProductRepository", "fromIntegrations": ["U", "CF"], "toIntegrations": ["OHS"],},

    { "to": "CLP_CovenantsAndConditions", "from": "CLP_ProductRepository", "fromIntegrations": ["U", "OSH-PL"], "toIntegrations": ["ACL"],},

    { "to": "CLP_Profitability", "from": "CLP_ProductRepository", "fromIntegrations": ["U", "OSH-PL"], "toIntegrations": ["ACL"],},
    { "to": "CLP_Profitability", "from": "CLP_Collateral", "fromIntegrations": ["U", "OSH-PL"], "toIntegrations": ["ACL"],},
    { "to": "CLP_Profitability", "from": "CLP_CovenantsAndConditions", "fromIntegrations": ["U", "OSH-PL"], "toIntegrations": ["ACL"],},
    { "to": "CLP_Profitability", "from": "CLP_ProductNonStandard", "fromIntegrations": ["U", "OSH-PL"], "toIntegrations": ["ACL"],},
    { "to": "CLP_Profitability", "from": "DE_Profitability", "fromIntegrations": ["U", "OSH-PL"], "toIntegrations": ["ACL"],},
    { "to": "CLP_Profitability", "from": "CLP_ProductRelations", "fromIntegrations": ["U", "OSH-PL"], "toIntegrations": ["ACL"],},

    { "to": "CLP_Collateral", "from": "CLP_ProductRepository", "fromIntegrations": ["U", "OSH-PL"], "toIntegrations": ["ACL"],},
  ]
}
// @formatter:on
