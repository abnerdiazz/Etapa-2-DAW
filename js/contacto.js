import { iniciarNavbar } from './saborexpress-data.js';

// Envío del formulario de contacto (simulado, sin backend todavía)
function initFormulario() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', event => {
        event.preventDefault();
        alert('¡Gracias por tu mensaje! Te responderemos pronto.');
        form.reset();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    iniciarNavbar();
    initFormulario();
});