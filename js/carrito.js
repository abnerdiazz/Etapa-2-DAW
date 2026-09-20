document.addEventListener('DOMContentLoaded', () => {
    const SHIPPING_COST = 1.00;
    
    // Clave principal y única fuente de verdad
    const PRIMARY_KEY = 'saborexpress_cart';
    const MIRROR_KEYS = ['cart', 'se_cart', 'carrito', 'saborexpress_carrito'];

    // Normalizador universal de productos
    function normalizeItem(item) {
        if (!item || typeof item !== 'object') return null;
        const name = item.name || item.nombre || item.title || item.titulo || item.productName || '';
        const price = parseFloat(item.price || item.precio || item.unitPrice || 0);
        const qty = parseInt(item.qty || item.cantidad || item.quantity || item.count || 1);
        
        if (!name) return null;
        return {
            id: item.id || name,
            name: name,
            nombre: name,
            price: isNaN(price) ? 0 : price,
            precio: isNaN(price) ? 0 : price,
            qty: isNaN(qty) || qty < 1 ? 1 : qty,
            cantidad: isNaN(qty) || qty < 1 ? 1 : qty,
            img: item.img || item.imagen || item.image || ''
        };
    }

    // Lee EXCLUSIVAMENTE del almacenamiento activo (sin resucitar datos viejos)
    function getStoredCart() {
        // 1. Intentar leer la clave principal
        const primaryRaw = localStorage.getItem(PRIMARY_KEY);
        if (primaryRaw) {
            try {
                const parsed = JSON.parse(primaryRaw);
                if (Array.isArray(parsed)) {
                    return parsed.map(normalizeItem).filter(Boolean);
                }
            } catch (e) {}
        }

        // 2. Si la clave principal está completamente vacía, importar UNA SOLA VEZ de claves alternativas
        for (const key of MIRROR_KEYS) {
            const raw = localStorage.getItem(key);
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        const items = parsed.map(normalizeItem).filter(Boolean);
                        saveCart(items); // Migra a la clave principal y limpia el formato
                        return items;
                    }
                } catch (e) {}
            }
        }

        return [];
    }

    // Guarda los cambios 
    function saveCart(cartArray) {
        const normalized = cartArray.map(normalizeItem).filter(Boolean);
        const json = JSON.stringify(normalized);

        // Guardar lista
        localStorage.setItem(PRIMARY_KEY, json);
        MIRROR_KEYS.forEach(key => localStorage.setItem(key, json));
        
        updateCartBadge();
        return normalized;
    }

    // Actualiza el contador (badge) en el Navbar
    function updateCartBadge() {
        const badges = document.querySelectorAll('#cart-count, [data-cart-count]');
        if (!badges.length) return;

        const cart = getStoredCart();
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

        badges.forEach(badge => {
            badge.textContent = totalItems;
        });
    }

    // Función global para agregar o actualizar productos
    window.agregarAlCarrito = function(nombre, precio, cantidad = 1, img = '') {
        let cart = getStoredCart();
        const priceNum = parseFloat(precio) || 0;

        const index = cart.findIndex(item => item.name.toLowerCase().trim() === nombre.toLowerCase().trim());

        if (index !== -1) {
            cart[index].qty += cantidad;
            cart[index].cantidad = cart[index].qty;
        } else {
            cart.push({
                name: nombre,
                nombre: nombre,
                price: priceNum,
                precio: priceNum,
                qty: cantidad,
                cantidad: cantidad,
                img: img
            });
        }

        saveCart(cart);
    };

    updateCartBadge();
    window.addEventListener('storage', updateCartBadge);
    window.addEventListener('pageshow', updateCartBadge);

    // Capturar clics del botón "Agregar" en la vista de menú 
    document.addEventListener('click', (e) => {
        const btnAdd = e.target.closest('button, .btn, [role="button"]');
        if (!btnAdd) return;

        const text = btnAdd.textContent.trim().toLowerCase();
        const isAddBtn = text.includes('agregar') || btnAdd.classList.contains('btn-add-cart') || btnAdd.hasAttribute('data-add-cart');

        if (isAddBtn && !btnAdd.closest('#cart-table-body')) {
            const card = btnAdd.closest('.card, .product-card, .surface-card, .col, div[class*="col"]');
            if (card) {
                const titleEl = card.querySelector('h1, h2, h3, h4, h5, h6, .card-title, .product-title, .fw-bold');
                const priceEl = card.querySelector('.price, .product-price, .text-brand, .badge, strong');
                const qtyEl = card.querySelector('.qty-val, input[type="number"], .quantity-control span');

                if (titleEl) {
                    const name = titleEl.textContent.trim();
                    let price = 0.85;

                    if (priceEl) {
                        const priceMatch = priceEl.textContent.match(/\d+(\.\d+)?/);
                        if (priceMatch) price = parseFloat(priceMatch[0]);
                    }

                    let qty = 1;
                    if (qtyEl) {
                        const parsedQty = parseInt(qtyEl.textContent || qtyEl.value || 1);
                        if (!isNaN(parsedQty) && parsedQty > 0) qty = parsedQty;
                    }

                    window.agregarAlCarrito(name, price, qty);

                    const toastEl = document.getElementById('menuToast');
                    if (toastEl && typeof bootstrap !== 'undefined') {
                        const toastMsg = toastEl.querySelector('[data-toast-message]');
                        if (toastMsg) toastMsg.textContent = `${qty}x "${name}" agregado al carrito.`;
                        const toast = bootstrap.Toast.getInstance(toastEl) || new bootstrap.Toast(toastEl);
                        toast.show();
                    }
                }
            }
        }
    });

    // ===========
    // 1. CARRITO
    // ===========
    const cartTableBody = document.getElementById('cart-table-body');

    if (cartTableBody) {
        function renderCartTable() {
            const cart = getStoredCart();

            if (cart.length === 0) {
                cartTableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center py-5 text-muted fs-6">
                            Tu carrito está vacío. <br>
                            <a href="menu.html" class="text-decoration-none fw-bold mt-2 d-inline-block" style="color: var(--se-primary, #ce4b31);">Ir a ver el menú</a>
                        </td>
                    </tr>
                `;
                updateSummaryTotals(0);
                return;
            }

            let html = '';
            let subtotalSum = 0;

            cart.forEach((item, index) => {
                const itemSubtotal = item.price * item.qty;
                subtotalSum += itemSubtotal;

                html += `
                    <tr class="cart-item" data-index="${index}">
                        <td class="ps-4 cart-product-title fw-bold">${item.name}</td>
                        <td class="text-center">
                            <div class="qty-pill-container quantity-control d-inline-flex align-items-center gap-2">
                                <button type="button" class="btn btn-sm btn-outline-secondary btn-minus" data-index="${index}">-</button>
                                <span class="qty-val fw-bold px-2">${item.qty}</span>
                                <button type="button" class="btn btn-sm btn-outline-secondary btn-plus" data-index="${index}">+</button>
                            </div>
                        </td>
                        <td class="cart-price-text">$${item.price.toFixed(2)}</td>
                        <td class="pe-4 cart-subtotal-text fw-bold">$${itemSubtotal.toFixed(2)}</td>
                    </tr>
                `;
            });

            cartTableBody.innerHTML = html;
            updateSummaryTotals(subtotalSum);
        }

        function updateSummaryTotals(subtotal) {
            const subtotalEl = document.getElementById('cart-subtotal');
            const totalEl = document.getElementById('cart-total');
            const shippingEl = document.getElementById('cart-shipping');

            if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
            
            if (subtotal > 0) {
                if (shippingEl) shippingEl.textContent = `$${SHIPPING_COST.toFixed(2)}`;
                if (totalEl) totalEl.textContent = `$${(subtotal + SHIPPING_COST).toFixed(2)}`;
            } else {
                if (shippingEl) shippingEl.textContent = '$0.00';
                if (totalEl) totalEl.textContent = '$0.00';
            }
        }

        renderCartTable();

        // Manejo directo de [+] y [-] en las filas de la tabla
        cartTableBody.addEventListener('click', (e) => {
            const btnPlus = e.target.closest('.btn-plus');
            const btnMinus = e.target.closest('.btn-minus');

            if (btnPlus || btnMinus) {
                const btn = btnPlus || btnMinus;
                const index = parseInt(btn.getAttribute('data-index'));
                let cart = getStoredCart();

                if (!isNaN(index) && cart[index]) {
                    if (btnPlus) {
                        cart[index].qty++;
                        cart[index].cantidad = cart[index].qty;
                    } else if (btnMinus) {
                        cart[index].qty--;
                        cart[index].cantidad = cart[index].qty;
                    }

                    // Si la cantidad llega a 0 o menos, elimina el elemento del arreglo
                    if (cart[index].qty <= 0) {
                        cart.splice(index, 1);
                    }

                    saveCart(cart);
                    renderCartTable();
                }
            }
        });
    }

    // =============
    // 2. Checout
    // =============
    const checkoutSummaryItems = document.getElementById('checkout-summary-items');
    const confirmOrderBtn = document.getElementById('btn-confirm-order');

    if (checkoutSummaryItems || confirmOrderBtn) {
        function renderCheckoutSummary() {
            const cart = getStoredCart();
            let subtotalSum = 0;
            let html = '';

            if (cart.length > 0) {
                cart.forEach(item => {
                    const itemSubtotal = item.price * item.qty;
                    subtotalSum += itemSubtotal;

                    html += `
                        <div class="d-flex justify-content-between mb-2 fs-6">
                            <span>${item.qty}x ${item.name}</span>
                            <span class="fw-bold">$${itemSubtotal.toFixed(2)}</span>
                        </div>
                    `;
                });

                if (checkoutSummaryItems) checkoutSummaryItems.innerHTML = html;

                const subtotalEl = document.getElementById('checkout-subtotal');
                const totalEl = document.getElementById('checkout-total');

                if (subtotalEl) subtotalEl.textContent = `$${subtotalSum.toFixed(2)}`;
                if (totalEl) totalEl.textContent = `$${(subtotalSum + SHIPPING_COST).toFixed(2)}`;
            } else {
                if (checkoutSummaryItems) {
                    checkoutSummaryItems.innerHTML = '<p class="text-muted small">No hay productos en el pedido.</p>';
                }
            }
        }

        renderCheckoutSummary();

        if (confirmOrderBtn) {
            confirmOrderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const nombre = document.getElementById('input-nombre')?.value || 'Cliente';
                const direccion = document.getElementById('input-direccion')?.value || 'San Salvador';
                const totalTxt = document.getElementById('checkout-total')?.textContent || '$0.00';
                
                const mensaje = `Hola SaborExpress, soy ${nombre}. Confirmo mi pedido con dirección: ${direccion}. Total a pagar: ${totalTxt}.`;
                const urlWhatsApp = `https://wa.me/50322000000?text=${encodeURIComponent(mensaje)}`;
                
                window.open(urlWhatsApp, '_blank');
                saveCart([]);
                window.location.href = 'mis-pedidos.html';
            });
        }
    }

    // ========
    // 3. MAPA
    // ========
    const mapEl = document.getElementById('map');
    if (mapEl && typeof L !== 'undefined') {
        const initialLat = 13.6925;
        const initialLng = -89.2381;

        const map = L.map('map').setView([initialLat, initialLng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);

        const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);

        map.on('click', (e) => {
            marker.setLatLng(e.latlng);
        });

        setTimeout(() => {
            map.invalidateSize();
        }, 200);
    }
});

document.querySelectorAll('input[name="metodo_pago"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('border-dark', 'fw-bold'));
        
        if (e.target.checked) {
            e.target.closest('.payment-option').classList.add('border-dark', 'fw-bold');
        }
    });
});