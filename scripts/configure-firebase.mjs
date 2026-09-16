import { existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Ejecutar con Node.js 22 o posterior desde cualquier directorio.
const envPath = fileURLToPath(new URL('../.env', import.meta.url));
if (existsSync(envPath)) process.loadEnvFile(envPath);
const apiKey = process.env.FIREBASE_API_KEY?.trim();
if (!apiKey || apiKey.startsWith('REEMPLAZAR')) {
    throw new Error('Configura FIREBASE_API_KEY en .env o en el entorno antes de continuar.');
}
writeFileSync(new URL('../js/firebase-env.js', import.meta.url),
    '// Generado por scripts/configure-firebase.mjs. No editar ni subir a Git.\n' +
    'export const firebaseApiKey = ' + JSON.stringify(apiKey) + ';\n');
console.log('Configuracion de Firebase generada.');
