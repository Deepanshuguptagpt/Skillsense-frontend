'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ── Data ──────────────────────────────────────────────────────────────────────

interface SkillNode {
  id: string;
  label: string;
  weight: number;      // confidence score 0–1 (drives arc + size)
  source: 'github' | 'quiz' | 'resume' | 'milestone' | 'project';
  category: 'lang' | 'framework' | 'ml' | 'db' | 'tool' | 'devops';
  x: number; y: number;
  vx: number; vy: number;
}

interface Edge { a: string; b: string; }

const SOURCE_COLORS: Record<string, string> = {
  github:    '#6366f1',
  quiz:      '#8b5cf6',
  resume:    '#a78bfa',
  milestone: '#4f46e5',
  project:   '#7c3aed',
};

const CATEGORY_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  role:      { fill: 'rgba(79, 70, 229, 0.12)', stroke: '#4f46e5', text: '#312e81' }, // Indigo for roles
  lang:      { fill: 'rgba(99, 102, 241, 0.10)', stroke: '#6366f1', text: '#3730a3' },
  framework: { fill: 'rgba(139, 92, 246, 0.10)', stroke: '#8b5cf6', text: '#5b21b6' },
  ml:        { fill: 'rgba(6, 182, 212, 0.10)',  stroke: '#06b6d4', text: '#155e75' },
  db:        { fill: 'rgba(59, 130, 246, 0.10)', stroke: '#3b82f6', text: '#1e3a8a' },
  tool:      { fill: 'rgba(167, 139, 250, 0.10)', stroke: '#a78bfa', text: '#4c1d95' },
  devops:    { fill: 'rgba(16, 185, 129, 0.10)', stroke: '#10b981', text: '#064e3b' },
};

const NODES_DATA: Omit<SkillNode, 'x' | 'y' | 'vx' | 'vy'>[] = [
  // Roles
  { id: 'fs_dev',     label: 'Full-Stack Eng', weight: 1.0,  source: 'milestone', category: 'role' },
  { id: 'ml_eng',     label: 'ML Engineer',    weight: 1.0,  source: 'milestone', category: 'role' },
  { id: 'data_sci',   label: 'Data Scientist', weight: 1.0,  source: 'milestone', category: 'role' },
  // Skills
  { id: 'python',     label: 'Python',      weight: 0.85, source: 'github',    category: 'lang' },
  { id: 'react',      label: 'React',       weight: 0.78, source: 'quiz',      category: 'framework' },
  { id: 'pytorch',    label: 'PyTorch',     weight: 0.90, source: 'milestone', category: 'ml' },
  { id: 'sql',        label: 'SQL',         weight: 0.70, source: 'quiz',      category: 'db' },
  { id: 'fastapi',    label: 'FastAPI',     weight: 0.82, source: 'github',    category: 'framework' },
  { id: 'typescript', label: 'TypeScript',  weight: 0.65, source: 'resume',    category: 'lang' },
  { id: 'docker',     label: 'Docker',      weight: 0.50, source: 'resume',    category: 'devops' },
  { id: 'sklearn',    label: 'Sklearn',     weight: 0.75, source: 'project',   category: 'ml' },
  { id: 'nextjs',     label: 'Next.js',     weight: 0.72, source: 'quiz',      category: 'framework' },
  { id: 'nodejs',     label: 'Node.js',     weight: 0.80, source: 'github',    category: 'framework' },
  { id: 'aws',        label: 'AWS',         weight: 0.60, source: 'resume',    category: 'devops' },
  { id: 'kubernetes', label: 'Kubernetes',  weight: 0.55, source: 'resume',    category: 'devops' },
  { id: 'mongodb',    label: 'MongoDB',     weight: 0.68, source: 'quiz',      category: 'db' },
  { id: 'golang',     label: 'Go',          weight: 0.75, source: 'github',    category: 'lang' },
  { id: 'tensorflow', label: 'TensorFlow',  weight: 0.88, source: 'milestone', category: 'ml' },
  { id: 'vue',        label: 'Vue.js',      weight: 0.70, source: 'project',   category: 'framework' },
];

