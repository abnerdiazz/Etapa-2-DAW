import { obtenerProductos, leerSesion, resolverImagenMenu } from './saborexpress-data.js';

const state = {
    productos: [],
    categoria: 'Todas',
    busqueda: '',
    pagina: 1,
    porPagina: 6,
    cantidades: new Map()
};

const money = value => `$${Number(value || 0).toFixed(2)}`;
const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));

function leerCarrito() {
    try {
        // Conserva el carrito temporal creado por la version anterior.
        if (localStorage.getItem('saborExpressCart') === null) {
            const anterior = sessionStorage.getItem('saborExpressCart');
            if (anterior !== null) {
                const items = JSON.parse(anterior);
                if (Array.isArray(items)) localStorage.setItem('saborExpressCart', JSON.stringify(items));
            }
        }
        const carrito = JSON.parse(localStorage.getItem('saborExpressCart'));
        return Array.isArray(carrito) ? carrito.map(item => ({
            ...item, imagen: resolverImagenMenu(item.imagen)
        })) : [];
    } catch {
        return [];
    }
}

function guardarCarrito(carrito) {
    localStorage.setItem('saborExpressCart', JSON.stringify(carrito));
    actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
    const total = leerCarrito().reduce((sum, item) => sum + Number(item.cantidad || 0), 0);
    document.querySelectorAll('[data-cart-count]').forEach(node => { node.textContent = total; });
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

function mostrarToast(mensaje) {
    const toastEl = document.getElementById('menuToast');
    if (!toastEl || !window.bootstrap) return;
    toastEl.querySelector('[data-toast-message]').textContent = mensaje;
    bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2200 }).show();
}

function productosFiltrados() {
    const query = state.busqueda.toLowerCase();
    return state.productos.filter(producto => {
        const coincideCategoria = state.categoria === 'Todas' || producto.categoria === state.categoria;
        const texto = `${producto.nombre} ${producto.descripcion} ${producto.categoria}`.toLowerCase();
        return coincideCategoria && texto.includes(query);
    });
}

function cantidadSeleccionada(id) {
    return state.cantidades.get(id) ?? 1;
}

function renderPaginacion(total) {
    const ul = document.getElementById('menuPagination');
    const paginas = Math.ceil(total / state.porPagina);
    ul.innerHTML = '';
    if (paginas <= 1) return;

    const prevDisabled = state.pagina === 1 ? 'disabled' : '';
    ul.insertAdjacentHTML('beforeend', `<li class="page-item ${prevDisabled}"><button class="page-link" data-page="${state.pagina - 1}" aria-label="Página anterior"><i class="bi bi-chevron-left"></i></button></li>`);
    for (let page = 1; page <= paginas; page += 1) {
        ul.insertAdjacentHTML('beforeend', `<li class="page-item ${page === state.pagina ? 'active' : ''}"><button class="page-link" data-page="${page}">${page}</button></li>`);
    }
    const nextDisabled = state.pagina === paginas ? 'disabled' : '';
    ul.insertAdjacentHTML('beforeend', `<li class="page-item ${nextDisabled}"><button class="page-link" data-page="${state.pagina + 1}" aria-label="Página siguiente"><i class="bi bi-chevron-right"></i></button></li>`);
}

