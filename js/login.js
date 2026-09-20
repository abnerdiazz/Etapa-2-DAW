/* ============================================
   SaborExpress · Login de cliente
   ============================================ */

function leerUsuarios() {
    try {
        const datos = JSON.parse(localStorage.getItem('saborExpressUsers'));
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

function leerSesion() {
    try {
        return JSON.parse(localStorage.getItem('saborExpressSession'));
    } catch {
        return null;
    }
}

function guardarSesionCliente(usuario) {
    localStorage.setItem('saborExpressSession', JSON.stringify({
        name: usuario.name,
        email: usuario.email,
        role: 'cliente',
        loginAt: new Date().toISOString()
    }));
}

function destinoSeguro() {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect && /^[a-zA-Z0-9_-]+\.html$/.test(redirect)) return redirect;
    return 'mis-pedidos.html';
}

function mostrarError(mensaje) {
    const box = document.getElementById('loginError');
    box.textContent = mensaje;
    box.classList.remove('d-none');
}

function ocultarError() {
    document.getElementById('loginError').classList.add('d-none');
}

function init() {
    // Si ya hay una sesion de cliente activa, no tiene sentido ver el login de nuevo.
    const sesionActual = leerSesion();
    if (sesionActual && sesionActual.role === 'cliente') {
        window.location.replace(destinoSeguro());
        return;
    }

    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        ocultarError();

        const correo = document.getElementById('loginCorreo').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;

        if (!correo || !password) {
            mostrarError('Ingresa tu correo y tu contraseña.');
            return;
        }

        const usuarios = leerUsuarios();
        const usuario = usuarios.find(u => u.email === correo && u.password === password);

        if (!usuario) {
            mostrarError('Correo o contraseña incorrectos.');
            return;
        }

        guardarSesionCliente(usuario);
        window.location.href = destinoSeguro();
    });
}

document.addEventListener('DOMContentLoaded', init);