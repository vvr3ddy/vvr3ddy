'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Link {
  source: number; // index of source node
  target: number; // index of target node
}

export default function Graph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Simulation parameters
    const nodeCount = 40;
    const connectionProb = 0.15; // Probability of connecting two nodes
    const friction = 0.96;
    const repulsionStrength = 200;
    const springLength = 100;
    const springStrength = 0.05;
    const mouseRepulsionRadius = 200;
    const mouseRepulsionStrength = 0.5;

    // Initialize Nodes
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 4 + 2, // Varying sizes (2 to 6)
      });
    }

    // Initialize Links (Simple random mesh)
    const links: Link[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        // Higher probability for closer nodes initially, or just random
        if (Math.random() < connectionProb) {
          links.push({ source: i, target: j });
        }
      }
    }

    // Mouse state
    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationId: number;

    const animate = () => {
      // Theme colors
      const isDark = (theme === 'system' ? resolvedTheme : theme) === 'dark';
      // Muted colors for connected papers vibe
      const nodeFill = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';
      const linkStroke = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';

      ctx.clearRect(0, 0, width, height);

      // Physics Update
      for (let i = 0; i < nodeCount; i++) {
        const nodeA = nodes[i];

        // 1. Repulsion (Node vs Node)
        for (let j = 0; j < nodeCount; j++) {
          if (i === j) continue;
          const nodeB = nodes[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const distSq = dx * dx + dy * dy;
          // Avoid division by zero and extreme forces
          if (distSq > 0 && distSq < 40000) { 
            const dist = Math.sqrt(distSq);
            const force = repulsionStrength / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            nodeA.vx += fx;
            nodeA.vy += fy;
          }
        }

        // 2. Mouse Repulsion
        const dx = nodeA.x - mouseX;
        const dy = nodeA.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRepulsionRadius) {
           const force = (1 - dist / mouseRepulsionRadius) * mouseRepulsionStrength;
           nodeA.vx += (dx / dist) * force * 10; // Stronger push
           nodeA.vy += (dy / dist) * force * 10;
        }

        // 3. Center Gravity (keep them on screen)
        const centerX = width / 2;
        const centerY = height / 2;
        nodeA.vx += (centerX - nodeA.x) * 0.0005;
        nodeA.vy += (centerY - nodeA.y) * 0.0005;
      }

      // 4. Spring Forces (Links)
      links.forEach(link => {
        const nodeA = nodes[link.source];
        const nodeB = nodes[link.target];
        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist === 0) return;

        const force = (dist - springLength) * springStrength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        nodeA.vx += fx;
        nodeA.vy += fy;
        nodeB.vx -= fx;
        nodeB.vy -= fy;
      });

      // 5. Update Position & Apply Friction
      nodes.forEach(node => {
        node.vx *= friction;
        node.vy *= friction;
        node.x += node.vx;
        node.y += node.vy;

        // Draw Node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeFill;
        ctx.fill();
      });

      // Draw Links
      ctx.strokeStyle = linkStroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      links.forEach(link => {
        const nodeA = nodes[link.source];
        const nodeB = nodes[link.target];
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
      });
      ctx.stroke();

      animationId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [theme, resolvedTheme]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 -z-10 pointer-events-none transition-colors duration-500"
    />
  );
}
