/**
 * SINCOTECS — Officers Directory Section
 * Loads officers from JSON, renders grid with batch selector, handles modal
 */
import officerData from '../data/officers.json';
import gsap from 'gsap';
import { EASE, DUR, prefersReducedMotion } from '../gsap/motion-system.js';

let currentBatch = '2025-2026';

/** Get unique batch list */
function getBatches() {
    const set = new Set(officerData.officers.map(o => o.batch));
    return [...set].sort().reverse();
}

/** Get officers for a batch */
function getOfficersForBatch(batch) {
    return officerData.officers
        .filter(o => o.batch === batch)
        .sort((a, b) => a.order_index - b.order_index);
}

/** Render batch selector buttons */
function renderBatchSelector() {
    const container = document.querySelector('.batch-selector');
    if (!container) return;

    const batches = getBatches();
    container.innerHTML = batches.map(b => `
    <button class="batch-btn ${b === currentBatch ? 'active' : ''}"
            role="tab"
            aria-selected="${b === currentBatch}"
            data-batch="${b}">
      Batch ${b}
    </button>
  `).join('');

    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.batch-btn');
        if (!btn) return;
        currentBatch = btn.dataset.batch;
        container.querySelectorAll('.batch-btn').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        renderOfficerCards();
    });
}

/** Render officer cards for current batch */
function renderOfficerCards() {
    const grid = document.getElementById('officers-grid');
    if (!grid) return;

    const officers = getOfficersForBatch(currentBatch);

    grid.innerHTML = officers.map(officer => {
        const photoUrl = officer.photo
            ? (officer.photo.startsWith('http') ? officer.photo : `${import.meta.env.BASE_URL}${officer.photo}`)
            : null;

        return `
    <article class="officer-card"
             role="listitem"
             tabindex="0"
             data-officer-id="${officer.id}"
             aria-label="${officer.name}, ${officer.position}">
      <div class="officer-photo">
        ${photoUrl
                ? `<img src="${photoUrl}" alt="Photo of ${officer.name}" loading="lazy" />`
                : `<span class="officer-photo-placeholder" aria-hidden="true">👤</span>`
            }
        <div class="officer-overlay">
          <!-- Hover effect on photo only (zoom) -->
        </div>
      </div>
      <div class="officer-info">
        <div class="officer-role-label">${officer.position}</div>
        <div class="officer-name-label">${officer.name}</div>
      </div>
    </article>
  `;
    }).join('');

    // Grid entrance animation
    if (!prefersReducedMotion) {
        const cards = grid.querySelectorAll('.officer-card');
        gsap.set(cards, { opacity: 0, y: 30, scale: 0.95 });
        gsap.to(cards, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: DUR.normal,
            stagger: {
                each: 0.05,
                grid: 'auto',
                from: 'start'
            },
            ease: EASE.out,
            clearProps: 'transform' // Clear after animation for hover effects
        });
    }

    // Attach click handlers
    grid.querySelectorAll('.officer-card').forEach(card => {
        card.addEventListener('click', () => openOfficerModal(card.dataset.officerId));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openOfficerModal(card.dataset.officerId);
            }
        });

        // 3D tilt effect on mouse move
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `translateY(-6px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

/** Open officer detail modal */
function openOfficerModal(officerId) {
    const officer = officerData.officers.find(o => o.id === officerId);
    if (!officer) return;

    const modal = document.getElementById('officer-modal');
    const modalContent = modal.querySelector('.modal-officer');

    // Parse duties from full_description (assuming sentences ending in .)
    const duties = officer.full_description
        ? officer.full_description.match(/[^.!?]+[.!?]+/g) || [officer.full_description]
        : [];

    const dutiesHtml = duties.map(duty => `
        <li class="duty-item">
            <span class="duty-icon">❖</span>
            <span class="duty-text">${duty.trim()}</span>
        </li>
    `).join('');

    const photoUrl = officer.photo
        ? (officer.photo.startsWith('http') ? officer.photo : `${import.meta.env.BASE_URL}${officer.photo}`)
        : '';

    // Construct new Rich HTML
    const newHtml = `
        <!-- Left Sidebar / Photo -->
        <aside class="modal-sidebar">
            <div class="modal-officer-photo">
                <img src="${photoUrl}" alt="Photo of ${officer.name}" 
                     style="width:100%; height:auto; display:block; object-fit:contain;">
            </div>
            <div class="tech-stat-grid">
                <div class="tech-stat-item">
                    <span class="tech-stat-label">Batch</span>
                    <span class="tech-stat-value">${officer.batch}</span>
                </div>
                <div class="tech-stat-item">
                    <span class="tech-stat-label">Status</span>
                    <span class="tech-stat-value" style="color:#10b981">ACTIVE</span>
                </div>
            </div>
        </aside>

        <!-- Right Content -->
        <div class="modal-content-area">
            <div class="modal-header-section">
                <h2 class="modal-officer-name">${officer.name}</h2>
                <div class="modal-officer-role-badge">
                    <span>${officer.position.toUpperCase()}</span>
                </div>
            </div>

            <!-- Quote / Short Desc -->
            <div class="tech-screen">
                <div class="tech-screen-header">
                    <span>Mission Profile</span>
                    <span>// OVERVIEW</span>
                </div>
                <div class="tech-screen-body">
                    <p class="officer-quote">${officer.short_description || "Mission parameters restricted: Profile unavailable or classified."}</p>
                </div>
            </div>

            <!-- Protocols / Duties -->
            <div class="tech-screen">
                <div class="tech-screen-header">
                    <span>Protocols & Duties</span>
                    <span>// EXECUTE</span>
                </div>
                <div class="tech-screen-body">
                    <ul class="duties-list">
                        ${dutiesHtml}
                    </ul>
                </div>
            </div>
        </div>
    `;

    modalContent.innerHTML = newHtml;

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus trap
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
}

/** Close modal */
function closeOfficerModal() {
    const modal = document.getElementById('officer-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/** Init modal close handlers */
function initModalHandlers() {
    const modal = document.getElementById('officer-modal');
    const closeBtn = modal.querySelector('.modal-close');

    closeBtn.addEventListener('click', closeOfficerModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeOfficerModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeOfficerModal();
        }
    });
}

/** Initialize Officers Section */
export function initOfficers() {
    renderBatchSelector();
    renderOfficerCards();
    initModalHandlers();
}
