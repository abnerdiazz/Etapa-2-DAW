import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    setDoc,
    query,
    orderBy
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { firebaseConfig, firebaseIsConfigured } from './firebase-config.js';

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

let db = null;
if (firebaseIsConfigured) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
}

const normalizarFecha = value => {
    if (!value) return new Date();
    if (typeof value?.toDate === 'function') return value.toDate();
    if (value?.seconds) return new Date(value.seconds * 1000);
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

async function sembrarProductosSiEstaVacio() {
    if (!db) return;
    const snapshot = await getDocs(collection(db, 'productos'));
    if (!snapshot.empty) return;
    await Promise.all(PRODUCTOS_INICIALES.map(producto =>
        setDoc(doc(db, 'productos', producto.id), producto)
    ));
}

export async function obtenerProductos() {
    if (!db) {
        return { datos: PRODUCTOS_INICIALES.map(normalizarProducto), origen: 'demo' };
    }

    await sembrarProductosSiEstaVacio();
    const snapshot = await getDocs(collection(db, 'productos'));
    const ordenProductos = new Map(PRODUCTOS_INICIALES.map((producto, index) => [producto.id, index]));
    const datos = snapshot.docs
        .map(documento => normalizarProducto({ id: documento.id, ...documento.data() }))
        .filter(producto => producto.activo !== false)
        .sort((a, b) => (ordenProductos.get(a.id) ?? 999) - (ordenProductos.get(b.id) ?? 999));
    return { datos, origen: 'firestore' };
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
        const baseTotal = 10.25 + ((index * 37) % 550) / 100;
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
    if (!db) {
        return { datos: construirPedidosDemo(), origen: 'demo' };
    }

    try {
        const snapshot = await getDocs(query(collection(db, 'pedidos'), orderBy('creadoEn', 'desc')));
        return {
            datos: snapshot.docs.map(documento => normalizarPedido({ id: documento.id, ...documento.data() })),
            origen: 'firestore'
        };
    } catch (error) {
        // Compatibilidad si la colección todavía usa createdAt o aún no tiene índices.
        console.warn('No se pudo ordenar pedidos por creadoEn; se hará lectura simple.', error);
        const snapshot = await getDocs(collection(db, 'pedidos'));
        return {
            datos: snapshot.docs.map(documento => normalizarPedido({ id: documento.id, ...documento.data() })),
            origen: 'firestore'
        };
    }
}

export function leerSesion() {
    try {
        return JSON.parse(localStorage.getItem('saborExpressSession'));
    } catch {
        return null;
    }
}

export function modoDatos() {
    return firebaseIsConfigured ? 'firestore' : 'demo';
}
