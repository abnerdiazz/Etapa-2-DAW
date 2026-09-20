/* ============================================
   SaborExpress · Etapa 2 · Contacto
   ============================================ */

// Lee la sesión guardada por el login (misma clave que usa el resto del sitio).
function leerSesion() {
    try {
        return JSON.parse(localStorage.getItem('saborExpressSession'));
    } catch {
        return null;
    }
}

function leerCarrito() {
    try {
        if (localStorage.getItem('saborExpressCart') === null) {
            const anterior = sessionStorage.getItem('saborExpressCart');
            if (anterior !== null) {
                const items = JSON.parse(anterior);
                if (Array.isArray(items)) localStorage.setItem('saborExpressCart', JSON.stringify(items));
            }
        }
        const carrito = JSON.parse(localStorage.getItem('saborExpressCart'));
        return Array.isArray(carrito) ? carrito : [];
    } catch {
        return [];
    }
}

function actualizarContadorCarrito() {
    const total = leerCarrito().reduce((sum, item) => sum + Number(item.cantidad || 0), 0);
    document.querySelectorAll('[data-cart-count]').forEach(nodo => {
        nodo.textContent = total;
    });
}

function actualizarUsuario() {
    const sesion = leerSesion();
    const label = document.querySelector('[data-account-label]');
    const link = document.querySelector('[data-account-link]');
    if (sesion && label && link) {
        label.textContent = sesion.name?.split(' ')[0] || 'Mi cuenta';
        link.href = sesion.role === 'admin' ? 'admin-reportes.html' : 'mis-pedidos.html';
    }
}

// Envío del formulario de contacto (simulado, sin backend todavía)
function initFormulario() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('¡Gracias por tu mensaje! Te responderemos pronto.');
        form.reset();
    });
}

function init() {
    actualizarContadorCarrito();
    actualizarUsuario();
    initFormulario();
}

document.addEventListener('DOMContentLoaded', init);