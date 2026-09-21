/* ============================================
   SaborExpress · Registro de cliente
   ============================================ */

function leerUsuarios() {
    try {
        const datos = JSON.parse(localStorage.getItem('saborExpressUsers'));
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

function guardarUsuarios(usuarios) {
    localStorage.setItem('saborExpressUsers', JSON.stringify(usuarios));
}

function guardarSesionCliente(usuario) {
    localStorage.setItem('saborExpressSession', JSON.stringify({
        name: usuario.name,
        email: usuario.email,
        role: 'cliente',
        loginAt: new Date().toISOString()
    }));
}

function mostrarError(mensaje) {
    const box = document.getElementById('registroError');
    box.textContent = mensaje;
    box.classList.remove('d-none');
}

function ocultarError() {
    document.getElementById('registroError').classList.add('d-none');
}

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONO = /^(\+?503[\s-]?)?\d{4}[\s-]?\d{4}$/;

function paginaDestino() {
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    const valida = redirect && /^[a-zA-Z0-9_-]+\.html$/.test(redirect) && !redirect.startsWith('admin-');
    return valida ? redirect : 'mis-pedidos.html';
}

function init() {
    const enlaceLogin = document.querySelector('a[href="login.html"]');
    if (enlaceLogin) enlaceLogin.search = window.location.search;

    const form = document.getElementById('registroForm');
    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        ocultarError();

        const nombre = document.getElementById('registroNombre').value.trim();
        const correo = document.getElementById('registroCorreo').value.trim().toLowerCase();
        const telefono = document.getElementById('registroTelefono').value.trim();
        const password = document.getElementById('registroPassword').value;
        const confirmar = document.getElementById('registroConfirmar').value;

        if (!nombre || !correo || !password || !confirmar) {
            mostrarError('Completa todos los campos obligatorios.');
            return;
        }
        if (nombre.length < 3) {
            mostrarError('Ingresa tu nombre completo.');
            return;
        }
        if (!REGEX_CORREO.test(correo)) {
            mostrarError('Ingresa un correo válido.');
            return;
        }
        if (correo === 'admin@saborexpress.com') {
            mostrarError('Ese correo está reservado. Usa otro.');
            return;
        }
        if (telefono && !REGEX_TELEFONO.test(telefono)) {
            mostrarError('Ingresa un teléfono válido de 8 dígitos (ej. 7777-7777).');
            return;
        }
        if (password.length < 6) {
            mostrarError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (password !== confirmar) {
            mostrarError('Las contraseñas no coinciden.');
            return;
        }

        const usuarios = leerUsuarios();
        if (usuarios.some(u => u.email === correo)) {
            mostrarError('Ya existe una cuenta con ese correo. Inicia sesión con la contraseña que usaste al registrarte.');
            return;
        }

        const nuevoUsuario = { name: nombre, email: correo, phone: telefono, password };
        usuarios.push(nuevoUsuario);
        guardarUsuarios(usuarios);
        guardarSesionCliente(nuevoUsuario);

        window.location.href = paginaDestino();
    });
}

document.addEventListener('DOMContentLoaded', init);