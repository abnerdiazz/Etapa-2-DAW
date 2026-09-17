import { leerSesion } from './saborexpress-data.js';

const ADMIN_DEMO = {
    email: 'admin@saborexpress.com',
    password: 'Admin123',
    name: 'Carlos M.',
    role: 'admin'
};

function destinoSeguro() {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect && /^[a-zA-Z0-9_-]+\.html$/.test(redirect)) return redirect;
    return 'admin-reportes.html';
}

function guardarSesionAdmin() {
    localStorage.setItem('saborExpressSession', JSON.stringify({
        name: ADMIN_DEMO.name,
        email: ADMIN_DEMO.email,
        role: ADMIN_DEMO.role,
        loginAt: new Date().toISOString()
    }));
}

function init() {
    const sesion = leerSesion();
    if (sesion?.role === 'admin') {
        window.location.replace(destinoSeguro());
        return;
    }

    const form = document.getElementById('adminLoginForm');
    const email = document.getElementById('adminEmail');
    const password = document.getElementById('adminPassword');
    const error = document.getElementById('adminLoginError');
    const toggle = document.querySelector('[data-toggle-password]');

    toggle.addEventListener('click', () => {
        const visible = password.type === 'text';
        password.type = visible ? 'password' : 'text';
        toggle.innerHTML = `<i class="bi ${visible ? 'bi-eye' : 'bi-eye-slash'}"></i>`;
    });

    form.addEventListener('submit', event => {
        event.preventDefault();
        error.classList.add('d-none');

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const emailValue = email.value.trim().toLowerCase();
        const passwordValue = password.value;
        if (emailValue !== ADMIN_DEMO.email || passwordValue !== ADMIN_DEMO.password) {
            error.classList.remove('d-none');
            return;
        }

        guardarSesionAdmin();
        window.location.href = destinoSeguro();
    });
}

document.addEventListener('DOMContentLoaded', init);
