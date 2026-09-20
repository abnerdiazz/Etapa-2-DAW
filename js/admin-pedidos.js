import { obtenerPedidos, leerSesion } from './saborexpress-data.js';

const state = {
    pedidos: [],
    estado: 'todos',
    busqueda: ''
};

const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));

// Traduce los estados que vienen del modelo de datos (Confirmado, En preparación,
// En camino, Entregado, Cancelado) a las tres etiquetas visuales del panel.
function normalizarEstado(estado) {
    const valor = String(estado || '').toLowerCase();
    if (valor.includes('entreg')) return { clave: 'entregado', texto: 'Entregado' };
    if (valor.includes('cancel')) return { clave: 'cancelado', texto: 'Cancelado' };
    if (valor.includes('camino') || valor.includes('prepara')) return { clave: 'preparando', texto: 'Preparando' };
    return { clave: 'pendiente', texto: 'Pendiente' };
}

function pedidosFiltrados() {
    const query = state.busqueda.toLowerCase();
    return state.pedidos.filter(pedido => {
        const { clave } = normalizarEstado(pedido.estado);
        const coincideEstado = state.estado === 'todos' || clave === state.estado;
        const texto = `${pedido.id} ${pedido.cliente || ''}`.toLowerCase();
        return coincideEstado && texto.includes(query);
    });
}

function render() {
    const tbody = document.getElementById('pedidosBody');
    const visibles = pedidosFiltrados();

    tbody.innerHTML = visibles.map(pedido => {
        const { clave, texto } = normalizarEstado(pedido.estado);
        const cliente = pedido.cliente || 'Cliente web';
        return `
        <tr>
            <td>#${esc(pedido.id)}</td>
            <td>${esc(cliente)}</td>
            <td class="text-end">${money(pedido.total)}</td>
            <td><span class="status-badge status-${clave}">${texto}</span></td>
        </tr>`;
    }).join('');

    document.getElementById('pedidosNoResults').classList.toggle('d-none', visibles.length !== 0);
}

async function init() {
    const sesion = leerSesion();
    if (!sesion || sesion.role !== 'admin') {
        window.location.replace('admin-login.html?redirect=admin-pedidos.html');
        return;
    }
    if (sesion.name) document.querySelector('[data-admin-name]').textContent = sesion.name;
    if (sesion.email) document.querySelector('[data-admin-email]').textContent = sesion.email;

    document.querySelector('[data-admin-logout]').addEventListener('click', () => {
        localStorage.removeItem('saborExpressSession');
        window.location.href = 'admin-login.html';
    });

    try {
        const { datos, origen } = await obtenerPedidos();
        state.pedidos = datos;
        console.info(`Fuente de pedidos: ${origen}`);
        render();
    } catch (error) {
        console.error(error);
        const aviso = document.createElement('p');
        aviso.className = 'alert alert-danger';
        aviso.setAttribute('role', 'alert');
        aviso.textContent = 'No se pudieron leer los pedidos guardados. Revisa el almacenamiento del navegador.';
        document.querySelector('main').prepend(aviso);
    }

    document.querySelectorAll('[data-status]').forEach(button => button.addEventListener('click', () => {
        document.querySelectorAll('[data-status]').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        state.estado = button.dataset.status;
        render();
    }));

    document.getElementById('pedidosSearch').addEventListener('input', event => {
        state.busqueda = event.target.value.trim();
        render();
    });
}

document.addEventListener('DOMContentLoaded', init);