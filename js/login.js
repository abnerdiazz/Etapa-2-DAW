/* ============================================
   SaborExpress · Inicio de sesión (clientes y administrador)
   Un solo formulario: según las credenciales se decide el rol y la vista.
   ============================================ */
import { ADMIN_DEMO, leerSesion, guardarSesion, leerUsuarios } from './saborexpress-data.js';

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Devuelve la página a la que debe ir cada rol (ignora destinos que no le corresponden).
function paginaDestino(rol) {
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    const valida = Boolean(redirect && /^[a-zA-Z0-9_-]+\.html$/.test(redirect));
    const esPanel = valida && redirect.startsWith('admin-');
    if (rol === 'admin') return esPanel ? redirect : 'admin-reportes.html';
    return valida && !esPanel ? redirect : 'mis-pedidos.html';
}

function mostrarError(mensaje) {
    const box = document.getElementById('loginError');
    box.textContent = mensaje;
    box.classList.remove('d-none');
}

function init() {
    // Solo la sesión de cliente redirige; con una sesión de admin se puede iniciar como cliente.
    if (leerSesion()) {
        window.location.replace(paginaDestino('cliente'));
        return;
    }

    const enlaceRegistro = document.querySelector('a[href="registro.html"]');
    if (enlaceRegistro) enlaceRegistro.search = window.location.search;

    const form = document.getElementById('loginForm');
    form.addEventListener('submit', event => {
        event.preventDefault();
        document.getElementById('loginError').classList.add('d-none');

        const correo = document.getElementById('loginCorreo').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;

        if (!correo || !password) return mostrarError('Ingresa tu correo y tu contraseña.');
        if (!REGEX_CORREO.test(correo)) return mostrarError('Ingresa un correo válido.');

        if (correo === ADMIN_DEMO.email && password === ADMIN_DEMO.password) {
            guardarSesion(ADMIN_DEMO);
            window.location.href = paginaDestino('admin');
            return;
        }

        const usuario = leerUsuarios().find(u => u.email === correo);
        if (!usuario) return mostrarError('No existe una cuenta con ese correo. Crea una cuenta para continuar.');
        if (usuario.password !== password) return mostrarError('Contraseña incorrecta. Usa la que escribiste al registrarte.');

        guardarSesion({ name: usuario.name, email: usuario.email, role: 'cliente' });
        window.location.href = paginaDestino('cliente');
    });
}

document.addEventListener('DOMContentLoaded', init);