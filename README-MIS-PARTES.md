# SaborExpress — Mis partes actualizadas (Etapa 2)

Esta carpeta contiene las vistas trabajadas para **Menú** y **Reportes administrativos**, manteniendo HTML5 + CSS3 + Bootstrap 5 + JavaScript vanilla.

## Archivos principales

- `menu.html`: catálogo de productos conectado a Firestore.
- `admin-login.html`: inicio de sesión simulado del administrador.
- `admin-reportes.html`: reportes con navegación superior inspirada en el wireframe de Etapa 1.
- `styles.css`: estilos generales, menú, reportes y login administrativo.
- `js/menu.js`: filtros, búsqueda, cantidades, carrito temporal y paginación.
- `js/admin-login.js`: validación del login y creación de sesión administrativa en `localStorage`.
- `js/admin-reportes.js`: protección por rol admin, métricas, filtros, Chart.js, CSV y cierre de sesión.
- `js/saborexpress-data.js`: lectura de productos/pedidos desde Firestore.
- `js/firebase-config.js`: configuración del proyecto Firebase.

## Acceso administrador de demostración

- Correo: `admin@saborexpress.com`
- Contraseña: `Admin123`

Al iniciar sesión se guarda únicamente la sesión/rol en `localStorage`, de acuerdo con el enfoque definido para la Etapa 2. Si un usuario intenta abrir `admin-reportes.html` sin una sesión administrativa, se redirige a `admin-login.html`.

## Flujo recomendado

1. Abrir `admin-login.html` con Live Server.
2. Iniciar sesión con las credenciales de demostración.
3. El sistema redirige a `admin-reportes.html`.
4. `admin-reportes.html` consulta la colección `pedidos` de Firestore.
5. El botón **Cerrar sesión** elimina `saborExpressSession` y regresa al login.

> Nota: este login es una autenticación simulada para Etapa 2. No debe confundirse con una autenticación segura de producción.


## Configuracion local de la API key

Requiere Node.js 22 o posterior. Antes de abrir el sitio con Live Server:

1. Copia `.env.example` a `.env` y establece `FIREBASE_API_KEY` con la clave web de Firebase.
2. Ejecuta `node scripts/configure-firebase.mjs` desde la raiz del proyecto.
3. Abre el sitio con Live Server como de costumbre.

Repite el comando cuando cambies la clave. El script genera `js/firebase-env.js`, que necesita el navegador. Tanto ese archivo como `.env` estan excluidos de Git.

Para publicar, ejecuta primero el script (tambien acepta FIREBASE_API_KEY del entorno) e incluye el archivo generado en el sitio. No publiques el archivo .env.

La clave web de Firebase seguira visible en el navegador; .env evita guardarla en el repositorio, pero no la convierte en un secreto. Los permisos de datos se controlan mediante las reglas de seguridad de Firebase. Esta modificacion no elimina claves de commits anteriores.
