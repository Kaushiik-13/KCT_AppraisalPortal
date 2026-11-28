'use client';

import { memo, useEffect, useMemo } from 'react';
import { Graph, layout } from '@dagrejs/dagre';
import {
  Background,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Calculator, CircleAlert, CircleCheck, Flag, GitBranch, Maximize2, Minus, Play, Plus, Split, UserCheck } from 'lucide-react';
import type { KpiContent, WfNode, Workflow } from '@/lib/frameworks/types';
import { reachable, routeLabel, routesOf, summaryOf, TOOL_NAME, type StepIssue } from '@/lib/frameworks/workflow';
import { cn } from '@/lib/utils';

const STEP_W = 264;
const STEP_H = 96;
const SLOT = 28;

/** A place a new step can go: the route `route` out of step `parentId`. */
export type Slot = { parentId: string; route: string };

type StepData = {
  node: WfNode;
  summary: string;
  issue?: StepIssue;
  selected: boolean;
  /** In a test run: on the path taken, or not. Undefined when no run is shown. */
  onPath?: boolean;
  onSelect: (id: string) => void;
};
type SlotData = { slot: Slot; label: string; onAdd: (slot: Slot) => void; active: boolean };
type AddEdgeData = { slot: Slot; label: string; onAdd?: (slot: Slot) => void; onPath?: boolean; active: boolean };

const KIND_META: Record<WfNode['kind'], { label: string; Icon: typeof Play }> = {
  trigger: { label: 'Trigger', Icon: Play },
  action: { label: 'Action', Icon: Calculator },
  condition: { label: 'Condition', Icon: GitBranch },
  split: { label: 'Split by role', Icon: Split },
  review: { label: 'Human review', Icon: UserCheck },
  result: { label: 'Result', Icon: Flag },
};

const hidden = '!size-px !min-w-0 !border-0 !bg-transparent';

const StepNode = memo(function StepNode({ data }: NodeProps<Node<StepData, 'step'>>) {
  const { node, summary, issue, selected, onPath, onSelect } = data;
  const meta = KIND_META[node.kind];
  const overline = node.kind === 'action' && node.tool ? `Action · ${TOOL_NAME[node.tool]}` : meta.label;
  return (
    // React Flow turns off pointer events on nodes that are not draggable or selectable; the step stays clickable.
    <div className={cn('nopan pointer-events-auto transition-opacity', onPath === false && 'opacity-40')} style={{ width: STEP_W }}>
      {node.kind !== 'trigger' && <Handle type="target" position={Position.Top} isConnectable={false} className={hidden} />}
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        aria-pressed={selected}
        aria-label={`${overline}: ${node.name}. ${summary}${issue ? `. Needs attention: ${issue.text}` : ''}`}
        className={cn(
          'bg-card grid w-full gap-1 rounded-xl border px-3.5 py-3 text-left shadow-xs transition-[border-color,box-shadow] outline-none',
          'hover:border-foreground/30 focus-visible:ring-ring/50 focus-visible:ring-2',
          selected && 'border-foreground ring-foreground/10 ring-4',
          onPath && 'border-foreground',
        )}
        style={{ minHeight: STEP_H }}
      >
        <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase">
          <meta.Icon className="size-3.5" aria-hidden />
          {overline}
        </span>
        <span className="truncate text-sm font-semibold">{node.name || 'Untitled step'}</span>
        <span className="text-muted-foreground truncate text-xs">{summary}</span>
        <span className={cn('mt-0.5 flex items-center gap-1 text-[11px]', issue ? (issue.blocking ? 'text-warning' : 'text-muted-foreground') : 'text-muted-foreground')}>
          {issue ? <CircleAlert className="size-3" aria-hidden /> : <CircleCheck className="size-3" aria-hidden />}
          <span className="truncate">{issue ? issue.text : 'Ready'}</span>
        </span>
      </button>
      {routesOf(node).length > 0 && <Handle type="source" position={Position.Bottom} isConnectable={false} className={hidden} />}
    </div>
  );
});

