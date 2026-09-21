import { iniciarNavbar, leerCarrito, guardarCarrito, vaciarCarrito, leerSesion, leerUsuarios, crearPedido } from './saborexpress-data.js';

const ENVIO = 1.00;
const money = value => `$${Number(value || 0).toFixed(2)}`;
const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
const subtotalDe = carrito => carrito.reduce((sum, item) => sum + Number(item.precio || 0) * Number(item.cantidad || 0), 0);
const esCliente = sesion => Boolean(sesion && sesion.role === 'cliente');

// ---------- Carrito ----------
function initCarrito() {
    const tbody = document.getElementById('cart-table-body');
    if (!tbody) return;
    const enlaceCheckout = document.querySelector('a[href="checkout.html"]');
    if (enlaceCheckout && !esCliente(leerSesion())) enlaceCheckout.href = 'login.html?redirect=checkout.html';

    function render() {
        const carrito = leerCarrito();
        const subtotal = subtotalDe(carrito);
        tbody.innerHTML = carrito.length ? carrito.map((item, i) => `
            <tr class="cart-item">
                <td class="ps-4 cart-product-title">${esc(item.nombre)}</td>
                <td class="text-center">
                    <div class="qty-pill-container">
                        <button type="button" class="qty-btn btn-minus" data-index="${i}" aria-label="Disminuir">-</button>
                        <span class="qty-val">${Number(item.cantidad)}</span>
                        <button type="button" class="qty-btn btn-plus" data-index="${i}" aria-label="Aumentar">+</button>
                    </div>
                </td>
                <td class="cart-price-text">${money(item.precio)}</td>
                <td class="pe-4 cart-subtotal-text">${money(item.precio * item.cantidad)}</td>
            </tr>`).join('') : `
            <tr><td colspan="4" class="text-center py-5 text-muted">Tu carrito está vacío.<br>
            <a href="menu.html" class="fw-bold text-decoration-none" style="color: var(--se-primary);">Ir a ver el menú</a></td></tr>`;

        document.getElementById('cart-subtotal').textContent = money(subtotal);
        document.getElementById('cart-shipping').textContent = money(carrito.length ? ENVIO : 0);
        document.getElementById('cart-total').textContent = money(carrito.length ? subtotal + ENVIO : 0);
        if (enlaceCheckout) {
            enlaceCheckout.style.pointerEvents = carrito.length ? '' : 'none';
            enlaceCheckout.style.opacity = carrito.length ? '' : '.5';
        }
    }

    tbody.addEventListener('click', event => {
        const boton = event.target.closest('.btn-plus, .btn-minus');
        if (!boton) return;
        const carrito = leerCarrito();
        const item = carrito[Number(boton.dataset.index)];
        if (!item) return;
        item.cantidad += boton.classList.contains('btn-plus') ? 1 : -1;
        guardarCarrito(carrito.filter(producto => producto.cantidad > 0));
        render();
    });
    render();
}

// ---------- Checkout ----------
function initMapa() {
    if (!document.getElementById('map') || typeof L === 'undefined') return null;
    const inicio = [13.6925, -89.2381];
    const mapa = L.map('map').setView(inicio, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(mapa);
    const marcador = L.marker(inicio, { draggable: true }).addTo(mapa);
    mapa.on('click', event => marcador.setLatLng(event.latlng));
    setTimeout(() => mapa.invalidateSize(), 200);
    return marcador;
}

function initCheckout() {
    const resumen = document.getElementById('checkout-summary-items');
    if (!resumen) return;

    const sesion = leerSesion();
    if (!esCliente(sesion)) {
        window.location.replace('login.html?redirect=checkout.html');
        return;
    }

    const carrito = leerCarrito();
    const subtotal = subtotalDe(carrito);
    const boton = document.getElementById('btn-confirm-order');
    const error = document.getElementById('checkout-error');
    const campo = id => document.getElementById(id);

    // Datos precargados desde la cuenta del cliente
    const usuario = leerUsuarios().find(u => u.email === sesion.email);
    campo('input-nombre').value = sesion.name || '';
    campo('input-telefono').value = usuario?.phone || '';

    resumen.innerHTML = carrito.length ? carrito.map(item => `
        <div class="checkout-summary-item">
            <span class="item-title">${Number(item.cantidad)}x ${esc(item.nombre)}</span>
            <span class="item-price">${money(item.precio * item.cantidad)}</span>
        </div>`).join('') : '<p class="text-muted small">No hay productos en el pedido. <a href="menu.html">Ir al menú</a></p>';
    campo('checkout-subtotal').textContent = money(subtotal);
    campo('checkout-shipping').textContent = money(carrito.length ? ENVIO : 0);
    campo('checkout-total').textContent = money(carrito.length ? subtotal + ENVIO : 0);
    if (!carrito.length) boton.disabled = true;

    const marcador = initMapa();

    document.querySelectorAll('input[name="metodo_pago"]').forEach(radio => radio.addEventListener('change', marcarPago));
    function marcarPago() {
        document.querySelectorAll('.payment-option').forEach(opcion => {
            opcion.classList.toggle('active', opcion.querySelector('input').checked);
        });
    }
    marcarPago();

    function fallo(mensaje, id) {
        error.textContent = mensaje;
        error.classList.remove('d-none');
        campo(id)?.focus();
    }

    boton.addEventListener('click', () => {
        error.classList.add('d-none');
        const nombre = campo('input-nombre').value.trim();
        const telefono = campo('input-telefono').value.trim();
        const direccion = campo('input-direccion').value.trim();
        const referencia = campo('input-referencia').value.trim();

        if (nombre.length < 3) return fallo('Ingresa tu nombre de contacto.', 'input-nombre');
        if (!/^(\+?503[\s-]?)?\d{4}[\s-]?\d{4}$/.test(telefono)) return fallo('Ingresa un teléfono válido de 8 dígitos (ej. 7777-7777).', 'input-telefono');
        if (direccion.length < 8) return fallo('Ingresa una dirección de entrega más completa.', 'input-direccion');

        const pago = document.querySelector('input[name="metodo_pago"]:checked').value === 'efectivo'
            ? 'Efectivo (contra entrega)' : 'Transferencia bancaria';
        const posicion = marcador?.getLatLng();
        const pedido = crearPedido({
            cliente: nombre,
            email: sesion.email,
            telefono,
            direccion,
            referencia,
            pago,
            subtotal: Number(subtotal.toFixed(2)),
            envio: ENVIO,
            total: Number((subtotal + ENVIO).toFixed(2)),
            ubicacion: posicion ? { lat: posicion.lat, lng: posicion.lng } : null,
            items: carrito.map(item => ({
                productoId: item.productoId, nombre: item.nombre, categoria: item.categoria,
                precio: item.precio, cantidad: item.cantidad
            }))
        });

        const detalle = carrito.map(item => `${item.cantidad}x ${item.nombre}`).join(', ');
        const mensaje = `Hola SaborExpress, soy ${nombre}. Pedido #${pedido.id}: ${detalle}. Dirección: ${direccion}. Pago: ${pago}. Total: ${money(pedido.total)}.`;
        window.open(`https://wa.me/50322000000?text=${encodeURIComponent(mensaje)}`, '_blank');
        vaciarCarrito();
        window.location.href = 'mis-pedidos.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    iniciarNavbar();
    initCarrito();
    initCheckout();
});