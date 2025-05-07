document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    loadMenuItems();
    loadActiveOrders();
    loadReservedTables();
    updateStats();
    setupLanguageButtons();
    translatePage();
    loadTables();
});

function initializeData() {
    if (!localStorage.getItem('tableReservations')) {
        localStorage.setItem('tableReservations', JSON.stringify([]));
    }
    if (!localStorage.getItem('activeOrders')) {
        localStorage.setItem('activeOrders', JSON.stringify([]));
    }
    if (!localStorage.getItem('menuItems')) {
        localStorage.setItem('menuItems', JSON.stringify([]));
    }
}

function setupEventListeners() {
    const tableReservationForm = document.getElementById('tableReservationForm');
    if (tableReservationForm) {
        tableReservationForm.addEventListener('submit', handleTableReservation);
    }
    const newOrderForm = document.getElementById('newOrderForm');
    if (newOrderForm) {
        newOrderForm.addEventListener('submit', handleNewOrder);
    }
    const activeOrders = document.getElementById('activeOrders');
    if (activeOrders) {
        activeOrders.addEventListener('click', (e) => {
            if (e.target.classList.contains('status-btn')) {
                const orderId = parseInt(e.target.dataset.orderId);
                updateOrderStatus(orderId, e.target.dataset.status);
            }
        });
    }
}

function setupLanguageButtons() {
    const currentLang = getLang();
    document.querySelectorAll('.btn-lang').forEach(btn => {
        if (btn.getAttribute('data-btn') === currentLang) {
            btn.classList.add('btn_active');
        } else {
            btn.classList.remove('btn_active');
        }
    });

    document.querySelectorAll('[data-btn]').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-btn');
            localStorage.setItem('lang', lang);
            location.reload();
        });
    });
}

async function loadMenuItems() {
    try {
        const response = await fetch('../data/menu.json');
        if (!response.ok) {
            return;
        }
        const menu = await response.json();
        const select = document.getElementById('menuItems');
        if (!Array.isArray(menu.items)) {
            return;
        }
        localStorage.setItem('menuItems', JSON.stringify(menu.items));
        menu.items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name || item.fi || item.en || 'Tuote';
            select.appendChild(option);
        });
    } catch (error) {
    }
}