const EDGES: Edge[] = [
  // Connect Skills to Full Stack Eng
  { a: 'fs_dev', b: 'react' },
  { a: 'fs_dev', b: 'typescript' },
  { a: 'fs_dev', b: 'nextjs' },
  { a: 'fs_dev', b: 'fastapi' },
  { a: 'fs_dev', b: 'sql' },
  { a: 'fs_dev', b: 'docker' },
  { a: 'fs_dev', b: 'nodejs' },
  { a: 'fs_dev', b: 'mongodb' },
  { a: 'fs_dev', b: 'vue' },
  { a: 'fs_dev', b: 'golang' },
  // Connect Skills to ML Engineer
  { a: 'ml_eng', b: 'python' },
  { a: 'ml_eng', b: 'pytorch' },
  { a: 'ml_eng', b: 'fastapi' },
  { a: 'ml_eng', b: 'docker' },
  { a: 'ml_eng', b: 'tensorflow' },
  { a: 'ml_eng', b: 'aws' },
  { a: 'ml_eng', b: 'kubernetes' },
  // Connect Skills to Data Scientist
  { a: 'data_sci', b: 'python' },
  { a: 'data_sci', b: 'sklearn' },
  { a: 'data_sci', b: 'sql' },
  { a: 'data_sci', b: 'tensorflow' },
  // Inter-skill relations
  { a: 'python', b: 'fastapi' },
  { a: 'react', b: 'nextjs' },
  { a: 'typescript', b: 'react' },
  { a: 'nodejs', b: 'mongodb' },
  { a: 'docker', b: 'kubernetes' },
  { a: 'aws', b: 'docker' },
  { a: 'typescript', b: 'vue' },
  { a: 'golang', b: 'docker' },
  { a: 'pytorch', b: 'tensorflow' },
];

// ── Physics constants ─────────────────────────────────────────────────────────

const REPULSION   = 18000;
const ATTRACTION  = 0.012;
const DAMPING     = 0.85;
const REST_LEN    = 240;
const CENTER_PULL = 0.005;

// ── Component ─────────────────────────────────────────────────────────────────

