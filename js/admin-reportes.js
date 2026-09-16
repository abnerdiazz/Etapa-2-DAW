import { obtenerPedidos, leerSesion } from './saborexpress-data.js';

const state = {
    pedidos: [],
    rango: 7,
    inicioPersonalizado: null,
    finPersonalizado: null,
    busqueda: '',
    chart: null
};

const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));

function inicioDia(date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

function finDia(date) {
    const copy = new Date(date);
    copy.setHours(23, 59, 59, 999);
    return copy;
}

function rangoActual() {
    if (state.inicioPersonalizado && state.finPersonalizado) {
        return {
            inicio: inicioDia(new Date(`${state.inicioPersonalizado}T00:00:00`)),
            fin: finDia(new Date(`${state.finPersonalizado}T00:00:00`))
        };
    }
    const fin = finDia(new Date());
    const inicio = inicioDia(new Date());
    inicio.setDate(inicio.getDate() - state.rango + 1);
    return { inicio, fin };
}

function pedidosDelRango() {
    const { inicio, fin } = rangoActual();
    return state.pedidos.filter(pedido => {
        const fecha = new Date(pedido.creadoEn);
        const cancelado = String(pedido.estado).toLowerCase() === 'cancelado';
        return fecha >= inicio && fecha <= fin && !cancelado;
    });
}

function agrupar(pedidos) {
    const productos = new Map();
    const categorias = new Map();

    pedidos.forEach(pedido => {
        pedido.items.forEach(item => {
            const cantidad = Number(item.cantidad || 0);
            const ingreso = Number(item.precio || 0) * cantidad;
            const p = productos.get(item.nombre) || { nombre: item.nombre, cantidad: 0, ingreso: 0 };
            p.cantidad += cantidad;
            p.ingreso += ingreso;
            productos.set(item.nombre, p);

            const c = categorias.get(item.categoria) || { categoria: item.categoria, cantidad: 0, ingreso: 0 };
            c.cantidad += cantidad;
            c.ingreso += ingreso;
            categorias.set(item.categoria, c);
        });
    });

    return {
        productos: [...productos.values()].sort((a, b) => b.cantidad - a.cantidad),
        categorias: [...categorias.values()].sort((a, b) => b.ingreso - a.ingreso)
    };
}

function construirSerieVentas(pedidos) {
    const { inicio, fin } = rangoActual();
    const labels = [];
    const values = [];
    const cursor = new Date(inicio);

    while (cursor <= fin) {
        const dayStart = inicioDia(cursor);
        const dayEnd = finDia(cursor);
        labels.push(cursor.toLocaleDateString('es-SV', state.rango <= 7 && !state.inicioPersonalizado ? { weekday: 'short' } : { day: '2-digit', month: 'short' }).replace('.', ''));
        values.push(pedidos
            .filter(pedido => pedido.creadoEn >= dayStart && pedido.creadoEn <= dayEnd)
            .reduce((sum, pedido) => sum + Number(pedido.total || 0), 0));
        cursor.setDate(cursor.getDate() + 1);
    }
    return { labels, values };
}

function renderChart(pedidos) {
    const { labels, values } = construirSerieVentas(pedidos);
    const ctx = document.getElementById('ventasChart');
    if (state.chart) state.chart.destroy();

    state.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Ventas',
                data: values,
                backgroundColor: '#CE4B31',
                borderRadius: 5,
                maxBarThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: { label: context => money(context.raw) }
                }
            },
            scales: {
                x: { grid: { display: false }, border: { display: false } },
                y: {
                    beginAtZero: true,
                    ticks: { callback: value => `$${value}` },
                    grid: { color: '#F0E9DF' },
                    border: { display: false }
                }
            }
        }
    });
}

