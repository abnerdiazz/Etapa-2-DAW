export const PRODUCTOS_INICIALES = [
    { id: 'pup-revuelta', nombre: 'Pupusa Revuelta', categoria: 'Pupusas', precio: 0.85, imagen: 'img/pupusa-revuelta.png', descripcion: 'Clásica de delicioso chicharrón molido, frijoles refritos y abundante queso derretido.', activo: true },
    { id: 'pup-loroco', nombre: 'Pupusa de Queso con Loroco', categoria: 'Pupusas', precio: 0.90, imagen: 'img/pupusa-loroco.png', descripcion: 'Suave queso tradicional mezclado con loroco fresco finamente picado de alta calidad.', activo: true },
    { id: 'pup-frijol-queso', nombre: 'Pupusa de Frijol con Queso', categoria: 'Pupusas', precio: 0.85, imagen: 'img/pupusa-frijol-queso.png', descripcion: 'Frijoles rojos molidos cocinados lentamente combinados con nuestro queso artesanal.', activo: true },
    { id: 'pup-loca', nombre: 'Pupusa Loca', categoria: 'Pupusas', precio: 1.50, imagen: 'img/pupusa-loca.png', descripcion: '¡La más grande! Una mezcla generosa de los ingredientes de la casa.', activo: true },
    { id: 'pup-queso', nombre: 'Pupusa de Queso', categoria: 'Pupusas', precio: 0.80, imagen: 'img/pupusa-queso.png', descripcion: 'Pupusa tradicional rellena de abundante queso derretido, suave y reconfortante.', activo: true },
    { id: 'tip-nuegados', nombre: 'Nuegados de Yuca con Miel', categoria: 'Típicos', precio: 1.75, imagen: 'img/nuegados.png', descripcion: 'Nuegados de yuca suaves bañados con miel dulce tradicional.', activo: true },
    { id: 'tip-yuca', nombre: 'Yuca Frita con Chicharrón', categoria: 'Típicos', precio: 2.75, imagen: 'img/yuca-frita.png', descripcion: 'Yuca dorada y crujiente acompañada de curtido y chicharrones.', activo: true },
    { id: 'beb-coca', nombre: 'Coca-Cola en Lata', categoria: 'Bebidas', precio: 1.00, imagen: 'img/soda-coca-cola.png', descripcion: 'Coca-Cola bien helada para acompañar tu pedido.', activo: true },
    { id: 'beb-fanta', nombre: 'Fanta en Lata', categoria: 'Bebidas', precio: 1.00, imagen: 'img/soda-fanta.png', descripcion: 'Fanta naranja fría y refrescante.', activo: true },
    { id: 'beb-sprite', nombre: 'Sprite en Lata', categoria: 'Bebidas', precio: 1.00, imagen: 'img/soda-sprite.png', descripcion: 'Sprite fría con su clásico sabor limón-lima.', activo: true },
    { id: 'beb-fresa', nombre: 'Tropical Fresa', categoria: 'Bebidas', precio: 1.00, imagen: 'img/soda-fresa.png', descripcion: 'Soda Tropical sabor fresa servida bien fría.', activo: true },
    { id: 'beb-chocolate', nombre: 'Chocolate Caliente', categoria: 'Bebidas', precio: 0.90, imagen: 'img/chocolate.png', descripcion: 'Chocolate caliente cremoso y reconfortante, preparado al estilo de casa.', activo: true },
    { id: 'beb-cafe', nombre: 'Café de Olla', categoria: 'Bebidas', precio: 0.75, imagen: 'img/cafe.png', descripcion: 'Café de altura tradicional caliente, con un sutil toque aromático de canela.', activo: true },
    { id: 'pos-quesadilla', nombre: 'Quesadilla Salvadoreña', categoria: 'Postres', precio: 1.25, imagen: 'img/quesadilla.png', descripcion: 'Tradicional quesadilla salvadoreña, suave, esponjosa y con delicado sabor a queso.', activo: true },
    { id: 'pos-arroz', nombre: 'Arroz con Leche', categoria: 'Postres', precio: 1.50, imagen: 'img/arroz-leche.png', descripcion: 'Postre cremoso de arroz con leche, canela y dulzor casero.', activo: true }
];

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
    imagen: raw.imagen ?? raw.image ?? 'img/pupusa-revuelta.png',
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

function construirPedidosDemo() {
    const pesos = [
        ['Pupusa Revuelta', 'Pupusas', 0.85, 45],
        ['Pupusa de Queso con Loroco', 'Pupusas', 0.90, 28],
        ['Pupusa de Frijol con Queso', 'Pupusas', 0.85, 15],
        ['Quesadilla Salvadoreña', 'Postres', 1.25, 8],
        ['Café de Olla', 'Bebidas', 0.75, 4]
    ];
    const expanded = pesos.flatMap(([nombre, categoria, precio, peso]) =>
        Array.from({ length: peso }, () => ({ nombre, categoria, precio }))
    );
    const estados = ['Confirmado', 'En preparación', 'En camino', 'Entregado'];

    return Array.from({ length: 247 }, (_, index) => {
        const itemBase = expanded[(index * 17) % expanded.length];
        const cantidad = 7 + (index % 5);
        const extra = expanded[(index * 29 + 11) % expanded.length];
        const items = [
            { ...itemBase, productoId: `demo-${index}-a`, cantidad },
            { ...extra, productoId: `demo-${index}-b`, cantidad: 2 + (index % 3) }
        ];
        const baseTotal = items.reduce((total, item) => total + item.precio * item.cantidad, 0);
        const creadoEn = new Date();
        creadoEn.setDate(creadoEn.getDate() - (index % 7));
        creadoEn.setHours(9 + (index % 12), (index * 13) % 60, 0, 0);
        return {
            id: `DEMO-${String(index + 1).padStart(4, '0')}`,
            estado: estados[index % estados.length],
            total: Number(baseTotal.toFixed(2)),
            creadoEn,
            items
        };
    });
}

export async function obtenerPedidos() {
    const datos = leerColeccion('saborExpressPedidos', construirPedidosDemo)
        .map(normalizarPedido).sort((a, b) => b.creadoEn - a.creadoEn);
    return { datos, origen: 'localStorage' };
}

export function leerSesion() {
    try {
        return JSON.parse(localStorage.getItem('saborExpressSession'));
    } catch {
        return null;
    }
}

export function modoDatos() {
    return 'localStorage';
}
