/* ============================================
   SaborExpress · Admin Menú (CRUD del catálogo)
   Lee y guarda en saborExpressProductos, el mismo catálogo que muestra el Menú público.
   ============================================ */
import { iniciarAdmin, leerProductosTodos, guardarProductos, PRODUCTOS_INICIALES } from './saborexpress-data.js';

let productos = [];

const money = value => `$${Number(value || 0).toFixed(2)}`;
const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
const precioValido = valor => Number.isFinite(valor) && valor > 0 && valor <= 99;

function render() {
    const grid = document.getElementById('admin-menu-grid');
    grid.innerHTML = productos.length ? productos.map(producto => `
        <div class="col-md-4">
            <div class="admin-card">
                <img src="${esc(producto.imagen)}" class="admin-card-img" alt="${esc(producto.nombre)}">
                <div class="admin-card-body">
                    <h3 class="admin-product-title">${esc(producto.nombre)}</h3>
                    <p class="admin-product-category">${esc(producto.categoria)}</p>
                    <p class="admin-product-price">${money(producto.precio)}</p>
                </div>
                <div class="admin-card-footer d-flex justify-content-between align-items-center">
                    <button type="button" class="btn-action-text btn-action-edit" data-id="${esc(producto.id)}">[Editar]</button>
                    <button type="button" class="btn-action-text btn-action-delete" data-id="${esc(producto.id)}">[Eliminar]</button>
                </div>
            </div>
        </div>`).join('') : '<p class="text-secondary">El menú está vacío. Usa "Añadir Producto" para agregar platillos.</p>';
    llenarSelect();
}

// Solo se ofrecen los platillos base que todavía no están en el menú.
function llenarSelect() {
    const select = document.getElementById('new-prod-name');
    const existentes = new Set(productos.map(producto => producto.id));
    const disponibles = PRODUCTOS_INICIALES.filter(producto => !existentes.has(producto.id));
    select.innerHTML = '<option value="" selected disabled>-- Selecciona un platillo o bebida --</option>' +
        disponibles.map(producto => `<option value="${esc(producto.id)}" data-price="${producto.precio}">${esc(producto.nombre)} (${esc(producto.categoria)})</option>`).join('');
}

function persistir() {
    guardarProductos(productos);
    render();
}

function init() {
    if (!iniciarAdmin('admin-menu.html')) return;
    productos = leerProductosTodos();
    render();

    const select = document.getElementById('new-prod-name');
    const precio = document.getElementById('new-prod-price');
    const error = document.getElementById('addProductError');

    select.addEventListener('change', () => {
        precio.value = select.selectedOptions[0]?.dataset.price || '';
    });

    document.getElementById('admin-menu-grid').addEventListener('click', event => {
        const eliminar = event.target.closest('.btn-action-delete');
        const editar = event.target.closest('.btn-action-edit');
        const id = (eliminar || editar)?.dataset.id;
        const producto = productos.find(item => item.id === id);
        if (!producto) return;

        if (eliminar && confirm(`¿Eliminar "${producto.nombre}" del menú público?`)) {
            productos = productos.filter(item => item.id !== id);
            persistir();
        }
        if (editar) {
            const nombre = prompt('Editar nombre del producto:', producto.nombre)?.trim();
            if (nombre) producto.nombre = nombre;
            const nuevo = prompt('Editar precio ($):', producto.precio.toFixed(2));
            if (nuevo !== null) {
                if (precioValido(parseFloat(nuevo))) producto.precio = Number(parseFloat(nuevo).toFixed(2));
                else alert('Ingresa un precio válido (mayor que 0).');
            }
            persistir();
        }
    });

    document.getElementById('form-add-product').addEventListener('submit', event => {
        event.preventDefault();
        error.classList.add('d-none');
        const base = PRODUCTOS_INICIALES.find(item => item.id === select.value);
        const valor = parseFloat(precio.value);
        if (!base || !precioValido(valor)) {
            error.textContent = 'Selecciona un producto e ingresa un precio válido (mayor que 0).';
            error.classList.remove('d-none');
            return;
        }
        productos.push({ ...base, precio: Number(valor.toFixed(2)), activo: true });
        persistir();
        event.target.reset();
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAddProduct')).hide();
    });
}

document.addEventListener('DOMContentLoaded', init);