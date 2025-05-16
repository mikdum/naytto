let orders = [];
let menu = {};
let tables = [];
let currentOrder = null;
let orderModal = null;

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setInterval(loadData, 5000);
    initializeOrderModal();
});

function initializeOrderModal() {
    orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
    
    const menuCategories = document.querySelector('.menu-categories');
    Object.entries(menu).forEach(([category, data]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'menu-category mb-4';
        categoryDiv.innerHTML = `
            <h4>${data.fi}</h4>
            <div class="menu-items">
                ${data.items.map(item => `
                    <div class="menu-item">
                        <span>${item.fi}</span>
                        <span>${item.price.toFixed(2)} €</span>
                        <button class="btn btn-sm btn-primary add-item" data-item='${JSON.stringify(item)}'>
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        menuCategories.appendChild(categoryDiv);
    });

    document.querySelectorAll('.add-item').forEach(button => {
        button.addEventListener('click', () => {
            const item = JSON.parse(button.dataset.item);
            addItemToOrder(item);
        });
    });
}

function addItemToOrder(item) {
    if (!currentOrder) return;

    const existingItem = currentOrder.items.find(i => i.fi === item.fi);
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        currentOrder.items.push({
            ...item,
            quantity: 1
        });
    }

    updateOrderDisplay();
}

function updateOrderDisplay() {
    const orderItems = document.getElementById('orderItems');
    const orderTotal = document.getElementById('orderTotal');
    const submitButton = document.getElementById('submitOrder');

    if (!currentOrder || currentOrder.items.length === 0) {
        orderItems.innerHTML = '<p>Ei tuotteita valittuna</p>';
        orderTotal.textContent = '0.00';
        submitButton.disabled = true;
        return;
    }

    let total = 0;
    orderItems.innerHTML = currentOrder.items.map(item => {
        const itemTotal = item.price * (item.quantity || 1);
        total += itemTotal;
        return `
            <div class="order-item">
                <span>${item.fi}</span>
                <span>${item.quantity || 1}x</span>
                <span>${itemTotal.toFixed(2)} €</span>
                <button class="btn btn-sm btn-danger remove-item" data-item="${item.fi}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');

    orderTotal.textContent = total.toFixed(2);
    submitButton.disabled = false;

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
            const itemName = button.dataset.item;
            removeItemFromOrder(itemName);
        });
    });
}

function removeItemFromOrder(itemName) {
    if (!currentOrder) return;

    currentOrder.items = currentOrder.items.filter(item => item.fi !== itemName);
    updateOrderDisplay();
}

async function createOrder(tableId) {
    const table = tables.find(t => t.name.fi === tableId);
    if (!table) return;

    currentOrder = {
        id: `ORD${String(orders.length + 1).padStart(3, '0')}`,
        time: new Date().toISOString(),
        startTime: new Date().toISOString(),
        table: table.name.fi,
        amount: 0,
        status: 'active',
        items: []
    };

    document.getElementById('currentOrder').innerHTML = `
        <h4>Tilaus pöydälle ${table.name.fi}</h4>
    `;

    orderModal.show();
}

async function submitOrder() {
    if (!currentOrder || currentOrder.items.length === 0) return;

    currentOrder.amount = currentOrder.items.reduce((total, item) => {
        return total + (item.price * (item.quantity || 1));
    }, 0);

    orders.push(currentOrder);
    await saveOrders();
    updateTableStatus();
    
    currentOrder = null;
    document.getElementById('currentOrder').innerHTML = '<p>Valitse pöytä tilauksen tekemistä varten</p>';
    updateOrderDisplay();
    orderModal.hide();
}

async function loadData() {
    try {
        const storedOrders = localStorage.getItem("nayttoOrders");
        if (storedOrders != null) {
            orders = JSON.parse(storedOrders);
        } else {
            const response = await fetch('../data/orders.json');
            orders = await response.json();
            localStorage.setItem("nayttoOrders", JSON.stringify(orders));
        }

        const storedMenu = localStorage.getItem("nayttoMenu");
        if (storedMenu != null) {
            menu = JSON.parse(storedMenu);
        } else {
            const response = await fetch('../data/menu.json');
            menu = await response.json();
            localStorage.setItem("nayttoMenu", JSON.stringify(menu));
        }

        const storedTables = localStorage.getItem("nayttoTables");
        if (storedTables != null) {
            tables = JSON.parse(storedTables);
        } else {
            const response = await fetch('../data/tables.json');
            tables = await response.json();
            localStorage.setItem("nayttoTables", JSON.stringify(tables));
        }

        updateTableStatus();
    } catch (error) {
        console.error('Virhe datan haussa:', error);
    }
}

function updateTableStatus() {
    tables.forEach(table => {
        const tableElement = document.querySelector(`[data-table="${table.name.fi}"]`);
        if (tableElement) {
            const statusElement = tableElement.querySelector('.card-text');
            const orderButton = tableElement.querySelector('.order-btn');
            const reserveButton = tableElement.querySelector('.reserve-btn');
            const releaseButton = tableElement.querySelector('.release-btn');

            const tableOrders = orders.filter(order => order.table === table.name.fi);
            const activeOrder = tableOrders.find(order => order.status === 'active');

            if (activeOrder) {
                statusElement.textContent = 'Varattu';
                orderButton.disabled = false;
                reserveButton.disabled = true;
                releaseButton.disabled = false;
            } else {
                statusElement.textContent = 'Vapaa';
                orderButton.disabled = true;
                reserveButton.disabled = false;
                releaseButton.disabled = true;
            }
        }
    });
}

async function completeOrder(tableId) {
    const order = orders.find(o => o.table === tableId && o.status === 'active');
    if (!order) return;

    order.status = 'completed';
    order.endTime = new Date().toISOString();
    await saveOrders();
    updateTableStatus();
}

async function saveOrders() {
    try {
        localStorage.setItem("nayttoOrders", JSON.stringify(orders));

        const response = await fetch('../data/orders.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orders)
        });

        if (!response.ok) {
            throw new Error('Virhe tilauksen tallennuksessa');
        }
    } catch (error) {
        console.error('Virhe tilauksen tallennuksessa:', error);
    }
}

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('order-btn')) {
        const tableId = event.target.dataset.table;
        createOrder(tableId);
    } else if (event.target.classList.contains('release-btn')) {
        const tableId = event.target.dataset.table;
        completeOrder(tableId);
    } else if (event.target.id === 'submitOrder') {
        submitOrder();
    }
}); 