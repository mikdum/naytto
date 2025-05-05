document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    loadMenuItems();
    loadActiveOrders();
    loadReservedTables();
    updateStats();
    setupEventListeners();
    setupLanguageButtons();
    translatePage();
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
    document.getElementById('tableReservationForm').addEventListener('submit', handleTableReservation);
    document.getElementById('newOrderForm').addEventListener('submit', handleNewOrder);
    
    // Lisätään tilauksen tilan muuttamisen mahdollisuus
    document.getElementById('activeOrders').addEventListener('click', (e) => {
        if (e.target.classList.contains('status-btn')) {
            const orderId = parseInt(e.target.dataset.orderId);
            updateOrderStatus(orderId, e.target.dataset.status);
        }
    });
}

function setupLanguageButtons() {
    document.querySelectorAll('[data-btn]').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-btn');
            localStorage.setItem('lang', lang);
            location.reload(); // Päivitetään sivu, jotta kaikki tekstit vaihtuvat
        });
    });
}

async function loadMenuItems() {
    try {
        const response = await fetch('../data/menu.json');
        const menu = await response.json();
        const select = document.getElementById('menuItems');
        if (!Array.isArray(menu.items)) {
            alert('Virhe: menu.json-tiedostossa ei ole oikeaa items-taulukkoa!');
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
        alert('Virhe: menu.json-tiedostoa ei voitu ladata!');
    }
}

function handleTableReservation(event) {
    event.preventDefault();
    const tableNumber = document.getElementById('tableNumber').value;
    const guestCount = document.getElementById('guestCount').value;
    
    const reservations = JSON.parse(localStorage.getItem('tableReservations'));
    const existingReservation = reservations.find(r => r.tableNumber === tableNumber);
    
    if (existingReservation) {
        alert('Pöytä on jo varattu!');
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
    // Palauttaa nykyisen kielen, oletus 'fi'
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
        orderElement.innerHTML = `
            <div class="order-header">
                <span>Pöytä ${order.tableNumber}</span>
                <span>${new Date(order.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="order-details">
                <span>${order.menuItemName} x ${order.quantity}</span>
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
        const translations = await response.json();
        document.querySelectorAll('[data-lang]').forEach(el => {
            const key = el.getAttribute('data-lang');
            if (translations[key] && translations[key][lang]) {
                el.textContent = translations[key][lang];
            }
        });
    } catch (e) {
        // Jos käännöstiedostoa ei löydy, ei tehdä mitään
    }
} 