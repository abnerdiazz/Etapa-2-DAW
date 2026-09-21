export const PRODUCTOS_INICIALES = [
    { id: 'pup-revuelta', nombre: 'Pupusa Revuelta', categoria: 'Pupusas', precio: 0.85, imagen: 'img/menú/pupusa-revuelta.png', descripcion: 'Clásica de delicioso chicharrón molido, frijoles refritos y abundante queso derretido.', activo: true },
    { id: 'pup-loroco', nombre: 'Pupusa de Queso con Loroco', categoria: 'Pupusas', precio: 0.90, imagen: 'img/menú/pupusa-loroco.png', descripcion: 'Suave queso tradicional mezclado con loroco fresco finamente picado de alta calidad.', activo: true },
    { id: 'pup-frijol-queso', nombre: 'Pupusa de Frijol con Queso', categoria: 'Pupusas', precio: 0.85, imagen: 'img/menú/pupusa-frijol-queso.png', descripcion: 'Frijoles rojos molidos cocinados lentamente combinados con nuestro queso artesanal.', activo: true },
    { id: 'pup-loca', nombre: 'Pupusa Loca', categoria: 'Pupusas', precio: 1.50, imagen: 'img/menú/pupusa-loca.png', descripcion: '¡La más grande! Una mezcla generosa de los ingredientes de la casa.', activo: true },
    { id: 'pup-queso', nombre: 'Pupusa de Queso', categoria: 'Pupusas', precio: 0.80, imagen: 'img/menú/pupusa-queso.png', descripcion: 'Pupusa tradicional rellena de abundante queso derretido, suave y reconfortante.', activo: true },
    { id: 'tip-nuegados', nombre: 'Nuegados de Yuca con Miel', categoria: 'Típicos', precio: 1.75, imagen: 'img/menú/nuegados.png', descripcion: 'Nuegados de yuca suaves bañados con miel dulce tradicional.', activo: true },
    { id: 'tip-yuca', nombre: 'Yuca Frita con Chicharrón', categoria: 'Típicos', precio: 2.75, imagen: 'img/menú/yuca-frita.png', descripcion: 'Yuca dorada y crujiente acompañada de curtido y chicharrones.', activo: true },
    { id: 'beb-coca', nombre: 'Coca-Cola en Lata', categoria: 'Bebidas', precio: 1.00, imagen: 'img/menú/soda-coca-cola.png', descripcion: 'Coca-Cola bien helada para acompañar tu pedido.', activo: true },
    { id: 'beb-fanta', nombre: 'Fanta en Lata', categoria: 'Bebidas', precio: 1.00, imagen: 'img/menú/soda-fanta.png', descripcion: 'Fanta naranja fría y refrescante.', activo: true },
    { id: 'beb-sprite', nombre: 'Sprite en Lata', categoria: 'Bebidas', precio: 1.00, imagen: 'img/menú/soda-sprite.png', descripcion: 'Sprite fría con su clásico sabor limón-lima.', activo: true },
    { id: 'beb-fresa', nombre: 'Tropical Fresa', categoria: 'Bebidas', precio: 1.00, imagen: 'img/menú/soda-fresa.png', descripcion: 'Soda Tropical sabor fresa servida bien fría.', activo: true },
    { id: 'beb-chocolate', nombre: 'Chocolate Caliente', categoria: 'Bebidas', precio: 0.90, imagen: 'img/menú/chocolate.png', descripcion: 'Chocolate caliente cremoso y reconfortante, preparado al estilo de casa.', activo: true },
    { id: 'beb-cafe', nombre: 'Café de Olla', categoria: 'Bebidas', precio: 0.75, imagen: 'img/menú/cafe.png', descripcion: 'Café de altura tradicional caliente, con un sutil toque aromático de canela.', activo: true },
    { id: 'pos-quesadilla', nombre: 'Quesadilla Salvadoreña', categoria: 'Postres', precio: 1.25, imagen: 'img/menú/quesadilla.png', descripcion: 'Tradicional quesadilla salvadoreña, suave, esponjosa y con delicado sabor a queso.', activo: true },
    { id: 'pos-arroz', nombre: 'Arroz con Leche', categoria: 'Postres', precio: 1.50, imagen: 'img/menú/arroz-leche.png', descripcion: 'Postre cremoso de arroz con leche, canela y dulzor casero.', activo: true }
];

// Adapta las rutas del catalogo anterior sin borrar los datos guardados.
const rutasAnteriores = new Map(PRODUCTOS_INICIALES.map(producto => [
    'img/' + producto.imagen.split('/').pop(), producto.imagen
]));

export function resolverImagenMenu(ruta) {
    return rutasAnteriores.get(ruta) ?? ruta;
}

const normalizarFecha = value => {
    if (!value) return new Date();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date() : date;
};

