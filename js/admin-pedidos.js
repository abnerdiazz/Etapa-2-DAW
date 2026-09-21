import { obtenerPedidos, iniciarAdmin, actualizarEstadoPedido } from './saborexpress-data.js';

const ESTADOS = ['Pendiente', 'Preparando', 'En camino', 'Entregado', 'Cancelado'];
const state = { pedidos: [], estado: 'todos', busqueda: '' };

const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));

// Agrupa los estados en las etiquetas de los filtros del panel.
function claveEstado(estado) {
    const valor = String(estado || '').toLowerCase();
    if (valor.includes('entreg')) return 'entregado';
    if (valor.includes('cancel')) return 'cancelado';
    if (valor.includes('camino') || valor.includes('prepara')) return 'preparando';
    return 'pendiente';
}

function pedidosFiltrados() {
    const query = state.busqueda.toLowerCase();
    return state.pedidos.filter(pedido => {
        const coincideEstado = state.estado === 'todos' || claveEstado(pedido.estado) === state.estado;
        return coincideEstado && `${pedido.id} ${pedido.cliente}`.toLowerCase().includes(query);
    });
}

function render() {
    const visibles = pedidosFiltrados();
    document.getElementById('pedidosBody').innerHTML = visibles.map(pedido => {
        const opciones = ESTADOS.map(estado => `<option ${estado === pedido.estado ? 'selected' : ''}>${estado}</option>`).join('');
        const productos = pedido.items.map(item => `${item.cantidad}× ${esc(item.nombre)}`).join(', ');
        return `
        <tr>
            <td>#${esc(pedido.id)}</td>
            <td>${pedido.creadoEn.toLocaleDateString('es-SV')} ${pedido.creadoEn.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}</td>
            <td>${esc(pedido.cliente || 'Cliente web')}<br><small class="text-secondary">${esc(pedido.telefono)}</small></td>
            <td class="small">${productos}</td>
            <td class="text-end">${money(pedido.total)}</td>
            <td><select class="form-select form-select-sm" data-estado-id="${esc(pedido.id)}" aria-label="Estado del pedido ${esc(pedido.id)}">${opciones}</select></td>
        </tr>`;
    }).join('');

    const aviso = document.getElementById('pedidosNoResults');
    aviso.textContent = state.pedidos.length
        ? 'No se encontraron pedidos con ese criterio.'
        : 'Aún no hay pedidos. Aparecerán aquí cuando un cliente confirme uno desde el checkout.';
    aviso.classList.toggle('d-none', visibles.length !== 0);
}

async function init() {
    if (!iniciarAdmin('admin-pedidos.html')) return;

    try {
        state.pedidos = (await obtenerPedidos()).datos;
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

    // Cambiar el estado de un pedido (se refleja en Mis Pedidos del cliente)
    document.getElementById('pedidosBody').addEventListener('change', event => {
        const select = event.target.closest('[data-estado-id]');
        if (!select) return;
        actualizarEstadoPedido(select.dataset.estadoId, select.value);
        const pedido = state.pedidos.find(item => item.id === select.dataset.estadoId);
        if (pedido) pedido.estado = select.value;
        render();
    });
}

document.addEventListener('DOMContentLoaded', init);