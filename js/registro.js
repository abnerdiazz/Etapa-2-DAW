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

function init() {
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
            mostrarError('Ya existe una cuenta registrada con ese correo.');
            return;
        }

        const nuevoUsuario = { name: nombre, email: correo, phone: telefono, password };
        usuarios.push(nuevoUsuario);
        guardarUsuarios(usuarios);
        guardarSesionCliente(nuevoUsuario);

        window.location.href = 'mis-pedidos.html';
    });
}

document.addEventListener('DOMContentLoaded', init);