const normalizarProducto = raw => ({
    id: raw.id,
    nombre: raw.nombre ?? raw.name ?? 'Producto',
    categoria: raw.categoria ?? raw.category ?? 'Otros',
    precio: Number(raw.precio ?? raw.price ?? 0),
    imagen: resolverImagenMenu(raw.imagen ?? raw.image ?? 'img/menú/pupusa-revuelta.png'),
    descripcion: raw.descripcion ?? raw.description ?? '',
    activo: raw.activo ?? raw.active ?? true
});

const normalizarItem = raw => ({
    productoId: raw.productoId ?? raw.productId ?? raw.id ?? '',
    nombre: raw.nombre ?? raw.name ?? 'Producto',
    categoria: raw.categoria ?? raw.category ?? 'Otros',
    precio: Number(raw.precio ?? raw.price ?? 0),
    cantidad: Number(raw.cantidad ?? raw.quantity ?? 1)
});

const normalizarPedido = raw => ({
    id: raw.id,
    estado: raw.estado ?? raw.status ?? 'Pendiente',
    total: Number(raw.total ?? 0),
    subtotal: Number(raw.subtotal ?? raw.total ?? 0),
    envio: Number(raw.envio ?? 0),
    cliente: raw.cliente ?? raw.nombre ?? '',
    email: String(raw.email ?? '').toLowerCase(),
    telefono: raw.telefono ?? '',
    direccion: raw.direccion ?? '',
    referencia: raw.referencia ?? '',
    pago: raw.pago ?? '',
    ubicacion: raw.ubicacion ?? null,
    creadoEn: normalizarFecha(raw.creadoEn ?? raw.createdAt ?? raw.fecha),
    items: (raw.items ?? raw.productos ?? []).map(normalizarItem)
});

// Solo inicializa una coleccion ausente; una lista vacia es un valor valido.
function leerColeccion(clave, inicializar) {
    const contenido = localStorage.getItem(clave);
    if (contenido === null) {
        const datos = inicializar();
        localStorage.setItem(clave, JSON.stringify(datos));
        return datos;
    }
    const datos = JSON.parse(contenido);
    if (!Array.isArray(datos) || datos.some(item => !item || typeof item !== 'object')) {
        throw new Error('Los datos locales de ' + clave + ' no son validos.');
    }
    return datos;
}

export async function obtenerProductos() {
    const datos = leerColeccion('saborExpressProductos', () => PRODUCTOS_INICIALES)
        .map(normalizarProducto).filter(producto => producto.activo !== false);
    return { datos, origen: 'localStorage' };
}

// ---------------------------------------------------------------------------
// Catálogo: lectura completa y guardado (lo usa el panel Admin Menú)
// ---------------------------------------------------------------------------
export function leerProductosTodos() {
    return leerColeccion('saborExpressProductos', () => PRODUCTOS_INICIALES).map(normalizarProducto);
}

export function guardarProductos(lista) {
    localStorage.setItem('saborExpressProductos', JSON.stringify(lista));
}

// ---------------------------------------------------------------------------
// Pedidos reales (creados desde el Checkout).
// ---------------------------------------------------------------------------
const CLAVE_PEDIDOS = 'saborExpressPedidos';
const esDemo = pedido => String(pedido?.id ?? '').startsWith('DEMO-');

// Descarta los pedidos de demostración que versiones anteriores dejaron en el navegador.
function leerPedidosGuardados() {
    return leerColeccion(CLAVE_PEDIDOS, () => []).filter(pedido => !esDemo(pedido));
}

export async function obtenerPedidos() {
    const datos = leerPedidosGuardados().map(normalizarPedido).sort((a, b) => b.creadoEn - a.creadoEn);
    return { datos, origen: 'localStorage' };
}

export function crearPedido(datos) {
    const pedidos = leerPedidosGuardados();
    const pedido = {
        ...datos,
        id: `SE-${String(pedidos.length + 1).padStart(4, '0')}`,
        estado: 'Pendiente',
        creadoEn: new Date().toISOString()
    };
    pedidos.push(pedido);
    localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(pedidos));
    return pedido;
}

export function actualizarEstadoPedido(id, estado) {
    const pedidos = leerPedidosGuardados();
    const pedido = pedidos.find(item => item.id === id);
    if (!pedido) return false;
    pedido.estado = estado;
    localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(pedidos));
    return true;
}

// ---------------------------------------------------------------------------
// Sesión y usuarios. Una sola sesión a la vez: 'cliente' o 'admin'.
// ---------------------------------------------------------------------------
const CLAVE_SESION = 'saborExpressSession';            // cliente (tienda)
const CLAVE_SESION_ADMIN = 'saborExpressAdminSession'; // administrador (paneles)