function render() {
    const grid = document.getElementById('menuGrid');
    const empty = document.getElementById('menuEmpty');
    const productos = productosFiltrados();
    const paginas = Math.max(1, Math.ceil(productos.length / state.porPagina));
    state.pagina = Math.min(state.pagina, paginas);
    const inicio = (state.pagina - 1) * state.porPagina;
    const visibles = productos.slice(inicio, inicio + state.porPagina);

    grid.innerHTML = visibles.map(producto => {
        const qty = cantidadSeleccionada(producto.id);
        return `
        <div class="col-12 col-md-6 col-xl-4">
            <article class="menu-product-card h-100">
                <div class="menu-product-image-wrap">
                    <img src="${esc(producto.imagen)}" class="menu-product-image" alt="${esc(producto.nombre)}" loading="lazy">
                    <span class="menu-price-badge">${money(producto.precio)}</span>
                </div>
                <div class="menu-product-body">
                    <h2 class="menu-product-title">${esc(producto.nombre)}</h2>
                    <p class="menu-product-description">${esc(producto.descripcion)}</p>
                    <div class="d-flex align-items-center justify-content-between gap-3 mt-auto">
                        <div class="quantity-control" aria-label="Cantidad de ${esc(producto.nombre)}">
                            <button type="button" data-qty-action="minus" data-id="${esc(producto.id)}" aria-label="Disminuir cantidad"><i class="bi bi-dash"></i></button>
                            <span data-qty-value="${esc(producto.id)}">${qty}</span>
                            <button type="button" data-qty-action="plus" data-id="${esc(producto.id)}" aria-label="Aumentar cantidad"><i class="bi bi-plus"></i></button>
                        </div>
                        <button type="button" class="btn btn-brand px-4" data-add-cart="${esc(producto.id)}">Agregar</button>
                    </div>
                </div>
            </article>
        </div>`;
    }).join('');

    empty.classList.toggle('d-none', productos.length !== 0);
    renderPaginacion(productos.length);
}

function cambiarCantidad(id, delta) {
    const actual = cantidadSeleccionada(id);
    const nueva = Math.min(20, Math.max(1, actual + delta));
    state.cantidades.set(id, nueva);
    const node = document.querySelector(`[data-qty-value="${CSS.escape(id)}"]`);
    if (node) node.textContent = nueva;
}

function agregarAlCarrito(id) {
    const producto = state.productos.find(item => item.id === id);
    if (!producto) return;
    const cantidad = cantidadSeleccionada(id);
    const carrito = leerCarrito();
    const existente = carrito.find(item => item.productoId === id);
    if (existente) existente.cantidad += cantidad;
    else carrito.push({
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen,
        categoria: producto.categoria,
        cantidad
    });
    try {
        guardarCarrito(carrito);
    } catch (error) {
        console.error(error);
        mostrarToast('No se pudo guardar el carrito. Revisa el almacenamiento del navegador.');
        return;
    }
    mostrarToast(`${cantidad} × ${producto.nombre} agregado al carrito.`);
}

async function init() {
    actualizarContadorCarrito();
    actualizarUsuario();

    try {
        const { datos, origen } = await obtenerProductos();
        state.productos = datos;
        console.info(`Fuente del catálogo: ${origen}`);
        render();
    } catch (error) {
        console.error(error);
        document.getElementById('menuGrid').innerHTML = '<p class="text-danger" role="alert">No se pudo leer el catalogo guardado. Revisa el almacenamiento del navegador.</p>';
    }

    document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
        document.querySelectorAll('[data-category]').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        state.categoria = button.dataset.category;
        state.pagina = 1;
        render();
    }));

    document.getElementById('menuSearch').addEventListener('input', event => {
        state.busqueda = event.target.value.trim();
        state.pagina = 1;
        render();
    });

    document.getElementById('menuGrid').addEventListener('click', event => {
        const qtyButton = event.target.closest('[data-qty-action]');
        if (qtyButton) {
            cambiarCantidad(qtyButton.dataset.id, qtyButton.dataset.qtyAction === 'plus' ? 1 : -1);
            return;
        }
        const addButton = event.target.closest('[data-add-cart]');
        if (addButton) agregarAlCarrito(addButton.dataset.addCart);
    });

    document.getElementById('menuPagination').addEventListener('click', event => {
        const button = event.target.closest('[data-page]');
        if (!button || button.parentElement.classList.contains('disabled')) return;
        state.pagina = Number(button.dataset.page);
        render();
        window.scrollTo({ top: 120, behavior: 'smooth' });
    });
}

document.addEventListener('DOMContentLoaded', init);