function handleTableReservation(event) {
    event.preventDefault();
    const tableNumber = document.getElementById('tableNumber').value;
    const guestCount = document.getElementById('guestCount').value;
    
    const reservations = JSON.parse(localStorage.getItem('tableReservations'));
    const existingReservation = reservations.find(r => r.tableNumber === tableNumber);
    
    if (existingReservation) {
        return;
    }
    
    reservations.push({
        tableNumber,
        guestCount,
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('tableReservations', JSON.stringify(reservations));
    loadReservedTables();
    updateStats();
    event.target.reset();
}

function handleNewOrder(event) {
    event.preventDefault();
    const tableNumber = document.getElementById('orderTableNumber').value;
    const menuItemId = document.getElementById('menuItems').value;
    const quantity = document.getElementById('orderQuantity').value;
    
    const orders = JSON.parse(localStorage.getItem('activeOrders'));
    const menuItems = JSON.parse(localStorage.getItem('menuItems'));
    const selectedItem = menuItems.find(item => item.id === menuItemId);
    
    orders.push({
        id: Date.now(),
        tableNumber,
        menuItemId,
        menuItemName: selectedItem.name,
        quantity,
        status: 'pending',
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('activeOrders', JSON.stringify(orders));
    loadActiveOrders();
    updateStats();
    event.target.reset();
}

function updateOrderStatus(orderId, newStatus) {
    const orders = JSON.parse(localStorage.getItem('activeOrders'));
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('activeOrders', JSON.stringify(orders));
        loadActiveOrders();
        updateStats();
    }
}

function getLang() {
    return localStorage.getItem('lang') || 'fi';
}

const statusTranslations = {
    fi: {
        pending: 'Odottaa',
        completed: 'Valmis',
        cancelled: 'Peruttu'
    },
    en: {
        pending: 'Pending',
        completed: 'Completed',
        cancelled: 'Cancelled'
    },
    ru: {
        pending: 'В ожидании',
        completed: 'Готово',
        cancelled: 'Отменено'
    }
};

function getStatusText(status) {
    const lang = getLang();
    return (statusTranslations[lang] && statusTranslations[lang][status]) || status;
}

function loadActiveOrders() {
    const orders = JSON.parse(localStorage.getItem('activeOrders'));
    const container = document.getElementById('activeOrders');
    container.innerHTML = '';
    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        let productsHtml = '';
        if (order.products) {
            productsHtml = order.products.map(p => `${p.menuItemName} x ${p.quantity}`).join('<br>');
        } else {
            productsHtml = `${order.menuItemName} x ${order.quantity}`;
        }
        orderElement.innerHTML = `
            <div class="order-header">
                <span>Pöytä ${order.tableNumber}</span>
                <span>${new Date(order.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="order-details">
                <span>${productsHtml}</span>
                <div class="order-status">
                    <span class="status-badge ${order.status}">${getStatusText(order.status)}</span>
                    <button class="btn btn-sm btn-primary status-btn" data-order-id="${order.id}" data-status="completed">Valmis</button>
                    <button class="btn btn-sm btn-danger status-btn" data-order-id="${order.id}" data-status="cancelled">Peruuta</button>
                </div>
            </div>
        `;
        container.appendChild(orderElement);
    });
}

function loadReservedTables() {
    const reservations = JSON.parse(localStorage.getItem('tableReservations'));
    const container = document.getElementById('reservedTables');
    container.innerHTML = '';
    
    reservations.forEach(reservation => {
        const tableElement = document.createElement('div');
        tableElement.className = 'reserved-table-box table-item';
        tableElement.innerHTML = `
            <div class="table-info">
                <span class="table-number">Pöytä ${reservation.tableNumber}</span>
                <span class="table-guests">${reservation.guestCount} vierasta</span>
                <span class="table-time">${new Date(reservation.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="table-actions">
                <button class="btn btn-sm btn-danger" onclick="removeReservation('${reservation.tableNumber}')">
                    X
                </button>
            </div>
        `;
        container.appendChild(tableElement);
    });
}

function removeReservation(tableNumber) {
    const reservations = JSON.parse(localStorage.getItem('tableReservations'));
    const updatedReservations = reservations.filter(r => r.tableNumber !== tableNumber);
    localStorage.setItem('tableReservations', JSON.stringify(updatedReservations));
    loadReservedTables();
    updateStats();
}

function updateStats() {
    const reservations = JSON.parse(localStorage.getItem('tableReservations'));
    const orders = JSON.parse(localStorage.getItem('activeOrders'));
    const today = new Date().toISOString().split('T')[0];
    
    const totalGuests = reservations.reduce((sum, res) => sum + parseInt(res.guestCount), 0);
    const activeOrdersCount = orders.filter(order => order.status === 'pending').length;
    const todayOrders = orders.filter(order => order.timestamp.startsWith(today)).length;
    
    document.getElementById('totalGuests').textContent = totalGuests;
    document.getElementById('activeOrdersCount').textContent = activeOrdersCount;
    document.getElementById('todayOrders').textContent = todayOrders;
}

async function translatePage() {
    const lang = getLang();
    try {
        const response = await fetch('../data/lang.json');
        if (!response.ok) {
            return;
        }
        const translations = await response.json();
        
        document.querySelectorAll('[data-lang]').forEach(el => {
            const key = el.getAttribute('data-lang');
            if (translations[key] && translations[key][lang]) {
                el.textContent = translations[key][lang];
            }
        });

        document.title = translations['Naytto'][lang] + ' - Tarjoilijat';
        
    } catch (e) {
    }
}

let TABLES = [];

async function loadTables() {
    try {
        const response = await fetch('../data/tables.json');
        if (!response.ok) {
        }
        TABLES = await response.json();
        renderTableGrid();
    } catch (e) {
        TABLES = [];
        renderTableGrid();
    }
}

function renderTableGrid() {
    const grid = document.getElementById('tableGrid');
    grid.innerHTML = '';
    const orders = JSON.parse(localStorage.getItem('activeOrders')) || [];
    const reservations = JSON.parse(localStorage.getItem('tableReservations')) || [];
    const currentLang = getLang();
    
    TABLES.forEach(table => {
        const hasOrder = orders.some(order => order.tableNumber == table.id && order.status === 'pending');
        const isReserved = reservations.some(res => res.tableNumber == table.id.toString());
        let btnClass = 'table-btn';
        if (table.type === 'vip') btnClass += ' vip';
        if (hasOrder) btnClass += ' has-order';
        if (isReserved) btnClass += ' reserved';
        
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        
        const btn = document.createElement('button');
        btn.className = btnClass;
        btn.textContent = typeof table.name === 'object' ? table.name[currentLang] : table.name;
        
        if (!isReserved) {
            btn.onclick = () => openOrderModal(table.id);
        } else {
            btn.disabled = true;
        }
        
        if (!isReserved) {
            const reserveBtn = document.createElement('button');
            reserveBtn.className = 'btn btn-sm btn-info reserve-btn';
            reserveBtn.setAttribute('data-lang', 'Varaa');
            reserveBtn.textContent = 'Varaa';
            reserveBtn.onclick = () => openReservationModal(table.id);
            tableContainer.appendChild(reserveBtn);
        }
        
        if (isReserved || hasOrder) {
            const releaseBtn = document.createElement('button');
            releaseBtn.className = 'btn btn-sm btn-danger release-btn';
            releaseBtn.setAttribute('data-lang', 'Vapauta');
            releaseBtn.textContent = 'Vapauta';
            releaseBtn.onclick = () => {
                if (isReserved) {
                    releaseTable(table.id);
                } else {
                    cancelOrder(table.id);
                }
            };
            tableContainer.appendChild(releaseBtn);
        }
        
        tableContainer.appendChild(btn);
        grid.appendChild(tableContainer);
    });
}

function releaseTable(tableId) {
    const confirmMessage = getLang() === 'fi' ? 'Haluatko varmasti vapauttaa pöydän?' :
                          getLang() === 'en' ? 'Are you sure you want to release the table?' :
                          'Вы уверены, что хотите освободить стол?';
    if (confirm(confirmMessage)) {
        const reservations = JSON.parse(localStorage.getItem('tableReservations')) || [];
        const updatedReservations = reservations.filter(r => r.tableNumber !== tableId.toString());
        localStorage.setItem('tableReservations', JSON.stringify(updatedReservations));
        renderTableGrid();
        updateStats();
    }
}

function cancelOrder(tableId) {
    const confirmMessage = getLang() === 'fi' ? 'Haluatko varmasti peruuttaa pöydän tilauksen?' :
                          getLang() === 'en' ? 'Are you sure you want to cancel the table order?' :
                          'Вы уверены, что хотите отменить заказ стола?';
    if (confirm(confirmMessage)) {
        const orders = JSON.parse(localStorage.getItem('activeOrders')) || [];
        const updatedOrders = orders.filter(order => !(order.tableNumber == tableId && order.status === 'pending'));
        localStorage.setItem('activeOrders', JSON.stringify(updatedOrders));
        renderTableGrid();
        updateStats();
    }
}

function fillOrderRowSelects() {
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    document.querySelectorAll('.modalMenuItems').forEach(select => {
        select.innerHTML = '';
        menuItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name || item.fi || item.en || 'Tuote';
            select.appendChild(option);
        });
    });
}