export default function HeroSkillGraph() {
  const svgRef   = useRef<SVGSVGElement>(null);
  const rafRef   = useRef<number>(0);
  const nodesRef = useRef<SkillNode[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dims, setDims] = useState({ w: 600, h: 520 });

  // ── Init nodes with scattered positions ────────────────────────────────────
  useEffect(() => {
    const { w, h } = dims;
    const cx = w / 2, cy = h / 2;
    nodesRef.current = NODES_DATA.map((n, i) => {
      const angle = (i / NODES_DATA.length) * Math.PI * 2;
      const r = 140 + Math.random() * 80;
      return {
        ...n,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      };
    });
  }, [dims]);

  // ── Resize observer ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      setDims({ w: rect.width, h: Math.max(rect.height, 400) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Physics + render loop ──────────────────────────────────────────────────
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    function tick(time: number) {
      const nodes = nodesRef.current;
      if (!nodes.length) { rafRef.current = requestAnimationFrame(tick); return; }

      const { w, h } = dims;
      const cx = w / 2, cy = h / 2;

      // Repulsion between all pairs
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const f  = REPULSION / (d * d);
          const nx = (dx / d) * f, ny = (dy / d) * f;
          nodes[i].vx += nx; nodes[i].vy += ny;
          nodes[j].vx -= nx; nodes[j].vy -= ny;
        }
      }

      // Attraction along edges
      for (const edge of EDGES) {
        const a = nodes.find(n => n.id === edge.a);
        const b = nodes.find(n => n.id === edge.b);
        if (!a || !b) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d  = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const f  = (d - REST_LEN) * ATTRACTION;
        const nx = (dx / d) * f, ny = (dy / d) * f;
        a.vx += nx; a.vy += ny;
        b.vx -= nx; b.vy -= ny;
      }

      // Gentle center pull + continuous float + damping + clamp to bounds
      const pad = 55;
      const t = time * 0.001; // convert ms to seconds
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        // Add gentle continuous floating motion using sine waves
        n.vx += Math.sin(t * 0.8 + i) * 0.15;
        n.vy += Math.cos(t * 0.7 + i * 2) * 0.15;

        n.vx += (cx - n.x) * CENTER_PULL;
        n.vy += (cy - n.y) * CENTER_PULL;
        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.x  = Math.max(pad, Math.min(w - pad, n.x + n.vx));
        n.y  = Math.max(pad, Math.min(h - pad, n.y + n.vy));
      }

      renderFrame(nodes, svg);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims, hoveredId]);

  // ── Render frame directly into SVG DOM (no React re-render per frame) ──────
  function renderFrame(nodes: SkillNode[], svg: SVGSVGElement) {
    const edgeGroup = svg.querySelector('#sg-edges') as SVGGElement | null;
    const nodeGroup = svg.querySelector('#sg-nodes') as SVGGElement | null;
    if (!edgeGroup || !nodeGroup) return;

    const nodeMap: Record<string, SkillNode> = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });
    const hid = hoveredIdRef.current;

    // ── Edges ────────────────────────────────────────────────────────────────
    const edgeChildren = edgeGroup.children;
    EDGES.forEach((edge, i) => {
      const a = nodeMap[edge.a], b = nodeMap[edge.b];
      if (!a || !b) return;
      const isHot = hid === edge.a || hid === edge.b;
      let line = edgeChildren[i] as SVGLineElement;
      if (!line) {
        line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        edgeGroup.appendChild(line);
      }
      line.setAttribute('x1', String(a.x)); line.setAttribute('y1', String(a.y));
      line.setAttribute('x2', String(b.x)); line.setAttribute('y2', String(b.y));
      line.setAttribute('stroke',         isHot ? '#818cf8' : 'rgba(99,102,241,0.18)');
      line.setAttribute('stroke-width',   isHot ? '1.5' : '0.8');
      line.setAttribute('stroke-linecap', 'round');
    });

    // ── Nodes ────────────────────────────────────────────────────────────────
    const nodeChildren = nodeGroup.children;
    nodes.forEach((n, i) => {
      const colors  = CATEGORY_COLORS[n.category];
      const r       = 20 + n.weight * 14;           // radius 20–34
      const arcR    = r + 6;                         // weight arc radius
      const circumf = 2 * Math.PI * arcR;
      const dash    = circumf * n.weight;
      const isHov   = hid === n.id;
      const srcCol  = SOURCE_COLORS[n.source];

      let g = nodeChildren[i] as SVGGElement;
      if (!g) {
        g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.style.cursor = 'pointer';
        nodeGroup.appendChild(g);
      }
      g.setAttribute('transform', `translate(${n.x},${n.y})`);
      g.setAttribute('data-id', n.id);

      // Build children if not yet created
      if (g.children.length === 0) {
        // glow circle
        const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        glow.setAttribute('class', 'sg-glow');
        g.appendChild(glow);
        // weight arc
        const arc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        arc.setAttribute('class', 'sg-arc');
        arc.setAttribute('fill', 'none');
        arc.setAttribute('stroke-linecap', 'round');
        g.appendChild(arc);
        // main circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'sg-circle');
        g.appendChild(circle);
        // label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'sg-label');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-family', 'ui-monospace, SFMono-Regular, monospace');
        text.setAttribute('font-weight', '600');
        text.setAttribute('pointer-events', 'none');
        g.appendChild(text);
      }

      // Update attributes
      const glow   = g.querySelector('.sg-glow')   as SVGCircleElement;
      const arc    = g.querySelector('.sg-arc')    as SVGCircleElement;
      const circle = g.querySelector('.sg-circle') as SVGCircleElement;
      const label  = g.querySelector('.sg-label')  as SVGTextElement;

      // glow
      glow.setAttribute('r',    String(r + (isHov ? 18 : 11)));
      glow.setAttribute('fill', colors.stroke);
      glow.setAttribute('opacity', isHov ? '0.20' : '0.08');

      // arc (weight ring)
      arc.setAttribute('r',            String(arcR));
      arc.setAttribute('stroke',       srcCol);
      arc.setAttribute('stroke-width', isHov ? '3.5' : '2.5');
      arc.setAttribute('stroke-dasharray',  `${dash} ${circumf}`);
      arc.setAttribute('stroke-dashoffset', String(circumf * 0.25));
      arc.setAttribute('opacity', isHov ? '1' : '0.7');
      arc.setAttribute('transform', '-rotate(90)');

      // main circle
      circle.setAttribute('r',    String(r));
      circle.setAttribute('fill', isHov ? colors.stroke : colors.fill);
      circle.setAttribute('stroke', colors.stroke);
      circle.setAttribute('stroke-width', isHov ? '2' : '1.5');

      // label
      label.setAttribute('font-size', String(Math.round(9 + n.weight * 3)));
      label.setAttribute('fill', isHov ? '#fff' : colors.text);
      label.textContent = n.label;
      label.setAttribute('dy', isHov ? '-5' : '0');

    });
  }

  // Keep hovered id in ref so the RAF loop can read it without recreating
  const hoveredIdRef = useRef<string | null>(null);
  useEffect(() => { hoveredIdRef.current = hoveredId; }, [hoveredId]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const target = (e.target as Element).closest('[data-id]');
    const id = target?.getAttribute('data-id') ?? null;
    if (id !== hoveredIdRef.current) setHoveredId(id);
  }, []);

  const handleMouseLeave = useCallback(() => setHoveredId(null), []);

  return (
    <svg
      ref={svgRef}
      width={dims.w}
      height={dims.h}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#4f46e5" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <pattern id="grid-pattern" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
        </pattern>
        <mask id="grid-mask">
          <radialGradient id="mask-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <ellipse cx={dims.w / 2} cy={dims.h / 2} rx={dims.w * 0.45} ry={dims.h * 0.45} fill="url(#mask-grad)" />
        </mask>
      </defs>

      {/* Subtle dashed grid that fades out at the edges */}
      <rect width="100%" height="100%" fill="url(#grid-pattern)" mask="url(#grid-mask)" />

      {/* Background glow pulse */}
      <ellipse cx={dims.w / 2} cy={dims.h / 2} rx={dims.w * 0.45} ry={dims.h * 0.45} fill="url(#bg-glow)" />
      <g id="sg-edges" />
      <g id="sg-nodes" />
    </svg>
  );
}