// Cuenta de demostración del administrador (credenciales públicas, solo para pruebas).
export const ADMIN_DEMO = {
    email: 'admin@saborexpress.com',
    password: 'Admin123',
    name: 'Carlos M.',
    role: 'admin'
};

function leerClave(clave, rol) {
    try {
        const sesion = JSON.parse(localStorage.getItem(clave));
        return sesion && sesion.role === rol ? sesion : null;
    } catch {
        return null;
    }
}

// Sesión del cliente (tienda). Una sesión de administrador nunca se refleja aquí.
export function leerSesion() {
    return leerClave(CLAVE_SESION, 'cliente');
}

// Sesión del administrador (paneles). Es independiente de la del cliente.
export function leerSesionAdmin() {
    return leerClave(CLAVE_SESION_ADMIN, 'admin');
}

export function guardarSesion(usuario) {
    const clave = usuario.role === 'admin' ? CLAVE_SESION_ADMIN : CLAVE_SESION;
    localStorage.setItem(clave, JSON.stringify({
        name: usuario.name,
        email: usuario.email,
        role: usuario.role,
        loginAt: new Date().toISOString()
    }));
}

export function cerrarSesion(rol = 'cliente') {
    localStorage.removeItem(rol === 'admin' ? CLAVE_SESION_ADMIN : CLAVE_SESION);
}

export function leerUsuarios() {
    try {
        const datos = JSON.parse(localStorage.getItem('saborExpressUsers'));
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

export function leerCarrito() {
    try {
        const carrito = JSON.parse(localStorage.getItem('saborExpressCart'));
        return Array.isArray(carrito) ? carrito.map(item => ({
            ...item, imagen: resolverImagenMenu(item.imagen)
        })) : [];
    } catch {
        return [];
    }
}

export function guardarCarrito(carrito) {
    localStorage.setItem('saborExpressCart', JSON.stringify(carrito));
    actualizarContadorCarrito();
}

export function vaciarCarrito() {
    guardarCarrito([]);
}

export function actualizarContadorCarrito() {
    const total = leerCarrito().reduce((sum, item) => sum + Number(item.cantidad || 0), 0);
    document.querySelectorAll('[data-cart-count]').forEach(nodo => { nodo.textContent = total; });
}

// ---------------------------------------------------------------------------
// Navbar de la tienda: contador del carrito + menú de "Mi cuenta"
// ---------------------------------------------------------------------------
function pintarMenuCuenta() {
    const label = document.querySelector('[data-account-label]');
    const menu = document.querySelector('[data-account-menu]');
    if (!label || !menu) return;
    const sesion = leerSesion();

    if (!sesion) {
        label.textContent = 'Mi cuenta';
        menu.innerHTML = `
            <li><a class="dropdown-item" href="login.html"><i class="bi bi-box-arrow-in-right me-2"></i>Iniciar sesión</a></li>
            <li><a class="dropdown-item" href="registro.html"><i class="bi bi-person-plus me-2"></i>Crear cuenta</a></li>`;
        return;
    }

    label.textContent = sesion.name?.split(' ')[0] || 'Mi cuenta';
    const destino = '<li><a class="dropdown-item" href="mis-pedidos.html"><i class="bi bi-receipt me-2"></i>Mis Pedidos</a></li>';
    menu.innerHTML = `${destino}
        <li><hr class="dropdown-divider"></li>
        <li><button class="dropdown-item text-danger" type="button" data-logout><i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión</button></li>`;
    menu.querySelector('[data-logout]').addEventListener('click', () => {
        cerrarSesion();
        window.location.href = 'index.html';
    });
}

export function iniciarNavbar() {
    // Limpia claves de carrito de versiones anteriores (ya no se usan).
    ['saborexpress_cart', 'cart', 'se_cart', 'carrito', 'saborexpress_carrito'].forEach(clave => localStorage.removeItem(clave));
    actualizarContadorCarrito();
    pintarMenuCuenta();
    window.addEventListener('pageshow', actualizarContadorCarrito);
}

// ---------------------------------------------------------------------------
// Paneles de administración
// ---------------------------------------------------------------------------
export function iniciarAdmin(pagina) {
    const sesion = leerSesionAdmin();
    if (!sesion) {
        window.location.replace(`login.html?redirect=${pagina}`);
        return false;
    }
    const nombre = document.querySelector('[data-admin-name]');
    const correo = document.querySelector('[data-admin-email]');
    if (nombre && sesion.name) nombre.textContent = sesion.name;
    if (correo && sesion.email) correo.textContent = sesion.email;
    document.querySelector('[data-admin-logout]')?.addEventListener('click', () => {
        cerrarSesion('admin');
        window.location.href = 'login.html';
    });
    return true;
}

export function modoDatos() {
    return 'localStorage';
}