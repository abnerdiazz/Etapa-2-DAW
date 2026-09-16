import { firebaseApiKey } from './firebase-env.js';

// Configuración Firebase de SaborExpress.
// Esta configuración corresponde a la app web del proyecto.
// No coloques claves privadas de servidor ni service-account en el frontend.
export const firebaseConfig = {
    apiKey: firebaseApiKey,
    authDomain: 'saborexpress-d31e1.firebaseapp.com',
    projectId: 'saborexpress-d31e1',
    storageBucket: 'saborexpress-d31e1.firebasestorage.app',
    messagingSenderId: '319041246863',
    appId: '1:319041246863:web:57d9037c4cf5a1daee02fa',
    measurementId: 'G-HWP5TCXKCP'
};

export const firebaseIsConfigured = Object.values(firebaseConfig)
    .every(value => typeof value === 'string' && value && !value.startsWith('REEMPLAZAR'));
