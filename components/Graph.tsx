'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Post } from '@/lib/mdx';

interface Node extends Post {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Link {
  source: number; // index of source node
  target: number; // index of target node
  strength: number;
  tags: string[]; // Shared tags causing this link
}

const stringToColor = (str: string, isDark: boolean) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return isDark 
    ? `hsl(${hue}, 40%, 60%)` // Reduced saturation for minimal look
    : `hsl(${hue}, 40%, 40%)`; 
};

export default function Graph({ posts }: { posts: Post[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const linksRef = useRef<Link[]>([]);
  const requestRef = useRef<number>(0);
  // Cache DOM elements to avoid getElementById and React reconciliation issues
  const nodeElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const linkElementsRef = useRef<(SVGPathElement | null)[][]>([]);

  const { theme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const isHome = pathname === '/';
  
  const [mounted, setMounted] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const hoveredNodeRef = useRef<number | null>(null);

  useEffect(() => {
    hoveredNodeRef.current = hoveredNode;
  }, [hoveredNode]);

  useEffect(() => {
    if (!posts.length || mounted) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    nodesRef.current = posts.map((post) => ({
      ...post,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      radius: 40 + Math.random() * 20,
    }));

    const links: Link[] = [];
    for (let i = 0; i < posts.length; i++) {
      for (let j = i + 1; j < posts.length; j++) {
        const tagsA = posts[i].frontmatter.tags || [];
        const tagsB = posts[j].frontmatter.tags || [];
        const sharedTags = tagsA.filter(t => tagsB.includes(t));
        
        if (sharedTags.length > 0) {
          links.push({ 
              source: i, 
              target: j, 
              strength: sharedTags.length,
              tags: sharedTags 
            });
        }
      }
    }
    linksRef.current = links;
    // Initialize refs arrays
    nodeElementsRef.current = new Array(nodesRef.current.length).fill(null);
    linkElementsRef.current = new Array(links.length).fill(null);
    
    setMounted(true);
  }, [posts, mounted]);

  useEffect(() => {
    if (!mounted) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const friction = 0.80;
    const repulsionStrength = 1000;
    const springLength = 150;
    const springStrength = 0.005;
    const centerStrength = 0.001;
    const mouseRepulsionRadius = 100;
    const mouseRepulsionForce = 0;

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const animate = () => {
      const nodes = nodesRef.current;
      const links = linksRef.current;
      const hoveredIdx = hoveredNodeRef.current;

      // 1. Forces
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];

        if (i === hoveredIdx) {
            nodeA.vx = 0;
            nodeA.vy = 0;
            continue;
        }

        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const nodeB = nodes[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > 0 && distSq < 100000) {
            const dist = Math.sqrt(distSq);
            const force = repulsionStrength / (distSq + 1);
            nodeA.vx += (dx / dist) * force;
            nodeA.vy += (dy / dist) * force;
          }
        }

        const dxM = nodeA.x - mouseX;
        const dyM = nodeA.y - mouseY;
        const distM = Math.sqrt(dxM * dxM + dyM * dyM);
        if (distM < mouseRepulsionRadius) {
          const force = (1 - distM / mouseRepulsionRadius) * mouseRepulsionForce;
          nodeA.vx += (dxM / distM) * force;
          nodeA.vy += (dyM / distM) * force;
        }

        nodeA.vx += (width / 2 - nodeA.x) * centerStrength;
        nodeA.vy += (height / 2 - nodeA.y) * centerStrength;
      }

      links.forEach(link => {
        const nodeA = nodes[link.source];
        const nodeB = nodes[link.target];
        
        if (link.source === hoveredIdx || link.target === hoveredIdx) return;

        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist === 0) return;

        const force = (dist - springLength) * springStrength * link.strength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        nodeA.vx += fx;
        nodeA.vy += fy;
        nodeB.vx -= fx;
        nodeB.vy -= fy;
      });

      // 2. Update Positions & DOM
      nodes.forEach((node, i) => {
        if (i !== hoveredIdx) {
            node.vx *= friction;
            node.vy *= friction;
            node.x += node.vx;
            node.y += node.vy;

            if (node.x < 0) node.vx += 1;
            if (node.x > width) node.vx -= 1;
            if (node.y < 0) node.vy += 1;
            if (node.y > height) node.vy -= 1;
        }

        // Optimized DOM update via cached refs
        const el = nodeElementsRef.current[i];
        if (el) {
          el.style.transform = `translate3d(${node.x - node.radius}px, ${node.y - node.radius}px, 0)`;
        }
      });

      // Update Links
      links.forEach((link, i) => {
        const nodeA = nodes[link.source];
        const nodeB = nodes[link.target];
        const midX = (nodeA.x + nodeB.x) / 2;
        const midY = (nodeA.y + nodeB.y) / 2;

        link.tags.forEach((tag, tagIndex) => {
            const el = document.getElementById(`link-${i}-${tagIndex}`);
            if (el) {
                const dx = nodeB.x - nodeA.x;
                const dy = nodeB.y - nodeA.y;
                const offset = (tagIndex - (link.tags.length - 1) / 2) * 20; 
                const len = Math.sqrt(dx*dx + dy*dy) || 1;
                const cpX = midX + (-dy / len) * offset;
                const cpY = midY + (dx / len) * offset;

                el.setAttribute('d', `M${nodeA.x},${nodeA.y} Q${cpX},${cpY} ${nodeB.x},${nodeB.y}`);
            }
        });
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [mounted]);

  const isDark = (theme === 'system' ? resolvedTheme : theme) === 'dark';

  if (!mounted) return null;

  return (
    <div 
        ref={containerRef} 
        className={`fixed inset-0 z-0 overflow-hidden bg-[#fdfbf7] dark:bg-[#0a0a0a] transition-all duration-1000 ${
            isHome ? 'opacity-100' : 'opacity-20 pointer-events-none blur-[2px]'
        }`}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {linksRef.current.map((link, i) => (
            link.tags.map((tag, tagIndex) => (
                <path
                    key={`${i}-${tagIndex}`}
                    id={`link-${i}-${tagIndex}`}
                    fill="none"
                    stroke={stringToColor(tag, isDark)}
                    strokeWidth={1.5}
                    strokeOpacity={0.4}
                />
            ))
        ))}
      </svg>

      {nodesRef.current.map((node, i) => {
        const isHovered = hoveredNode === i;
        const isFocusMode = hoveredNode !== null;
        const isDimmed = isFocusMode && !isHovered;

        return (
        <div
            key={node.slug}
            ref={el => { nodeElementsRef.current[i] = el; }} 
            onMouseEnter={() => setHoveredNode(i)}
            onMouseLeave={() => setHoveredNode(null)}
            className="absolute rounded-full shadow-sm hover:shadow-xl hover:z-50 cursor-pointer group will-change-transform"
            style={{ 
                width: node.radius * 2, 
                height: node.radius * 2,
                left: 0,
                top: 0,
                transition: 'box-shadow 0.3s' 
            }}
        >
          <Link 
            href={`/posts/${node.slug}`}
            className={`flex items-center justify-center w-full h-full rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white transition-all duration-300 ease-out ${
                isHovered ? 'scale-150 z-50' : ''
            } ${
                isDimmed ? 'scale-50 opacity-40 grayscale' : 'scale-100'
            }`}
          >
              <div className={`text-center p-2 overflow-hidden transition-opacity duration-300 ${isDimmed ? 'opacity-0' : 'opacity-100'}`}>
                  <span className="font-sans font-bold text-xs md:text-sm text-gray-900 dark:text-gray-100 line-clamp-3 group-hover:line-clamp-none">
                      {node.frontmatter.title}
                  </span>
                  {node.frontmatter.tags && (
                    <div className="hidden group-hover:flex flex-wrap justify-center gap-1 mt-1">
                      {node.frontmatter.tags.slice(0, 2).map(t => (
                        <span key={t} 
                              style={{ backgroundColor: stringToColor(t, isDark), color: '#fff' }}
                              className="text-[10px] px-1 rounded opacity-80">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
          </Link>
        </div>
      );
      })}
      
      {/* Empty State */}
      {nodesRef.current.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              No thoughts planted yet.
          </div>
      )}
    </div>
  );
}