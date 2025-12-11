'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
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
}

export default function Graph({ posts }: { posts: Post[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const linksRef = useRef<Link[]>([]);
  const requestRef = useRef<number>(0);
  const { theme, resolvedTheme } = useTheme();
  
  // State for rendering (initial render only, subsequent updates are direct DOM manipulation)
  const [mounted, setMounted] = useState(false);

  // Initialize simulation
  useEffect(() => {
    if (!posts.length || mounted) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create Nodes
    nodesRef.current = posts.map((post) => ({
      ...post,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      radius: 40 + Math.random() * 20, // Base size + variance
    }));

    // Create Links based on shared tags
    const links: Link[] = [];
    for (let i = 0; i < posts.length; i++) {
      for (let j = i + 1; j < posts.length; j++) {
        const tagsA = posts[i].frontmatter.tags || [];
        const tagsB = posts[j].frontmatter.tags || [];
        const sharedTags = tagsA.filter(t => tagsB.includes(t));
        
        if (sharedTags.length > 0) {
          links.push({ source: i, target: j, strength: sharedTags.length });
        }
      }
    }
    linksRef.current = links;
    setMounted(true);
  }, [posts, mounted]);

  // Physics Loop
  useEffect(() => {
    if (!mounted) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Simulation params
    const friction = 0.94;
    const repulsionStrength = 5000;
    const springLength = 150;
    const springStrength = 0.005;
    const centerStrength = 0.001;
    const mouseRepulsionRadius = 300;
    const mouseRepulsionForce = 2;

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

      // 1. Forces
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];

        // Repulsion
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const nodeB = nodes[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > 0 && distSq < 100000) {
            const dist = Math.sqrt(distSq);
            const force = repulsionStrength / (distSq + 1); // +1 to avoid infinity
            nodeA.vx += (dx / dist) * force;
            nodeA.vy += (dy / dist) * force;
          }
        }

        // Mouse Repulsion
        const dxM = nodeA.x - mouseX;
        const dyM = nodeA.y - mouseY;
        const distM = Math.sqrt(dxM * dxM + dyM * dyM);
        if (distM < mouseRepulsionRadius) {
          const force = (1 - distM / mouseRepulsionRadius) * mouseRepulsionForce;
          nodeA.vx += (dxM / distM) * force;
          nodeA.vy += (dyM / distM) * force;
        }

        // Center Gravity
        nodeA.vx += (width / 2 - nodeA.x) * centerStrength;
        nodeA.vy += (height / 2 - nodeA.y) * centerStrength;
      }

      // Spring Forces
      links.forEach(link => {
        const nodeA = nodes[link.source];
        const nodeB = nodes[link.target];
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
        node.vx *= friction;
        node.vy *= friction;
        node.x += node.vx;
        node.y += node.vy;

        // Boundary Check (Soft bounce)
        if (node.x < 0) node.vx += 1;
        if (node.x > width) node.vx -= 1;
        if (node.y < 0) node.vy += 1;
        if (node.y > height) node.vy -= 1;

        // Direct DOM update for nodes
        const el = document.getElementById(`node-${i}`);
        if (el) {
          el.style.transform = `translate3d(${node.x - node.radius}px, ${node.y - node.radius}px, 0)`;
        }
      });

      // Direct DOM/SVG update for links
      links.forEach((link, i) => {
        const el = document.getElementById(`link-${i}`);
        if (el) {
          const nodeA = nodes[link.source];
          const nodeB = nodes[link.target];
          el.setAttribute('x1', String(nodeA.x));
          el.setAttribute('y1', String(nodeA.y));
          el.setAttribute('x2', String(nodeB.x));
          el.setAttribute('y2', String(nodeB.y));
        }
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

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 overflow-hidden bg-[#fdfbf7] dark:bg-[#0a0a0a] transition-colors duration-500">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {linksRef.current.map((link, i) => (
          <line
            key={i}
            id={`link-${i}`}
            className="stroke-gray-300 dark:stroke-gray-800 transition-colors duration-500"
            strokeWidth={1 + link.strength * 0.5}
          />
        ))}
      </svg>

      {nodesRef.current.map((node, i) => (
        <Link 
            key={node.slug} 
            href={`/posts/${node.slug}`}
            id={`node-${i}`}
            className="absolute flex items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:scale-110 hover:border-black dark:hover:border-white hover:z-50 transition-all duration-300 cursor-pointer group"
            style={{ 
                width: node.radius * 2, 
                height: node.radius * 2,
                // Initial position off-screen or center, updated by loop
                left: 0,
                top: 0,
            }}
        >
            <div className="text-center p-2 overflow-hidden">
                <span className="font-sans font-bold text-xs md:text-sm text-gray-900 dark:text-gray-100 line-clamp-3 group-hover:line-clamp-none transition-all">
                    {node.frontmatter.title}
                </span>
                {node.frontmatter.tags && (
                  <div className="hidden group-hover:flex flex-wrap justify-center gap-1 mt-1">
                    {node.frontmatter.tags.slice(0, 2).map(t => (
                      <span key={t} className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1 rounded">#{t}</span>
                    ))}
                  </div>
                )}
            </div>
        </Link>
      ))}
      
      {/* Empty State / Hint */}
      {nodesRef.current.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              No thoughts planted yet.
          </div>
      )}
    </div>
  );
}
