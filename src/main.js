/**
 * SINCOTECS — Main Application Entry Point
 * Initializes all modules: preloader, Three.js hero, GSAP animations, sections
 */
import './styles/global.css';
import './styles/sections.css';
import './styles/accomplishments_dialer.css';

import { HeroScene, isWebGLAvailable, createFallback } from './three/hero-scene.js';
import { createPreloaderTimeline, initScrollAnimations, initNavScroll } from './gsap/motion-system.js';
import { initOfficers } from './sections/officers.js';
import { initTimeline } from './sections/timeline.js';
import { initContactForm } from './sections/contact.js';
import { initAccomplishments } from './sections/accomplishments.js';
import { initNav } from './sections/nav.js';

// ── App Init ──
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize navigation
    initNav();
    initNavScroll();

    // 2. Initialize hero (Three.js or fallback)
    let heroScene = null;
    const canvas = document.getElementById('hero-canvas');
    const fallback = document.getElementById('hero-fallback');

    if (isWebGLAvailable()) {
        try {
            heroScene = new HeroScene(canvas);
            window.__heroScene = heroScene;
        } catch (e) {
            console.warn('WebGL hero failed, using fallback:', e);
            canvas.style.display = 'none';
            createFallback(fallback);
        }
    } else {
        canvas.style.display = 'none';
        createFallback(fallback);
    }

    // 3. Initialize sections
    initOfficers();
    initTimeline();
    initContactForm();
    initAccomplishments();

    // 4. Run preloader → reveal timeline
    const preloaderTl = createPreloaderTimeline(() => {
        // After preloader completes, start scroll animations
        initScrollAnimations();
    });

    // 5. Start preloader after a short delay (simulate loading)
    setTimeout(() => {
        preloaderTl.play();
    }, 800);

    // ── Lite mode toggle (for low-power devices) ──
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
        document.documentElement.classList.add('lite-mode');
    }
});
