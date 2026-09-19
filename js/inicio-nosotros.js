/* ============================================
   SaborExpress · Etapa 2 · Inicio + Nosotros
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
        // Conserva el carrito temporal creado por la versión anterior.
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

function init() {
    actualizarContadorCarrito();
    actualizarUsuario();
}

document.addEventListener('DOMContentLoaded', init);