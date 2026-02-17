/**
 * SINCOTECS — Enhanced Event Timeline Section
 * Vertical timeline with alternating cards, scroll-triggered reveal,
 * animated connector lines, and Three.js hero reaction.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, prefersReducedMotion } from '../gsap/motion-system.js';

gsap.registerPlugin(ScrollTrigger);

const EVENTS = [
    {
        id: 'est-2016',
        date: '2016',
        title: 'SINCOTECS Founded',
        description: 'The Society of Information & Communications Technology Students was established at Davao Central College to serve the BSIT program and represent its students in the college\'s student government.',
        type: 'milestone',
        icon: '🏛️',
        tags: ['Foundation', 'ITE']
    },
    {
        id: 'growth-2018',
        date: '2018',
        title: 'Membership Growth',
        description: 'SINCOTECS expanded its influence with growing enrollment in the BSIT program, establishing regular events and engaging students through technology-focused activities.',
        type: 'milestone',
        icon: '📈',
        tags: ['Growth', 'Membership']
    },
    {
        id: 'cbl-2023',
        date: '2023',
        title: 'Constitution & By-Laws Ratified',
        description: 'The CBL was formally ratified, establishing the organizational structure with defined officer duties, governance framework, and committee system — including Governor, Vice Governor, Secretary, Treasurer, Auditor, and P.R.O.',
        type: 'milestone',
        icon: '📜',
        tags: ['CBL', 'Governance']
    },
    {
        id: 'cssg-cbl',
        date: '2023',
        title: 'DCC-CSSG CBL Updated',
        description: 'The Davao Central College Supreme Student Government updated its Constitution and By-Laws, strengthening the role of local councils like SINCOTECS within the broader student governance ecosystem.',
        type: 'milestone',
        icon: '⚖️',
        tags: ['DCC-CSSG', 'Policy']
    },
    {
        id: 'batch-2023',
        date: '2023–2024',
        title: 'First Batch Under Revised CBL',
        description: 'Led by Governor Mark Lawrence Narisma with 12 officers, the founding batch established organizational foundations, launched committee operations, and set precedents for future administrations.',
        type: 'batch',
        icon: '👥',
        tags: ['Batch 2023-24', 'Leadership']
    },
    {
        id: 'committees',
        date: '2024',
        title: 'Committee System Formalized',
        description: 'Standing and special committees were formalized: Ways & Means, Logistics, Working Head, Discipline & Policies, Student Grievance, and Adhoc — each with clearly defined mandates from the CBL.',
        type: 'milestone',
        icon: '🏗️',
        tags: ['Committees', 'Structure']
    },
    {
        id: 'batch-2025',
        date: '2025–2026',
        title: 'Current Batch Officers',
        description: 'The current administration with 14 officers — now including 2nd and 3rd Year Representatives — continues the mission of SINCOTECS under Governor Cristian Silagan, with all executive and committee positions filled.',
        type: 'batch',
        icon: '🚀',
        tags: ['Batch 2025-26', 'Current']
    }
];

let selectedEvent = EVENTS[EVENTS.length - 1];

function renderTimeline() {
    const container = document.getElementById('timeline-track');
    if (!container) return;

    // Build vertical timeline
    container.innerHTML = `
    <div class="timeline-vertical">
      <div class="timeline-spine" aria-hidden="true"></div>
      <div class="timeline-spine-fill" aria-hidden="true"></div>
      ${EVENTS.map((evt, i) => `
        <div class="timeline-node ${evt.id === selectedEvent.id ? 'active' : ''} ${i % 2 === 0 ? 'left' : 'right'}"
             data-event-id="${evt.id}"
             tabindex="0"
             role="button"
             aria-label="${evt.title}, ${evt.date}">
          <div class="timeline-dot ${evt.type}" aria-hidden="true">
            <span class="timeline-dot-icon">${evt.icon}</span>
          </div>
          <div class="timeline-card card">
            <div class="timeline-card-header">
              <span class="timeline-date">${evt.date}</span>
              <span class="timeline-type-badge ${evt.type}">
                ${evt.type === 'batch' ? 'Batch' : 'Milestone'}
              </span>
            </div>
            <h4 class="timeline-card-title">${evt.title}</h4>
            <p class="timeline-card-desc">${evt.description}</p>
            <div class="timeline-tags">
              ${evt.tags.map(t => `<span class="timeline-tag">${t}</span>`).join('')}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

    // Attach click & keyboard handlers
    container.querySelectorAll('.timeline-node').forEach(node => {
        node.addEventListener('click', () => selectEvent(node.dataset.eventId));
        node.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectEvent(node.dataset.eventId);
            }
        });
    });

    // Scroll-triggered progressive reveal
    if (!prefersReducedMotion) {
        initTimelineAnimations();
    }
}

function initTimelineAnimations() {
    const nodes = document.querySelectorAll('.timeline-node');
    const spineFill = document.querySelector('.timeline-spine-fill');

    // Animate spine fill on scroll
    if (spineFill) {
        gsap.fromTo(spineFill,
            { scaleY: 0 },
            {
                scaleY: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.timeline-vertical',
                    start: 'top 70%',
                    end: 'bottom 30%',
                    scrub: 0.5
                }
            }
        );
    }

    // Stagger-reveal each timeline node
    nodes.forEach((node, i) => {
        const isLeft = node.classList.contains('left');
        const card = node.querySelector('.timeline-card');
        const dot = node.querySelector('.timeline-dot');

        // Dot entrance
        gsap.set(dot, { scale: 0, opacity: 0 });
        gsap.to(dot, {
            scale: 1,
            opacity: 1,
            duration: DUR.normal,
            ease: EASE.spring,
            scrollTrigger: {
                trigger: node,
                start: 'top 80%',
                once: true
            }
        });

        // Card slide-in from alternating sides
        gsap.set(card, {
            x: isLeft ? -60 : 60,
            opacity: 0,
            rotateY: isLeft ? 8 : -8
        });
        gsap.to(card, {
            x: 0,
            opacity: 1,
            rotateY: 0,
            duration: DUR.slow,
            ease: EASE.out,
            delay: 0.15,
            scrollTrigger: {
                trigger: node,
                start: 'top 80%',
                once: true
            }
        });
    });
}

function selectEvent(eventId) {
    const evt = EVENTS.find(e => e.id === eventId);
    if (!evt) return;
    selectedEvent = evt;

    // Trigger Three.js hero reaction
    if (window.__heroScene && typeof window.__heroScene.react === 'function') {
        window.__heroScene.react(evt.type);
    }

    // Update active states with animation
    document.querySelectorAll('.timeline-node').forEach(el => {
        const isActive = el.dataset.eventId === eventId;
        el.classList.toggle('active', isActive);

        if (isActive && !prefersReducedMotion) {
            const card = el.querySelector('.timeline-card');
            const dot = el.querySelector('.timeline-dot');

            // Pulse the dot
            gsap.fromTo(dot,
                { scale: 1.3 },
                { scale: 1, duration: DUR.normal, ease: EASE.elastic }
            );

            // Subtle card lift
            gsap.fromTo(card,
                { y: -4 },
                { y: 0, duration: DUR.slow, ease: EASE.out }
            );
        }
    });
}

export function initTimeline() {
    renderTimeline();
}