function renderProductos(productos) {
    const container = document.getElementById('topProducts');
    const totalUnidades = productos.reduce((sum, p) => sum + p.cantidad, 0) || 1;
    const top = productos.slice(0, 5).filter(producto => producto.nombre.toLowerCase().includes(state.busqueda.toLowerCase()));

    container.innerHTML = top.length ? top.map(producto => {
        const porcentaje = Math.round((producto.cantidad / totalUnidades) * 100);
        return `
        <div class="product-progress-row">
            <div class="product-progress-label">
                <strong>${esc(producto.nombre)}</strong>
                <strong>${porcentaje}%</strong>
            </div>
            <div class="thin-progress"><span style="width:${porcentaje}%"></span></div>
        </div>`;
    }).join('') : '<p class="text-secondary mb-0">No hay productos para mostrar.</p>';
}

function renderCategorias(categorias) {
    const tbody = document.getElementById('categorySalesBody');
    const query = state.busqueda.toLowerCase();
    const visibles = categorias.filter(item => item.categoria.toLowerCase().includes(query));
    tbody.innerHTML = visibles.map(item => `
        <tr>
            <td><strong>${esc(item.categoria)}</strong></td>
            <td class="text-end text-secondary">${item.cantidad} items</td>
            <td class="text-end fw-bold">${money(item.ingreso)}</td>
        </tr>`).join('');
    document.getElementById('reportNoResults').classList.toggle('d-none', visibles.length !== 0 || !query);
}

function render() {
    const pedidos = pedidosDelRango();
    const ingresos = pedidos.reduce((sum, pedido) => sum + Number(pedido.total || 0), 0);
    const { productos, categorias } = agrupar(pedidos);

    document.getElementById('metricOrders').textContent = pedidos.length.toLocaleString('es-SV');
    document.getElementById('metricRevenue').textContent = money(ingresos);
    document.getElementById('metricAverage').textContent = money(pedidos.length ? ingresos / pedidos.length : 0);
    document.getElementById('metricTopProduct').textContent = productos[0]?.nombre.replace(/^Pupusa de /, '').replace(/^Pupusa /, '') || '—';

    const { inicio, fin } = rangoActual();
    document.getElementById('salesPeriodLabel').textContent = state.inicioPersonalizado
        ? `(${inicio.toLocaleDateString('es-SV')} – ${fin.toLocaleDateString('es-SV')})`
        : state.rango === 7 ? '(Esta Semana)' : '(Último Mes)';

    renderChart(pedidos);
    renderProductos(productos);
    renderCategorias(categorias);
}

function exportarCsv() {
    const pedidos = pedidosDelRango();
    const { categorias } = agrupar(pedidos);
    const rows = [['Categoría', 'Ordenado (cant.)', 'Total recaudado'], ...categorias.map(item => [item.categoria, item.cantidad, item.ingreso.toFixed(2)])];
    const csv = rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-saborexpress-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

async function init() {
    const sesion = leerSesion();
    if (!sesion || sesion.role !== 'admin') {
        window.location.replace('admin-login.html?redirect=admin-reportes.html');
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
        console.info(`Fuente de reportes: ${origen}`);
        render();
    } catch (error) {
        console.error(error);
        console.error('No fue posible cargar los reportes desde Firestore.', error);
    }

    document.querySelectorAll('[data-range]').forEach(button => button.addEventListener('click', () => {
        document.querySelectorAll('[data-range]').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        state.rango = Number(button.dataset.range);
        state.inicioPersonalizado = null;
        state.finPersonalizado = null;
        render();
    }));

    document.getElementById('applyCustomRange').addEventListener('click', () => {
        const inicio = document.getElementById('reportStart').value;
        const fin = document.getElementById('reportEnd').value;
        const feedback = document.getElementById('rangeFeedback');
        if (!inicio || !fin || inicio > fin) {
            feedback.classList.remove('d-none');
            return;
        }
        feedback.classList.add('d-none');
        state.inicioPersonalizado = inicio;
        state.finPersonalizado = fin;
        document.querySelectorAll('[data-range]').forEach(item => item.classList.remove('active'));
        bootstrap.Modal.getOrCreateInstance(document.getElementById('customRangeModal')).hide();
        render();
    });

    document.getElementById('reportSearch').addEventListener('input', event => {
        state.busqueda = event.target.value.trim();
        render();
    });
    document.getElementById('exportReportCsv').addEventListener('click', exportarCsv);

}

document.addEventListener('DOMContentLoaded', init);
