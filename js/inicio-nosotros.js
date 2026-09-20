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

// Pinta el menu de la cuenta segun si hay sesion activa o no.
function actualizarUsuario() {
    const sesion = leerSesion();
    // Solo se muestra como "logueado" si la sesion es de un cliente.
    // Una sesion de admin activa no debe reflejarse en las vistas del cliente.
    const esCliente = Boolean(sesion && sesion.role === 'cliente');
    const label = document.querySelector('[data-account-label]');
    const menu = document.querySelector('[data-account-menu]');
    if (!label || !menu) return;

    if (esCliente) {
        label.textContent = sesion.name?.split(' ')[0] || 'Mi cuenta';
        menu.innerHTML = `
            <li><a class="dropdown-item" href="mis-pedidos.html"><i class="bi bi-receipt me-2"></i>Mis Pedidos</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><button class="dropdown-item text-danger" type="button" data-logout-client><i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión</button></li>
        `;
        menu.querySelector('[data-logout-client]').addEventListener('click', () => {
            localStorage.removeItem('saborExpressSession');
            window.location.href = 'index.html';
        });
    } else {
        label.textContent = 'Mi cuenta';
        menu.innerHTML = `
            <li><a class="dropdown-item" href="login.html"><i class="bi bi-box-arrow-in-right me-2"></i>Iniciar sesión</a></li>
            <li><a class="dropdown-item" href="registro.html"><i class="bi bi-person-plus me-2"></i>Crear cuenta</a></li>
        `;
    }
}

function init() {
    actualizarContadorCarrito();
    actualizarUsuario();
}

document.addEventListener('DOMContentLoaded', init);