document.getElementById('addOrderRow').addEventListener('click', function() {
    const orderRows = document.getElementById('orderRows');
    const row = document.createElement('div');
    row.className = 'order-row d-flex align-items-end mb-2';
    row.innerHTML = `
        <div class="flex-grow-1 mr-2">
            <label>Ruoka</label>
            <select class="form-control modalMenuItems"></select>
        </div>
        <div style="width: 90px;" class="mr-2">
            <label>Määrä</label>
            <input type="number" class="form-control modalOrderQuantity" min="1" value="1" required>
        </div>
        <button type="button" class="btn btn-danger btn-remove-row" style="height:38px;">X</button>
    `;
    orderRows.appendChild(row);
    fillOrderRowSelects();
    row.querySelector('.btn-remove-row').style.display = '';
    row.querySelector('.btn-remove-row').addEventListener('click', function() {
        row.remove();
    });
});

document.getElementById('orderRows').addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-remove-row')) {
        e.target.closest('.order-row').remove();
    }
});

function openOrderModal(tableId) {
    document.getElementById('modalTableNumber').textContent = tableId;
    const orderRows = document.getElementById('orderRows');
    orderRows.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'order-row d-flex align-items-end mb-2';
    row.innerHTML = `
        <div class="flex-grow-1 mr-2">
            <label>Ruoka</label>
            <select class="form-control modalMenuItems"></select>
        </div>
        <div style="width: 90px;" class="mr-2">
            <label>Määrä</label>
            <input type="number" class="form-control modalOrderQuantity" min="1" value="1" required>
        </div>
        <button type="button" class="btn btn-danger btn-remove-row" style="height:38px;display:none;">X</button>
    `;
    orderRows.appendChild(row);
    fillOrderRowSelects();
    document.getElementById('modalOrderQuantity')?.focus();
    $('#orderModal').modal('show');
    document.getElementById('tableOrderForm').dataset.tableId = tableId;
}

document.getElementById('tableOrderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const tableId = this.dataset.tableId;
    const orderRows = document.querySelectorAll('.order-row');
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    const orders = JSON.parse(localStorage.getItem('activeOrders')) || [];
    const products = [];
    orderRows.forEach(row => {
        const menuItemId = row.querySelector('.modalMenuItems').value;
        const quantity = row.querySelector('.modalOrderQuantity').value;
        const selectedItem = menuItems.find(item => item.id == menuItemId);
        products.push({
            menuItemId,
            menuItemName: selectedItem ? (selectedItem.name || selectedItem.fi || selectedItem.en || 'Tuote') : 'Tuote',
            quantity
        });
    });
    orders.push({
        id: Date.now(),
        tableNumber: tableId,
        products,
        status: 'pending',
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('activeOrders', JSON.stringify(orders));
    $('#orderModal').modal('hide');
    renderTableGrid();
    loadActiveOrders();
    updateStats();
});

function openReservationModal(tableId) {
    document.getElementById('modalReservationTableNumber').textContent = tableId;
    document.getElementById('tableReservationForm').dataset.tableId = tableId;
    $('#reservationModal').modal('show');
}

document.getElementById('tableReservationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const tableId = this.dataset.tableId;
    const guestCount = document.getElementById('guestCount').value;
    
    const reservations = JSON.parse(localStorage.getItem('tableReservations')) || [];
    reservations.push({
        tableNumber: tableId.toString(),
        guestCount: parseInt(guestCount),
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('tableReservations', JSON.stringify(reservations));
    $('#reservationModal').modal('hide');
    renderTableGrid();
    updateStats();
}); 