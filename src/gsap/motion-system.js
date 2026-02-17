/**
 * SINCOTECS — Enhanced GSAP Motion System
 * Text splits, parallax layers, magnetic hover, scroll reveals, counter animations
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Motion Constants ──
export const EASE = {
    out: 'power3.out',
    inOut: 'power2.inOut',
    spring: 'back.out(1.4)',
    smooth: 'power1.out',
    elastic: 'elastic.out(1, 0.5)',
    expo: 'expo.out',
    circ: 'circ.out'
};

export const DUR = {
    fast: 0.25,
    normal: 0.5,
    slow: 0.8,
    slower: 1.2,
    stagger: 0.08
};

// ── Reduced Motion Check ──
export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function getAnimationProps(props) {
    if (prefersReducedMotion) {
        return { ...props, duration: 0, delay: 0 };
    }
    return props;
}

// ──────────────────────────────────────────────
//  Text Split Animation
// ──────────────────────────────────────────────
export function splitTextReveal(selector) {
    if (prefersReducedMotion) return;

    document.querySelectorAll(selector).forEach(el => {
        const text = el.textContent;
        const words = text.split(' ');
        el.innerHTML = words.map(word =>
            `<span class="word-wrap"><span class="word">${word}</span></span>`
        ).join(' ');

        gsap.set(el.querySelectorAll('.word'), { y: '110%', opacity: 0 });

        gsap.to(el.querySelectorAll('.word'), {
            y: '0%',
            opacity: 1,
            duration: DUR.slow,
            stagger: 0.04,
            ease: EASE.expo,
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                once: true
            }
        });
    });
}

// ──────────────────────────────────────────────
//  Counter Animation (for stats)
// ──────────────────────────────────────────────
export function animateCounters(selector) {
    if (prefersReducedMotion) return;

    document.querySelectorAll(selector).forEach(el => {
        const raw = el.dataset.value || el.textContent;
        const numericMatch = raw.match(/^(\d+)/);
        if (!numericMatch) return;

        const target = parseInt(numericMatch[1], 10);
        const suffix = raw.replace(/^\d+/, '');
        const obj = { val: 0 };

        gsap.to(obj, {
            val: target,
            duration: DUR.slower * 1.5,
            ease: EASE.circ,
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                once: true
            },
            onUpdate: () => {
                el.textContent = Math.round(obj.val) + suffix;
            }
        });
    });
}

// ──────────────────────────────────────────────
//  Parallax Layers
// ──────────────────────────────────────────────
export function initParallaxLayers() {
    if (prefersReducedMotion) return;

    document.querySelectorAll('[data-parallax]').forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.1;
        gsap.to(el, {
            y: () => ScrollTrigger.maxScroll(window) * speed * -0.15,
            ease: 'none',
            scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6,
                invalidateOnRefresh: true
            }
        });
    });
}

// ──────────────────────────────────────────────
//  Magnetic Hover (for buttons, links, cards)
// ──────────────────────────────────────────────
export function initMagneticHover(selector) {
    if (prefersReducedMotion) return;

    document.querySelectorAll(selector).forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(el, {
                x: x * 0.15,
                y: y * 0.15,
                duration: DUR.fast,
                ease: EASE.smooth
            });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: DUR.normal,
                ease: EASE.elastic
            });
        });
    });
}

// ──────────────────────────────────────────────
//  Reveal on Scroll (enhanced)
// ──────────────────────────────────────────────
export function revealOnScroll(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    elements.forEach((el, i) => {
        const defaults = {
            y: 40,
            opacity: 0,
            duration: DUR.slow,
            ease: EASE.out,
            delay: (options.stagger || 0) * i,
        };

        const props = getAnimationProps({ ...defaults, ...options });

        gsap.set(el, { y: props.y, x: props.x || 0, opacity: 0 });

        gsap.to(el, {
            ...props,
            y: 0,
            x: 0,
            opacity: 1,
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                once: true,
                ...options.scrollTrigger
            }
        });
    });
}

// ──────────────────────────────────────────────
//  Scale-Reveal (for images, cards with pop)
// ──────────────────────────────────────────────
export function scaleReveal(selector) {
    if (prefersReducedMotion) return;

    document.querySelectorAll(selector).forEach(el => {
        gsap.set(el, { scale: 0.85, opacity: 0 });
        gsap.to(el, {
            scale: 1,
            opacity: 1,
            duration: DUR.slow,
            ease: EASE.spring,
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                once: true
            }
        });
    });
}

// ──────────────────────────────────────────────
//  Stagger Grid Reveal (for officer cards, about cards)
// ──────────────────────────────────────────────
export function staggerGridReveal(containerSelector, itemSelector) {
    if (prefersReducedMotion) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    const items = container.querySelectorAll(itemSelector);
    if (!items.length) return;

    items.forEach(el => gsap.set(el, { y: 50, opacity: 0, scale: 0.92 }));

    ScrollTrigger.create({
        trigger: container,
        start: 'top 80%',
        once: true,
        onEnter: () => {
            gsap.to(items, {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: DUR.slow,
                stagger: {
                    each: DUR.stagger,
                    from: 'start',
                    grid: 'auto',
                    ease: EASE.smooth
                },
                ease: EASE.spring
            });
        }
    });
}

// ──────────────────────────────────────────────
//  Section Separator Line Animation
// ──────────────────────────────────────────────
export function animateSectionSeparators() {
    if (prefersReducedMotion) return;

    document.querySelectorAll('.section-label::before').forEach(el => {
        gsap.fromTo(el, { width: 0 }, {
            width: '2rem',
            duration: DUR.slow,
            ease: EASE.out,
            scrollTrigger: {
                trigger: el.parentElement,
                start: 'top 85%',
                once: true
            }
        });
    });
}

// ──────────────────────────────────────────────
//  Preloader → Hero Entrance Timeline
// ──────────────────────────────────────────────
export function createPreloaderTimeline(onComplete) {
    const tl = gsap.timeline({ onComplete });

    if (prefersReducedMotion) {
        tl.set('#preloader', { autoAlpha: 0 });
        tl.set('.hero-content', { autoAlpha: 1 });
        return tl;
    }

    // ── New Intro Zoom Timeline ──
    tl.set('.intro-text', { scale: 0.8, opacity: 0 });

    tl
        // 1. Reveal Text
        .to('.intro-text', {
            scale: 1,
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out'
        })
        // 2. Massive Zoom Through
        .to('.intro-text', {
            scale: 50,
            opacity: 0, // Fade out as it passes camera
            duration: 1.5,
            ease: 'power4.in' // Accelerate
        }, '+=0.2')
        // 3. Fade out overlay to reveal Hero
        .to('#preloader', {
            autoAlpha: 0,
            duration: 0.5,
            ease: 'none'
        }, '-=0.5')

        // ── Hero Entrance (Chained) ──
        // Hero title lines slide up with stagger
        .from('.hero-line', {
            y: 80,
            opacity: 0,
            rotationX: 15,
            duration: DUR.slower,
            stagger: DUR.stagger * 2,
            ease: EASE.expo,
        }, '-=0.2')
        // Subtitle fades up
        .from('.hero-subtitle', {
            y: 40,
            opacity: 0,
            duration: DUR.slow,
            ease: EASE.out
        }, '-=0.6')
        // CTA buttons pop in with spring
        .from('.hero-actions .btn', {
            y: 30,
            opacity: 0,
            scale: 0.8,
            duration: DUR.normal,
            stagger: 0.12,
            ease: EASE.spring
        }, '-=0.4')
        // Scroll indicator fade
        .from('.hero-scroll-indicator', {
            opacity: 0,
            y: 10,
            duration: DUR.normal,
            ease: EASE.out
        }, '-=0.2');

    return tl;
}

// ──────────────────────────────────────────────
//  Initialize All Scroll-Triggered Animations
// ──────────────────────────────────────────────
export function initScrollAnimations() {
    // Section headers — text split reveal
    splitTextReveal('.section-header h2');

    // Section descriptions — standard reveal
    revealOnScroll('.section-header p', { y: 20, duration: DUR.normal });

    // About cards — stagger grid
    staggerGridReveal('.about-grid', '.about-card');

    // Contact form and info — slide from opposite sides
    revealOnScroll('.contact-form', { x: -50, y: 0 });
    revealOnScroll('.contact-info', { x: 50, y: 0 });

    // Accomplishments — slide from sides
    revealOnScroll('#accomplishments-gallery', { x: -40, y: 0 });
    revealOnScroll('#accomplishments-details', { x: 40, y: 0 });

    // Counter animations
    animateCounters('.accomplishment-stat-value');

    // Footer — fade up
    revealOnScroll('.footer-inner', { y: 30 });

    // Magnetic hover on CTA buttons
    initMagneticHover('.btn-primary');

    // Parallax for hero, about icons
    initParallaxLayers();
}

/**
 * Nav scroll behavior
 */
export function initNavScroll() {
    ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        toggleClass: { className: 'scrolled', targets: '#main-nav' }
    });
}

/**
 * Reveal officer cards (called dynamically after render)
 */
export function revealOfficerCards() {
    staggerGridReveal('#officers-grid', '.officer-card');
}