const SlotNode = memo(function SlotNode({ data }: NodeProps<Node<SlotData, 'slot'>>) {
  return (
    <div className="nopan pointer-events-auto" style={{ width: SLOT }}>
      <Handle type="target" position={Position.Top} isConnectable={false} className={hidden} />
      <button
        type="button"
        onClick={() => data.onAdd(data.slot)}
        aria-label={`Add a step${data.label ? ` on ${data.label}` : ''}`}
        className={cn(
          'bg-card text-muted-foreground hover:text-foreground hover:border-foreground grid place-items-center rounded-full border border-dashed transition-colors',
          data.active && 'border-foreground text-foreground border-solid',
        )}
        style={{ width: SLOT, height: SLOT }}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
});

function AddEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps<Edge<AddEdgeData, 'add'>>) {
  const d = data!;
  // Branch edges turn sideways just under the source, so each branch gets its own vertical run into its target.
  // The label (and +) sit on that run, where they can never overlap another branch's label.
  const branch = !!d.label;
  const [path, midX, midY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 10,
    ...(branch ? { centerY: sourceY + 20 } : {}),
  });
  const labelX = branch ? targetX : midX;
  const labelY = branch ? targetY - (d.onAdd ? 30 : 18) : midY;
  const strong = d.onPath === true;
  return (
    <>
      <BaseEdge id={id} path={path} style={{ stroke: strong ? 'var(--foreground)' : 'var(--border)', strokeWidth: strong ? 2 : 1.5, opacity: d.onPath === false ? 0.4 : 1 }} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-auto absolute flex flex-col items-center gap-1"
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
        >
          {d.label && <span className="bg-card text-foreground max-w-36 truncate rounded-md border px-1.5 text-[11px] leading-5 font-medium shadow-xs">{d.label}</span>}
          {d.onAdd && (
            <button
              type="button"
              onClick={() => d.onAdd!(d.slot)}
              aria-label={`Add a step here${d.label ? ` on ${d.label}` : ''}`}
              className={cn(
                'bg-card text-muted-foreground hover:text-foreground hover:border-foreground grid size-5 place-items-center rounded-full border transition-colors',
                d.active && 'border-foreground text-foreground',
              )}
            >
              <Plus className="size-3" aria-hidden />
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = { step: StepNode, slot: SlotNode };
const edgeTypes = { add: AddEdge };

type CanvasProps = {
  content: KpiContent;
  workflow: Workflow;
  issues: StepIssue[];
  selectedId: string;
  onSelect: (id: string) => void;
  /** Leave out to hide every + (read only, or test mode). */
  onAdd?: (slot: Slot) => void;
  activeSlot?: Slot | null;
  /** Steps and routes a test run took. */
  path?: { nodes: Set<string>; routes: Set<string> } | null;
};

/** Lays the workflow out top-down with dagre, the way the PoC's tree did. */
function useLayout({ content, workflow, issues, selectedId, onSelect, onAdd, activeSlot, path }: CanvasProps) {
  return useMemo(() => {
    const reach = reachable(workflow);
    const steps = workflow.nodes.filter((n) => reach.has(n.id));
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const sameSlot = (s: Slot) => !!activeSlot && activeSlot.parentId === s.parentId && activeSlot.route === s.route;

    for (const n of steps) {
      nodes.push({
        id: n.id,
        type: 'step',
        position: { x: 0, y: 0 },
        width: STEP_W,
        height: STEP_H,
        data: {
          node: n,
          summary: summaryOf(n, content, workflow),
          issue: issues.find((i) => i.nodeId === n.id && i.blocking) ?? issues.find((i) => i.nodeId === n.id),
          selected: n.id === selectedId,
          onPath: path ? path.nodes.has(n.id) : undefined,
          onSelect,
        } satisfies StepData,
      });
      for (const route of routesOf(n)) {
        const slot = { parentId: n.id, route };
        const label = routeLabel(n, route);
        const target = n.routes[route];
        if (target) {
          edges.push({
            id: `${n.id}:${route}`,
            source: n.id,
            target,
            type: 'add',
            data: { slot, label, onAdd, onPath: path ? path.routes.has(`${n.id}:${route}`) : undefined, active: sameSlot(slot) } satisfies AddEdgeData,
          });
        } else if (onAdd) {
          const sid = `slot:${n.id}:${route}`;
          nodes.push({ id: sid, type: 'slot', position: { x: 0, y: 0 }, width: SLOT, height: SLOT, data: { slot, label, onAdd, active: sameSlot(slot) } satisfies SlotData });
          edges.push({ id: `${n.id}:${route}`, source: n.id, target: sid, type: 'add', data: { slot, label, active: false } satisfies AddEdgeData });
        }
      }
    }

    const g = new Graph();
    g.setGraph({ rankdir: 'TB', nodesep: 48, ranksep: 88, marginx: 24, marginy: 24 });
    g.setDefaultEdgeLabel(() => ({}));
    // Open slots are small, but get a wider footprint so the branch labels above them have room.
    nodes.forEach((n) => g.setNode(n.id, { width: n.type === 'slot' ? 144 : n.width!, height: n.height! }));
    edges.forEach((e) => g.setEdge(e.source, e.target));
    layout(g);
    for (const n of nodes) {
      const p = g.node(n.id);
      n.position = { x: p.x - n.width! / 2, y: p.y - n.height! / 2 };
    }
    return { nodes, edges };
  }, [content, workflow, issues, selectedId, onSelect, onAdd, activeSlot, path]);
}

function Canvas(props: CanvasProps) {
  const { nodes, edges } = useLayout(props);
  const flow = useReactFlow();
  const shape = nodes.map((n) => n.id).join('|');

  // Refit when steps are added or removed, not on every edit.
  useEffect(() => {
    const t = setTimeout(() => flow.fitView({ padding: 0.15, maxZoom: 1, duration: 250 }), 30);
    return () => clearTimeout(t);
  }, [shape, flow]);

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll
        minZoom={0.3}
        maxZoom={1.4}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
        proOptions={{ hideAttribution: true }}
        aria-label="KPI workflow"
      >
        <Background gap={20} size={1} color="var(--border)" />
      </ReactFlow>
      <div className="bg-card absolute right-3 bottom-3 flex items-center rounded-lg border shadow-xs" role="group" aria-label="Zoom">
        <button type="button" aria-label="Zoom out" onClick={() => flow.zoomOut({ duration: 150 })} className="hover:bg-muted grid size-8 place-items-center rounded-l-lg">
          <Minus className="size-4" aria-hidden />
        </button>
        <button type="button" aria-label="Zoom in" onClick={() => flow.zoomIn({ duration: 150 })} className="hover:bg-muted grid size-8 place-items-center border-x">
          <Plus className="size-4" aria-hidden />
        </button>
        <button type="button" aria-label="Fit to screen" onClick={() => flow.fitView({ padding: 0.15, maxZoom: 1, duration: 250 })} className="hover:bg-muted grid size-8 place-items-center rounded-r-lg">
          <Maximize2 className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/** Top-down workflow canvas. Steps are laid out automatically; there is no free dragging (an n8n-style canvas may come later). */
export function WorkflowCanvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}
