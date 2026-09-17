# SaborExpress ? Fase 2: men? y reportes

HTML5, CSS3, Bootstrap 5 y JavaScript vanilla, sin backend.

## Uso

Abre menu.html con Live Server. No requiere claves, Node.js ni compilaci?n. Publica los archivos como sitio est?tico. Bootstrap, iconos y Chart.js requieren conexi?n por sus CDN.

Acceso administrativo: admin-login.html, correo admin@saborexpress.com y contrase?a Admin123. La sesi?n simulada usa saborExpressSession y el rol admin. Cerrar sesi?n elimina esa sesi?n.

## localStorage

- saborExpressProductos: 15 productos iniciales.
- saborExpressPedidos: 247 pedidos ficticios para demostrar los reportes.
- saborExpressCart: carrito persistente; recupera el carrito temporal anterior cuando todav?a no existe uno local.

Las colecciones se crean solo si no existen. Una lista vac?a se respeta. Los pedidos conservan sus fechas al recargar; usa un rango personalizado para consultar per?odos anteriores. Para reiniciar una colecci?n de ejemplo, elimina su clave desde las herramientas del navegador y recarga. Los datos da?ados muestran un aviso sin sobrescribirlos.

Los datos son propios del navegador y del origen (dominio y puerto); no se comparten entre equipos ni se importan de servicios externos. Borrar datos del sitio elimina esta informaci?n. La autenticaci?n es una simulaci?n acad?mica.

menu-reportes.css contiene los estilos de men?, reportes y acceso administrativo. Se conservan styles.css, Inicio y Nosotros de main.

## Alcance pendiente

Este cambio conserva men? y reportes. No implementa checkout, registro/inicio de sesi?n del cliente ni gesti?n de pedidos. A?n deben verificarse el segundo rol, las validaciones de las dem?s p?ginas, los colaboradores y el despliegue.
