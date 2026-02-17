/**
 * SINCOTECS Hero Scene — Three.js WebGL
 * Animated 3D emblem (6 nodes + circuit traces) with starfield background
 */
import * as THREE from 'three';

const COLORS = {
    primary: 0x9333ea,
    primaryLight: 0xc084fc,
    cyan: 0x06b6d4,
    gold: 0xd4a017,
    white: 0xffffff,
    bg: 0x050510
};

export class HeroScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouse = { x: 0, y: 0 };
        this.scrollY = 0;
        this.time = 0;
        this.isDestroyed = false;
        this.reactIntensity = 0;
        this.reactColor = null;
        this.liteMode = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.init();
    }

    init() {
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(COLORS.bg, 1);

        // Scene & Camera
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        // Groups
        this.emblemGroup = new THREE.Group();
        this.scene.add(this.emblemGroup);

        this.createStarfield();
        this.createEmblem();
        this.createGlow();

        // Events
        this.onResize = this.handleResize.bind(this);
        this.onMouseMove = this.handleMouseMove.bind(this);
        this.onScroll = this.handleScroll.bind(this);

        window.addEventListener('resize', this.onResize);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('scroll', this.onScroll, { passive: true });

        this.animate();
    }

    createStarfield() {
        const count = this.liteMode ? 500 : 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const colors = new Float32Array(count * 3);

        const color1 = new THREE.Color(COLORS.primaryLight);
        const color2 = new THREE.Color(COLORS.cyan);
        const color3 = new THREE.Color(COLORS.white);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 40;
            positions[i3 + 1] = (Math.random() - 0.5) * 40;
            positions[i3 + 2] = (Math.random() - 0.5) * 40;
            sizes[i] = Math.random() * 2 + 0.5;

            const c = Math.random() > 0.7 ? (Math.random() > 0.5 ? color1 : color2) : color3;
            colors[i3] = c.r;
            colors[i3 + 1] = c.g;
            colors[i3 + 2] = c.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.03,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.starfield = new THREE.Points(geometry, material);
        this.scene.add(this.starfield);
    }

    createEmblem() {
        // 6 nodes arranged in hexagonal pattern (representing the six objectives)
        const nodePositions = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
            nodePositions.push(new THREE.Vector3(
                Math.cos(angle) * 1.5,
                Math.sin(angle) * 1.5,
                0
            ));
        }

        // Create glowing nodes
        this.nodes = [];
        const nodeGeometry = new THREE.SphereGeometry(0.08, 16, 16);

        nodePositions.forEach((pos, i) => {
            const color = i % 2 === 0 ? COLORS.primaryLight : COLORS.cyan;
            const nodeMaterial = new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.9
            });
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.position.copy(pos);
            this.emblemGroup.add(node);
            this.nodes.push(node);

            // Outer glow ring for each node
            const ringGeometry = new THREE.RingGeometry(0.12, 0.18, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.copy(pos);
            this.emblemGroup.add(ring);
        });

        // Circuit traces (lines connecting nodes)
        const lineMaterial = new THREE.LineBasicMaterial({
            color: COLORS.primary,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });

        // Connect each node to its neighbors
        for (let i = 0; i < 6; i++) {
            const next = (i + 1) % 6;
            const points = [nodePositions[i], nodePositions[next]];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.emblemGroup.add(line);
        }

        // Cross connections (star pattern)
        const crossPairs = [[0, 3], [1, 4], [2, 5]];
        const crossMaterial = new THREE.LineBasicMaterial({
            color: COLORS.cyan,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });

        crossPairs.forEach(([a, b]) => {
            const points = [nodePositions[a], nodePositions[b]];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, crossMaterial);
            this.emblemGroup.add(line);
        });

        // Center lightbulb glow
        const centerGeometry = new THREE.SphereGeometry(0.2, 32, 32);
        const centerMaterial = new THREE.MeshBasicMaterial({
            color: COLORS.gold,
            transparent: true,
            opacity: 0.6
        });
        this.centerNode = new THREE.Mesh(centerGeometry, centerMaterial);
        this.emblemGroup.add(this.centerNode);

        // Outer ring (circuit border)
        const outerRingGeometry = new THREE.RingGeometry(1.8, 1.85, 64);
        const outerRingMaterial = new THREE.MeshBasicMaterial({
            color: COLORS.primary,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        this.outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
        this.emblemGroup.add(this.outerRing);

        // Second outer ring
        const outerRing2Geometry = new THREE.RingGeometry(2.0, 2.03, 64);
        const outerRing2Material = new THREE.MeshBasicMaterial({
            color: COLORS.primaryLight,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        const outerRing2 = new THREE.Mesh(outerRing2Geometry, outerRing2Material);
        this.emblemGroup.add(outerRing2);
    }

    createGlow() {
        // Ambient nebula-like glow behind the emblem
        const glowGeometry = new THREE.PlaneGeometry(8, 8);
        const glowMaterial = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                uTime: { value: 0 },
                uColor1: { value: new THREE.Color(COLORS.primary) },
                uColor2: { value: new THREE.Color(COLORS.cyan) }
            },
            vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying vec2 vUv;
        void main() {
          vec2 center = vUv - 0.5;
          float dist = length(center);
          float glow = smoothstep(0.5, 0.0, dist);
          glow *= 0.15;
          float pulse = sin(uTime * 0.5) * 0.03 + 0.97;
          vec3 color = mix(uColor1, uColor2, sin(uTime * 0.3 + dist * 3.0) * 0.5 + 0.5);
          gl_FragColor = vec4(color * glow * pulse, glow * pulse);
        }
      `
        });
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.glow.position.z = -1;
        this.emblemGroup.add(this.glow);
    }

    handleResize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    handleMouseMove(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    handleScroll() {
        this.scrollY = window.scrollY;
    }

    animate() {
        if (this.isDestroyed) return;
        requestAnimationFrame(() => this.animate());

        this.time += 0.016;

        // Emblem rotation + mouse reactivity
        const targetRotX = this.mouse.y * 0.3;
        const targetRotY = this.mouse.x * 0.3;
        this.emblemGroup.rotation.x += (targetRotX - this.emblemGroup.rotation.x) * 0.05;
        this.emblemGroup.rotation.y += (targetRotY - this.emblemGroup.rotation.y) * 0.05;

        // Slow auto-rotation
        if (!this.liteMode) {
            this.emblemGroup.rotation.z = Math.sin(this.time * 0.2) * 0.1;
        }

        // Scroll parallax
        const scrollNorm = this.scrollY / window.innerHeight;
        this.emblemGroup.position.y = scrollNorm * 2;
        this.emblemGroup.scale.setScalar(1 - scrollNorm * 0.3);

        // Node pulse (boosted during reaction)
        const ri = this.reactIntensity;
        this.nodes.forEach((node, i) => {
            const basePulse = Math.sin(this.time * 2 + i * 1.05) * 0.02 + 1;
            const reactPulse = ri * Math.sin(this.time * 8 + i * 0.8) * 0.15;
            node.scale.setScalar(basePulse + reactPulse);

            // Flash node color during reaction
            if (ri > 0.01 && this.reactColor) {
                const origColor = i % 2 === 0 ? COLORS.primaryLight : COLORS.cyan;
                node.material.color.lerpColors(
                    new THREE.Color(origColor),
                    this.reactColor,
                    ri * 0.6
                );
            }
        });

        // Center glow pulse (amplified during reaction)
        if (this.centerNode) {
            const centerPulse = Math.sin(this.time * 1.5) * 0.15 + 1 + ri * 0.5;
            this.centerNode.scale.setScalar(centerPulse);
        }

        // Decay react intensity
        if (this.reactIntensity > 0) {
            this.reactIntensity *= 0.96;
            if (this.reactIntensity < 0.005) this.reactIntensity = 0;
        }

        // Starfield rotation (faster during reaction)
        if (this.starfield && !this.liteMode) {
            this.starfield.rotation.y += 0.0003 + ri * 0.002;
            this.starfield.rotation.x += 0.0001 + ri * 0.001;
        }

        // Glow shader time uniform
        if (this.glow && this.glow.material.uniforms) {
            this.glow.material.uniforms.uTime.value = this.time;
        }

        this.renderer.render(this.scene, this.camera);
    }

    /**
     * React to an external event (e.g. timeline selection).
     * @param {'milestone'|'batch'} eventType — determines flash color
     */
    react(eventType = 'milestone') {
        if (this.liteMode) return;

        // Set reaction color based on event type
        this.reactColor = eventType === 'milestone'
            ? new THREE.Color(COLORS.gold)
            : new THREE.Color(COLORS.cyan);

        // Start reaction intensity
        this.reactIntensity = 1;

        // Quick scale burst
        const origScale = this.emblemGroup.scale.x;
        const burst = origScale * 1.12;
        this.emblemGroup.scale.setScalar(burst);

        // Smooth scale-back over ~20 frames
        const scaleBack = () => {
            const s = this.emblemGroup.scale.x;
            const target = 1 - (this.scrollY / window.innerHeight) * 0.3;
            if (Math.abs(s - target) > 0.005) {
                this.emblemGroup.scale.setScalar(s + (target - s) * 0.08);
                requestAnimationFrame(scaleBack);
            }
        };
        requestAnimationFrame(scaleBack);

        // Rotation kick
        this.emblemGroup.rotation.z += (Math.random() - 0.5) * 0.3;
    }

    destroy() {
        this.isDestroyed = true;
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('scroll', this.onScroll);
        this.renderer.dispose();
    }
}

/** Check if WebGL is available */
export function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext &&
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

/** Create SVG/CSS fallback when WebGL is not available */
export function createFallback(container) {
    container.style.display = 'block';
    container.innerHTML = `
    <svg viewBox="0 0 400 400" class="fallback-emblem" aria-hidden="true">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#9333ea" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#9333ea" stop-opacity="0" />
        </radialGradient>
        <filter id="blur">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <circle cx="200" cy="200" r="180" fill="url(#glow)" class="fallback-glow" />
      <circle cx="200" cy="200" r="140" fill="none" stroke="#9333ea" stroke-width="1.5" opacity="0.3" class="fallback-ring" />
      <circle cx="200" cy="200" r="155" fill="none" stroke="#c084fc" stroke-width="0.5" opacity="0.15" />
      ${[0, 1, 2, 3, 4, 5].map(i => {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const x = 200 + Math.cos(angle) * 110;
        const y = 200 + Math.sin(angle) * 110;
        const color = i % 2 === 0 ? '#c084fc' : '#06b6d4';
        return `<circle cx="${x}" cy="${y}" r="6" fill="${color}" opacity="0.8" class="fallback-node" style="animation-delay:${i * 0.2}s" />`;
    }).join('')}
      ${[0, 1, 2, 3, 4, 5].map(i => {
        const a1 = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 1) / 6) * Math.PI * 2 - Math.PI / 2;
        return `<line x1="${200 + Math.cos(a1) * 110}" y1="${200 + Math.sin(a1) * 110}" x2="${200 + Math.cos(a2) * 110}" y2="${200 + Math.sin(a2) * 110}" stroke="#9333ea" stroke-width="1" opacity="0.3" />`;
    }).join('')}
      <circle cx="200" cy="200" r="15" fill="#d4a017" opacity="0.6" class="fallback-center" />
    </svg>
  `;
}
