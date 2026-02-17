/**
 * SINCOTECS — Contact Form Handler
 */

export function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const status = document.getElementById('contact-status');
    const submitBtn = document.getElementById('contact-submit');

    // Honeypot check
    const honeypot = form.querySelector('[name="website"]');
    if (honeypot && honeypot.value) {
        showStatus(status, 'success', 'Message sent successfully!');
        return;
    }

    // Gather values
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    // Validation
    if (!name || !email || !message) {
        showStatus(status, 'error', 'Please fill in all required fields.');
        return;
    }

    if (!isValidEmail(email)) {
        showStatus(status, 'error', 'Please enter a valid email address.');
        return;
    }

    if (message.length < 10) {
        showStatus(status, 'error', 'Message must be at least 10 characters.');
        return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Sending...';

    try {
        // Try to send to API endpoint (will fail gracefully if no backend)
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message, source: 'website', timestamp: new Date().toISOString() })
        });

        if (response.ok) {
            showStatus(status, 'success', 'Thank you! Your message has been sent successfully.');
            form.reset();
        } else {
            throw new Error('Server error');
        }
    } catch {
        // Fallback: store locally and show success (for demo purposes)
        const submissions = JSON.parse(localStorage.getItem('sincotecs_contacts') || '[]');
        submissions.push({ name, email, message, timestamp: new Date().toISOString() });
        localStorage.setItem('sincotecs_contacts', JSON.stringify(submissions));

        showStatus(status, 'success', 'Thank you! Your message has been received.');
        form.reset();
    }

    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Send Message';
}

function showStatus(el, type, msg) {
    el.className = `form-status ${type}`;
    el.textContent = msg;
    el.style.display = 'block';

    setTimeout(() => {
        el.style.display = 'none';
    }, 5000);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
