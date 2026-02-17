/**
 * SINCOTECS — Accomplishments & Batch Viewer Section
 * Redesigned with Year Dialer (GSAP Draggable)
 */
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { EASE, DUR } from '../gsap/motion-system.js';

gsap.registerPlugin(Draggable);

// Data for batches/years
const BATCH_DATA = {
  '2025': {
    title: 'Batch 2025–2026',
    subtitle: 'Current Leadership',
    stats: [
      { label: 'Officers', value: '14' },
      { label: 'Committees', value: '8' },
      { label: 'Projects', value: '12+' } // Placeholder
    ],
    highlights: [
      'Full 14-officer council including Reps',
      'Implemented revised CBL mandates',
      'Launched new student engagement programs',
      'Strengthened DCC-CSSG relations'
    ]
  },
  '2023': {
    title: 'Batch 2023–2024',
    subtitle: 'The Founding Batch',
    stats: [
      { label: 'Officers', value: '12' },
      { label: 'Committees', value: '6' },
      { label: 'CBL Ratified', value: '2023' }
    ],
    highlights: [
      'Ratification of Constitution & By-Laws',
      'Established governance framework',
      'Created core committee structure',
      'Foundation for future leadership'
    ]
  },
  '2026': {
    title: 'Batch 2026–2027',
    subtitle: 'Future Leadership',
    stats: [
      { label: 'Status', value: 'Upcoming' }
    ],
    highlights: [
      'Elections scheduled for Q2 2026',
      'Transition planning in progress'
    ]
  }
};

// Range of years for the dialer
const YEARS = [2023, 2024, 2025, 2026, 2027, 2028];
const INITIAL_YEAR = 2025;
const ITEM_WIDTH = 100; // px, must match CSS

let currentYear = INITIAL_YEAR;

function renderAccomplishments() {
  const dialerList = document.getElementById('dialer-list');
  const displayContainer = document.getElementById('accomplishments-display');
  const wrapper = document.getElementById('dialer-wrapper');

  if (!dialerList || !displayContainer || !wrapper) return;

  // 1. Render Dialer Items
  dialerList.innerHTML = YEARS.map(year => `
        <li class="dialer-item ${year === currentYear ? 'active' : ''}" data-year="${year}">
            <span>${year}</span>
        </li>
    `).join('');

  // 2. Render Initial Content
  updateContent(currentYear);

  // 3. Initialize Draggable
  initDraggable(wrapper, dialerList);
}

function updateContent(year) {
  const container = document.getElementById('accomplishments-display');
  if (!container) return;

  const data = BATCH_DATA[year];

  // Fallback for empty years
  if (!data) {
    // Handle empty/past/future years without specific data
    const isFuture = year > 2025;
    container.innerHTML = `
            <div class="accomplishment-year-content active">
                <h2 class="acc-title">${year}</h2>
                <p class="acc-subtitle">${isFuture ? 'Future Batch' : 'Historical Data'}</p>
                <div class="acc-stats">
                    <div class="acc-stat-item">
                        <span class="acc-stat-val">--</span>
                        <span class="acc-stat-lbl">Records</span>
                    </div>
                </div>
            </div>
        `;
    return;
  }

  // Render Data
  const contentHTML = `
        <div class="accomplishment-year-content active">
            <h2 class="acc-title">${data.title}</h2>
            <p class="acc-subtitle">${data.subtitle}</p>
            
            <div class="acc-stats">
                ${data.stats.map(s => `
                    <div class="acc-stat-item">
                        <span class="acc-stat-val">${s.value}</span>
                        <span class="acc-stat-lbl">${s.label}</span>
                    </div>
                `).join('')}
            </div>
            
            <ul class="acc-highlights">
                ${data.highlights.map(h => `<li>${h}</li>`).join('')}
            </ul>
        </div>
    `;

  // Animate transition (simple fade/swap)
  // For now, simpler innerHTML replacement. 
  // Ideally use GSAP to fade out old, swap, fade in new.

  gsap.to(container, {
    opacity: 0,
    duration: 0.2,
    onComplete: () => {
      container.innerHTML = contentHTML;
      gsap.to(container, {
        opacity: 1,
        duration: 0.4
      });

      // Animate items staggering in
      gsap.fromTo(container.querySelectorAll('.acc-stat-item, li'),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  });
}

function initDraggable(wrapper, list) {
  // Calculate bounds/snap
  // We want the active item to be centered.
  // wrapper width (dynamic), list width (YEARS.length * ITEM_WIDTH + padding?)

  // We need to set the initial position to center the INITIAL_YEAR.
  // Index of 2025 is 2.
  // Position = (WrapperW / 2) - (ItemW / 2) - (Index * ItemW)

  const snapX = [];
  // Populate snap points if needed, or use grid

  let draggable = Draggable.create(list, {
    type: 'x',
    edgeResistance: 0.7,
    dragResistance: 0.0,
    inertia: true, // Requires InertiaPlugin? If not available, standard drag.
    // If inertia is missing, it will just drag.

    onDrag: updateActiveState,
    onThrowUpdate: updateActiveState, // If inertia exists
    onDragEnd: function () {
      snapToNearest(this);
    }
  })[0];

  // Initial Positioning
  const initialIndex = YEARS.indexOf(currentYear);
  centerOnIndex(initialIndex, wrapper, list, draggable);

  // Resize handler
  window.addEventListener('resize', () => {
    const idx = YEARS.indexOf(currentYear);
    centerOnIndex(idx, wrapper, list, draggable);
  });

  // Tap/Click on item
  list.querySelectorAll('.dialer-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      if (currentYear !== YEARS[index]) {
        currentYear = YEARS[index];
        updateContent(currentYear);
        centerOnIndex(index, wrapper, list, draggable);
        updateClasses(list, index);
      }
    });
  });
}

function centerOnIndex(index, wrapper, list, draggable) {
  if (index < 0) index = 0;
  const wrapperW = wrapper.offsetWidth;
  const itemW = ITEM_WIDTH;
  const x = (wrapperW / 2) - (itemW / 2) - (index * itemW);

  gsap.to(list, {
    x: x,
    duration: 0.5,
    ease: 'power2.out',
    onUpdate: draggable ? draggable.update : null
  });
}

function snapToNearest(draggable) {
  // Calculate nearest index based on x
  const list = draggable.target;
  const wrapper = list.parentElement;
  const wrapperW = wrapper.offsetWidth;
  const itemW = ITEM_WIDTH;

  const currentX = draggable.x; // or getComputedStyle

  // x = center - index * itemW
  // index * itemW = center - x
  // index = (center - x) / itemW

  const centerOffset = (wrapperW / 2) - (itemW / 2);
  let index = Math.round((centerOffset - currentX) / itemW);

  // Clamp index
  if (index < 0) index = 0;
  if (index >= YEARS.length) index = YEARS.length - 1;

  const year = YEARS[index];
  if (year !== currentYear) {
    currentYear = year;
    updateContent(currentYear);
    updateClasses(list, index);
  }

  centerOnIndex(index, wrapper, list, draggable);
}

function updateClasses(list, activeIndex) {
  const items = list.querySelectorAll('.dialer-item');
  items.forEach((item, i) => {
    if (i === activeIndex) item.classList.add('active');
    else item.classList.remove('active');
  });
}

function updateActiveState() {
  // Optional: Real-time highlighting during drag?
  // Can leave mostly for snapEnd to avoid flicker
}

export function initAccomplishments() {
  renderAccomplishments();
}
