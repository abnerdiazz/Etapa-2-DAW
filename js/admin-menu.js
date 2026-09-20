document.addEventListener('DOMContentLoaded', () => {

    const adminGrid = document.getElementById('admin-menu-grid');
    const formAdd = document.getElementById('form-add-product');
    const nameSelect = document.getElementById('new-prod-name');
    const priceInput = document.getElementById('new-prod-price');

    const PRODUCT_IMAGES = {
        "Pupusa de Queso": "img/menú/pupusa-queso.png",
        "Pupusa Revuelta": "img/menú/pupusa-revuelta.png",
        "Pupusa de Frijol con Queso": "img/menú/pupusa-frijol-queso.png",
        "Pupusa de Loroco": "img/menú/pupusa-loroco.png",
        "Pupusa Loca": "img/menú/pupusa-loca.png",
        "Yuca Frita con Chicharrón": "img/menú/yuca-frita.png",
        "Café de Palo": "img/menú/cafe.png",
        "Chocolate Caliente": "img/menú/chocolate.png",
        "Soda Coca Cola": "img/menú/soda-coca-cola.png",
        "Soda Fanta": "img/menú/soda-fanta.png",
        "Soda Fresa": "img/menú/soda-fresa.png",
        "Soda Sprite": "img/menú/soda-sprite.png",
        "Arroz con Leche": "img/menú/arroz-leche.png",
        "Nuégados con Miel": "img/menú/nuegados.png",
        "Quesadilla Rústica": "img/menú/quesadilla.png"
    };

    // Autocompletar el precio automáticamente al seleccionar producto
    if (nameSelect) {
        nameSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const defaultPrice = selectedOption.getAttribute('data-price');

            if (defaultPrice && priceInput) {
                priceInput.value = defaultPrice;
            }
        });
    }

    // Editar y eliminar
    if (adminGrid) {
        adminGrid.addEventListener('click', (e) => {
            const btnDelete = e.target.closest('.btn-action-delete');
            if (btnDelete) {
                const cardCol = btnDelete.closest('.col-md-4');
                if (cardCol && confirm('¿Estás seguro de eliminar este producto del menú público?')) {
                    cardCol.remove();
                }
            }

            const btnEdit = e.target.closest('.btn-action-edit');
            if (btnEdit) {
                const card = btnEdit.closest('.admin-card');
                const titleEl = card.querySelector('.admin-product-title');
                const priceEl = card.querySelector('.admin-product-price');

                const currentName = titleEl ? titleEl.textContent.trim() : '';
                const currentPrice = priceEl ? priceEl.textContent.replace('$', '').trim() : '0.00';

                const newName = prompt('Editar nombre del producto:', currentName);
                if (newName !== null && newName.trim() !== '') {
                    titleEl.textContent = newName.trim();
                }

                const newPrice = prompt('Editar precio ($):', currentPrice);
                if (newPrice !== null && !isNaN(parseFloat(newPrice))) {
                    priceEl.textContent = `$${parseFloat(newPrice).toFixed(2)}`;
                }
            }
        });
    }

    // Agregar nuevo producto 
    if (formAdd) {
        formAdd.addEventListener('submit', (e) => {
            e.preventDefault();

            const selectedOption = nameSelect?.options[nameSelect.selectedIndex];
            const name = nameSelect ? nameSelect.value : 'Nuevo Producto';
            const category = selectedOption?.getAttribute('data-category') || 'Pupusas';
            const price = parseFloat(priceInput ? priceInput.value : 0).toFixed(2);
            const imgSrc = selectedOption?.getAttribute('data-img') || PRODUCT_IMAGES[name] || 'img/menú/pupusa-queso.png';

            const newCol = document.createElement('div');
            newCol.className = 'col-md-4';
            newCol.innerHTML = `
                <div class="admin-card">
                    <img src="${imgSrc}" class="admin-card-img" alt="${name}">
                    <div class="admin-card-body">
                        <h3 class="admin-product-title">${name}</h3>
                        <p class="admin-product-category">${category}</p>
                        <p class="admin-product-price">$${price}</p>
                    </div>
                    <div class="admin-card-footer d-flex justify-content-between align-items-center">
                        <button type="button" class="btn-action-text btn-action-edit">[Editar]</button>
                        <button type="button" class="btn-action-text btn-action-delete">[Eliminar]</button>
                    </div>
                </div>
            `;

            if (adminGrid) {
                adminGrid.appendChild(newCol);
            }

            formAdd.reset();

            const modalEl = document.getElementById('modalAddProduct');
            if (modalEl) {
                const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modalInstance.hide();
            }
        });
    }
});